import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Clock } from 'lucide-react';

export const IdleWarningBanner: React.FC = () => {
  const { idle, keepIdleTime, discardIdleTime } = useApp();

  if (!idle.detected) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle size={18} />
        </div>
        <div>
          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <span>Web Inactivity Detected:</span>
            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded font-mono">
              <Clock size={11} /> {idle.idleMinutes} min idle
            </span>
          </div>
          <div className="text-xs text-amber-800 mt-0.5">
            No keyboard or mouse activity was detected in the active browser tab. Choose how to account for this duration.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={keepIdleTime}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
        >
          Keep {idle.idleMinutes}m
        </button>
        <button
          onClick={discardIdleTime}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all cursor-pointer shadow-xs"
        >
          Discard {idle.idleMinutes}m
        </button>
      </div>
    </div>
  );
};
