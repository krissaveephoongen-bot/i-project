/**
 * Centralized error handling utilities
 */

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
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
 */
export const parseApiError = (error: any): ApiError => {
  // Handle Fetch API errors
  if (error instanceof TypeError) {
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  }

  // Handle HTTP response errors
  if (error?.response?.status) {
    const status = error.response.status;
    const data = error.response.data || error.response;

    return {
      status,
      message: data?.message || getDefaultErrorMessage(status),
      code: data?.code || `HTTP_${status}`,
      details: data?.details,
    };
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    return {
      status: error.status || 500,
      message: error.message,
      code: error.code,
      details: error.details,
    };
  }

  // Handle generic errors
  return {
    status: 500,
    message: error?.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * Get human-readable error message based on HTTP status
 */
export const getDefaultErrorMessage = (status: number): string => {
  const messages: Record<number, string> = {
    400: 'Bad request. Please check your input.',
    401: 'Authentication failed. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This resource already exists.',
    429: 'Too many requests. Please try again later.',
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
 * Format error for display
 */
export const formatErrorDisplay = (error: ApiError): string => {
  if (error.code && error.code !== 'UNKNOWN_ERROR') {
    return `[${error.code}] ${error.message}`;
  }
  return error.message;
};
