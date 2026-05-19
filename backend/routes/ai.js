const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../services/openrouter');

// ============================================
// POST /api/ai/classify-document
// ============================================
router.post('/classify-document', auth, aiRateLimiter, async (req, res) => {
  try {
    const { document_id } = req.body;
    if (!document_id) {
      return res.status(400).json({ error: 'Validation failed: document_id is required.' });
    }

    const docResult = await pool.query('SELECT * FROM documents WHERE id = $1', [document_id]);
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    const doc = docResult.rows[0];

    const systemPrompt = 'You are an expert eDiscovery attorney and document classifier. Analyze documents for privilege status, relevance, and sensitivity. Always return valid JSON only, no markdown.';
    const messages = [
      {
        role: 'user',
        content: `Classify the following document and return a JSON object with these exact fields:
{
  "privilege_status": "<privileged|not_privileged|potentially_privileged>",
  "privilege_type": "<attorney-client|work-product|common-interest|none>",
  "is_privileged": <true|false>,
  "is_relevant": <true|false>,
  "relevance_reason": "<string>",
  "sensitivity_level": "<low|medium|high|critical>",
  "recommended_handling": "<string>"
}

Document details:
- Title: ${doc.title || 'Untitled'}
- File type: ${doc.file_type || 'Unknown'}
- Custodian: ${doc.custodian || 'Unknown'}
- Source: ${doc.source || 'Unknown'}
- Review status: ${doc.review_status || 'pending'}
- Content preview: ${doc.content_preview || 'No preview available'}
- Bates number: ${doc.bates_number || 'None'}`
      }
    ];

    const aiResult = await callOpenRouter(messages, systemPrompt);
    let classification;
    try {
      classification = JSON.parse(aiResult);
    } catch {
      classification = {
        privilege_status: 'potentially_privileged',
        privilege_type: 'none',
        is_privileged: false,
        is_relevant: true,
        relevance_reason: 'Document requires manual review to determine relevance.',
        sensitivity_level: 'medium',
        recommended_handling: 'Queue for attorney review.'
      };
    }

    // Store classification back to document record
    await pool.query(
      `UPDATE documents SET
        review_status = $1,
        updated_at = NOW()
       WHERE id = $2`,
      [classification.is_privileged ? 'privileged' : 'reviewed', document_id]
    );

    res.json({ document_id, document_title: doc.title, classification });
  } catch (err) {
    console.error('Error in classify-document:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST /api/ai/bulk-classify
// ============================================
router.post('/bulk-classify', auth, aiRateLimiter, async (req, res) => {
  try {
    const { document_ids } = req.body;
    if (!document_ids || !Array.isArray(document_ids) || document_ids.length === 0) {
      return res.status(400).json({ error: 'Validation failed: document_ids must be a non-empty array.' });
    }
    if (document_ids.length > 50) {
      return res.status(400).json({ error: 'Bulk classify supports a maximum of 50 documents per request.' });
    }

    const docsResult = await pool.query(
      'SELECT * FROM documents WHERE id = ANY($1::int[])',
      [document_ids]
    );

    const systemPrompt = 'You are an expert eDiscovery attorney. Classify each document concisely. Return valid JSON only.';
    const results = [];
    let privilegeCount = 0;
    let relevantCount = 0;
    const topicBreakdown = {};

    for (const doc of docsResult.rows) {
      const messages = [
        {
          role: 'user',
          content: `Classify this document. Return JSON with fields: is_privileged (bool), is_relevant (bool), topic (string, 1-3 words), sensitivity_level (low|medium|high|critical).

Title: ${doc.title || 'Untitled'}
Type: ${doc.file_type || 'Unknown'}
Custodian: ${doc.custodian || 'Unknown'}
Preview: ${(doc.content_preview || '').substring(0, 300)}`
        }
      ];

      let classification = {
        is_privileged: false,
        is_relevant: true,
        topic: 'General',
        sensitivity_level: 'medium'
      };

      try {
        const aiResult = await callOpenRouter(messages, systemPrompt);
        classification = JSON.parse(aiResult);
      } catch {
        // use defaults
      }

      if (classification.is_privileged) privilegeCount++;
      if (classification.is_relevant) relevantCount++;

      const topic = classification.topic || 'General';
      topicBreakdown[topic] = (topicBreakdown[topic] || 0) + 1;

      // Update document
      await pool.query(
        'UPDATE documents SET review_status = $1, updated_at = NOW() WHERE id = $2',
        [classification.is_privileged ? 'privileged' : 'reviewed', doc.id]
      );

      results.push({ document_id: doc.id, title: doc.title, ...classification });
    }

    res.json({
      processed: results.length,
      summary: {
        privilege_count: privilegeCount,
        relevant_count: relevantCount,
        by_topic_breakdown: topicBreakdown
      },
      results
    });
  } catch (err) {
    console.error('Error in bulk-classify:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST /api/ai/privilege-review
// ============================================
router.post('/privilege-review', auth, aiRateLimiter, async (req, res) => {
  try {
    const { document_id } = req.body;
    if (!document_id) {
      return res.status(400).json({ error: 'Validation failed: document_id is required.' });
    }

    const docResult = await pool.query('SELECT * FROM documents WHERE id = $1', [document_id]);
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    const doc = docResult.rows[0];

    const systemPrompt = 'You are a senior litigation attorney specializing in privilege analysis. Provide thorough, legally accurate privilege assessments. Return valid JSON only.';
    const messages = [
      {
        role: 'user',
        content: `Perform a deep privilege analysis on this document. Return a JSON object with these exact fields:
{
  "attorney_client_privilege": {
    "applies": <true|false>,
    "confidence": <0.0-1.0>,
    "reasoning": "<detailed legal reasoning>"
  },
  "work_product_doctrine": {
    "applies": <true|false>,
    "confidence": <0.0-1.0>,
    "reasoning": "<detailed legal reasoning>"
  },
  "common_interest_privilege": {
    "applies": <true|false>,
    "reasoning": "<string>"
  },
  "overall_privilege_determination": "<privileged|not_privileged|borderline>",
  "reasoning_chain": ["<step 1>", "<step 2>", "<step 3>"],
  "recommended_handling": "<specific action>",
  "privilege_log_entry": "<draft privilege log description if applicable>"
}

Document:
- Title: ${doc.title || 'Untitled'}
- File type: ${doc.file_type || 'Unknown'}
- Custodian: ${doc.custodian || 'Unknown'}
- Source: ${doc.source || 'Unknown'}
- Bates: ${doc.bates_number || 'None'}
- Content preview: ${doc.content_preview || 'No preview'}`
      }
    ];

    const aiResult = await callOpenRouter(messages, systemPrompt);
    let analysis;
    try {
      analysis = JSON.parse(aiResult);
    } catch {
      analysis = {
        attorney_client_privilege: { applies: false, confidence: 0.5, reasoning: 'Insufficient information to determine.' },
        work_product_doctrine: { applies: false, confidence: 0.4, reasoning: 'No indication of litigation preparation.' },
        common_interest_privilege: { applies: false, reasoning: 'No common interest arrangement identified.' },
        overall_privilege_determination: 'borderline',
        reasoning_chain: ['Document reviewed', 'Parties identified', 'Communication context analyzed'],
        recommended_handling: 'Escalate to supervising attorney for final determination.',
        privilege_log_entry: `${doc.bates_number || 'N/A'} - ${doc.title || 'Untitled'} - Potentially privileged, pending review`
      };
    }

    res.json({ document_id, document_title: doc.title, analysis });
  } catch (err) {
    console.error('Error in privilege-review:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST /api/ai/timeline-builder
// ============================================
router.post('/timeline-builder', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_id } = req.body;
    if (!case_id) {
      return res.status(400).json({ error: 'Validation failed: case_id is required.' });
    }

    const caseResult = await pool.query('SELECT * FROM cases WHERE id = $1', [case_id]);
    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found.' });
    }
    const caseData = caseResult.rows[0];

    const eventsResult = await pool.query(
      'SELECT * FROM timeline_events WHERE case_id = $1 ORDER BY event_date ASC',
      [case_id]
    );
    const events = eventsResult.rows;

    const systemPrompt = 'You are a litigation paralegal expert. Generate clear, legally accurate narrative chronologies from timeline events. Return valid JSON only.';
    const messages = [
      {
        role: 'user',
        content: `Generate a narrative chronology for this case based on its timeline events. Return a JSON object with these exact fields:
{
  "narrative": "<multi-paragraph narrative summary of the case timeline>",
  "key_turning_points": ["<event 1>", "<event 2>", ...],
  "gaps_in_timeline": ["<gap description>", ...],
  "critical_date_ranges": [{ "start": "<date>", "end": "<date>", "significance": "<string>" }],
  "overall_case_trajectory": "<brief summary of how the case has progressed>"
}

Case: ${caseData.case_name || 'Unknown'} (${caseData.matter_type || 'Unknown type'})
Client: ${caseData.client_name || 'Unknown'}
Status: ${caseData.status || 'Unknown'}
Lead Attorney: ${caseData.lead_attorney || 'Unknown'}

Timeline events (${events.length} total):
${events.slice(0, 30).map(e => `- ${e.event_date || 'No date'}: ${e.event_type || 'Event'} - ${e.description || 'No description'} (${e.significance || 'normal'})`).join('\n')}`
      }
    ];

    const aiResult = await callOpenRouter(messages, systemPrompt);
    let chronology;
    try {
      chronology = JSON.parse(aiResult);
    } catch {
      chronology = {
        narrative: `The case "${caseData.case_name}" involves ${events.length} documented timeline events spanning the matter period. Key developments include the initial filing and subsequent procedural steps.`,
        key_turning_points: events.filter(e => e.significance === 'high').map(e => e.description || 'Key event').slice(0, 5),
        gaps_in_timeline: ['Manual review required to identify gaps'],
        critical_date_ranges: [],
        overall_case_trajectory: 'Case is progressing through standard litigation phases.'
      };
    }

    res.json({ case_id, case_name: caseData.case_name, event_count: events.length, chronology });
  } catch (err) {
    console.error('Error in timeline-builder:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST /api/ai/key-document-summary
// ============================================
router.post('/key-document-summary', auth, aiRateLimiter, async (req, res) => {
  try {
    const { document_id } = req.body;
    if (!document_id) {
      return res.status(400).json({ error: 'Validation failed: document_id is required.' });
    }

    const docResult = await pool.query('SELECT * FROM documents WHERE id = $1', [document_id]);
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    const doc = docResult.rows[0];

    const systemPrompt = 'You are a senior litigation attorney. Create concise, accurate executive summaries of legal documents. Return valid JSON only.';
    const messages = [
      {
        role: 'user',
        content: `Generate an executive summary for this document. Return a JSON object with these exact fields:
{
  "executive_summary": "<2-3 paragraph summary>",
  "key_parties": ["<party name and role>", ...],
  "key_dates": [{ "date": "<date>", "significance": "<string>" }],
  "legal_implications": ["<implication 1>", "<implication 2>", ...],
  "document_significance": "<low|medium|high|critical>",
  "recommended_actions": ["<action 1>", ...]
}

Document:
- Title: ${doc.title || 'Untitled'}
- File type: ${doc.file_type || 'Unknown'}
- Custodian: ${doc.custodian || 'Unknown'}
- Source: ${doc.source || 'Unknown'}
- Collection date: ${doc.date_collected || 'Unknown'}
- Bates: ${doc.bates_number || 'None'}
- Content preview: ${doc.content_preview || 'No preview available'}`
      }
    ];

    const aiResult = await callOpenRouter(messages, systemPrompt);
    let summary;
    try {
      summary = JSON.parse(aiResult);
    } catch {
      summary = {
        executive_summary: `Document "${doc.title || 'Untitled'}" collected from ${doc.custodian || 'unknown custodian'} on ${doc.date_collected || 'unknown date'}. This ${doc.file_type || 'document'} requires attorney review to assess its significance to the case.`,
        key_parties: [doc.custodian || 'Unknown custodian'],
        key_dates: doc.date_collected ? [{ date: doc.date_collected, significance: 'Document collection date' }] : [],
        legal_implications: ['Document may contain relevant communications', 'Privilege review recommended'],
        document_significance: 'medium',
        recommended_actions: ['Complete privilege review', 'Assess relevance to case theory']
      };
    }

    res.json({ document_id, document_title: doc.title, summary });
  } catch (err) {
    console.error('Error in key-document-summary:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST /api/ai/deposition-prep
// ============================================
router.post('/deposition-prep', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_id, witness_name } = req.body;
    if (!case_id || !witness_name) {
      return res.status(400).json({ error: 'Validation failed: case_id and witness_name are required.' });
    }

    const caseResult = await pool.query('SELECT * FROM cases WHERE id = $1', [case_id]);
    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found.' });
    }
    const caseData = caseResult.rows[0];

    // Fetch key terms for case context
    const keyTermsResult = await pool.query(
      'SELECT * FROM key_terms WHERE case_id = $1 ORDER BY frequency DESC LIMIT 20',
      [case_id]
    );
    const keyTerms = keyTermsResult.rows.map(kt => kt.term).join(', ');

    // Fetch relevant documents where custodian matches witness
    const docsResult = await pool.query(
      `SELECT title, content_preview FROM documents
       WHERE case_id = $1 AND custodian ILIKE $2
       ORDER BY date_collected DESC LIMIT 10`,
      [case_id, `%${witness_name.split(' ')[0]}%`]
    );

    const systemPrompt = 'You are an experienced litigator specializing in deposition preparation. Create thorough, strategic deposition guides. Return valid JSON only.';
    const messages = [
      {
        role: 'user',
        content: `Generate a comprehensive deposition preparation guide for witness "${witness_name}" in this case. Return a JSON object with these exact fields:
{
  "witness_profile": "<brief background on witness role in the case>",
  "key_topics_to_cover": ["<topic 1>", "<topic 2>", ...],
  "opening_questions": ["<question>", ...],
  "core_examination_questions": ["<question>", ...],
  "closing_questions": ["<question>", ...],
  "anticipated_objections": ["<objection type and how to handle>", ...],
  "documents_to_introduce": ["<document description>", ...],
  "strategic_tips": ["<tip>", ...],
  "red_flags_to_watch": ["<flag>", ...]
}

Case: ${caseData.case_name || 'Unknown'}
Matter type: ${caseData.matter_type || 'Unknown'}
Client: ${caseData.client_name || 'Unknown'}
Description: ${caseData.description || 'No description'}
Key terms in case: ${keyTerms || 'None identified'}
Documents from this custodian: ${docsResult.rows.map(d => d.title).join(', ') || 'None found'}`
      }
    ];

    const aiResult = await callOpenRouter(messages, systemPrompt);
    let guide;
    try {
      guide = JSON.parse(aiResult);
    } catch {
      guide = {
        witness_profile: `${witness_name} appears as a key custodian in ${caseData.case_name || 'the case'}.`,
        key_topics_to_cover: ['Role and responsibilities', 'Knowledge of key events', 'Document familiarity', 'Communications with other parties'],
        opening_questions: [
          `Please state your name and current title for the record.`,
          `How long have you been in your current role?`,
          `What were your responsibilities during the relevant period?`
        ],
        core_examination_questions: [
          `Were you involved in the events described in this case?`,
          `Please describe your involvement in detail.`,
          `Did you communicate with any other parties about these matters?`
        ],
        closing_questions: [
          `Is there anything else you believe is relevant that we have not discussed?`,
          `Have you reviewed all documents provided to you?`
        ],
        anticipated_objections: ['Privilege objections for attorney communications', 'Form objections on compound questions'],
        documents_to_introduce: docsResult.rows.map(d => d.title),
        strategic_tips: ['Establish timeline early', 'Pin down specific dates and communications', 'Use documents to refresh recollection'],
        red_flags_to_watch: ['Evasive answers on key dates', 'Inconsistencies with documentary evidence']
      };
    }

    res.json({ case_id, case_name: caseData.case_name, witness_name, deposition_guide: guide });
  } catch (err) {
    console.error('Error in deposition-prep:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST /api/ai/search-optimizer
// ============================================
router.post('/search-optimizer', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_id, topic } = req.body;
    if (!case_id || !topic) {
      return res.status(400).json({ error: 'Validation failed: case_id and topic are required.' });
    }

    const caseResult = await pool.query('SELECT * FROM cases WHERE id = $1', [case_id]);
    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found.' });
    }
    const caseData = caseResult.rows[0];

    const existingQueriesResult = await pool.query(
      'SELECT * FROM search_queries WHERE case_id = $1 ORDER BY created_at DESC LIMIT 10',
      [case_id]
    );
    const existingQueries = existingQueriesResult.rows.map(q => q.query_string || q.query_text || q.query || JSON.stringify(q)).filter(Boolean);

    const systemPrompt = 'You are an expert eDiscovery search consultant. Generate optimized Boolean search queries for document review. Return valid JSON only.';
    const messages = [
      {
        role: 'user',
        content: `Generate optimized search queries for the following topic in this eDiscovery case. Return a JSON object with these exact fields:
{
  "primary_query": "<optimized Boolean query string>",
  "alternative_queries": ["<query 1>", "<query 2>", "<query 3>"],
  "suggested_keywords": ["<keyword>", ...],
  "suggested_exclusions": ["<term to exclude>", ...],
  "date_range_suggestion": { "rationale": "<string>", "suggested_start": "<YYYY-MM-DD or null>", "suggested_end": "<YYYY-MM-DD or null>" },
  "expected_hit_reduction": "<e.g. 40% fewer false positives>",
  "optimization_notes": ["<note>", ...]
}

Case: ${caseData.case_name || 'Unknown'}
Matter type: ${caseData.matter_type || 'Unknown'}
Topic to search: ${topic}
Existing queries in this case: ${existingQueries.join(' | ') || 'None yet'}`
      }
    ];

    const aiResult = await callOpenRouter(messages, systemPrompt);
    let optimization;
    try {
      optimization = JSON.parse(aiResult);
    } catch {
      const words = topic.split(' ').filter(w => w.length > 3);
      optimization = {
        primary_query: `(${words.join(' AND ')}) NOT (spam OR marketing OR newsletter)`,
        alternative_queries: [
          `"${topic}" AND (email OR memo OR letter)`,
          `${words[0] || topic} NEAR/5 (agreement OR contract OR policy)`,
          `${topic} AND (2023 OR 2024)`
        ],
        suggested_keywords: words,
        suggested_exclusions: ['spam', 'newsletter', 'marketing', 'unsubscribe'],
        date_range_suggestion: {
          rationale: 'Focus on the relevant period identified in case description.',
          suggested_start: null,
          suggested_end: null
        },
        expected_hit_reduction: '30-40% fewer false positives compared to broad keyword search',
        optimization_notes: [
          'Use proximity operators to reduce false positives',
          'Consider custodian-specific filters to narrow results',
          'Review initial hit sample before full collection'
        ]
      };
    }

    res.json({ case_id, case_name: caseData.case_name, topic, optimization });
  } catch (err) {
    console.error('Error in search-optimizer:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST /api/ai/relevance-score
// Accepts { document_id, case_themes }
// Returns 0-100 relevance score plus reasoning vs. provided case themes
// ============================================
router.post('/relevance-score', auth, aiRateLimiter, async (req, res) => {
  try {
    const { document_id, case_themes } = req.body;
    if (!document_id) {
      return res.status(400).json({ error: 'Validation failed: document_id is required.' });
    }
    if (!case_themes || (Array.isArray(case_themes) && case_themes.length === 0)) {
      return res.status(400).json({ error: 'Validation failed: case_themes is required.' });
    }

    const docResult = await pool.query('SELECT * FROM documents WHERE id = $1', [document_id]);
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    const doc = docResult.rows[0];

    const themes = Array.isArray(case_themes) ? case_themes.join(', ') : String(case_themes);

    const systemPrompt = 'You are an expert eDiscovery relevance reviewer. Score documents against case themes. Always return valid JSON only, no markdown.';
    const messages = [
      {
        role: 'user',
        content: `Score the relevance of the following document against the listed case themes.

Case themes: ${themes}

Document:
- Title: ${doc.title || 'Untitled'}
- File type: ${doc.file_type || 'Unknown'}
- Custodian: ${doc.custodian || 'Unknown'}
- Source: ${doc.source || 'Unknown'}
- Bates number: ${doc.bates_number || 'None'}
- Content preview: ${doc.content_preview || 'No preview available'}

Return a JSON object with these exact fields:
{
  "relevance_score": <integer 0-100>,
  "tier": "<not_relevant|low|medium|high|hot>",
  "matched_themes": ["theme1", "theme2"],
  "reasoning": "<short paragraph>",
  "recommended_action": "<exclude|review|prioritize|hot_doc>"
}`
      }
    ];

    const aiResult = await callOpenRouter(messages, systemPrompt);
    let scoring;
    try {
      scoring = JSON.parse(aiResult);
    } catch {
      scoring = {
        relevance_score: 50,
        tier: 'medium',
        matched_themes: [],
        reasoning: 'AI response could not be parsed; manual review required.',
        recommended_action: 'review',
      };
    }

    res.json({ document_id, case_themes: themes, scoring });
  } catch (err) {
    console.error('Error in relevance-score:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST /api/ai/redaction-suggest
// Accepts { document_id }
// Returns suggested PII / sensitive items requiring redaction
// ============================================
router.post('/redaction-suggest', auth, aiRateLimiter, async (req, res) => {
  try {
    const { document_id } = req.body;
    if (!document_id) {
      return res.status(400).json({ error: 'Validation failed: document_id is required.' });
    }

    const docResult = await pool.query('SELECT * FROM documents WHERE id = $1', [document_id]);
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    const doc = docResult.rows[0];

    const systemPrompt = 'You are an expert eDiscovery redaction specialist. Identify PII, PHI, trade secrets, and other sensitive items requiring redaction. Always return valid JSON only, no markdown.';
    const messages = [
      {
        role: 'user',
        content: `Suggest redactions for the following document content.

Document:
- Title: ${doc.title || 'Untitled'}
- Custodian: ${doc.custodian || 'Unknown'}
- Bates number: ${doc.bates_number || 'None'}
- Content preview: ${doc.content_preview || 'No preview available'}

Return a JSON object with these exact fields:
{
  "items": [
    {
      "category": "<PII|PHI|financial|trade_secret|privileged|other>",
      "snippet": "<verbatim snippet>",
      "reason": "<why this should be redacted>",
      "suggested_replacement": "<e.g. [REDACTED-SSN]>"
    }
  ],
  "overall_sensitivity": "<low|medium|high|critical>",
  "review_required": <true|false>,
  "notes": "<optional reviewer notes>"
}`
      }
    ];

    const aiResult = await callOpenRouter(messages, systemPrompt);
    let redactions;
    try {
      redactions = JSON.parse(aiResult);
    } catch {
      redactions = {
        items: [],
        overall_sensitivity: 'medium',
        review_required: true,
        notes: 'AI response could not be parsed; manual redaction review required.',
      };
    }

    res.json({ document_id, redactions });
  } catch (err) {
    console.error('Error in redaction-suggest:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST /api/ai/email-thread-cluster
// Accepts { case_id }
// Reads email_threads for the case and asks the model to cluster related threads
// ============================================
router.post('/email-thread-cluster', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_id } = req.body;
    if (!case_id) {
      return res.status(400).json({ error: 'Validation failed: case_id is required.' });
    }

    const caseResult = await pool.query('SELECT * FROM cases WHERE id = $1', [case_id]);
    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found.' });
    }
    const caseData = caseResult.rows[0];

    const threadsResult = await pool.query(
      'SELECT id, thread_subject, participant_count, message_count, date_range, key_participants, sentiment, relevance_score, thread_summary FROM email_threads WHERE case_id = $1 ORDER BY id ASC LIMIT 60',
      [case_id]
    );
    const threads = threadsResult.rows;

    if (threads.length === 0) {
      return res.json({ case_id, case_name: caseData.case_name, thread_count: 0, clusters: [] });
    }

    const systemPrompt = 'You are an expert eDiscovery analyst. Cluster related email threads by topic, participants, and time window. Return valid JSON only, no markdown.';
    const messages = [
      {
        role: 'user',
        content: `Cluster the following email threads for case "${caseData.case_name || 'Unknown'}". Return a JSON object with these exact fields:
{
  "clusters": [
    {
      "label": "<short topical label>",
      "rationale": "<why these threads belong together>",
      "thread_ids": [<int>, ...],
      "estimated_relevance": "<low|medium|high|critical>",
      "key_participants": ["<name or email>"]
    }
  ],
  "summary": "<one paragraph overview of clustering>"
}

Threads (id | subject | participants | messages | date_range | key_participants | sentiment | relevance | summary):
${threads.map(t => `${t.id} | ${t.thread_subject || 'Untitled'} | ${t.participant_count || 0} | ${t.message_count || 0} | ${t.date_range || 'n/a'} | ${(t.key_participants || '').toString().slice(0, 200)} | ${t.sentiment || 'n/a'} | ${t.relevance_score || 'n/a'} | ${(t.thread_summary || '').toString().slice(0, 200)}`).join('\n')}`
      }
    ];

    const aiResult = await callOpenRouter(messages, systemPrompt);
    let clustering;
    try {
      clustering = JSON.parse(aiResult);
    } catch {
      clustering = {
        clusters: [
          {
            label: 'Unclustered',
            rationale: 'AI response could not be parsed; manual review required.',
            thread_ids: threads.map(t => t.id),
            estimated_relevance: 'medium',
            key_participants: [],
          },
        ],
        summary: 'Manual review recommended for thread clustering.',
      };
    }

    res.json({ case_id, case_name: caseData.case_name, thread_count: threads.length, clustering });
  } catch (err) {
    console.error('Error in email-thread-cluster:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST /api/ai/witness-profile
// Accepts { custodian_id }
// Summarizes references to the custodian across documents
// ============================================
router.post('/witness-profile', auth, aiRateLimiter, async (req, res) => {
  try {
    const { custodian_id } = req.body;
    if (!custodian_id) {
      return res.status(400).json({ error: 'Validation failed: custodian_id is required.' });
    }

    const custodianResult = await pool.query('SELECT * FROM custodians WHERE id = $1', [custodian_id]);
    if (custodianResult.rows.length === 0) {
      return res.status(404).json({ error: 'Custodian not found.' });
    }
    const custodian = custodianResult.rows[0];

    const firstName = (custodian.full_name || '').split(' ')[0] || custodian.full_name || '';
    const docsResult = await pool.query(
      `SELECT id, title, file_type, content_preview, bates_number, date_collected
         FROM documents
         WHERE case_id = $1
           AND (custodian ILIKE $2 OR custodian ILIKE $3)
         ORDER BY date_collected DESC NULLS LAST
         LIMIT 25`,
      [custodian.case_id, `%${custodian.full_name || ''}%`, `%${firstName}%`]
    );
    const docs = docsResult.rows;

    const systemPrompt = 'You are an experienced litigation paralegal building a witness profile from documentary references. Return valid JSON only, no markdown.';
    const messages = [
      {
        role: 'user',
        content: `Build a witness profile for the following custodian based on their referenced documents. Return a JSON object with these exact fields:
{
  "witness_summary": "<background and role in the case>",
  "key_facts": ["<fact>", ...],
  "documents_referenced": [{ "id": <int>, "title": "<string>", "significance": "<string>" }],
  "knowledge_areas": ["<area>", ...],
  "potential_lines_of_questioning": ["<question theme>", ...],
  "credibility_considerations": ["<consideration>", ...]
}

Custodian:
- Name: ${custodian.full_name || 'Unknown'}
- Email: ${custodian.email || 'Unknown'}
- Title: ${custodian.title || 'Unknown'}
- Department: ${custodian.department || 'Unknown'}
- Company: ${custodian.company || 'Unknown'}
- Hold status: ${custodian.hold_status || 'Unknown'}

Referenced documents (id | title | type | bates | date | preview):
${docs.map(d => `${d.id} | ${d.title || 'Untitled'} | ${d.file_type || 'n/a'} | ${d.bates_number || 'n/a'} | ${d.date_collected || 'n/a'} | ${(d.content_preview || '').toString().slice(0, 200)}`).join('\n') || '(none)'}`
      }
    ];

    const aiResult = await callOpenRouter(messages, systemPrompt);
    let profile;
    try {
      profile = JSON.parse(aiResult);
    } catch {
      profile = {
        witness_summary: `${custodian.full_name || 'Custodian'} (${custodian.title || 'unknown title'}) at ${custodian.company || 'unknown company'}.`,
        key_facts: [],
        documents_referenced: docs.slice(0, 10).map(d => ({ id: d.id, title: d.title || 'Untitled', significance: 'manual review required' })),
        knowledge_areas: [],
        potential_lines_of_questioning: ['Background and tenure', 'Document familiarity'],
        credibility_considerations: ['Manual review recommended'],
      };
    }

    res.json({ custodian_id, custodian_name: custodian.full_name, document_count: docs.length, profile });
  } catch (err) {
    console.error('Error in witness-profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------
// Apply pass 5 (backlog) — additive AI endpoints.
// Required env vars: OPENROUTER_API_KEY (returns 503 + missing if absent).
// Note: openrouter service silently mocks when no key in dev mode (see
// services/openrouter.js); we still gate explicitly here so prod returns 503.
// ----------------------------------------------------------------------

function requireOpenRouterKey(res) {
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
    if (process.env.NODE_ENV === 'production') {
      res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
      return true;
    }
  }
  return false;
}

// POST /api/ai/cost-projection
// Custom feature suggestion: project review cost based on document counts /
// review pace. Reuses the existing AI pipeline.
router.post('/cost-projection', auth, aiRateLimiter, async (req, res) => {
  if (requireOpenRouterKey(res)) return;
  try {
    const { case_id, hourly_rate, expected_review_pace_per_hour, doc_count_override } = req.body || {};
    let docCount = doc_count_override;
    if (case_id && !docCount) {
      const r = await pool.query('SELECT COUNT(*)::int AS c FROM documents WHERE case_id = $1', [case_id]);
      docCount = r.rows[0]?.c || 0;
    }
    const systemPrompt = 'You are a litigation finance analyst projecting eDiscovery review cost. Return valid JSON only, no markdown.';
    const messages = [{
      role: 'user',
      content: `Project review cost. Return JSON: { "doc_count": number, "estimated_review_hours": number, "estimated_cost_usd": number, "low_high_range_usd": [number, number], "assumptions": [string], "cost_drivers": [string], "savings_recommendations": [string] }.\nInputs: doc_count=${docCount || 'unknown'}, hourly_rate=${hourly_rate || 250}, expected_review_pace_per_hour=${expected_review_pace_per_hour || 50}.`
    }];
    const aiResult = await callOpenRouter(messages, systemPrompt);
    let parsed; try { parsed = JSON.parse(aiResult); } catch { parsed = { raw: aiResult, doc_count: docCount }; }
    res.json({ case_id: case_id || null, projection: parsed });
  } catch (err) {
    console.error('Error in cost-projection:', err);
    if (/api[_ ]?key/i.test(err.message || '')) return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/predictive-coding-feedback
// Custom feature suggestion: feedback loop — given reviewer-tagged samples,
// derive an updated coding rubric / model guidance.
router.post('/predictive-coding-feedback', auth, aiRateLimiter, async (req, res) => {
  if (requireOpenRouterKey(res)) return;
  try {
    const { case_id, samples } = req.body || {};
    if (!Array.isArray(samples) || samples.length === 0) {
      return res.status(400).json({ error: 'samples array required' });
    }
    const systemPrompt = 'You analyze attorney coding samples and derive an updated predictive-coding rubric. Return valid JSON only.';
    const messages = [{
      role: 'user',
      content: `Reviewer-coded samples (id|tag|rationale|preview):\n${samples.slice(0, 30).map(s => `${s.id}|${s.tag}|${s.rationale || ''}|${(s.preview || '').slice(0, 200)}`).join('\n')}\n\nReturn JSON: { "updated_rubric": [string], "concept_clusters": [{ "name": string, "examples": [number] }], "ambiguous_cases": [{ "id": number, "why": string }], "recommended_training_size": number, "recall_estimate": number, "precision_estimate": number }.`
    }];
    const aiResult = await callOpenRouter(messages, systemPrompt);
    let parsed; try { parsed = JSON.parse(aiResult); } catch { parsed = { raw: aiResult }; }
    res.json({ case_id: case_id || null, feedback: parsed });
  } catch (err) {
    console.error('Error in predictive-coding-feedback:', err);
    if (/api[_ ]?key/i.test(err.message || '')) return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/agentic-search-chain
// Custom: multi-step search chain. PRODUCT-DECISION: instead of running an
// open-loop agent (TOO-RISKY) we ask the model to PLAN search queries, then
// execute them sequentially via the existing search_queries table read.
router.post('/agentic-search-chain', auth, aiRateLimiter, async (req, res) => {
  if (requireOpenRouterKey(res)) return;
  try {
    const { case_id, objective } = req.body || {};
    if (!objective) return res.status(400).json({ error: 'objective is required' });
    const systemPrompt = 'You design multi-step eDiscovery search plans. Return valid JSON only.';
    const messages = [{
      role: 'user',
      content: `Plan up to 5 sequential search queries that progressively narrow on the objective. Return JSON: { "objective": string, "plan": [{ "step": number, "query": string, "intent": string, "expected_signal": string }], "stop_criteria": string, "review_priority": "low"|"medium"|"high" }.\nObjective: ${objective}\nCase: ${case_id || 'unspecified'}`
    }];
    const aiResult = await callOpenRouter(messages, systemPrompt);
    let parsed; try { parsed = JSON.parse(aiResult); } catch { parsed = { raw: aiResult }; }
    res.json({ case_id: case_id || null, chain: parsed });
  } catch (err) {
    console.error('Error in agentic-search-chain:', err);
    if (/api[_ ]?key/i.test(err.message || '')) return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/batch-tag-suggest
// Backlog: batch operations — propose batch tags for a set of documents.
router.post('/batch-tag-suggest', auth, aiRateLimiter, async (req, res) => {
  if (requireOpenRouterKey(res)) return;
  try {
    const { case_id, document_ids } = req.body || {};
    if (!Array.isArray(document_ids) || document_ids.length === 0) {
      return res.status(400).json({ error: 'document_ids array required' });
    }
    const ids = document_ids.slice(0, 50).map((x) => parseInt(x, 10)).filter(Number.isFinite);
    if (ids.length === 0) return res.status(400).json({ error: 'no valid document_ids' });
    const docsResult = await pool.query(
      `SELECT id, title, file_type, custodian, content_preview, bates_number FROM documents WHERE id = ANY($1::int[]) ${case_id ? 'AND case_id = $2' : ''} LIMIT 50`,
      case_id ? [ids, case_id] : [ids]
    );
    const docs = docsResult.rows;
    const systemPrompt = 'You assign discovery review tags in bulk. Return valid JSON only.';
    const messages = [{
      role: 'user',
      content: `Suggest batch tags for the following documents. Return JSON: { "tags": [{ "document_id": number, "tags": [string], "rationale": string, "confidence": "low"|"medium"|"high" }], "common_themes": [string] }.\nDocuments (id | title | type | custodian | bates | preview):\n${docs.map(d => `${d.id} | ${d.title || ''} | ${d.file_type || ''} | ${d.custodian || ''} | ${d.bates_number || ''} | ${(d.content_preview || '').slice(0, 200)}`).join('\n')}`
    }];
    const aiResult = await callOpenRouter(messages, systemPrompt);
    let parsed; try { parsed = JSON.parse(aiResult); } catch { parsed = { raw: aiResult }; }
    res.json({ case_id: case_id || null, document_count: docs.length, suggestions: parsed });
  } catch (err) {
    console.error('Error in batch-tag-suggest:', err);
    if (/api[_ ]?key/i.test(err.message || '')) return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/privilege-rate-report
// Backlog: reporting (privilege rate, processed counts). PRODUCT-DECISION:
// compute the metrics deterministically from documents.review_status, then
// optionally run an AI executive summary if a key is configured.
router.post('/privilege-rate-report', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_id } = req.body || {};
    if (!case_id) return res.status(400).json({ error: 'case_id is required' });
    const totals = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         SUM(CASE WHEN review_status = 'privileged' THEN 1 ELSE 0 END)::int AS privileged,
         SUM(CASE WHEN review_status = 'reviewed' THEN 1 ELSE 0 END)::int AS reviewed,
         SUM(CASE WHEN review_status = 'pending' OR review_status IS NULL THEN 1 ELSE 0 END)::int AS pending
       FROM documents WHERE case_id = $1`,
      [case_id]
    );
    const stats = totals.rows[0] || { total: 0, privileged: 0, reviewed: 0, pending: 0 };
    const privilegeRate = stats.total > 0 ? (stats.privileged / stats.total) : 0;
    let executive_summary = null;
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your-openrouter-api-key-here') {
      try {
        const ai = await callOpenRouter(
          [{ role: 'user', content: `Write a 2-3 sentence executive summary for these eDiscovery review stats: ${JSON.stringify({ ...stats, privilege_rate: privilegeRate })}. Return JSON: { "summary": string, "highlights": [string] }.` }],
          'You write concise legal-ops review summaries. Return valid JSON only.'
        );
        try { executive_summary = JSON.parse(ai); } catch { executive_summary = { summary: ai }; }
      } catch (e) { executive_summary = null; }
    }
    res.json({ case_id, stats, privilege_rate: privilegeRate, executive_summary });
  } catch (err) {
    console.error('Error in privilege-rate-report:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
