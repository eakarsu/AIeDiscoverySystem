// Court-format export: produce TIFF + LOAD-file manifest for opposing
// counsel. v0 emits the LOAD file as text and lists TIFF paths.
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// POST /api/court-format-export/:production_id
router.post('/:production_id', auth, async (req, res) => {
  try {
    const { production_id } = req.params;
    let production;
    try {
      const r = await pool.query(`SELECT * FROM productions WHERE id = $1`, [production_id]);
      production = r.rows[0];
    } catch {}
    if (!production) return res.status(404).json({ error: 'production not found' });

    let docs = [];
    try {
      const r = await pool.query(`SELECT * FROM documents WHERE production_id = $1 LIMIT 5000`, [production_id]);
      docs = r.rows;
    } catch {}

    // LOAD file (Concordance-style DAT). Columns: control number, bates, file path
    const delim = ''; // standard Concordance delimiter
    const header = ['BEGDOC', 'ENDDOC', 'AUTHOR', 'DATE_SENT', 'TIFF_PATH'].join(delim);
    const lines = docs.map((d, i) => {
      const bates = `PROD${String(production_id).padStart(4, '0')}-${String(i + 1).padStart(7, '0')}`;
      const tiffPath = `tiffs/${bates}.tif`;
      return [bates, bates, d.author || '', d.date_sent || '', tiffPath].join(delim);
    });

    return res.json({
      production_id,
      document_count: docs.length,
      load_file: [header, ...lines].join('\n'),
      tiff_paths: docs.map((_, i) => `tiffs/PROD${String(production_id).padStart(4, '0')}-${String(i + 1).padStart(7, '0')}.tif`),
      notice: 'TIFF rendering itself is not performed in v0 — paths reserved for downstream renderer.',
    });
  } catch (e) {
    console.error('court-format error:', e);
    return res.status(500).json({ error: 'export failed' });
  }
});

module.exports = router;
