import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Loader2, Mail } from 'lucide-react';
import { api } from '../api';

export default function EmailThreadClusterPage() {
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/cases');
        const list = res.data || res || [];
        if (!cancelled) setCases(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!cancelled) console.error('Failed to load cases:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseId) {
      setError('Please select a case.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/email-thread-cluster', {
        case_id: parseInt(caseId, 10),
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

  const relevanceColor = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'critical':
        return 'text-red-300 bg-red-500/10 border-red-500/30';
      case 'high':
        return 'text-orange-300 bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-blue-300 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-slate-300 bg-slate-500/10 border-slate-500/30';
    }
  };

  const clusters = result?.clustering?.clusters || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Mail className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">AI Email Thread Clustering</h2>
        </div>
        <p className="text-sm text-slate-400 ml-12">
          Group related email conversations across the case.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Case
          </label>
          <select
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a case...</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.id} — {c.case_name || c.name || 'Untitled'}
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
              Clustering...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run Clustering
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center py-8">
          <Brain className="w-12 h-12 text-purple-400 animate-pulse" />
          <p className="text-slate-400 mt-4 text-sm">AI is grouping related email threads...</p>
        </div>
      )}

      {!loading && result && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-300">
                {result.case_name} — {result.thread_count || 0} threads analyzed
              </p>
            </div>
            {result.clustering?.summary && (
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {result.clustering.summary}
              </p>
            )}
            <div className="space-y-3">
              {clusters.map((c, i) => (
                <div
                  key={i}
                  className="bg-slate-900/60 border border-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white">{c.label || 'Cluster'}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${relevanceColor(c.estimated_relevance)}`}
                    >
                      {c.estimated_relevance || 'medium'}
                    </span>
                  </div>
                  {c.rationale && (
                    <p className="text-xs text-slate-400 mb-2">{c.rationale}</p>
                  )}
                  {Array.isArray(c.thread_ids) && c.thread_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {c.thread_ids.map((id) => (
                        <span
                          key={id}
                          className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-300"
                        >
                          #{id}
                        </span>
                      ))}
                    </div>
                  )}
                  {Array.isArray(c.key_participants) && c.key_participants.length > 0 && (
                    <p className="text-xs text-slate-500">
                      Participants: {c.key_participants.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
