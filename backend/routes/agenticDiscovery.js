// Agentic discovery: NL query → chained searches, grouped threads, summary.
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../services/openrouter');

// POST /api/agentic-discovery/run { case_id, query }
router.post('/run', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_id, query } = req.body || {};
    if (!case_id || !query) return res.status(400).json({ error: 'case_id and query required' });

    // 1) Lexical search across documents
    const docs = await pool.query(
      `SELECT id, title, content, custodian_id FROM documents WHERE case_id = $1 AND (content ILIKE $2 OR title ILIKE $2) LIMIT 50`,
      [case_id, `%${query}%`]
    ).catch(() => ({ rows: [] }));

    // 2) Group by email_thread_id if available
    const threadMap = new Map();
    for (const d of docs.rows) {
      const key = d.thread_id || d.id;
      if (!threadMap.has(key)) threadMap.set(key, []);
      threadMap.get(key).push(d);
    }

    // 3) Ask LLM to summarise findings, citing doc IDs
    let summary = null;
    try {
      const sys = 'You are an eDiscovery analyst. Summarise findings for the supplied query with citations to document IDs. Output JSON {"summary":"...","key_documents":[ids],"recommended_next_steps":["..."]}.';
      const ctx = `Query: ${query}\nDocuments: ${JSON.stringify(docs.rows.map(d => ({ id: d.id, title: d.title, excerpt: (d.content || '').slice(0, 200) })))}`;
      const raw = await callOpenRouter([{ role: 'system', content: sys }, { role: 'user', content: ctx }]);
      try { summary = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || raw); } catch { summary = { raw }; }
    } catch (e) {
      summary = { error: e.message };
    }

    return res.json({ case_id, query, matched_documents: docs.rows.length, thread_count: threadMap.size, summary });
  } catch (e) {
    console.error('agentic-discovery error:', e);
    return res.status(500).json({ error: 'discovery failed' });
  }
});

module.exports = router;
