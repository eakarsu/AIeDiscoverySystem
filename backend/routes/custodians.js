const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/custodians - List all custodians
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, status, hold_status, department } = req.query;
    let query = 'SELECT * FROM custodians';
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
    if (hold_status) {
      params.push(hold_status);
      conditions.push(`hold_status = $${params.length}`);
    }
    if (department) {
      params.push(`%${department}%`);
      conditions.push(`department ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching custodians:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/custodians/:id - Get one custodian
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM custodians WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Custodian not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching custodian:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/custodians - Create new custodian
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, full_name, email, department, title, company, status, data_sources, hold_status, interview_date } = req.body;
    const result = await pool.query(
      `INSERT INTO custodians (case_id, full_name, email, department, title, company, status, data_sources, hold_status, interview_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [case_id || null, full_name || null, email || null, department || null, title || null, company || null, status || null, data_sources || null, hold_status || null, interview_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating custodian:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/custodians/:id - Update custodian
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, full_name, email, department, title, company, status, data_sources, hold_status, interview_date } = req.body;
    const result = await pool.query(
      `UPDATE custodians SET
        case_id = COALESCE($1, case_id),
        full_name = COALESCE($2, full_name),
        email = COALESCE($3, email),
        department = COALESCE($4, department),
        title = COALESCE($5, title),
        company = COALESCE($6, company),
        status = COALESCE($7, status),
        data_sources = COALESCE($8, data_sources),
        hold_status = COALESCE($9, hold_status),
        interview_date = COALESCE($10, interview_date),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [case_id, full_name, email, department, title, company, status, data_sources, hold_status, interview_date, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Custodian not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating custodian:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/custodians/:id - Delete custodian
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM custodians WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Custodian not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting custodian:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/custodians/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM custodians WHERE id = $1', [id]);
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
          { role: 'system', content: 'eDiscovery custodian analyst. Assess this custodian\'s data preservation risk, collection complexity, key data sources, and interview recommendations.' },
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
