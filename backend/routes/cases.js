const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/cases - List all cases
router.get('/', auth, async (req, res) => {
  try {
    const { status, matter_type, priority, lead_attorney } = req.query;
    let query = 'SELECT * FROM cases';
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (matter_type) {
      params.push(matter_type);
      conditions.push(`matter_type = $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      conditions.push(`priority = $${params.length}`);
    }
    if (lead_attorney) {
      params.push(`%${lead_attorney}%`);
      conditions.push(`lead_attorney ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cases:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cases/:id - Get one case
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cases WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching case:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cases - Create new case
router.post('/', auth, async (req, res) => {
  try {
    const { case_name, case_number, client_name, matter_type, status, description, lead_attorney, date_filed, court_jurisdiction, opposing_counsel, priority } = req.body;
    const result = await pool.query(
      `INSERT INTO cases (case_name, case_number, client_name, matter_type, status, description, lead_attorney, date_filed, court_jurisdiction, opposing_counsel, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [case_name || null, case_number || null, client_name || null, matter_type || null, status || null, description || null, lead_attorney || null, date_filed || null, court_jurisdiction || null, opposing_counsel || null, priority || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating case:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cases/:id - Update case
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_name, case_number, client_name, matter_type, status, description, lead_attorney, date_filed, court_jurisdiction, opposing_counsel, priority } = req.body;
    const result = await pool.query(
      `UPDATE cases SET
        case_name = COALESCE($1, case_name),
        case_number = COALESCE($2, case_number),
        client_name = COALESCE($3, client_name),
        matter_type = COALESCE($4, matter_type),
        status = COALESCE($5, status),
        description = COALESCE($6, description),
        lead_attorney = COALESCE($7, lead_attorney),
        date_filed = COALESCE($8, date_filed),
        court_jurisdiction = COALESCE($9, court_jurisdiction),
        opposing_counsel = COALESCE($10, opposing_counsel),
        priority = COALESCE($11, priority),
        updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [case_name, case_number, client_name, matter_type, status, description, lead_attorney, date_filed, court_jurisdiction, opposing_counsel, priority, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating case:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cases/:id - Delete case
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cases WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting case:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cases/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cases WHERE id = $1', [id]);
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
          { role: 'system', content: 'Expert eDiscovery consultant. Analyze this case and provide risk assessment, strategic recommendations, cost projections, and key considerations.' },
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
