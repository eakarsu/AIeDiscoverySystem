import React from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import AIAnalysisPanel from './AIAnalysisPanel';

const statusLikeKeys = [
  'status', 'review_status', 'privilege_status', 'connection_status',
  'training_status', 'severity', 'priority', 'importance', 'sentiment',
  'hold_status', 'significance', 'confidentiality_level', 'collection_priority',
  'verification_status', 'matter_type', 'hold_type', 'processing_type',
  'alert_type', 'privilege_type', 'category', 'regulation',
];

export default function DetailView({
  title,
  data,
  fields,
  onBack,
  onEdit,
  onDelete,
  onRunAnalysis,
  analysisResult,
  analysisLoading,
  loading,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Record not found.</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const displayTitle =
    data.case_name ||
    data.hold_name ||
    data.collection_name ||
    data.job_name ||
    data.set_name ||
    data.production_name ||
    data.query_name ||
    data.model_name ||
    data.alert_title ||
    data.event_title ||
    data.rule_name ||
    data.source_name ||
    data.title ||
    data.document_title ||
    data.thread_subject ||
    data.term ||
    data.full_name ||
    title;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{displayTitle}</h1>
            {data.status && (
              <div className="mt-1">
                <StatusBadge status={data.status} />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            const value = data[field.key];
            if (value == null && field.key !== 'status') return null;
            return (
              <div
                key={field.key}
                className={`${field.type === 'textarea' ? 'md:col-span-2' : ''}`}
              >
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  {field.label}
                </p>
                {statusLikeKeys.includes(field.key) ? (
                  <StatusBadge status={value} />
                ) : field.type === 'textarea' ? (
                  <p className="text-sm text-slate-200 bg-slate-900/30 rounded-lg p-3 whitespace-pre-wrap">
                    {value || '-'}
                  </p>
                ) : (
                  <p className="text-sm text-slate-200">{value != null ? String(value) : '-'}</p>
                )}
              </div>
            );
          })}
        </div>

        {data.id && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-500">
              Record ID: {data.id}
              {data.created_at && ` | Created: ${new Date(data.created_at).toLocaleString()}`}
              {data.updated_at && ` | Updated: ${new Date(data.updated_at).toLocaleString()}`}
            </p>
          </div>
        )}
      </div>

      <AIAnalysisPanel
        onRunAnalysis={onRunAnalysis}
        analysisResult={analysisResult}
        loading={analysisLoading}
      />
    </div>
  );
}
