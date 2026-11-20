import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 max-w-md w-full shadow-2xl rounded-xl overflow-hidden pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <div
            className={`p-4 flex items-start gap-3 border ${
              type === 'success'
                ? 'bg-neutral-900 text-white border-neutral-800 dark:bg-cream-100 dark:text-neutral-900 dark:border-cream-200'
                : 'bg-red-950 text-white border-red-900 dark:bg-red-100 dark:text-red-950 dark:border-red-200'
            }`}
          >
            {type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 dark:text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 dark:text-rose-600 mt-0.5" />
            )}
            <div className="flex-1 text-sm font-light leading-relaxed">
              {message}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:opacity-70 transition-opacity focus:outline-none"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
