const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/productions - List all productions
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, status, format, recipient } = req.query;
    let query = 'SELECT * FROM productions';
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
    if (format) {
      params.push(format);
      conditions.push(`format = $${params.length}`);
    }
    if (recipient) {
      params.push(`%${recipient}%`);
      conditions.push(`recipient ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching productions:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/productions/:id - Get one production
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM productions WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Production not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching production:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/productions - Create new production
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, production_name, status, format, total_documents, bates_prefix, bates_start, bates_end, recipient, delivery_date, confidentiality_level } = req.body;
    const result = await pool.query(
      `INSERT INTO productions (case_id, production_name, status, format, total_documents, bates_prefix, bates_start, bates_end, recipient, delivery_date, confidentiality_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [case_id || null, production_name || null, status || null, format || null, total_documents || null, bates_prefix || null, bates_start || null, bates_end || null, recipient || null, delivery_date || null, confidentiality_level || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating production:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/productions/:id - Update production
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, production_name, status, format, total_documents, bates_prefix, bates_start, bates_end, recipient, delivery_date, confidentiality_level } = req.body;
    const result = await pool.query(
      `UPDATE productions SET
        case_id = COALESCE($1, case_id),
        production_name = COALESCE($2, production_name),
        status = COALESCE($3, status),
        format = COALESCE($4, format),
        total_documents = COALESCE($5, total_documents),
        bates_prefix = COALESCE($6, bates_prefix),
        bates_start = COALESCE($7, bates_start),
        bates_end = COALESCE($8, bates_end),
        recipient = COALESCE($9, recipient),
        delivery_date = COALESCE($10, delivery_date),
        confidentiality_level = COALESCE($11, confidentiality_level),
        updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [case_id, production_name, status, format, total_documents, bates_prefix, bates_start, bates_end, recipient, delivery_date, confidentiality_level, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Production not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating production:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/productions/:id - Delete production
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM productions WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Production not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting production:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/productions/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM productions WHERE id = $1', [id]);
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
          { role: 'system', content: 'Production management expert. Assess production readiness, Bates numbering integrity, format compliance, and delivery timeline.' },
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
