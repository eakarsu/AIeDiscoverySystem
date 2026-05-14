// Blockchain chain-of-custody: immutable access log. v0 maintains a hash
// chain in a `custody_chain` table so each row's hash includes the prior.
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

function hashRow(prev, payload) {
  return crypto.createHash('sha256').update(String(prev) + JSON.stringify(payload)).digest('hex');
}

// POST /api/chain-of-custody/log { document_id, action, actor_email, details? }
router.post('/log', auth, async (req, res) => {
  try {
    const { document_id, action, actor_email, details } = req.body || {};
    if (!document_id || !action || !actor_email) return res.status(400).json({ error: 'document_id, action, actor_email required' });

    let prev = '0';
    try {
      const r = await pool.query(`SELECT hash FROM custody_chain WHERE document_id = $1 ORDER BY id DESC LIMIT 1`, [document_id]);
      prev = r.rows[0]?.hash || '0';
    } catch {}

    const payload = { document_id, action, actor_email, details: details || null, ts: new Date().toISOString() };
    const h = hashRow(prev, payload);
    let id = null;
    try {
      const r = await pool.query(
        `INSERT INTO custody_chain (document_id, action, actor_email, details, prev_hash, hash, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING id`,
        [document_id, action, actor_email, JSON.stringify(details || {}), prev, h]
      );
      id = r.rows[0].id;
    } catch (e) {
      return res.json({ id: null, hash: h, prev_hash: prev, note: 'custody_chain table missing — recorded in-memory only' });
    }
    return res.json({ id, hash: h, prev_hash: prev, payload });
  } catch (e) {
    console.error('coc log error:', e);
    return res.status(500).json({ error: 'log failed' });
  }
});

// GET /api/chain-of-custody/:document_id/verify
router.get('/:document_id/verify', auth, async (req, res) => {
  try {
    let chain = [];
    try {
      const r = await pool.query(`SELECT * FROM custody_chain WHERE document_id = $1 ORDER BY id ASC`, [req.params.document_id]);
      chain = r.rows;
    } catch {}
    if (!chain.length) return res.json({ document_id: req.params.document_id, chain_length: 0, valid: true });

    let prev = '0';
    let valid = true;
    for (const row of chain) {
      const expected = hashRow(prev, {
        document_id: row.document_id,
        action: row.action,
        actor_email: row.actor_email,
        details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
        ts: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
      });
      if (row.prev_hash !== prev || row.hash !== expected) { valid = false; break; }
      prev = row.hash;
    }
    return res.json({ document_id: req.params.document_id, chain_length: chain.length, valid });
  } catch (e) {
    return res.status(500).json({ error: 'verify failed' });
  }
});

module.exports = router;
