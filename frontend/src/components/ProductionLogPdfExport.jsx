import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';

export default function ProductionLogPdfExport() {
  const [caseId, setCaseId] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const downloadPdf = async () => {
    setBusy(true);
    setStatus('');
    try {
      const token = localStorage.getItem('token');
      const qs = caseId ? `?case_id=${encodeURIComponent(caseId)}` : '';
      const res = await fetch(`http://localhost:3502/api/custom-views/production-log-pdf${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `production-log-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('PDF downloaded successfully.');
    } catch (e) {
      setStatus(`Failed: ${e.message || e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <FileDown className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Production Log PDF Export</h3>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        Export a formatted PDF report of all productions for a case (Bates ranges, recipients, confidentiality).
      </p>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">Case ID (optional)</label>
          <input
            type="number"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            placeholder="Leave blank for all cases"
            className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
        <button
          onClick={downloadPdf}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          Download PDF
        </button>
      </div>

      {status && (
        <p className={`mt-3 text-sm ${status.startsWith('Failed') ? 'text-red-400' : 'text-emerald-400'}`}>
          {status}
        </p>
      )}
    </div>
  );
}
