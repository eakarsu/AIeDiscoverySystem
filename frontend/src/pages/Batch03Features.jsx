// === Batch 03 Gaps & Frontend Mounts ===
// Auto-generated frontend page (lean v0). Wires Custom Feature Suggestions
// and Gap endpoints (AI counterparts + non-AI features) to backend routes.
import React, { useState } from 'react';
import { API_BASE } from '../api';
import StructuredAIResult from '../components/StructuredAIResult';

const FEATURES = [
  { kind: 'cfs', slug: 'cf-agentic-discovery', label: 'Agentic discovery', desc: 'NL query → chained searches, grouped threads, summary', endpoint: '/cf-agentic-discovery' },
  { kind: 'cfs', slug: 'cf-deposition-video-sync', label: 'Deposition video sync', desc: 'Timeline aligned with video for live reference', endpoint: '/cf-deposition-video-sync' },
  { kind: 'cfs', slug: 'cf-court-format-export', label: 'Court-format export', desc: 'TIFF + LOAD files for opposing counsel', endpoint: '/cf-court-format-export' },
  { kind: 'cfs', slug: 'cf-predictive-coding-feedback-loop', label: 'Predictive-coding feedback loop', desc: 'Re-train after each review pass', endpoint: '/cf-predictive-coding-feedback-loop' },
  { kind: 'cfs', slug: 'cf-cost-projection', label: 'Cost projection', desc: 'Estimate review hours/cost from volume', endpoint: '/cf-cost-projection' },
  { kind: 'cfs', slug: 'cf-third-party-custodian-portal', label: 'Third-party custodian portal', desc: 'Secure upload UI for external sources', endpoint: '/cf-third-party-custodian-portal' },
  { kind: 'cfs', slug: 'cf-blockchain-chain-of-custody', label: 'Blockchain chain-of-custody', desc: 'Immutable access log', endpoint: '/cf-blockchain-chain-of-custody' },
  { kind: 'gap-ai', slug: 'gap-ai-no-video-deposition-transcription-sync', label: 'No video-deposition transcription/sync', desc: 'No video-deposition transcription/sync', endpoint: '/gap-no-video-deposition-transcription-sync' },
  { kind: 'gap-ai', slug: 'gap-ai-no-automated-pii-redaction-execution-only-suggestion', label: 'No automated PII redaction execution (only suggestion)', desc: 'No automated PII redaction execution (only suggestion)', endpoint: '/gap-no-automated-pii-redaction-execution-only-suggestion' },
  { kind: 'gap-ai', slug: 'gap-ai-no-cost-projection-ai-from-doc-volume', label: 'No cost-projection AI from doc-volume', desc: 'No cost-projection AI from doc-volume', endpoint: '/gap-no-cost-projection-ai-from-doc-volume' },
  { kind: 'gap-non', slug: 'gap-non-no-webhooks-no-external-data-source-push', label: 'No webhooks (no external data-source push)', desc: 'No webhooks (no external data-source push)', endpoint: '/gap-no-webhooks-no-external-data-source-push' },
  { kind: 'gap-non', slug: 'gap-non-limited-integration-no-email-server-connector-o365-ingest', label: 'Limited integration (no email-server connector / O365 ingest', desc: 'Limited integration (no email-server connector / O365 ingest endpoint surfaced)', endpoint: '/gap-limited-integration-no-email-server-connector-o365-ingest' },
  { kind: 'gap-non', slug: 'gap-non-no-two-factor-authentication-endpoint', label: 'No two-factor authentication endpoint', desc: 'No two-factor authentication endpoint', endpoint: '/gap-no-two-factor-authentication-endpoint' },
  { kind: 'gap-non', slug: 'gap-non-no-third-party-custodian-self-service-portal', label: 'No third-party custodian self-service portal', desc: 'No third-party custodian self-service portal', endpoint: '/gap-no-third-party-custodian-self-service-portal' },
  { kind: 'gap-non', slug: 'gap-non-no-chain-of-custody-blockchain-audit-trail', label: 'No chain-of-custody/blockchain audit trail', desc: 'No chain-of-custody/blockchain audit trail', endpoint: '/gap-no-chain-of-custody-blockchain-audit-trail' },
];

