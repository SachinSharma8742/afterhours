"use client";

import { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, type = "info", duration = 4000 }) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl ${
                t.type === "success"
                  ? "bg-slate-900/90 border-emerald-500/40 text-emerald-100"
                  : t.type === "error"
                  ? "bg-slate-900/90 border-rose-500/40 text-rose-100"
                  : "bg-slate-900/90 border-violet-500/40 text-slate-100"
              }`}
            >
              <div className="mt-0.5">
                {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {t.type === "info" && <Info className="w-5 h-5 text-violet-400" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{t.title}</p>
                {t.description && <p className="text-xs text-slate-400 mt-1">{t.description}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
