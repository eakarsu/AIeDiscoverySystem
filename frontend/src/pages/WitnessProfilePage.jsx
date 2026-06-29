import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Loader2, UserCircle } from 'lucide-react';
import { api } from '../api';

export default function WitnessProfilePage() {
  const [custodians, setCustodians] = useState([]);
  const [custodianId, setCustodianId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/custodians');
        const list = res.data || res || [];
        if (!cancelled) setCustodians(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!cancelled) console.error('Failed to load custodians:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const findCustodian = (matcher) => custodians.find(matcher) || custodians[0];

  const applyPreset = (label) => {
    const textOf = (c) => `${c.full_name} ${c.title} ${c.department} ${c.company} ${c.data_sources}`;
    const presets = {
      engineering: findCustodian((c) => /engineering|architect|source|git|meridian/i.test(textOf(c))),
      clinical: findCustodian((c) => /clinical|pinnacle|vp clinical|ctms|veeva/i.test(textOf(c))),
      finance: findCustodian((c) => /finance|cfo|controller|sap|globalbank/i.test(textOf(c))),
    };
    const selected = presets[label];
    if (!selected) return;
    setCustodianId(String(selected.id));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!custodianId) {
      setError('Please select a custodian.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/witness-profile', {
        custodian_id: parseInt(custodianId, 10),
      });
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

  const profile = result?.profile || null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <UserCircle className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">AI Witness Profile</h2>
        </div>
        <p className="text-sm text-slate-400 ml-12">
          Build a witness profile from documentary references.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-4"
      >
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => applyPreset('engineering')} className="px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-xs font-semibold text-blue-300 hover:bg-blue-500/25">
            Engineering witness
          </button>
          <button type="button" onClick={() => applyPreset('clinical')} className="px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-300 hover:bg-purple-500/25">
            Clinical witness
          </button>
          <button type="button" onClick={() => applyPreset('finance')} className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25">
            Finance witness
          </button>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Custodian
          </label>
          <select
            value={custodianId}
            onChange={(e) => setCustodianId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a custodian...</option>
            {custodians.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.id} — {c.full_name || 'Unknown'}
                {c.title ? ` (${c.title})` : ''}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Building profile...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Build Witness Profile
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center py-8">
          <Brain className="w-12 h-12 text-purple-400 animate-pulse" />
          <p className="text-slate-400 mt-4 text-sm">AI is reviewing referenced documents...</p>
        </div>
      )}

      {!loading && profile && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Custodian</p>
              <p className="text-base font-semibold text-white">{result.custodian_name}</p>
              <p className="text-xs text-slate-400 mt-1">
                {result.document_count || 0} referenced documents
              </p>
            </div>

            {profile.witness_summary && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Summary
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{profile.witness_summary}</p>
              </div>
            )}

            {Array.isArray(profile.key_facts) && profile.key_facts.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Key Facts
                </p>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {profile.key_facts.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(profile.knowledge_areas) && profile.knowledge_areas.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Knowledge Areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.knowledge_areas.map((k, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(profile.potential_lines_of_questioning) &&
              profile.potential_lines_of_questioning.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Lines of Questioning
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                    {profile.potential_lines_of_questioning.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

            {Array.isArray(profile.documents_referenced) &&
              profile.documents_referenced.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Documents Referenced
                  </p>
                  <div className="space-y-1">
                    {profile.documents_referenced.map((d, i) => (
                      <div
                        key={i}
                        className="bg-slate-900/60 border border-slate-700 rounded-lg p-2 text-xs"
                      >
                        <p className="text-slate-300">
                          #{d.id} {d.title}
                        </p>
                        {d.significance && (
                          <p className="text-slate-500 mt-0.5">{d.significance}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {Array.isArray(profile.credibility_considerations) &&
              profile.credibility_considerations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Credibility
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                    {profile.credibility_considerations.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
