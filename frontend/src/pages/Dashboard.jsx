import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Shield,
  Users,
  FolderOpen,
  Cpu,
  Eye,
  Package,
  Search,
  Brain,
  Hash,
  Clock,
  Mail,
  AlertTriangle,
  Lock,
  CheckSquare,
  Database,
  TrendingUp,
  Activity,
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { api } from '../api';
import { features } from '../config/features';

const iconMap = {
  Briefcase,
  FileText,
  Shield,
  Users,
  FolderOpen,
  Cpu,
  Eye,
  Package,
  Search,
  Brain,
  Hash,
  Clock,
  Mail,
  AlertTriangle,
  Lock,
  CheckSquare,
  Database,
};

const colorClasses = {
  blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 hover:shadow-blue-500/10',
  indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-indigo-500/10',
  red: 'from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/10',
  green: 'from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40 hover:shadow-green-500/10',
  yellow: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40 hover:shadow-yellow-500/10',
  orange: 'from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40 hover:shadow-orange-500/10',
  purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/10',
  teal: 'from-teal-500/10 to-teal-600/5 border-teal-500/20 hover:border-teal-500/40 hover:shadow-teal-500/10',
  cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-cyan-500/10',
  pink: 'from-pink-500/10 to-pink-600/5 border-pink-500/20 hover:border-pink-500/40 hover:shadow-pink-500/10',
  lime: 'from-lime-500/10 to-lime-600/5 border-lime-500/20 hover:border-lime-500/40 hover:shadow-lime-500/10',
  amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/10',
  sky: 'from-sky-500/10 to-sky-600/5 border-sky-500/20 hover:border-sky-500/40 hover:shadow-sky-500/10',
  rose: 'from-rose-500/10 to-rose-600/5 border-rose-500/20 hover:border-rose-500/40 hover:shadow-rose-500/10',
  violet: 'from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:border-violet-500/40 hover:shadow-violet-500/10',
  emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/10',
  slate: 'from-slate-500/10 to-slate-600/5 border-slate-500/20 hover:border-slate-500/40 hover:shadow-slate-500/10',
};

const iconColorClasses = {
  blue: 'text-blue-400',
  indigo: 'text-indigo-400',
  red: 'text-red-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  orange: 'text-orange-400',
  purple: 'text-purple-400',
  teal: 'text-teal-400',
  cyan: 'text-cyan-400',
  pink: 'text-pink-400',
  lime: 'text-lime-400',
  amber: 'text-amber-400',
  sky: 'text-sky-400',
  rose: 'text-rose-400',
  violet: 'text-violet-400',
  emerald: 'text-emerald-400',
  slate: 'text-slate-400',
};

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      const results = {};
      await Promise.allSettled(
        features.map(async (f) => {
          try {
            const data = await api.get(f.apiEndpoint);
            results[f.key] = Array.isArray(data) ? data.length : (data?.length ?? 0);
          } catch {
            results[f.key] = 0;
          }
        })
      );
      setCounts(results);
      setLoading(false);
    };
    fetchCounts();
  }, []);

  const totalCases = counts['cases'] || 0;
  const totalDocs = counts['documents'] || 0;
  const totalHolds = counts['legal-holds'] || 0;
  const totalAlerts = counts['anomaly-alerts'] || 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Briefcase} label="Total Cases" value={totalCases} color="blue" />
        <StatsCard icon={FileText} label="Documents" value={totalDocs} color="indigo" />
        <StatsCard icon={Shield} label="Active Holds" value={totalHolds} color="red" />
        <StatsCard icon={AlertTriangle} label="Anomaly Alerts" value={totalAlerts} color="orange" />
      </div>

      {/* Feature Cards Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          System Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || FileText;
            const cardColor = colorClasses[feature.color] || colorClasses.blue;
            const iColor = iconColorClasses[feature.color] || 'text-blue-400';

            return (
              <button
                key={feature.key}
                onClick={() => navigate(`/${feature.key}`)}
                className={`bg-gradient-to-br ${cardColor} border rounded-xl p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-lg bg-slate-800/60 ${iColor} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {loading ? (
                      <span className="inline-block w-6 h-6 rounded bg-slate-700 animate-pulse" />
                    ) : (
                      counts[feature.key] ?? 0
                    )}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
