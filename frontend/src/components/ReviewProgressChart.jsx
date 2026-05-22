import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { BarChart3, RefreshCw } from 'lucide-react';

export default function ReviewProgressChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/custom-views/review-progress');
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const max = data ? Math.max(1, ...data.series.map((s) => s.value)) : 1;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Document Review Progress</h3>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-4 gap-3 mb-5">
            <Stat label="Total"      value={data.total} />
            <Stat label="Reviewed"   value={data.reviewed}   color="text-blue-400" />
            <Stat label="Responsive" value={data.responsive} color="text-emerald-400" />
            <Stat label="Privileged" value={data.privileged} color="text-purple-400" />
          </div>

          <div className="space-y-3">
            {data.series.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{s.label}</span>
                  <span className="font-mono">{s.value}</span>
                </div>
                <div className="h-4 bg-slate-900/60 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${(s.value / max) * 100}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/40">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
