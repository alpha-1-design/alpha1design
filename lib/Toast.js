import { createContext, useContext, useState, useCallback } from 'react';
import Icons from '../components/Icons';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)', pointerEvents: 'auto',
            minWidth: '280px', maxWidth: '400px',
          }}>
            {toast.type === 'success' && <Icons.Check size={16} color="var(--img)" />}
            {toast.type === 'error' && <Icons.X size={16} color="#f87171" />}
            {toast.type === 'info' && <Icons.Loader size={16} color="var(--ai)" />}
            <span style={{ fontSize: '13px', color: 'var(--text)', flex: 1 }}>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
              <Icons.X size={14} color="var(--muted)" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}