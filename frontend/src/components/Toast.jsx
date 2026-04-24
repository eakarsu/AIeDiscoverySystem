import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-green-500/20 border-green-500/30 text-green-400',
  error: 'bg-red-500/20 border-red-500/30 text-red-400',
  warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
};

export default function Toast({ message, type = 'info', onClose }) {
  const Icon = icons[type] || icons.info;
  const colorClass = colors[type] || colors.info;

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg border ${colorClass} shadow-lg animate-fade-in max-w-md`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="p-0.5 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