function authHeaders() {
  const t = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

export default function Batch03Features() {
  const [active, setActive] = useState(FEATURES[0]?.slug);
  const [input, setInput] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const current = FEATURES.find(f => f.slug === active) || FEATURES[0];
  const sampleRequests = [
      {
          "label": "Customer implementation",
          "value": `Run ${current?.label || 'this feature'} for a realistic eDiscovery customer case.\nContext: litigation support needs ${current?.desc || 'this capability'} with incomplete operating data.\nUse case: active matter with custodians, documents, deadlines, privilege risk, production pressure, and audit requirements.\nReturn: executive summary, prioritized action plan, owner, due date, risks, missing information, and expected business impact.`
      },
      {
          "label": "Operational records",
          "value": `Analyze this ${current?.label || 'feature'} operational sample.\nInput records:\n- Record 1: urgent matter, court deadline in 7 days, owner unassigned\n- Record 2: medium priority, blocked by missing custodian data\n- Record 3: recurring review delay, automation opportunity\n- Record 4: privileged document risk, needs attorney approval\nReturn structured findings, anomalies, recommendations, confidence, escalation path, and follow-up questions.`
      },
      {
          "label": "Executive decision",
          "value": `Prepare an executive decision memo for ${current?.label || 'this feature'}.\nAudience: managing partner, litigation operations lead, IT/security owner, and review manager.\nInclude business impact, legal risk, data/security considerations, estimated effort, implementation sequence, KPI targets, and go/no-go decision points.`
      }
  ];

  const applySampleRequest = (value) => {
    setInput(value);
    setError(null);
  };

  async function run() {
    if (!current) return;
    setLoading(true); setError(null);
    try {
      let parsed;
      try { parsed = input ? JSON.parse(input) : {}; } catch { parsed = { input }; }
      const r = await fetch(`${API_BASE}${current.endpoint}`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(parsed)
      });
      let body; try { body = await r.json(); } catch { body = { raw: await r.text() }; }
      if (!r.ok) setError(body.error || `HTTP ${r.status}`);
      setResults(prev => ({ ...prev, [current.slug]: body }));
    } catch (e) {
      setError(String(e.message || e));
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="text-xl font-semibold text-white">Batch 03 Features <small className="font-normal text-slate-500">(AIeDiscoverySystem)</small></h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">
        Audit-driven AI counterparts, non-AI feature gaps, and custom feature suggestions.
        Backend endpoints prefixed <code>/api/cf-*</code> (custom features) and <code>/api/gap-*</code> (gap fills).
      </p>
      <div className="my-4 flex flex-wrap gap-2">
        {FEATURES.map(f => (
          <button key={f.slug} onClick={() => setActive(f.slug)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              active === f.slug
                ? 'border-blue-500 bg-blue-500/25 text-blue-100'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}>
            <span className="mr-1 opacity-70">[{f.kind}]</span>{f.label}
          </button>
        ))}
      </div>
      {current && (
        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/40 p-5">
          <div className="mb-3">
            <strong className="text-white">{current.label}</strong>
            <div className="text-sm text-slate-400">{current.desc}</div>
            <div className="mt-1 text-xs text-slate-500">POST <code>{current.endpoint}</code></div>
          </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {sampleRequests.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => applySampleRequest(sample.value)}
              className="rounded-lg border border-blue-500/30 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/25"
            >
              {sample.label}
            </button>
          ))}
        </div>

          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder='Optional JSON input (e.g. {"query":"..."})'
            className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" />
          <div className="mt-3">
            <button onClick={run} disabled={loading}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? 'Running…' : 'Run'}
            </button>
          </div>
          {error && (<div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>)}
          {results[current.slug] && <StructuredAIResult result={results[current.slug]} />}
        </div>
      )}
    </div>
  );
}
