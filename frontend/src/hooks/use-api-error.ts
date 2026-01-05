import { useErrorContext } from '@/contexts/ErrorContext';
import { parseApiError, getErrorSeverity, formatErrorDisplay, ApiError } from '@/lib/error-handler';
import { useCallback } from 'react';

/**
 * Hook for handling API errors in a standardized way
 */
export const useApiError = () => {
  const { addError } = useErrorContext();

  const handleError = useCallback((error: any, context?: string) => {
    const apiError = parseApiError(error);
    const severity = getErrorSeverity(apiError.status);
    const message = formatErrorDisplay(apiError);

    // Add to error context with context info
    addError(message, {
      severity,
      code: apiError.code,
      context: context ? { source: context } : undefined,
    });

    // Log full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error (${context}):`, apiError);
    }

    return apiError;
  }, [addError]);

  return { handleError };
};

/**
 * Hook for async operations with automatic error handling
 */
export const useAsync = <T,>(
  asyncFn: () => Promise<T>,
  onError?: (error: ApiError) => void
) => {
  const { handleError } = useApiError();

  const execute = useCallback(async (): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      const apiError = handleError(error);
      onError?.(apiError);
      return null;
    }
  }, [asyncFn, handleError, onError]);

  return { execute };
};
