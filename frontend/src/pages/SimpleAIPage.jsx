import React, { useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { api } from '../api';
import StructuredAIResult from '../components/StructuredAIResult';

const presetProfiles = [
  {
    label: 'Hot document triage',
    context: 'Trade secret litigation with urgent review deadlines, departing employee communications, and likely hot documents.',
    caseId: '1',
  },
  {
    label: 'Regulatory response',
    context: 'FDA or SEC regulatory response requiring defensible review, privilege control, production readiness, and audit-quality rationale.',
    caseId: '4',
  },
  {
    label: 'Cost and production risk',
    context: 'Large production planning exercise with review cost pressure, privilege risk, tight delivery dates, and executive reporting needs.',
    caseId: '2',
  },
];

function valueForField(field, profile, index, title) {
  const name = field.name;
  if (name === 'case_id') return profile.caseId;
  if (name === 'hourly_rate') return index === 0 ? '275' : index === 1 ? '325' : '240';
  if (name === 'expected_review_pace_per_hour') return index === 0 ? '55' : index === 1 ? '42' : '68';
  if (name === 'doc_count_override') return index === 0 ? '12500' : index === 1 ? '78500' : '225000';
  if (name === 'objective') {
    return `${profile.context} Build a sequenced search plan for ${title}: identify likely evidence, custodians, date windows, privilege risks, and follow-up searches.`;
  }
  if (name === 'document_ids') {
    const ids = index === 0 ? [1, 2, 3, 15] : index === 1 ? [10, 11, 9, 6] : [4, 5, 6, 12];
    return JSON.stringify(ids, null, 2);
  }
  if (name === 'samples') {
    const samples = [
      {
        id: index * 10 + 1,
        tag: 'responsive',
        rationale: profile.context,
        preview: 'Email thread references disputed conduct, key custodian decisions, and contemporaneous business impact.',
      },
      {
        id: index * 10 + 2,
        tag: 'privileged',
        rationale: 'Legal advice and work-product indicators require conservative handling.',
        preview: 'Counsel reviews investigation strategy, evidence preservation, and production response.',
      },
      {
        id: index * 10 + 3,
        tag: 'needs_qc',
        rationale: 'Ambiguous relevance and inconsistent reviewer treatment should be escalated.',
        preview: 'Business team discusses documents that may connect to the claim but lacks direct admissions.',
      },
    ];
    return JSON.stringify(samples, null, 2);
  }
  if (field.type === 'json') {
    return JSON.stringify({
      scenario: profile.label,
      context: profile.context,
      requested_output: ['findings', 'risks', 'recommended_actions', 'confidence', 'follow_up_questions'],
    }, null, 2);
  }
  if (field.type === 'number') return String((index + 1) * 10);
  return `${profile.context} Return a practical ${title} recommendation with assumptions, risk ranking, action owner, and next steps.`;
}

/**
 * Reusable AI page used by Apply pass 5 backlog endpoints.
 * Posts JSON to a configurable endpoint and renders the structured response.
 */
export default function SimpleAIPage({ title, description, endpoint, fields }) {
  const initial = Object.fromEntries(fields.map((f) => [f.name, '']));
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const applyPreset = (profile, index) => {
    const next = {};
    fields.forEach((field) => {
      next[field.name] = valueForField(field, profile, index, title);
    });
    setForm(next);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const required = fields.filter((f) => f.required).find((f) => !String(form[f.name] || '').trim());
    if (required) {
      setError(`${required.label} is required`);
      return;
    }
    setLoading(true);
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v === '' || v == null) return;
        const f = fields.find((x) => x.name === k);
        if (f && f.type === 'number') payload[k] = Number(v);
        else if (f && f.type === 'json') {
          try {
            payload[k] = JSON.parse(v);
          } catch {
            payload[k] = v;
          }
        } else {
          payload[k] = v;
        }
      });
      const res = await api.post(endpoint, payload);
      setResult(res);
    } catch (err) {
      const msg = err.message || 'Request failed.';
      if (msg.includes('503') || /api[_ ]key/i.test(msg)) {
        setError('AI service unavailable (503). Configure OPENROUTER_API_KEY on the server.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-2">
            <Brain className="h-5 w-5 text-purple-300" />
          </div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>
        {description && <p className="ml-12 text-sm text-slate-400">{description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="grid max-w-3xl gap-4 rounded-xl border border-slate-700 bg-slate-800/40 p-5">
        <div className="flex flex-wrap gap-2">
          {presetProfiles.map((profile, index) => (
            <button
              key={profile.label}
              type="button"
              onClick={() => applyPreset(profile, index)}
              className="rounded-lg border border-blue-500/30 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-300 transition-colors hover:bg-blue-500/25"
            >
              {profile.label}
            </button>
          ))}
        </div>
        {fields.map((f) => (
          <div key={f.name} className="grid gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              {f.label}
              {f.required ? ' *' : ''}
            </label>
            {f.type === 'textarea' || f.type === 'json' ? (
              <textarea
                rows={f.rows || 6}
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                placeholder={f.placeholder || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                placeholder={f.placeholder || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="spin" /> : <Brain size={16} />}
          {loading ? 'Analyzing...' : 'Run AI'}
        </button>
      </form>
      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      {result && <StructuredAIResult result={result} />}
    </div>
  );
}
