// NEW FEATURE 1: Document upload + AI text extraction + auto-classify pipeline
// Multer disk storage + SHA-256 hashing for dedup + auto-call to /api/ai/classify-document

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../services/openrouter');
const { parseAIJson } = require('../utils/parseAIJson');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^A-Za-z0-9._-]/g, '_');
    cb(null, `${ts}_${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

function hashFile(filepath) {
  const buffer = fs.readFileSync(filepath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Naive text extraction - reads first ~10KB of UTF-8 text-decodable content.
// In production this would route to Tesseract for images and pdf-parse for PDFs.
function extractTextNaive(filepath) {
  try {
    const stats = fs.statSync(filepath);
    const limit = Math.min(stats.size, 10 * 1024);
    const buf = Buffer.alloc(limit);
    const fd = fs.openSync(filepath, 'r');
    fs.readSync(fd, buf, 0, limit, 0);
    fs.closeSync(fd);
    return buf.toString('utf8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  } catch (e) {
    return '';
  }
}

// POST /api/document-upload/:document_id - upload a file for an existing document and auto-classify
router.post('/:document_id', auth, upload.single('file'), aiRateLimiter, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required' });
    const document_id = parseInt(req.params.document_id);

    const docRes = await pool.query('SELECT * FROM documents WHERE id = $1', [document_id]);
    if (docRes.rows.length === 0) {
      // cleanup file
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(404).json({ error: 'Document not found' });
    }
    const doc = docRes.rows[0];

    const fileHash = hashFile(req.file.path);

    // Dedup check - same hash already uploaded?
    const dupRes = await pool.query(
      'SELECT * FROM document_files WHERE file_hash = $1 LIMIT 1',
      [fileHash]
    );
    let extractedText = '';
    let extractionStatus = 'extracted';
    let duplicateOf = null;
    if (dupRes.rows.length > 0) {
      duplicateOf = dupRes.rows[0].id;
      extractedText = dupRes.rows[0].extracted_text || '';
      extractionStatus = 'duplicate';
    } else {
      extractedText = extractTextNaive(req.file.path);
    }

    const insertRes = await pool.query(
      `INSERT INTO document_files
        (document_id, filename, storage_path, file_hash, extracted_text, extraction_status, duplicate_of, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [document_id, req.file.originalname, req.file.path, fileHash, extractedText, extractionStatus, duplicateOf, req.user.id]
    );
    const fileRow = insertRes.rows[0];

    // Update document content_preview with first 4000 chars of extracted text
    await pool.query(
      `UPDATE documents SET content_preview = $1, hash_value = $2, updated_at = NOW() WHERE id = $3`,
      [(extractedText || '').slice(0, 4000), fileHash, document_id]
    );

    // Auto-classify only if not duplicate
    let classification = null;
    if (extractionStatus !== 'duplicate' && extractedText.trim().length > 50) {
      try {
        const systemPrompt = 'You are an expert eDiscovery attorney. Classify documents for privilege/relevance/sensitivity. Always return strict JSON only.';
        const messages = [
          {
            role: 'user',
            content: `Classify this newly uploaded document.

Title: ${doc.title}
File type: ${doc.file_type || 'Unknown'}
Custodian: ${doc.custodian || 'Unknown'}
Extracted text (first 4000 chars):
${extractedText.slice(0, 4000)}

Return JSON:
{
  "privilege_status": "<privileged|not_privileged|potentially_privileged>",
  "is_privileged": <bool>,
  "is_relevant": <bool>,
  "relevance_reason": "<string>",
  "sensitivity_level": "<low|medium|high|critical>",
  "key_topics": ["<string>", ...],
  "recommended_handling": "<string>"
}`,
          },
        ];
        const ai = await callOpenRouter(messages, systemPrompt);
        classification = parseAIJson(ai);
        if (classification && classification.is_privileged) {
          await pool.query("UPDATE documents SET review_status = 'privileged' WHERE id = $1", [document_id]);
        } else if (classification && classification.is_relevant) {
          await pool.query("UPDATE documents SET review_status = 'relevant' WHERE id = $1", [document_id]);
        }

        await pool.query(
          `INSERT INTO ai_logs (endpoint, user_id, document_id, input, ai_results, raw_response, status, synthesized)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          ['document-upload/auto-classify', req.user.id, document_id, JSON.stringify({ filename: req.file.originalname }), classification ? JSON.stringify(classification) : null, ai, classification ? 'success' : 'parse_failed', !!(classification && classification.synthesized)]
        );
      } catch (aiErr) {
        console.error('auto-classify failed:', aiErr.message);
      }
    }

    res.status(201).json({
      file: fileRow,
      classification,
      duplicate: extractionStatus === 'duplicate',
      duplicate_of: duplicateOf,
    });
  } catch (err) {
    console.error('Upload error:', err);
    if (req.file && req.file.path) try { fs.unlinkSync(req.file.path); } catch {}
    res.status(500).json({ error: err.message });
  }
});

// GET /api/document-upload/document/:document_id - list files for document
router.get('/document/:document_id', auth, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM document_files WHERE document_id = $1 ORDER BY uploaded_at DESC',
      [req.params.document_id]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/document-upload/file/:id
router.delete('/file/:id', auth, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM document_files WHERE id = $1 RETURNING *', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    try { fs.unlinkSync(r.rows[0].storage_path); } catch {}
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
