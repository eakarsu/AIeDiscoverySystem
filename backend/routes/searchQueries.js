const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/search-queries - List all search queries
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, query_type, status, created_by } = req.query;
    let query = 'SELECT * FROM search_queries';
    const conditions = [];
    const params = [];

    if (case_id) {
      params.push(case_id);
      conditions.push(`case_id = $${params.length}`);
    }
    if (query_type) {
      params.push(query_type);
      conditions.push(`query_type = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (created_by) {
      params.push(`%${created_by}%`);
      conditions.push(`created_by ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching search queries:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search-queries/:id - Get one search query
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM search_queries WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Search query not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching search query:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/search-queries - Create new search query
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, query_name, search_terms, query_type, results_count, created_by, date_range_start, date_range_end, file_types_filter, status } = req.body;
    const result = await pool.query(
      `INSERT INTO search_queries (case_id, query_name, search_terms, query_type, results_count, created_by, date_range_start, date_range_end, file_types_filter, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [case_id || null, query_name || null, search_terms || null, query_type || null, results_count || null, created_by || null, date_range_start || null, date_range_end || null, file_types_filter || null, status || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating search query:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/search-queries/:id - Update search query
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, query_name, search_terms, query_type, results_count, created_by, date_range_start, date_range_end, file_types_filter, status } = req.body;
    const result = await pool.query(
      `UPDATE search_queries SET
        case_id = COALESCE($1, case_id),
        query_name = COALESCE($2, query_name),
        search_terms = COALESCE($3, search_terms),
        query_type = COALESCE($4, query_type),
        results_count = COALESCE($5, results_count),
        created_by = COALESCE($6, created_by),
        date_range_start = COALESCE($7, date_range_start),
        date_range_end = COALESCE($8, date_range_end),
        file_types_filter = COALESCE($9, file_types_filter),
        status = COALESCE($10, status),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [case_id, query_name, search_terms, query_type, results_count, created_by, date_range_start, date_range_end, file_types_filter, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Search query not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating search query:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/search-queries/:id - Delete search query
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM search_queries WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Search query not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting search query:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/search-queries/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM search_queries WHERE id = $1', [id]);
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
          { role: 'system', content: 'eDiscovery search expert. Analyze this search query for precision, recall optimization, suggest query refinements, and assess coverage.' },
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
