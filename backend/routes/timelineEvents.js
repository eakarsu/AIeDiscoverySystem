const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/timeline-events - List all timeline events
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, category, significance } = req.query;
    let query = 'SELECT * FROM timeline_events';
    const conditions = [];
    const params = [];

    if (case_id) {
      params.push(case_id);
      conditions.push(`case_id = $${params.length}`);
    }
    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (significance) {
      params.push(significance);
      conditions.push(`significance = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching timeline events:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/timeline-events/:id - Get one timeline event
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM timeline_events WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Timeline event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching timeline event:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/timeline-events - Create new timeline event
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, event_title, event_date, description, category, source_document, participants, significance, ai_generated } = req.body;
    const result = await pool.query(
      `INSERT INTO timeline_events (case_id, event_title, event_date, description, category, source_document, participants, significance, ai_generated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [case_id || null, event_title || null, event_date || null, description || null, category || null, source_document || null, participants || null, significance || null, ai_generated || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating timeline event:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/timeline-events/:id - Update timeline event
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, event_title, event_date, description, category, source_document, participants, significance, ai_generated } = req.body;
    const result = await pool.query(
      `UPDATE timeline_events SET
        case_id = COALESCE($1, case_id),
        event_title = COALESCE($2, event_title),
        event_date = COALESCE($3, event_date),
        description = COALESCE($4, description),
        category = COALESCE($5, category),
        source_document = COALESCE($6, source_document),
        participants = COALESCE($7, participants),
        significance = COALESCE($8, significance),
        ai_generated = COALESCE($9, ai_generated),
        updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [case_id, event_title, event_date, description, category, source_document, participants, significance, ai_generated, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Timeline event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating timeline event:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/timeline-events/:id - Delete timeline event
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM timeline_events WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Timeline event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting timeline event:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/timeline-events/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM timeline_events WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const item = result.rows[0];
    const response = await fetch(process.env.OPENROUTER_BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: 'Legal timeline analyst. Analyze this event in the case timeline, identify patterns, gaps, and significance to the overall narrative.' },
          { role: 'user', content: `Analyze: ${JSON.stringify(item)}` }
        ],
        max_tokens: 2000
      })
    });

    const aiResult = await response.json();
    res.json({
      item_id: id,
      analysis: aiResult.choices?.[0]?.message?.content || 'Analysis unavailable',
      analyzed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
