import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />;
        let bg = 'bg-[#143226] text-white border-[#275c46]';

        if (toast.type === 'info') {
          icon = <Info size={16} className="text-sky-400 shrink-0" />;
          bg = 'bg-[#12283a] text-white border-[#244c6d]';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle size={16} className="text-amber-400 shrink-0" />;
          bg = 'bg-[#35250f] text-white border-[#61451f]';
        } else if (toast.type === 'error') {
          icon = <XCircle size={16} className="text-rose-400 shrink-0" />;
          bg = 'bg-[#361313] text-white border-[#662828]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-xs font-medium shadow-xl backdrop-blur-xs transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${bg}`}
          >
            {icon}
            <div className="flex-1 leading-relaxed">{toast.message}</div>
          </div>
        );
      })}
    </div>
  );
};
