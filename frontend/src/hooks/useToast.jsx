import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastCtx = createContext(null);

const icons = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle };
const colors = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error:   'border-red-200 bg-red-50 text-red-800',
  info:    'border-blue-200 bg-blue-50 text-blue-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
};
const iconColors = { success: '#059669', error: '#dc2626', info: '#5b8dee', warning: '#d97706' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
    return id;
  }, []);

  const dismiss = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = icons[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium max-w-xs pointer-events-auto ${colors[t.type]}`}
              >
                <Icon size={15} style={{ color: iconColors[t.type], flexShrink: 0 }} />
                <span className="flex-1">{t.message}</span>
                <button onClick={() => dismiss(t.id)} className="opacity-50 hover:opacity-100 transition-opacity ml-1">
                  <X size={13} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
