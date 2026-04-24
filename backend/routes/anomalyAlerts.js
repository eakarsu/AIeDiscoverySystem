const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/anomaly-alerts - List all anomaly alerts
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, severity, status, alert_type } = req.query;
    let query = 'SELECT * FROM anomaly_alerts';
    const conditions = [];
    const params = [];

    if (case_id) {
      params.push(case_id);
      conditions.push(`case_id = $${params.length}`);
    }
    if (severity) {
      params.push(severity);
      conditions.push(`severity = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (alert_type) {
      params.push(alert_type);
      conditions.push(`alert_type = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching anomaly alerts:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/anomaly-alerts/:id - Get one anomaly alert
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM anomaly_alerts WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Anomaly alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching anomaly alert:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/anomaly-alerts - Create new anomaly alert
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, alert_title, description, severity, alert_type, detected_date, affected_custodian, affected_date_range, status, ai_confidence } = req.body;
    const result = await pool.query(
      `INSERT INTO anomaly_alerts (case_id, alert_title, description, severity, alert_type, detected_date, affected_custodian, affected_date_range, status, ai_confidence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [case_id || null, alert_title || null, description || null, severity || null, alert_type || null, detected_date || null, affected_custodian || null, affected_date_range || null, status || null, ai_confidence || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating anomaly alert:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/anomaly-alerts/:id - Update anomaly alert
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, alert_title, description, severity, alert_type, detected_date, affected_custodian, affected_date_range, status, ai_confidence } = req.body;
    const result = await pool.query(
      `UPDATE anomaly_alerts SET
        case_id = COALESCE($1, case_id),
        alert_title = COALESCE($2, alert_title),
        description = COALESCE($3, description),
        severity = COALESCE($4, severity),
        alert_type = COALESCE($5, alert_type),
        detected_date = COALESCE($6, detected_date),
        affected_custodian = COALESCE($7, affected_custodian),
        affected_date_range = COALESCE($8, affected_date_range),
        status = COALESCE($9, status),
        ai_confidence = COALESCE($10, ai_confidence),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [case_id, alert_title, description, severity, alert_type, detected_date, affected_custodian, affected_date_range, status, ai_confidence, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Anomaly alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating anomaly alert:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/anomaly-alerts/:id - Delete anomaly alert
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM anomaly_alerts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Anomaly alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting anomaly alert:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/anomaly-alerts/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM anomaly_alerts WHERE id = $1', [id]);
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
          { role: 'system', content: 'Data anomaly investigator. Analyze this alert, assess root cause, potential impact on the case, and recommend investigation steps.' },
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
