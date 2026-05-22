import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Grid3X3, RefreshCw } from 'lucide-react';

export default function CustodianVolumeHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/custom-views/custodian-volume-heatmap');
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cellColor = (v) => {
    if (!data || data.max === 0) return 'rgba(59,130,246,0.05)';
    const intensity = v / data.max;
    return `rgba(59,130,246,${Math.max(0.06, intensity)})`;
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Custodian Volume Heatmap</h3>
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
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-2 px-2 text-slate-400 font-medium">Custodian</th>
                {data.file_types.map((ft) => (
                  <th key={ft} className="text-center py-2 px-2 text-slate-400 font-medium uppercase">{ft}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.custodians.map((c, i) => (
                <tr key={c} className="border-t border-slate-700/40">
                  <td className="py-1.5 px-2 text-slate-200 whitespace-nowrap">{c}</td>
                  {data.matrix[i].map((v, j) => (
                    <td
                      key={j}
                      className="py-1.5 px-2 text-center text-slate-100 font-mono"
                      style={{ backgroundColor: cellColor(v) }}
                      title={`${c} / ${data.file_types[j]}: ${v}`}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-slate-500 mt-3">
            Cell intensity scales to peak volume ({data.max}). Hover for exact counts.
          </p>
        </div>
      )}
    </div>
  );
}
