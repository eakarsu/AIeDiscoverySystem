const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/key-terms - List all key terms
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, category } = req.query;
    let query = 'SELECT * FROM key_terms';
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

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching key terms:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/key-terms/:id - Get one key term
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM key_terms WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Key term not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching key term:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/key-terms - Create new key term
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, term, frequency, relevance_score, category, context_snippet, first_occurrence, last_occurrence, document_count } = req.body;
    const result = await pool.query(
      `INSERT INTO key_terms (case_id, term, frequency, relevance_score, category, context_snippet, first_occurrence, last_occurrence, document_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [case_id || null, term || null, frequency || null, relevance_score || null, category || null, context_snippet || null, first_occurrence || null, last_occurrence || null, document_count || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating key term:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/key-terms/:id - Update key term
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, term, frequency, relevance_score, category, context_snippet, first_occurrence, last_occurrence, document_count } = req.body;
    const result = await pool.query(
      `UPDATE key_terms SET
        case_id = COALESCE($1, case_id),
        term = COALESCE($2, term),
        frequency = COALESCE($3, frequency),
        relevance_score = COALESCE($4, relevance_score),
        category = COALESCE($5, category),
        context_snippet = COALESCE($6, context_snippet),
        first_occurrence = COALESCE($7, first_occurrence),
        last_occurrence = COALESCE($8, last_occurrence),
        document_count = COALESCE($9, document_count),
        updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [case_id, term, frequency, relevance_score, category, context_snippet, first_occurrence, last_occurrence, document_count, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Key term not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating key term:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/key-terms/:id - Delete key term
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM key_terms WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Key term not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting key term:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/key-terms/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM key_terms WHERE id = $1', [id]);
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
          { role: 'system', content: 'Search term analyst. Analyze this term\'s significance, frequency patterns, contextual relationships, and recommend related terms.' },
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
