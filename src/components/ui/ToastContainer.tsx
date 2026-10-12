import React from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useBrandGuard();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />,
        };

        const borderColors = {
          success: 'border-emerald-500/30 bg-neutral-900/95',
          warning: 'border-amber-500/30 bg-neutral-900/95',
          error: 'border-rose-500/30 bg-neutral-900/95',
          info: 'border-indigo-500/30 bg-neutral-900/95',
        };

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-2 ${borderColors[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-semibold text-neutral-100">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-500 hover:text-neutral-300 transition-colors p-1 -mr-1 -mt-1 rounded-md"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
