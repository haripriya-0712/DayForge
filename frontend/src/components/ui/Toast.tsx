import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let toastCount = 0;

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  undoAction?: () => void;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (e: CustomEvent<Omit<ToastItem, 'id'>>) => {
      const id = toastCount++;
      setToasts((t) => [...t, { ...e.detail, id }]);
      setTimeout(() => {
        setToasts((t) => t.filter((toast) => toast.id !== id));
      }, 4000);
    };

    window.addEventListener('add-toast' as any, handleToast);
    return () => window.removeEventListener('add-toast' as any, handleToast);
  }, []);

  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 pointer-events-none w-full max-w-sm px-4 md:bottom-8">
      <AnimatePresence mode="popLayout">
        {toasts.map((toastItem) => (
          <motion.div
            key={toastItem.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl pointer-events-auto flex items-center justify-between gap-3 border ${
              toastItem.type === 'error'
                ? 'bg-danger text-white border-danger/20'
                : toastItem.type === 'success'
                ? 'bg-surface text-text border-success/40 dark:border-success/30 shadow-success/10'
                : 'bg-surface text-text border-border'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {toastItem.type === 'success' && <span className="h-2 w-2 rounded-full bg-success shrink-0" />}
              <span className="truncate">{toastItem.message}</span>
            </div>
            {toastItem.undoAction && (
              <button
                onClick={() => {
                  toastItem.undoAction?.();
                  setToasts((t) => t.filter((item) => item.id !== toastItem.id));
                }}
                className="text-xs font-bold text-primary hover:underline bg-primary-soft px-2.5 py-1 rounded-xl shrink-0"
              >
                Undo
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const toast = (
  message: string,
  type: 'success' | 'error' | 'info' = 'info',
  undoAction?: () => void
) => {
  window.dispatchEvent(new CustomEvent('add-toast', { detail: { message, type, undoAction } }));
};

