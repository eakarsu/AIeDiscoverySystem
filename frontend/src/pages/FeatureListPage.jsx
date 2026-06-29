import React, { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw, X, Edit, Trash2, Sparkles } from 'lucide-react';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import Toast from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import AIAnalysisPanel from '../components/AIAnalysisPanel';
import { api } from '../api';

const statusLikeKeys = [
  'status', 'review_status', 'privilege_status', 'connection_status',
  'training_status', 'severity', 'priority', 'importance', 'sentiment',
  'hold_status', 'significance', 'confidentiality_level', 'collection_priority',
  'verification_status', 'matter_type', 'hold_type', 'processing_type',
  'alert_type', 'privilege_type', 'category', 'regulation',
  'preview_status', 'ocr_status', 'sync_status', 'auth_status', 'delivery_status',
  'approval_status', 'signoff_status', 'qc_status', 'load_file_status', 'access_level',
  'resource_area', 'role_name',
];

function rowsFromResponse(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.rows)) return result.rows;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.cases)) return result.cases;
  if (Array.isArray(result?.documents)) return result.documents;
  return [];
}

function displayTitle(record, fallback) {
  return (
    record?.case_name ||
    record?.hold_name ||
    record?.collection_name ||
    record?.job_name ||
    record?.set_name ||
    record?.production_name ||
    record?.query_name ||
    record?.model_name ||
    record?.alert_title ||
    record?.event_title ||
    record?.rule_name ||
    record?.source_name ||
    record?.viewer_name ||
    record?.pipeline_name ||
    record?.connector_name ||
    record?.assignment_name ||
    record?.redaction_name ||
    record?.package_name ||
    record?.notification_name ||
    record?.permission_name ||
    record?.binder_name ||
    record?.governance_name ||
    record?.title ||
    record?.document_title ||
    record?.thread_subject ||
    record?.term ||
    record?.full_name ||
    fallback
  );
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString();
  }
  return String(value);
}

