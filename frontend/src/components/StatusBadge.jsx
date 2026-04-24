import React from 'react';

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  connected: 'bg-green-500/20 text-green-400 border-green-500/30',
  trained: 'bg-green-500/20 text-green-400 border-green-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  reviewed: 'bg-green-500/20 text-green-400 border-green-500/30',
  deployed: 'bg-green-500/20 text-green-400 border-green-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  verified: 'bg-green-500/20 text-green-400 border-green-500/30',
  analyzed: 'bg-green-500/20 text-green-400 border-green-500/30',

  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  pending_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  queued: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  not_started: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  new: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  unconfirmed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',

  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_review: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  investigating: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  training: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  validating: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  executed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  saved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',

  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  terminated: 'bg-red-500/20 text-red-400 border-red-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  disputed: 'bg-red-500/20 text-red-400 border-red-500/30',
  waived: 'bg-red-500/20 text-red-400 border-red-500/30',

  closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  archived: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  released: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  dismissed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  expired: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  decommissioned: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  deprecated: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  disconnected: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  maintenance: 'bg-orange-500/20 text-orange-400 border-orange-500/30',

  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',

  privileged: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  not_privileged: 'bg-green-500/20 text-green-400 border-green-500/30',
  partially_privileged: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  not_reviewed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  claimed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  partial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  flagged: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  redacted: 'bg-red-500/20 text-red-400 border-red-500/30',
  on_hold: 'bg-purple-500/20 text-purple-400 border-purple-500/30',

  // Matter/hold types
  litigation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  investigation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  regulatory: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  compliance: 'bg-green-500/20 text-green-400 border-green-500/30',

  // Processing types
  dedup: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  ocr: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  extraction: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  normalization: 'bg-teal-500/20 text-teal-400 border-teal-500/30',

  // Categories
  communication: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  filing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  meeting: 'bg-green-500/20 text-green-400 border-green-500/30',
  transaction: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  incident: 'bg-red-500/20 text-red-400 border-red-500/30',
  discovery: 'bg-purple-500/20 text-purple-400 border-purple-500/30',

  // Privilege types
  attorney_client: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  work_product: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  joint_defense: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  common_interest: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',

  // Key term categories
  person: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  organization: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  location: 'bg-green-500/20 text-green-400 border-green-500/30',
  date: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  concept: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  financial: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',

  // Regulations
  gdpr: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  hipaa: 'bg-green-500/20 text-green-400 border-green-500/30',
  sox: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  fcpa: 'bg-red-500/20 text-red-400 border-red-500/30',
  ccpa: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  sec: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  frcp: 'bg-teal-500/20 text-teal-400 border-teal-500/30',

  // Confidentiality
  confidential: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  highly_confidential: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  attorneys_eyes_only: 'bg-red-500/20 text-red-400 border-red-500/30',
  public: 'bg-green-500/20 text-green-400 border-green-500/30',

  // Alert types
  data_gap: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  spike: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  pattern: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  unusual_access: 'bg-red-500/20 text-red-400 border-red-500/30',
  deletion: 'bg-red-500/20 text-red-400 border-red-500/30',

  // Algorithms
  logistic_regression: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  svm: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  random_forest: 'bg-green-500/20 text-green-400 border-green-500/30',
  neural_network: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  transformer: 'bg-pink-500/20 text-pink-400 border-pink-500/30',

  // Boolean-like
  true: 'bg-green-500/20 text-green-400 border-green-500/30',
  false: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  relevant: 'bg-green-500/20 text-green-400 border-green-500/30',
  not_relevant: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  hot: 'bg-red-500/20 text-red-400 border-red-500/30',
  logged: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  challenged: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  upheld: 'bg-green-500/20 text-green-400 border-green-500/30',
  under_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',

  positive: 'bg-green-500/20 text-green-400 border-green-500/30',
  neutral: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  negative: 'bg-red-500/20 text-red-400 border-red-500/30',
  mixed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const defaultColor = 'bg-slate-500/20 text-slate-400 border-slate-500/30';

export default function StatusBadge({ status }) {
  if (!status) return null;
  const statusStr = String(status).toLowerCase().replace(/\s+/g, '_');
  const colorClass = statusColors[statusStr] || defaultColor;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {String(status).replace(/_/g, ' ')}
    </span>
  );
}
