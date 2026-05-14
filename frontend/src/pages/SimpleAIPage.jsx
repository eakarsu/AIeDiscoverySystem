import React, { useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { api } from '../api';

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
    <div style={{ padding: 24 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Brain size={24} /> {title}
      </h1>
      {description && <p style={{ color: '#64748b' }}>{description}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16, maxWidth: 720 }}>
        {fields.map((f) => (
          <div key={f.name} style={{ display: 'grid', gap: 4 }}>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {f.label}
              {f.required ? ' *' : ''}
            </label>
            {f.type === 'textarea' || f.type === 'json' ? (
              <textarea
                rows={f.rows || 6}
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                placeholder={f.placeholder || ''}
                style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, fontFamily: 'monospace' }}
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                placeholder={f.placeholder || ''}
                style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 16px',
            background: '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            width: 'fit-content',
          }}
        >
          {loading ? <Loader2 size={16} className="spin" /> : <Brain size={16} />}
          {loading ? 'Analyzing...' : 'Run AI'}
        </button>
      </form>
      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#fee2e2', borderRadius: 6, color: '#991b1b' }}>
          {error}
        </div>
      )}
      {result && (
        <pre
          style={{
            marginTop: 16,
            padding: 12,
            background: '#f1f5f9',
            borderRadius: 6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 600,
            overflow: 'auto',
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
