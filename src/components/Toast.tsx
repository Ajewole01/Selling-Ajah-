import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
        let borderClass = 'border-emerald-500/30';
        let bgClass = 'bg-white/95 dark:bg-neutral-900/95';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          borderClass = 'border-rose-500/30';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-[#D4AF37] shrink-0" />;
          borderClass = 'border-[#D4AF37]/30';
        }

        return (
          <div
            key={toast.id}
            id={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderClass} ${bgClass} text-neutral-900 dark:text-white shadow-xl dark:shadow-2xl backdrop-blur-md animate-in slide-in-from-right-4 transition-all duration-200`}
          >
            {icon}
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toast.message}
            </div>
            <button
              id={`close-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
