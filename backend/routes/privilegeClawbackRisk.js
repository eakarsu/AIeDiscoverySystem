const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({
  summary: { docs_reviewed: 18200, clawback_risk: 43, privileged_threads: 118, qc_queue: 27 },
  documents: [
    { doc: 'DOC-88421', reason: 'attorney copied late in thread', risk: 'high', action: 'second-level privilege review' },
    { doc: 'DOC-90118', reason: 'legal advice language', risk: 'medium', action: 'redaction check' },
    { doc: 'DOC-90552', reason: 'business-only thread', risk: 'low', action: 'release after sampling' },
  ],
}));

module.exports = router;
