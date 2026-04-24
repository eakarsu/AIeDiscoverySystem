const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/processing-jobs - List all processing jobs
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, status, processing_type } = req.query;
    let query = 'SELECT * FROM processing_jobs';
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
    if (processing_type) {
      params.push(processing_type);
      conditions.push(`processing_type = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching processing jobs:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/processing-jobs/:id - Get one processing job
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM processing_jobs WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Processing job not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching processing job:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/processing-jobs - Create new processing job
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, job_name, status, total_documents, processed_count, duplicate_count, error_count, processing_type, started_at, completed_at } = req.body;
    const result = await pool.query(
      `INSERT INTO processing_jobs (case_id, job_name, status, total_documents, processed_count, duplicate_count, error_count, processing_type, started_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [case_id || null, job_name || null, status || null, total_documents || null, processed_count || null, duplicate_count || null, error_count || null, processing_type || null, started_at || null, completed_at || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating processing job:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/processing-jobs/:id - Update processing job
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, job_name, status, total_documents, processed_count, duplicate_count, error_count, processing_type, started_at, completed_at } = req.body;
    const result = await pool.query(
      `UPDATE processing_jobs SET
        case_id = COALESCE($1, case_id),
        job_name = COALESCE($2, job_name),
        status = COALESCE($3, status),
        total_documents = COALESCE($4, total_documents),
        processed_count = COALESCE($5, processed_count),
        duplicate_count = COALESCE($6, duplicate_count),
        error_count = COALESCE($7, error_count),
        processing_type = COALESCE($8, processing_type),
        started_at = COALESCE($9, started_at),
        completed_at = COALESCE($10, completed_at),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [case_id, job_name, status, total_documents, processed_count, duplicate_count, error_count, processing_type, started_at, completed_at, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Processing job not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating processing job:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/processing-jobs/:id - Delete processing job
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM processing_jobs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Processing job not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting processing job:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/processing-jobs/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM processing_jobs WHERE id = $1', [id]);
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
          { role: 'system', content: 'Document processing analyst. Analyze this processing job\'s metrics, identify quality issues, optimization opportunities, and estimated completion.' },
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
