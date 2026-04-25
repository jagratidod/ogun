import React, { createContext, useContext, useState, useCallback } from 'react';
import { RiCheckLine, RiErrorWarningLine, RiInformationLine, RiCloseLine } from 'react-icons/ri';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showNotification = useCallback((typeOrObj, message) => {
    const id = Date.now();
    let type = typeOrObj;
    let msg = message;

    // Handle object-style: showNotification({ type, message })
    if (typeof typeOrObj === 'object' && typeOrObj !== null) {
      type = typeOrObj.type;
      msg = typeOrObj.message;
    }

    setToasts((prev) => [...prev, { id, type: type || 'info', message: msg }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showNotification }}>
      {children}
      {/* Toast Portal/Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 min-w-[300px] max-w-md
              bg-surface-secondary border-l-4 shadow-2xl animate-slide-left
              ${toast.type === 'success' ? 'border-brand-teal' : toast.type === 'error' ? 'border-state-danger' : 'border-state-info'}
            `}
          >
            <div className={`p-1.5 rounded-none ${
              toast.type === 'success' ? 'bg-brand-teal/10 text-brand-teal' : 
              toast.type === 'error' ? 'bg-state-danger/10 text-state-danger' : 
              'bg-state-info/10 text-state-info'
            }`}>
              {toast.type === 'success' && <RiCheckLine className="w-5 h-5" />}
              {toast.type === 'error' && <RiErrorWarningLine className="w-5 h-5" />}
              {toast.type !== 'success' && toast.type !== 'error' && <RiInformationLine className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-content-primary uppercase tracking-widest leading-none mb-1">{toast.type}</p>
              <p className="text-sm text-content-secondary leading-tight">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-content-tertiary hover:text-content-primary transition-colors p-1"
            >
              <RiCloseLine className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useNotification must be used within ToastProvider');
  return ctx;
}
