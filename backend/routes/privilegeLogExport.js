// Stub: privilegeLogExport (placeholder so server boots).
const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.json({ ok: true, note: 'privilegeLogExport stub' }));
module.exports = router;
