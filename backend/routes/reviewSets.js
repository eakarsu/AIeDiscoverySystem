const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/review-sets - List all review sets
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, status, reviewer, priority } = req.query;
    let query = 'SELECT * FROM review_sets';
    const conditions = [];
    const params = [];

    if (case_id) {
      params.push(case_id);
      conditions.push(`case_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (reviewer) {
      params.push(`%${reviewer}%`);
      conditions.push(`reviewer ILIKE $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      conditions.push(`priority = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching review sets:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/review-sets/:id - Get one review set
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM review_sets WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review set not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching review set:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/review-sets - Create new review set
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, set_name, description, total_documents, reviewed_count, relevant_count, privileged_count, reviewer, status, priority } = req.body;
    const result = await pool.query(
      `INSERT INTO review_sets (case_id, set_name, description, total_documents, reviewed_count, relevant_count, privileged_count, reviewer, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [case_id || null, set_name || null, description || null, total_documents || null, reviewed_count || null, relevant_count || null, privileged_count || null, reviewer || null, status || null, priority || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating review set:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/review-sets/:id - Update review set
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, set_name, description, total_documents, reviewed_count, relevant_count, privileged_count, reviewer, status, priority } = req.body;
    const result = await pool.query(
      `UPDATE review_sets SET
        case_id = COALESCE($1, case_id),
        set_name = COALESCE($2, set_name),
        description = COALESCE($3, description),
        total_documents = COALESCE($4, total_documents),
        reviewed_count = COALESCE($5, reviewed_count),
        relevant_count = COALESCE($6, relevant_count),
        privileged_count = COALESCE($7, privileged_count),
        reviewer = COALESCE($8, reviewer),
        status = COALESCE($9, status),
        priority = COALESCE($10, priority),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [case_id, set_name, description, total_documents, reviewed_count, relevant_count, privileged_count, reviewer, status, priority, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review set not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating review set:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/review-sets/:id - Delete review set
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM review_sets WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review set not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting review set:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/review-sets/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM review_sets WHERE id = $1', [id]);
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
          { role: 'system', content: 'Document review workflow analyst. Analyze review set progress, reviewer efficiency, quality metrics, and provide optimization recommendations.' },
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
