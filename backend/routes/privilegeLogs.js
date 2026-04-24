const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/privilege-logs - List all privilege logs
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, privilege_type, status, reviewer } = req.query;
    let query = 'SELECT * FROM privilege_logs';
    const conditions = [];
    const params = [];

    if (case_id) {
      params.push(case_id);
      conditions.push(`case_id = $${params.length}`);
    }
    if (privilege_type) {
      params.push(privilege_type);
      conditions.push(`privilege_type = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (reviewer) {
      params.push(`%${reviewer}%`);
      conditions.push(`reviewer ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching privilege logs:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/privilege-logs/:id - Get one privilege log
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM privilege_logs WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Privilege log not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching privilege log:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/privilege-logs - Create new privilege log
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, document_title, bates_number, privilege_type, basis, author, recipients, date_of_communication, status, reviewer } = req.body;
    const result = await pool.query(
      `INSERT INTO privilege_logs (case_id, document_title, bates_number, privilege_type, basis, author, recipients, date_of_communication, status, reviewer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [case_id || null, document_title || null, bates_number || null, privilege_type || null, basis || null, author || null, recipients || null, date_of_communication || null, status || null, reviewer || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating privilege log:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/privilege-logs/:id - Update privilege log
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, document_title, bates_number, privilege_type, basis, author, recipients, date_of_communication, status, reviewer } = req.body;
    const result = await pool.query(
      `UPDATE privilege_logs SET
        case_id = COALESCE($1, case_id),
        document_title = COALESCE($2, document_title),
        bates_number = COALESCE($3, bates_number),
        privilege_type = COALESCE($4, privilege_type),
        basis = COALESCE($5, basis),
        author = COALESCE($6, author),
        recipients = COALESCE($7, recipients),
        date_of_communication = COALESCE($8, date_of_communication),
        status = COALESCE($9, status),
        reviewer = COALESCE($10, reviewer),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [case_id, document_title, bates_number, privilege_type, basis, author, recipients, date_of_communication, status, reviewer, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Privilege log not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating privilege log:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/privilege-logs/:id - Delete privilege log
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM privilege_logs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Privilege log not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting privilege log:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/privilege-logs/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM privilege_logs WHERE id = $1', [id]);
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
          { role: 'system', content: 'Privilege review expert. Analyze this privilege claim\'s strength, potential challenges, waiver risks, and documentation adequacy.' },
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
