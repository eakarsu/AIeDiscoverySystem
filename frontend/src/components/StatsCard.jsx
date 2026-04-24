import React from 'react';

export default function StatsCard({ icon: Icon, label, value, color = 'blue', trend }) {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
  };

  const colorClass = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`bg-gradient-to-br ${colorClass} border rounded-xl p-5 transition-all duration-300 hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value ?? '-'}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-lg bg-slate-800/50">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
