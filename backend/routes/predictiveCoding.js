const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/predictive-coding - List all predictive coding models
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, status, algorithm } = req.query;
    let query = 'SELECT * FROM predictive_coding';
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
    if (algorithm) {
      params.push(algorithm);
      conditions.push(`algorithm = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching predictive coding models:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/predictive-coding/:id - Get one predictive coding model
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM predictive_coding WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Predictive coding model not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching predictive coding model:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/predictive-coding - Create new predictive coding model
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, model_name, description, status, accuracy, precision_score, recall_score, f1_score, training_docs, coded_docs, algorithm } = req.body;
    const result = await pool.query(
      `INSERT INTO predictive_coding (case_id, model_name, description, status, accuracy, precision_score, recall_score, f1_score, training_docs, coded_docs, algorithm)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [case_id || null, model_name || null, description || null, status || null, accuracy || null, precision_score || null, recall_score || null, f1_score || null, training_docs || null, coded_docs || null, algorithm || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating predictive coding model:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/predictive-coding/:id - Update predictive coding model
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, model_name, description, status, accuracy, precision_score, recall_score, f1_score, training_docs, coded_docs, algorithm } = req.body;
    const result = await pool.query(
      `UPDATE predictive_coding SET
        case_id = COALESCE($1, case_id),
        model_name = COALESCE($2, model_name),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        accuracy = COALESCE($5, accuracy),
        precision_score = COALESCE($6, precision_score),
        recall_score = COALESCE($7, recall_score),
        f1_score = COALESCE($8, f1_score),
        training_docs = COALESCE($9, training_docs),
        coded_docs = COALESCE($10, coded_docs),
        algorithm = COALESCE($11, algorithm),
        updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [case_id, model_name, description, status, accuracy, precision_score, recall_score, f1_score, training_docs, coded_docs, algorithm, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Predictive coding model not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating predictive coding model:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/predictive-coding/:id - Delete predictive coding model
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM predictive_coding WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Predictive coding model not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting predictive coding model:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/predictive-coding/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM predictive_coding WHERE id = $1', [id]);
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
          { role: 'system', content: 'Machine learning analyst for document review. Analyze model performance metrics, training adequacy, and provide improvement recommendations.' },
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
