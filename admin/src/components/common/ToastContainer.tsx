import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore, ToastItem } from '../../stores/toast.store';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((item) => (
        <ToastMessage key={item.id} toast={item} onClose={() => removeToast(item.id)} />
      ))}
    </div>
  );
};

const ToastMessage: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success: 'bg-emerald-900/90 border-emerald-700 text-white dark:bg-emerald-950 dark:border-emerald-800',
    error: 'bg-rose-900/90 border-rose-700 text-white dark:bg-rose-950 dark:border-rose-800',
    warning: 'bg-amber-900/90 border-amber-700 text-white dark:bg-amber-950 dark:border-amber-800',
    info: 'bg-slate-900/90 border-slate-700 text-white dark:bg-slate-950 dark:border-slate-800',
  };

  const iconColors = {
    success: 'text-emerald-400',
    error: 'text-rose-400',
    warning: 'text-amber-400',
    info: 'text-sky-400',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${styles[toast.type]}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
      <div className="flex-1 text-xs sm:text-sm">
        {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
        <div className="opacity-90 leading-relaxed font-light">{toast.message}</div>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default ToastContainer;
