const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/documents - List all documents with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, file_type, review_status, custodian, page, limit } = req.query;
    const conditions = [];
    const params = [];

    if (case_id) {
      params.push(case_id);
      conditions.push(`case_id = $${params.length}`);
    }
    if (file_type) {
      params.push(file_type);
      conditions.push(`file_type = $${params.length}`);
    }
    if (review_status) {
      params.push(review_status);
      conditions.push(`review_status = $${params.length}`);
    }
    if (custodian) {
      params.push(`%${custodian}%`);
      conditions.push(`custodian ILIKE $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const countResult = await pool.query(`SELECT COUNT(*) FROM documents${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const dataParams = [...params, limitNum, offset];
    const dataResult = await pool.query(
      `SELECT * FROM documents${whereClause} ORDER BY created_at DESC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    res.json({
      data: dataResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/:id - Get one document
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching document:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents - Create new document
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, title, file_type, file_size_mb, custodian, source, review_status, content_preview, date_collected, bates_number, hash_value } = req.body;
    if (!title || !case_id) {
      return res.status(400).json({ error: 'Validation failed: title and case_id are required.' });
    }
    const result = await pool.query(
      `INSERT INTO documents (case_id, title, file_type, file_size_mb, custodian, source, review_status, content_preview, date_collected, bates_number, hash_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [case_id || null, title || null, file_type || null, file_size_mb || null, custodian || null, source || null, review_status || null, content_preview || null, date_collected || null, bates_number || null, hash_value || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating document:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/documents/:id - Update document
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, title, file_type, file_size_mb, custodian, source, review_status, content_preview, date_collected, bates_number, hash_value } = req.body;
    const result = await pool.query(
      `UPDATE documents SET
        case_id = COALESCE($1, case_id),
        title = COALESCE($2, title),
        file_type = COALESCE($3, file_type),
        file_size_mb = COALESCE($4, file_size_mb),
        custodian = COALESCE($5, custodian),
        source = COALESCE($6, source),
        review_status = COALESCE($7, review_status),
        content_preview = COALESCE($8, content_preview),
        date_collected = COALESCE($9, date_collected),
        bates_number = COALESCE($10, bates_number),
        hash_value = COALESCE($11, hash_value),
        updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [case_id, title, file_type, file_size_mb, custodian, source, review_status, content_preview, date_collected, bates_number, hash_value, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/documents/:id - Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
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
          { role: 'system', content: 'Expert document analyst. Analyze this document\'s metadata and provide relevance assessment, key content indicators, privilege risk, and review priority.' },
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
