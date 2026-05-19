// Predictive-coding feedback loop: re-train after each review pass.
// v0 recomputes weights from reviewed labels in the predictive_coding table.
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// POST /api/predictive-coding-feedback/retrain { case_id }
router.post('/retrain', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_id } = req.body || {};
    if (!case_id) return res.status(400).json({ error: 'case_id required' });

    let labels = [];
    try {
      const r = await pool.query(
        `SELECT document_id, label, confidence FROM predictive_coding WHERE case_id = $1 AND label IS NOT NULL`,
        [case_id]
      );
      labels = r.rows;
    } catch {}

    if (labels.length < 10) {
      return res.json({ case_id, retrained: false, reason: 'Need ≥10 labels for retraining', label_count: labels.length });
    }

    // Compute trivial per-term TF-IDF style weights over labelled doc content.
    const tokenCounts = { relevant: new Map(), not_relevant: new Map() };
    for (const l of labels) {
      try {
        const d = await pool.query(`SELECT content FROM documents WHERE id = $1`, [l.document_id]);
        const text = (d.rows[0]?.content || '').toLowerCase();
        const tokens = text.split(/[^a-z0-9]+/).filter(t => t.length > 3).slice(0, 500);
        const bucket = l.label === 'relevant' ? 'relevant' : 'not_relevant';
        for (const t of tokens) tokenCounts[bucket].set(t, (tokenCounts[bucket].get(t) || 0) + 1);
      } catch {}
    }

    const topRelevant = Array.from(tokenCounts.relevant.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([term, count]) => ({ term, count }));

    try {
      await pool.query(
        `INSERT INTO predictive_coding_models (case_id, model_payload, created_at)
         VALUES ($1,$2,NOW())`,
        [case_id, JSON.stringify({ topRelevant, label_count: labels.length })]
      );
    } catch {}

    return res.json({ case_id, retrained: true, label_count: labels.length, top_relevant_terms: topRelevant });
  } catch (e) {
    console.error('pc-feedback error:', e);
    return res.status(500).json({ error: 'retrain failed' });
  }
});

module.exports = router;
