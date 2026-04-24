const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/compliance-rules - List all compliance rules
router.get('/', auth, async (req, res) => {
  try {
    const { status, regulation, severity, automated } = req.query;
    let query = 'SELECT * FROM compliance_rules';
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (regulation) {
      params.push(`%${regulation}%`);
      conditions.push(`regulation ILIKE $${params.length}`);
    }
    if (severity) {
      params.push(severity);
      conditions.push(`severity = $${params.length}`);
    }
    if (automated) {
      params.push(automated === 'true');
      conditions.push(`automated = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching compliance rules:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compliance-rules/:id - Get one compliance rule
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM compliance_rules WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Compliance rule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching compliance rule:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/compliance-rules - Create new compliance rule (NO case_id)
router.post('/', auth, async (req, res) => {
  try {
    const { rule_name, description, regulation, status, last_checked, violations_count, affected_cases, severity, automated, remediation_steps } = req.body;
    const result = await pool.query(
      `INSERT INTO compliance_rules (rule_name, description, regulation, status, last_checked, violations_count, affected_cases, severity, automated, remediation_steps)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [rule_name || null, description || null, regulation || null, status || null, last_checked || null, violations_count || null, affected_cases || null, severity || null, automated || null, remediation_steps || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating compliance rule:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/compliance-rules/:id - Update compliance rule
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rule_name, description, regulation, status, last_checked, violations_count, affected_cases, severity, automated, remediation_steps } = req.body;
    const result = await pool.query(
      `UPDATE compliance_rules SET
        rule_name = COALESCE($1, rule_name),
        description = COALESCE($2, description),
        regulation = COALESCE($3, regulation),
        status = COALESCE($4, status),
        last_checked = COALESCE($5, last_checked),
        violations_count = COALESCE($6, violations_count),
        affected_cases = COALESCE($7, affected_cases),
        severity = COALESCE($8, severity),
        automated = COALESCE($9, automated),
        remediation_steps = COALESCE($10, remediation_steps),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [rule_name, description, regulation, status, last_checked, violations_count, affected_cases, severity, automated, remediation_steps, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Compliance rule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating compliance rule:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/compliance-rules/:id - Delete compliance rule
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM compliance_rules WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Compliance rule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting compliance rule:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/compliance-rules/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM compliance_rules WHERE id = $1', [id]);
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
          { role: 'system', content: 'Regulatory compliance analyst. Assess this rule\'s enforcement, identify gaps, evaluate violation trends, and recommend remediation.' },
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
