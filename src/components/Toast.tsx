import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
}

/**
 * Individual Toast Component
 */
export function Toast({
  id,
  type,
  message,
  description,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colorMap = {
    success: {
      bg: 'bg-success-50 dark:bg-success-900/20',
      border: 'border-success-200 dark:border-success-800',
      icon: 'text-success-600 dark:text-success-400',
      text: 'text-success-900 dark:text-success-100',
      button: 'hover:bg-success-100 dark:hover:bg-success-900/30',
    },
    error: {
      bg: 'bg-error-50 dark:bg-error-900/20',
      border: 'border-error-200 dark:border-error-800',
      icon: 'text-error-600 dark:text-error-400',
      text: 'text-error-900 dark:text-error-100',
      button: 'hover:bg-error-100 dark:hover:bg-error-900/30',
    },
    warning: {
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      border: 'border-warning-200 dark:border-warning-800',
      icon: 'text-warning-600 dark:text-warning-400',
      text: 'text-warning-900 dark:text-warning-100',
      button: 'hover:bg-warning-100 dark:hover:bg-warning-900/30',
    },
    info: {
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      border: 'border-primary-200 dark:border-primary-800',
      icon: 'text-primary-600 dark:text-primary-400',
      text: 'text-primary-900 dark:text-primary-100',
      button: 'hover:bg-primary-100 dark:hover:bg-primary-900/30',
    },
  };

  const Icon = iconMap[type];
  const colors = colorMap[type];

  if (!isVisible) return null;

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-lg shadow-lg p-4 flex gap-3 items-start animate-fade-in`}
      role="alert"
      aria-live="assertive"
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${colors.icon}`} />

      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${colors.text}`}>{message}</p>
        {description && (
          <p className={`text-sm mt-1 ${colors.text} opacity-90`}>{description}</p>
        )}
      </div>

      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className={`flex-shrink-0 p-1 rounded transition-colors ${colors.button}`}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Toast Container for multiple toasts
 */
export function ToastContainer({
  toasts,
  onRemove,
  position = 'top-right',
}: {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 max-w-sm space-y-2 pointer-events-none`}
    >
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={() => onRemove(toast.id)} />
        </div>
      ))}
    </div>
  );
}

/**
 * useToast hook for using toasts in components
 */
let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (props: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = `toast-${toastId++}`;
    setToasts(prev => [...prev, { ...props, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const success = (message: string, description?: string) => {
    return addToast({ type: 'success', message, description });
  };

  const error = (message: string, description?: string) => {
    return addToast({ type: 'error', message, description });
  };

  const warning = (message: string, description?: string) => {
    return addToast({ type: 'warning', message, description });
  };

  const info = (message: string, description?: string) => {
    return addToast({ type: 'info', message, description });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

export default Toast;
