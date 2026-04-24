const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/data-sources - List all data sources
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, source_type, connection_status, collection_priority } = req.query;
    let query = 'SELECT * FROM data_sources';
    const conditions = [];
    const params = [];

    if (case_id) {
      params.push(case_id);
      conditions.push(`case_id = $${params.length}`);
    }
    if (source_type) {
      params.push(source_type);
      conditions.push(`source_type = $${params.length}`);
    }
    if (connection_status) {
      params.push(connection_status);
      conditions.push(`connection_status = $${params.length}`);
    }
    if (collection_priority) {
      params.push(collection_priority);
      conditions.push(`collection_priority = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching data sources:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/data-sources/:id - Get one data source
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM data_sources WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Data source not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching data source:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/data-sources - Create new data source
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, source_name, source_type, connection_status, custodian, total_items, total_size_gb, last_synced, credentials_stored, collection_priority } = req.body;
    const result = await pool.query(
      `INSERT INTO data_sources (case_id, source_name, source_type, connection_status, custodian, total_items, total_size_gb, last_synced, credentials_stored, collection_priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [case_id || null, source_name || null, source_type || null, connection_status || null, custodian || null, total_items || null, total_size_gb || null, last_synced || null, credentials_stored || null, collection_priority || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating data source:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/data-sources/:id - Update data source
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, source_name, source_type, connection_status, custodian, total_items, total_size_gb, last_synced, credentials_stored, collection_priority } = req.body;
    const result = await pool.query(
      `UPDATE data_sources SET
        case_id = COALESCE($1, case_id),
        source_name = COALESCE($2, source_name),
        source_type = COALESCE($3, source_type),
        connection_status = COALESCE($4, connection_status),
        custodian = COALESCE($5, custodian),
        total_items = COALESCE($6, total_items),
        total_size_gb = COALESCE($7, total_size_gb),
        last_synced = COALESCE($8, last_synced),
        credentials_stored = COALESCE($9, credentials_stored),
        collection_priority = COALESCE($10, collection_priority),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [case_id, source_name, source_type, connection_status, custodian, total_items, total_size_gb, last_synced, credentials_stored, collection_priority, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Data source not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating data source:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/data-sources/:id - Delete data source
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM data_sources WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Data source not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting data source:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/data-sources/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM data_sources WHERE id = $1', [id]);
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
          { role: 'system', content: 'Data source analyst. Assess this source\'s completeness, connection reliability, data integrity, and collection recommendations.' },
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
