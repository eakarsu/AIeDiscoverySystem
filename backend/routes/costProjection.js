// Cost projection: estimate review hours and cost from document volume.
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const REVIEW_RATE_PER_HOUR = Number(process.env.REVIEW_RATE_PER_HOUR || 75); // $/hr
const DOCS_PER_HOUR = Number(process.env.DOCS_PER_HOUR || 35);

// GET /api/cost-projection/:case_id
router.get('/:case_id', auth, async (req, res) => {
  try {
    const { case_id } = req.params;
    let docCount = 0;
    try {
      const r = await pool.query(`SELECT count(*) FROM documents WHERE case_id = $1`, [case_id]);
      docCount = Number(r.rows[0].count);
    } catch {}

    let collectionGb = 0;
    try {
      const r = await pool.query(`SELECT COALESCE(SUM(size_bytes),0) AS bytes FROM documents WHERE case_id = $1`, [case_id]);
      collectionGb = Number(r.rows[0].bytes) / (1024 ** 3);
    } catch {}

    const hours = docCount / DOCS_PER_HOUR;
    const reviewCost = hours * REVIEW_RATE_PER_HOUR;
    const storageCost = collectionGb * 0.10 * 12; // ~$0.10/GB/mo for 12 mo
    const processingCost = collectionGb * 50; // $50/GB processing

    return res.json({
      case_id,
      document_count: docCount,
      collection_gb: Math.round(collectionGb * 100) / 100,
      review_hours: Math.round(hours),
      cost_breakdown: {
        review: Math.round(reviewCost),
        processing: Math.round(processingCost),
        storage_12mo: Math.round(storageCost),
        total: Math.round(reviewCost + processingCost + storageCost),
      },
      assumptions: { REVIEW_RATE_PER_HOUR, DOCS_PER_HOUR, storage_per_gb_month: 0.1, processing_per_gb: 50 },
    });
  } catch (e) {
    console.error('cost-projection error:', e);
    return res.status(500).json({ error: 'projection failed' });
  }
});

module.exports = router;
