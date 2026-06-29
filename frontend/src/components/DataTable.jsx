import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ITEMS_PER_PAGE = 10;

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

function formatCellValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString();
  }
  return String(value);
}

export default function DataTable({ columns, data, onRowClick, loading }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil((data?.length || 0) / ITEMS_PER_PAGE);
  useEffect(() => {
    setPage(0);
  }, [data?.length]);
  const pageData = (data || []).slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-slate-400">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-12 text-center">
        <p className="text-slate-400">No records found.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {pageData.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick && onRowClick(row)}
                className="hover:bg-slate-700/30 transition-colors cursor-pointer"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-slate-300">
                    {statusLikeKeys.includes(col.key) ? (
                      <StatusBadge status={row[col.key]} />
                    ) : (
                      <span className="truncate block max-w-xs">
                        {formatCellValue(row[col.key])}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
        <p className="text-sm text-slate-400">
          Showing {page * ITEMS_PER_PAGE + 1}-
          {Math.min((page + 1) * ITEMS_PER_PAGE, data.length)} of {data.length} items
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
