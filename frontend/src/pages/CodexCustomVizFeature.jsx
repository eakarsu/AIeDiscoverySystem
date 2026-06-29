import React from 'react';

const signals = [
  { label: 'Demand', value: 72, delta: '+12%' },
  { label: 'Risk', value: 44, delta: '-8%' },
  { label: 'Capacity', value: 86, delta: '+6%' },
  { label: 'Quality', value: 63, delta: '+4%' },
  { label: 'Velocity', value: 58, delta: '+9%' },
];

const trend = [18, 32, 28, 46, 41, 57, 69, 64, 78, 72, 88, 83];
const maxTrend = Math.max(...trend);
const points = trend.map((value, index) => {
  const x = 28 + index * 42;
  const y = 172 - (value / maxTrend) * 128;
  return `${x},${y}`;
}).join(' ');

function TimelineView() {
  return (
    <section className="text-slate-100">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Custom visualization</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">AI eDiscovery System Insight Map</h1>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300">Live scenario model</div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(280px,1.3fr)_minmax(260px,.7fr)]">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
          <svg viewBox="0 0 520 220" role="img" aria-label="Custom trend visualization" style={{ width: '100%', height: 260 }}>
            <rect x="0" y="0" width="520" height="220" rx="8" fill="#0f172a" />
            {[44, 76, 108, 140, 172].map((y) => (
              <line key={y} x1="28" x2="492" y1={y} y2={y} stroke="#334155" strokeWidth="1" />
            ))}
            <polyline points={points} fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {trend.map((value, index) => {
              const x = 28 + index * 42;
              const y = 172 - (value / maxTrend) * 128;
              return <circle key={index} cx={x} cy={y} r="5" fill="#14b8a6" stroke="#ffffff" strokeWidth="2" />;
            })}
            <text x="28" y="204" fill="#94a3b8" fontSize="12">Start</text>
            <text x="448" y="204" fill="#94a3b8" fontSize="12">Current</text>
          </svg>
        </div>

        <div className="grid gap-3">
          {signals.map((signal) => (
            <div key={signal.label} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="mb-2 flex justify-between">
                <strong className="text-white">{signal.label}</strong>
                <span style={{ color: signal.delta.startsWith('+') ? '#047857' : '#b45309' }}>{signal.delta}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-700">
                <div style={{ width: `${signal.value}%`, height: '100%', background: '#0f766e' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CodexCustomVizFeature() {
  return <TimelineView />;
}
