const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/legal-holds - List all legal holds
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, status, hold_type, issued_by } = req.query;
    let query = 'SELECT * FROM legal_holds';
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
    if (hold_type) {
      params.push(hold_type);
      conditions.push(`hold_type = $${params.length}`);
    }
    if (issued_by) {
      params.push(`%${issued_by}%`);
      conditions.push(`issued_by ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching legal holds:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/legal-holds/:id - Get one legal hold
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM legal_holds WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Legal hold not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching legal hold:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/legal-holds - Create new legal hold
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, hold_name, description, status, custodian_count, issued_by, issued_date, release_date, hold_type, notification_sent } = req.body;
    const result = await pool.query(
      `INSERT INTO legal_holds (case_id, hold_name, description, status, custodian_count, issued_by, issued_date, release_date, hold_type, notification_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [case_id || null, hold_name || null, description || null, status || null, custodian_count || null, issued_by || null, issued_date || null, release_date || null, hold_type || null, notification_sent || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating legal hold:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/legal-holds/:id - Update legal hold
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, hold_name, description, status, custodian_count, issued_by, issued_date, release_date, hold_type, notification_sent } = req.body;
    const result = await pool.query(
      `UPDATE legal_holds SET
        case_id = COALESCE($1, case_id),
        hold_name = COALESCE($2, hold_name),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        custodian_count = COALESCE($5, custodian_count),
        issued_by = COALESCE($6, issued_by),
        issued_date = COALESCE($7, issued_date),
        release_date = COALESCE($8, release_date),
        hold_type = COALESCE($9, hold_type),
        notification_sent = COALESCE($10, notification_sent),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [case_id, hold_name, description, status, custodian_count, issued_by, issued_date, release_date, hold_type, notification_sent, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Legal hold not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating legal hold:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/legal-holds/:id - Delete legal hold
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM legal_holds WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Legal hold not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting legal hold:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/legal-holds/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM legal_holds WHERE id = $1', [id]);
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
          { role: 'system', content: 'Legal hold compliance expert. Analyze this legal hold and assess compliance gaps, risk of spoliation, notification effectiveness, and recommendations.' },
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
