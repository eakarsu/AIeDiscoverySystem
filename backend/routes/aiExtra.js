// Stub: aiExtra (placeholder so server boots).
const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.json({ ok: true, note: 'aiExtra stub' }));
module.exports = router;
