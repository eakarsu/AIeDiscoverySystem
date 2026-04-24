const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/email-threads - List all email threads
router.get('/', auth, async (req, res) => {
  try {
    const { case_id, sentiment, has_attachments } = req.query;
    let query = 'SELECT * FROM email_threads';
    const conditions = [];
    const params = [];

    if (case_id) {
      params.push(case_id);
      conditions.push(`case_id = $${params.length}`);
    }
    if (sentiment) {
      params.push(sentiment);
      conditions.push(`sentiment = $${params.length}`);
    }
    if (has_attachments) {
      params.push(has_attachments === 'true');
      conditions.push(`has_attachments = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching email threads:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/email-threads/:id - Get one email thread
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM email_threads WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Email thread not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching email thread:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/email-threads - Create new email thread
router.post('/', auth, async (req, res) => {
  try {
    const { case_id, thread_subject, participant_count, message_count, date_range, key_participants, has_attachments, sentiment, relevance_score, thread_summary } = req.body;
    const result = await pool.query(
      `INSERT INTO email_threads (case_id, thread_subject, participant_count, message_count, date_range, key_participants, has_attachments, sentiment, relevance_score, thread_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [case_id || null, thread_subject || null, participant_count || null, message_count || null, date_range || null, key_participants || null, has_attachments || null, sentiment || null, relevance_score || null, thread_summary || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating email thread:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/email-threads/:id - Update email thread
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { case_id, thread_subject, participant_count, message_count, date_range, key_participants, has_attachments, sentiment, relevance_score, thread_summary } = req.body;
    const result = await pool.query(
      `UPDATE email_threads SET
        case_id = COALESCE($1, case_id),
        thread_subject = COALESCE($2, thread_subject),
        participant_count = COALESCE($3, participant_count),
        message_count = COALESCE($4, message_count),
        date_range = COALESCE($5, date_range),
        key_participants = COALESCE($6, key_participants),
        has_attachments = COALESCE($7, has_attachments),
        sentiment = COALESCE($8, sentiment),
        relevance_score = COALESCE($9, relevance_score),
        thread_summary = COALESCE($10, thread_summary),
        updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [case_id, thread_subject, participant_count, message_count, date_range, key_participants, has_attachments, sentiment, relevance_score, thread_summary, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Email thread not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating email thread:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/email-threads/:id - Delete email thread
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM email_threads WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Email thread not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting email thread:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/email-threads/:id/analyze - AI analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM email_threads WHERE id = $1', [id]);
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
          { role: 'system', content: 'Email communication analyst. Analyze this thread for key topics, sentiment patterns, relationships, and potential relevance indicators.' },
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
