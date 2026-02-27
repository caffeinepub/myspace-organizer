import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-modal pointer-events-auto
            animate-slide-up border
            ${toast.variant === 'success' ? 'bg-card border-green-500/30 text-card-foreground' : ''}
            ${toast.variant === 'error' ? 'bg-card border-destructive/30 text-card-foreground' : ''}
            ${toast.variant === 'info' ? 'bg-card border-primary/30 text-card-foreground' : ''}
          `}
          role="alert"
        >
          {toast.variant === 'success' && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
          {toast.variant === 'error' && <AlertCircle className="w-4 h-4 text-destructive shrink-0" />}
          {toast.variant === 'info' && <Info className="w-4 h-4 text-primary shrink-0" />}
          <span className="text-sm flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
