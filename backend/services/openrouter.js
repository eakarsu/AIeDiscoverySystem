const fetch = require('node-fetch');

async function callOpenRouter(messages, systemPrompt, model = 'anthropic/claude-3-5-sonnet-20241022') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const allowMocks = process.env.ALLOW_AI_MOCKS === 'true' || process.env.NODE_ENV !== 'production';

  if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
    if (allowMocks) {
      console.warn('[openrouter] No API key — returning MOCK (dev mode). Result will be tagged synthesized=true.');
      const mock = getMockResponse(systemPrompt, messages);
      // Tag mock outputs with synthesized=true so callers can distinguish
      try {
        const obj = JSON.parse(mock);
        obj.synthesized = true;
        obj._mock_source = 'no_api_key';
        return JSON.stringify(obj);
      } catch { return mock; }
    }
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'AI eDiscovery System'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 2000,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenRouter API error');
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  // Strip markdown code fences if present
  content = content.replace(/^```[\w]*\n?/gm, '').replace(/\n?```$/gm, '').trim();
  return content;
}

function getMockResponse(systemPrompt, messages) {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';

  if (lastMsg.includes('privilege') || systemPrompt.toLowerCase().includes('privilege')) {
    return JSON.stringify({
      privilege_status: 'privileged',
      privilege_type: 'attorney-client',
      confidence: 0.87,
      reasoning: 'Document contains communications between attorney and client seeking legal advice.',
      relevance: true,
      relevance_reason: 'Directly relates to case matter.',
      sensitivity_level: 'high',
      recommended_handling: 'Withhold from production. Log in privilege log.'
    });
  }

  if (lastMsg.includes('timeline') || systemPrompt.toLowerCase().includes('chronology')) {
    return JSON.stringify({
      narrative: 'The case timeline begins with initial events in Q1, escalating through subsequent quarters with key turning points identified.',
      key_events: ['Initial incident', 'First legal hold', 'Document collection', 'Review completion'],
      critical_dates: [],
      gaps_identified: ['Missing communications between March-April']
    });
  }

  if (lastMsg.includes('deposition') || systemPrompt.toLowerCase().includes('deposition')) {
    return JSON.stringify({
      witness_background: 'Key witness with direct knowledge of relevant events.',
      likely_questions: [
        'What was your role during the period in question?',
        'Describe your involvement in the decision-making process.',
        'Were you aware of the communications referenced in Exhibit A?'
      ],
      areas_to_explore: ['Chain of command', 'Document access', 'Timeline of knowledge'],
      cautions: ['Witness may be evasive on topic X', 'Prepare for privilege objections']
    });
  }

  return JSON.stringify({
    analysis: 'AI analysis complete. Document reviewed and classified based on content patterns.',
    confidence: 0.78,
    recommendations: ['Review flagged sections', 'Consult with lead attorney']
  });
}

module.exports = { callOpenRouter };
