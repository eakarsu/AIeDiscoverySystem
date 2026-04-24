import React, { useState } from 'react';
import { Brain, Sparkles, Loader2 } from 'lucide-react';

function parseAIContent(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1.5 my-3">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-blue-400 mt-1 flex-shrink-0">&#8226;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={idx} className="text-sm font-semibold text-purple-300 mt-4 mb-1">
          {trimmed.slice(4)}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={idx} className="text-base font-bold text-blue-300 mt-4 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          {trimmed.slice(3)}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={idx} className="text-lg font-bold text-white mt-3 mb-2">
          {trimmed.slice(2)}
        </h2>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
      listItems.push(highlightKeywords(content));
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      flushList();
      elements.push(
        <p key={idx} className="text-sm font-semibold text-blue-200 my-2">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else {
      flushList();
      elements.push(
        <p key={idx} className="text-sm text-slate-300 my-1.5 leading-relaxed">
          {highlightKeywords(trimmed)}
        </p>
      );
    }
  });

  flushList();
  return elements;
}

function highlightKeywords(text) {
  if (typeof text !== 'string') return text;

  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="font-semibold text-blue-300">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

export default function AIAnalysisPanel({ onRunAnalysis, analysisResult, loading }) {
  return (
    <div className="mt-6 rounded-xl overflow-hidden gradient-border">
      <div className="bg-slate-800/80 backdrop-blur">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
              <p className="text-xs text-slate-400">Powered by OpenRouter</p>
            </div>
          </div>
          <button
            onClick={onRunAnalysis}
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
                Run Analysis
              </>
            )}
          </button>
        </div>

        <div className="p-5 min-h-[100px]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
              <div className="relative">
                <Brain className="w-12 h-12 text-purple-400 animate-pulse" />
                <div className="absolute inset-0 animate-spin-slow">
                  <Sparkles className="w-4 h-4 text-blue-400 absolute -top-1 -right-1" />
                </div>
              </div>
              <p className="text-slate-400 mt-4 text-sm">AI is analyzing this record...</p>
              <div className="flex gap-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {!loading && !analysisResult && (
            <div className="text-center py-8">
              <Brain className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                Click "Run Analysis" to get AI-powered insights for this record.
              </p>
            </div>
          )}

          {!loading && analysisResult && (
            <div className="animate-fade-in">
              {typeof analysisResult === 'string' ? (
                <div className="prose prose-invert max-w-none">
                  {parseAIContent(analysisResult)}
                </div>
              ) : analysisResult.analysis ? (
                <div className="prose prose-invert max-w-none">
                  {parseAIContent(analysisResult.analysis)}
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  {parseAIContent(JSON.stringify(analysisResult, null, 2))}
                </div>
              )}
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-xs text-blue-300">
                  <Brain className="w-3 h-3" />
                  AI Powered by OpenRouter
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