function DetailValue({ value }) {
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-sm text-slate-200">
              {item && typeof item === 'object' ? (
                <div className="grid gap-1">
                  {Object.entries(item).map(([key, nestedValue]) => (
                    <div key={key} className="grid grid-cols-[150px_1fr] gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{key.replace(/_/g, ' ')}</span>
                      <span className="break-words">{formatValue(nestedValue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                formatValue(item)
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-2">
        {Object.entries(value).map(([key, nestedValue]) => (
          <div key={key} className="grid grid-cols-[160px_1fr] gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{key.replace(/_/g, ' ')}</span>
            <span className="break-words text-sm text-slate-200">{formatValue(nestedValue)}</span>
          </div>
        ))}
      </div>
    );
  }

  return <p className="break-words text-sm text-slate-200">{formatValue(value)}</p>;
}

function RecordDetailModal({
  title,
  record,
  fields,
  onClose,
  onEdit,
  onDelete,
  onRunAnalysis,
  onRunAction,
  actions = [],
  analysisResult,
  analysisLoading,
}) {
  if (!record) return null;
  const shownKeys = new Set(fields.map((field) => field.key));
  const extraFields = Object.keys(record)
    .filter((key) => !shownKeys.has(key))
    .map((key) => ({ key, label: key.replace(/_/g, ' ') }));
  const allFields = [...fields, ...extraFields];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl animate-fade-in">
        <div className="flex items-start justify-between gap-4 border-b border-slate-700 bg-gradient-to-b from-blue-500/10 to-transparent px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
            <h2 className="mt-1 text-xl font-bold text-white break-words">{displayTitle(record, title)}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {record.id && <span className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1 text-xs font-semibold text-slate-300">Record ID {record.id}</span>}
              {record.status && <StatusBadge status={record.status} />}
              {record.review_status && <StatusBadge status={record.review_status} />}
              {record.priority && <StatusBadge status={record.priority} />}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close record details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-800 bg-slate-950/35 px-6 py-4">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/15 px-4 py-2 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/25"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/25"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={analysisLoading}
            className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/15 px-4 py-2 text-sm font-medium text-purple-300 transition-colors hover:bg-purple-500/25 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {analysisLoading ? 'Running AI...' : 'Run AI Analysis'}
          </button>
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => onRunAction(action)}
              disabled={analysisLoading}
              className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {action.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>

        <div className="max-h-[calc(90vh-190px)] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {allFields.map((field) => {
              const value = record[field.key];
              const wide = field.type === 'textarea' || (typeof value === 'object' && value !== null) || String(formatValue(value)).length > 120;
              return (
                <div
                  key={field.key}
                  className={`${wide ? 'md:col-span-2 xl:col-span-3' : ''} rounded-xl border border-slate-800 bg-slate-950/40 p-4`}
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{field.label}</p>
                  {statusLikeKeys.includes(field.key) ? (
                    <StatusBadge status={value} />
                  ) : wide ? (
                    <DetailValue value={value} />
                  ) : (
                    <DetailValue value={value} />
                  )}
                </div>
              );
            })}
          </div>

          <AIAnalysisPanel
            onRunAnalysis={onRunAnalysis}
            analysisResult={analysisResult}
            loading={analysisLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default function FeatureListPage({ feature }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingRow, setEditingRow] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get(feature.apiEndpoint);
      setData(rowsFromResponse(result));
    } catch (err) {
      setToast({ message: `Failed to load ${feature.title}: ${err.message}`, type: 'error' });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [feature.apiEndpoint, feature.title]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (formData) => {
    try {
      await api.post(feature.apiEndpoint, formData);
      setToast({ message: `${feature.title} item created successfully.`, type: 'success' });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setToast({ message: `Failed to create: ${err.message}`, type: 'error' });
    }
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setEditingRow(false);
    setAnalysisResult(null);
  };

  const handleEdit = async (formData) => {
    if (!selectedRow?.id) return;
    if (Object.keys(formData).length === 0) {
      setToast({ message: 'No changes to save.', type: 'info' });
      setEditingRow(false);
      return;
    }
    try {
      const updated = await api.put(`${feature.apiEndpoint}/${selectedRow.id}`, formData);
      setToast({ message: `${feature.title} record updated successfully.`, type: 'success' });
      setEditingRow(false);
      setSelectedRow(updated);
      fetchData();
    } catch (err) {
      setToast({ message: `Failed to update: ${err.message}`, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedRow?.id) return;
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) return;
    try {
      await api.delete(`${feature.apiEndpoint}/${selectedRow.id}`);
      setToast({ message: `${feature.title} record deleted.`, type: 'success' });
      setSelectedRow(null);
      setEditingRow(false);
      fetchData();
    } catch (err) {
      setToast({ message: `Failed to delete: ${err.message}`, type: 'error' });
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedRow?.id) return;
    setAnalysisLoading(true);
    setAnalysisResult(null);
    try {
      const result = await api.post(`${feature.apiEndpoint}/${selectedRow.id}/analyze`, {});
      setAnalysisResult(result.analysis || result.result || result);
    } catch (err) {
      setToast({ message: `AI analysis failed: ${err.message}`, type: 'error' });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleRunAction = async (action) => {
    if (!selectedRow?.id || !action?.key) return;
    setAnalysisLoading(true);
    setAnalysisResult(null);
    try {
      const result = await api.post(`${feature.apiEndpoint}/${selectedRow.id}/actions/${action.key}`, {});
      if (result.updated) {
        setSelectedRow(result.updated);
      }
      setAnalysisResult(result.result || result);
      setToast({ message: `${action.label} completed.`, type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: `${action.label} failed: ${err.message}`, type: 'error' });
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{feature.title}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{feature.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Item
          </button>
        </div>
      </div>

      <DataTable
        columns={feature.columns}
        data={data}
        onRowClick={handleRowClick}
        loading={loading}
      />

      {showModal && (
        <FormModal
          title={`Create ${feature.title}`}
          fields={feature.formFields}
          onSave={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}

      {selectedRow && !editingRow && (
        <RecordDetailModal
          title={feature.title}
          record={selectedRow}
          fields={feature.formFields}
          onClose={() => setSelectedRow(null)}
          onEdit={() => setEditingRow(true)}
          onDelete={handleDelete}
          onRunAnalysis={handleRunAnalysis}
          onRunAction={handleRunAction}
          actions={feature.actions || []}
          analysisResult={analysisResult}
          analysisLoading={analysisLoading}
        />
      )}

      {selectedRow && editingRow && (
        <FormModal
          title={`Edit ${feature.title}`}
          fields={feature.formFields}
          initialData={selectedRow}
          onSave={handleEdit}
          onClose={() => setEditingRow(false)}
        />
      )}
    </div>
  );
}
