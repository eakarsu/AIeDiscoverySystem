import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Loader2, Target } from 'lucide-react';
import { api } from '../api';

export default function RelevanceScorePage() {
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState('');
  const [themesText, setThemesText] = useState('');
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
    const themes = themesText
      .split(/\n|,/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (themes.length === 0) {
      setError('Please enter at least one case theme.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/relevance-score', {
        document_id: parseInt(documentId, 10),
        case_themes: themes,
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const tierColor = (tier) => {
    switch ((tier || '').toLowerCase()) {
      case 'hot':
        return 'text-red-300 bg-red-500/10 border-red-500/30';
      case 'high':
        return 'text-orange-300 bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-blue-300 bg-blue-500/10 border-blue-500/30';
      case 'not_relevant':
        return 'text-slate-300 bg-slate-500/10 border-slate-500/30';
      default:
        return 'text-slate-300 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">AI Relevance Scoring</h2>
        </div>
        <p className="text-sm text-slate-400 ml-12">
          Score documents against case themes (0-100 with reasoning).
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

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Case Themes (one per line or comma-separated)
          </label>
          <textarea
            value={themesText}
            onChange={(e) => setThemesText(e.target.value)}
            rows={4}
            placeholder="e.g.&#10;Antitrust collusion&#10;Price fixing communications&#10;Market allocation discussions"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
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
              Scoring...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run Relevance Scoring
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center py-8">
          <Brain className="w-12 h-12 text-purple-400 animate-pulse" />
          <p className="text-slate-400 mt-4 text-sm">AI is scoring relevance...</p>
        </div>
      )}

      {!loading && result?.scoring && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Score</p>
                <p className="text-3xl font-bold text-white">
                  {result.scoring.relevance_score}
                  <span className="text-base text-slate-500">/100</span>
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${tierColor(result.scoring.tier)}`}
              >
                {result.scoring.tier || 'unknown'}
              </span>
            </div>

            {Array.isArray(result.scoring.matched_themes) && result.scoring.matched_themes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Matched Themes
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.scoring.matched_themes.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.scoring.reasoning && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Reasoning
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {result.scoring.reasoning}
                </p>
              </div>
            )}

            {result.scoring.recommended_action && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Recommended Action
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  {result.scoring.recommended_action}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
