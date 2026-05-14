import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Loader2, Lock } from 'lucide-react';
import { api } from '../api';

export default function RedactionSuggestPage() {
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/documents');
        const list = res.data || res || [];
        if (!cancelled) setDocuments(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!cancelled) console.error('Failed to load documents:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentId) {
      setError('Please select a document.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/redaction-suggest', {
        document_id: parseInt(documentId, 10),
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const sensitivityColor = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'critical':
        return 'text-red-300 bg-red-500/10 border-red-500/30';
      case 'high':
        return 'text-orange-300 bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-green-300 bg-green-500/10 border-green-500/30';
      default:
        return 'text-slate-300 bg-slate-500/10 border-slate-500/30';
    }
  };

  const categoryColor = (cat) => {
    switch ((cat || '').toLowerCase()) {
      case 'pii':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'phi':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
      case 'financial':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      case 'trade_secret':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-300';
      case 'privileged':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-300';
    }
  };

  const items = result?.redactions?.items || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Lock className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">AI Redaction Suggestions</h2>
        </div>
        <p className="text-sm text-slate-400 ml-12">
          Identify PII, PHI, financial, trade-secret, and privileged content for redaction.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Document
          </label>
          <select
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a document...</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                #{d.id} — {d.title || 'Untitled'}
                {d.bates_number ? ` (${d.bates_number})` : ''}
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
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Suggest Redactions
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center py-8">
          <Brain className="w-12 h-12 text-purple-400 animate-pulse" />
          <p className="text-slate-400 mt-4 text-sm">AI is scanning for sensitive content...</p>
        </div>
      )}

      {!loading && result?.redactions && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Overall Sensitivity</p>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold border ${sensitivityColor(result.redactions.overall_sensitivity)}`}
                >
                  {result.redactions.overall_sensitivity || 'unknown'}
                </span>
              </div>
              {result.redactions.review_required !== undefined && (
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Review Required</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    {result.redactions.review_required ? 'Yes' : 'No'}
                  </p>
                </div>
              )}
            </div>

            {result.redactions.notes && (
              <p className="text-sm text-slate-400 italic mb-2">{result.redactions.notes}</p>
            )}

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Suggested Items ({items.length})
            </p>

            <div className="space-y-3">
              {items.length === 0 && (
                <p className="text-sm text-slate-500">No redactions suggested.</p>
              )}
              {items.map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-900/60 border border-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold border ${categoryColor(item.category)}`}
                    >
                      {item.category || 'other'}
                    </span>
                    {item.suggested_replacement && (
                      <code className="text-xs px-2 py-1 rounded bg-slate-800 text-blue-300">
                        {item.suggested_replacement}
                      </code>
                    )}
                  </div>
                  {item.snippet && (
                    <p className="text-sm text-slate-300 font-mono bg-slate-800/50 px-3 py-2 rounded mb-2">
                      "{item.snippet}"
                    </p>
                  )}
                  {item.reason && (
                    <p className="text-xs text-slate-400 leading-relaxed">{item.reason}</p>
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
