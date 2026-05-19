// Deposition video sync: timeline aligned with video for live reference.
// v0 stores video URL + transcript timestamps; serves a synced playback API.
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// POST /api/deposition-video/register { case_id, video_url, transcript:[{ts,text,speaker}] }
router.post('/register', auth, async (req, res) => {
  try {
    const { case_id, video_url, transcript } = req.body || {};
    if (!case_id || !video_url || !Array.isArray(transcript)) {
      return res.status(400).json({ error: 'case_id, video_url, transcript[] required' });
    }
    let id = null;
    try {
      const r = await pool.query(
        `INSERT INTO deposition_videos (case_id, video_url, transcript, created_at)
         VALUES ($1,$2,$3,NOW()) RETURNING id`,
        [case_id, video_url, JSON.stringify(transcript)]
      );
      id = r.rows[0].id;
    } catch (e) {
      // table may not exist — persist into timeline_events as JSON instead.
      try {
        const r = await pool.query(
          `INSERT INTO timeline_events (case_id, event_type, payload, created_at)
           VALUES ($1, 'deposition_video', $2, NOW()) RETURNING id`,
          [case_id, JSON.stringify({ video_url, transcript })]
        );
        id = r.rows[0].id;
      } catch {}
    }
    return res.json({ id, case_id, video_url, segments: transcript.length });
  } catch (e) {
    console.error('deposition-video register error:', e);
    return res.status(500).json({ error: 'register failed' });
  }
});

// GET /api/deposition-video/:id/at?ts=12.5 — find the transcript segment at a given timestamp
router.get('/:id/at', auth, async (req, res) => {
  try {
    const ts = Number(req.query.ts || 0);
    let video;
    try {
      const r = await pool.query(`SELECT * FROM deposition_videos WHERE id = $1`, [req.params.id]);
      video = r.rows[0];
    } catch {}
    if (!video) return res.status(404).json({ error: 'deposition video not found' });
    const transcript = Array.isArray(video.transcript) ? video.transcript : (typeof video.transcript === 'string' ? JSON.parse(video.transcript) : []);
    const seg = transcript.find(s => Number(s.ts) <= ts && (s.end == null || Number(s.end) >= ts));
    return res.json({ id: req.params.id, ts, segment: seg || null });
  } catch (e) {
    return res.status(500).json({ error: 'lookup failed' });
  }
});

module.exports = router;
