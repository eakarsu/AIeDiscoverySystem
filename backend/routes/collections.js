const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/collections - List all collections
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, status, source_type, verification_status } = req.query;
    let query = 'SELECT * FROM collections';
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
    if (source_type) {
      params.push(source_type);
      conditions.push(`source_type = $${params.length}`);
    }
    if (verification_status) {
      params.push(verification_status);
      conditions.push(`verification_status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/collections/:id - Get one collection
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM collections WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Collection not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching collection:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections - Create new collection
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, collection_name, source_type, custodian, status, total_items, total_size_gb, collected_by, collection_date, verification_status } = req.body;
    const result = await pool.query(
      `INSERT INTO collections (case_id, collection_name, source_type, custodian, status, total_items, total_size_gb, collected_by, collection_date, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [case_id || null, collection_name || null, source_type || null, custodian || null, status || null, total_items || null, total_size_gb || null, collected_by || null, collection_date || null, verification_status || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating collection:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/collections/:id - Update collection
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, collection_name, source_type, custodian, status, total_items, total_size_gb, collected_by, collection_date, verification_status } = req.body;
    const result = await pool.query(
      `UPDATE collections SET
        case_id = COALESCE($1, case_id),
        collection_name = COALESCE($2, collection_name),
        source_type = COALESCE($3, source_type),
        custodian = COALESCE($4, custodian),
        status = COALESCE($5, status),
        total_items = COALESCE($6, total_items),
        total_size_gb = COALESCE($7, total_size_gb),
        collected_by = COALESCE($8, collected_by),
        collection_date = COALESCE($9, collection_date),
        verification_status = COALESCE($10, verification_status),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [case_id, collection_name, source_type, custodian, status, total_items, total_size_gb, collected_by, collection_date, verification_status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Collection not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating collection:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:id - Delete collection
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM collections WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Collection not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting collection:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM collections WHERE id = $1', [id]);
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
          { role: 'system', content: 'Data collection specialist. Analyze this collection and assess completeness, data integrity, potential gaps, and verification recommendations.' },
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
