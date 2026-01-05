/**
 * Centralized error handling utilities
 * Provides comprehensive error parsing, formatting, and recovery strategies
 */

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
  isRetryable?: boolean;
}

export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Parse API error response into standardized format
 * Handles fetch, axios, AppError, and generic errors
 */
export const parseApiError = (error: any): ApiError => {
  // Handle AbortError (timeout)
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      status: 408,
      message: 'Request timeout. Please check your connection and try again.',
      code: 'TIMEOUT_ERROR',
      isTimeoutError: true,
      isRetryable: true,
    };
  }

  // Handle Fetch API TypeError (network errors)
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    const isNetworkError = message.includes('fetch') || message.includes('network');

    return {
      status: 0,
      message: 'Network error. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      isNetworkError: true,
      isRetryable: true,
    };
  }

  // Handle Axios response errors
  if (error?.response?.status) {
    const status = error.response.status;
    const data = error.response.data || error.response;

    return {
      status,
      message: data?.message || getDefaultErrorMessage(status),
      code: data?.code || `HTTP_${status}`,
      details: data?.details,
      isRetryable: isRetryableStatus(status),
    };
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    return {
      status: error.status || 500,
      message: error.message,
      code: error.code,
      details: error.details,
      isRetryable: error.status ? isRetryableStatus(error.status) : false,
    };
  }

  // Handle generic errors with message
  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      status: 500,
      message: error,
      code: 'UNKNOWN_ERROR',
    };
  }

  // Fallback
  return {
    status: 500,
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * Check if HTTP status is retryable
 */
const isRetryableStatus = (status: number): boolean => {
  // 5xx server errors
  if (status >= 500) return true;
  // 429 Too Many Requests
  if (status === 429) return true;
  // 408 Request Timeout
  if (status === 408) return true;
  return false;
};

/**
 * Get human-readable error message based on HTTP status
 */
export const getDefaultErrorMessage = (status: number): string => {
  const messages: Record<number, string> = {
    0: 'Network error. Please check your internet connection.',
    400: 'Bad request. Please check your input.',
    401: 'Authentication failed. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    408: 'Request timeout. Please try again.',
    409: 'This resource already exists.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Please try again later.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service unavailable. Please try again later.',
    504: 'Gateway timeout. Please try again later.',
  };

  return messages[status] || 'An error occurred. Please try again.';
};

/**
 * Determine error severity based on status code
 */
export const getErrorSeverity = (status: number): 'error' | 'warning' | 'info' => {
  if (status >= 500) return 'error';
  if (status >= 400) return 'warning';
  return 'info';
};

/**
 * Safe try-catch wrapper for async functions
 */
export const tryCatch = async <T,>(
  fn: () => Promise<T>,
  onError?: (error: ApiError) => void
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    const apiError = parseApiError(error);
    onError?.(apiError);
    console.error('Caught error:', apiError);
    return null;
  }
};

/**
 * Format error for display to user
 */
export const formatErrorDisplay = (error: ApiError): string => {
  if (error.code && error.code !== 'UNKNOWN_ERROR') {
    return `[${error.code}] ${error.message}`;
  }
  return error.message;
};

/**
 * Get recovery action suggestion for error
 */
export const getErrorRecoveryAction = (error: ApiError): string => {
  if (error.isNetworkError) {
    return 'Please check your internet connection and try again.';
  }
  if (error.isTimeoutError) {
    return 'The request took too long. Please try again.';
  }
  if (error.status === 401) {
    return 'Please log in again.';
  }
  if (error.status === 403) {
    return 'Contact your administrator for access.';
  }
  if (error.status === 404) {
    return 'The resource may have been deleted. Please refresh and try again.';
  }
  if (error.status && error.status >= 500) {
    return 'The server is having issues. Please try again later.';
  }
  return 'Please try again.';
};

/**
 * Determine if error should be displayed to user
 */
export const shouldDisplayError = (error: ApiError): boolean => {
  // Don't show 401 errors as they're handled by auth redirects
  if (error.status === 401) return false;
  return true;
};
