import React, { createContext, useContext, useCallback, useState } from 'react';
import toast from 'react-hot-toast';

interface AppError {
  id: string;
  message: string;
  code?: string;
  severity: 'error' | 'warning' | 'info';
  timestamp: number;
  context?: Record<string, any>;
}

interface ErrorContextType {
  errors: AppError[];
  addError: (message: string, options?: Partial<AppError>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  lastError: AppError | null;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);
  const [lastError, setLastError] = useState<AppError | null>(null);

  const addError = useCallback((message: string, options?: Partial<AppError>) => {
    const error: AppError = {
      id: `error-${Date.now()}-${Math.random()}`,
      message,
      severity: 'error',
      timestamp: Date.now(),
      ...options,
    };

    setErrors((prev) => [...prev, error]);
    setLastError(error);

    // Show toast notification
    const toastMessage = options?.code ? `[${options.code}] ${message}` : message;
    toast.error(toastMessage, {
      duration: 5000,
      id: error.id,
    });

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[AppError]', error);
    }
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
    toast.dismiss(id);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
    toast.remove();
  }, []);

  const value: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors,
    lastError,
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

export const useErrorContext = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within ErrorProvider');
  }
  return context;
};
