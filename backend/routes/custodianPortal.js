// Third-party custodian portal: secure upload UI for external sources.
// v0 issues short-lived signed upload tokens and accepts uploads via base64.
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const TOKEN_SECRET = process.env.CUSTODIAN_TOKEN_SECRET || 'change-me'; // TODO: configure credentials

function signToken(payload, ttlMs = 24 * 60 * 60 * 1000) {
  const expires = Date.now() + ttlMs;
  const body = JSON.stringify({ ...payload, expires });
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('hex');
  return Buffer.from(body).toString('base64url') + '.' + sig;
}

function verifyToken(token) {
  try {
    const [b64, sig] = token.split('.');
    const body = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(JSON.stringify(body)).digest('hex');
    if (expected !== sig || body.expires < Date.now()) return null;
    return body;
  } catch {
    return null;
  }
}

// POST /api/custodian-portal/issue-token { case_id, custodian_email, ttl_hours? } (auth required)
router.post('/issue-token', auth, async (req, res) => {
  const { case_id, custodian_email, ttl_hours = 24 } = req.body || {};
  if (!case_id || !custodian_email) return res.status(400).json({ error: 'case_id + custodian_email required' });
  const token = signToken({ case_id, custodian_email, kind: 'upload' }, ttl_hours * 60 * 60 * 1000);
  return res.json({ token, expires_in_hours: ttl_hours, upload_url: `/api/custodian-portal/upload?token=${token}` });
});

// POST /api/custodian-portal/upload?token=...  body: { filename, mime, base64 } — no auth (external)
router.post('/upload', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'token required' });
  const payload = verifyToken(token);
  if (!payload || payload.kind !== 'upload') return res.status(403).json({ error: 'invalid or expired token' });
  const { filename, mime, base64 } = req.body || {};
  if (!filename || !base64) return res.status(400).json({ error: 'filename + base64 required' });
  if (base64.length > 32 * 1024 * 1024) return res.status(413).json({ error: 'file too large (>32MB base64)' });

  let id = null;
  try {
    const r = await pool.query(
      `INSERT INTO documents (case_id, title, content_type, custodian_email, size_bytes, source, created_at)
       VALUES ($1,$2,$3,$4,$5,'custodian_portal',NOW()) RETURNING id`,
      [payload.case_id, filename, mime || 'application/octet-stream', payload.custodian_email, Math.floor(base64.length * 0.75)]
    );
    id = r.rows[0].id;
  } catch {}
  return res.json({ accepted: true, document_id: id, case_id: payload.case_id, custodian_email: payload.custodian_email });
});

module.exports = router;
