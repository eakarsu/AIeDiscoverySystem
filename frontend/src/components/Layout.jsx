import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
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
  Target,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Scale,
  Menu,
  User,
  UserCircle,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
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
  Target,
  Sparkles,
  UserCircle,
};

const navGroups = [
  {
    label: 'CORE',
    items: [
      { path: '/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
      { path: '/cases', icon: 'Briefcase', label: 'Cases' },
      { path: '/documents', icon: 'FileText', label: 'Documents' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { path: '/legal-holds', icon: 'Shield', label: 'Legal Holds' },
      { path: '/custodians', icon: 'Users', label: 'Custodians' },
      { path: '/collections', icon: 'FolderOpen', label: 'Collections' },
    ],
  },
  {
    label: 'PROCESSING',
    items: [
      { path: '/processing-jobs', icon: 'Cpu', label: 'Processing Jobs' },
      { path: '/review-sets', icon: 'Eye', label: 'Review Sets' },
      { path: '/productions', icon: 'Package', label: 'Productions' },
    ],
  },
  {
    label: 'ANALYSIS',
    items: [
      { path: '/search-queries', icon: 'Search', label: 'Search Queries' },
      { path: '/predictive-coding', icon: 'Brain', label: 'Predictive Coding' },
      { path: '/key-terms', icon: 'Hash', label: 'Key Terms' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { path: '/timeline-events', icon: 'Clock', label: 'Timeline Events' },
      { path: '/email-threads', icon: 'Mail', label: 'Email Threads' },
      { path: '/anomaly-alerts', icon: 'AlertTriangle', label: 'Anomaly Alerts' },
    ],
  },
  {
    label: 'COMPLIANCE',
    items: [
      { path: '/privilege-logs', icon: 'Lock', label: 'Privilege Logs' },
      { path: '/compliance-rules', icon: 'CheckSquare', label: 'Compliance Rules' },
      { path: '/data-sources', icon: 'Database', label: 'Data Sources' },
    ],
  },
  {
    label: 'AI TOOLS',
    items: [
      { path: '/ai-relevance-score', icon: 'Target', label: 'Relevance Scoring' },
      { path: '/ai-redaction-suggest', icon: 'Sparkles', label: 'Redaction Suggest' },
      { path: '/ai-email-thread-cluster', icon: 'Mail', label: 'Email Thread Cluster' },
      { path: '/ai-witness-profile', icon: 'UserCircle', label: 'Witness Profile' },
    ],
  },
];

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  })();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-60'
        } flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800 flex-shrink-0">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0">
            <Scale className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white whitespace-nowrap">AI eDiscovery</p>
              <p className="text-[10px] text-slate-500 whitespace-nowrap">Legal Intelligence</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-2 mb-1.5">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = iconMap[item.icon] || FileText;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 mb-0.5 ${
                      isActive
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                    }`}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-slate-800 p-2 flex-shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">
              {getPageTitle(location.pathname)}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">{user.email || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function getPageTitle(pathname) {
  const map = {
    '/dashboard': 'Dashboard',
    '/cases': 'Case Management',
    '/documents': 'Document Management',
    '/legal-holds': 'Legal Holds',
    '/custodians': 'Custodians',
    '/collections': 'Collections',
    '/processing-jobs': 'Processing Jobs',
    '/review-sets': 'Review Sets',
    '/productions': 'Productions',
    '/search-queries': 'Search Queries',
    '/predictive-coding': 'Predictive Coding',
    '/key-terms': 'Key Terms',
    '/timeline-events': 'Timeline Events',
    '/email-threads': 'Email Threads',
    '/anomaly-alerts': 'Anomaly Alerts',
    '/privilege-logs': 'Privilege Logs',
    '/compliance-rules': 'Compliance Rules',
    '/data-sources': 'Data Sources',
    '/ai-relevance-score': 'AI Relevance Scoring',
    '/ai-redaction-suggest': 'AI Redaction Suggestions',
    '/ai-email-thread-cluster': 'AI Email Thread Clustering',
    '/ai-witness-profile': 'AI Witness Profile',
  };

  for (const [path, title] of Object.entries(map)) {
    if (pathname.startsWith(path)) return title;
  }
  return 'AI eDiscovery System';
}
