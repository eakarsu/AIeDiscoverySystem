import React from 'react';

const stages = [
  { label: 'Intake', value: 28 },
  { label: 'Review', value: 46 },
  { label: 'Decision', value: 64 },
  { label: 'Action', value: 78 },
  { label: 'Outcome', value: 91 },
];

function TimelineView() {
  const width = 620;
  const height = 260;
  const max = Math.max(...stages.map((stage) => stage.value));
  const points = stages.map((stage, index) => {
    const x = 48 + index * 130;
    const y = 202 - (stage.value / max) * 142;
    return { ...stage, x, y };
  });

  return (
    <main className="text-slate-100">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Custom visualization</p>
      <h1 className="mb-5 mt-1 text-2xl font-semibold text-white">AI eDiscovery System Timeline View</h1>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(280px,1fr)_260px]">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Timeline view of operational stages" className="min-h-72 w-full rounded-xl border border-slate-700 bg-slate-900">
          {[60, 100, 140, 180, 220].map((y) => <line key={y} x1="42" x2="580" y1={y} y2={y} stroke="#334155" />)}
          <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="8" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
              <text x={point.x} y="238" textAnchor="middle" fill="#94a3b8" fontSize="13">{point.label}</text>
              <text x={point.x} y={point.y - 16} textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="700">{point.value}</text>
            </g>
          ))}
        </svg>
        <div className="grid gap-3">
          {stages.map((stage) => (
            <div key={stage.label} className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
              <strong className="text-white">{stage.label}</strong>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
                <div style={{ width: `${stage.value}%`, height: '100%', background: '#2563eb' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default TimelineView;
