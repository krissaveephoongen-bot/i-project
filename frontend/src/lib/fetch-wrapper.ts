/**
 * Enhanced Fetch Wrapper with comprehensive error handling
 * Provides timeout, retry logic, request/response interceptors, and error recovery
 */

import { parseApiError, AppError } from './error-handler';

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
  signal?: AbortSignal;
}

interface FetchConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: FetchConfig = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Create an abort signal with timeout
 */
function createTimeoutSignal(timeout: number, signal?: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Chain the provided signal if available
  if (signal) {
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      controller.abort();
    });
  }

  return controller.signal;
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, status?: number): boolean {
  // Network errors are retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Timeout errors are retryable
  if (error.name === 'AbortError') {
    return true;
  }

  // Server errors (5xx) are retryable
  if (status && status >= 500) {
    return true;
  }

  // Rate limit (429) is retryable
  if (status === 429) {
    return true;
  }

  return false;
}

/**
 * Enhanced fetch wrapper with error handling, timeout, and retry logic
 */
export async function fetchWithErrorHandling(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_CONFIG.timeout,
    retries = DEFAULT_CONFIG.retries,
    retryDelay = DEFAULT_CONFIG.retryDelay,
    onRetry,
    signal,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create timeout signal
      const timeoutSignal = createTimeoutSignal(timeout, signal);

      // Make the fetch request
      const response = await fetch(url, {
        ...fetchOptions,
        signal: timeoutSignal,
      });

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new AppError(
          errorData.message || `HTTP ${response.status}`,
          errorData.code || `HTTP_${response.status}`,
          response.status,
          errorData.details
        );

        // Check if retryable
        if (isRetryableError(error, response.status) && attempt < retries) {
          lastError = error;
          onRetry?.(attempt + 1, error);
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );
          continue;
        }

        throw error;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if retryable
      if (isRetryableError(error, undefined) && attempt < retries) {
        onRetry?.(attempt + 1, lastError);
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
        continue;
      }

      throw error;
    }
  }

  // Should not reach here, but just in case
  throw lastError || new Error('Failed to fetch after all retries');
}

/**
 * Parse JSON response with fallback
 */
export async function parseJsonResponse(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    // Return empty object if JSON parsing fails
    return {};
  }
}

/**
 * Helper to make API requests with error handling
 */
export async function apiRequest<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  try {
    const response = await fetchWithErrorHandling(url, options);
    const data = await parseJsonResponse(response);
    return data as T;
  } catch (error) {
    const apiError = parseApiError(error);
    throw new AppError(apiError.message, apiError.code, apiError.status, apiError.details);
  }
}

/**
 * Batch fetch with error handling and timeout
 */
export async function batchFetch(
  requests: Array<{ url: string; options?: FetchOptions }>,
  options?: { timeout?: number; continueOnError?: boolean }
): Promise<Array<Response | Error>> {
  const { timeout = DEFAULT_CONFIG.timeout, continueOnError = false } = options || {};

  const promises = requests.map((request) =>
    fetchWithErrorHandling(request.url, {
      ...request.options,
      timeout,
    }).catch((error) => {
      if (continueOnError) {
        return error;
      }
      throw error;
    })
  );

  try {
    return await Promise.all(promises);
  } catch (error) {
    if (continueOnError) {
      // Return results that completed, errors for failed
      return Promise.allSettled(promises).then((results) =>
        results.map((result) => (result.status === 'fulfilled' ? result.value : result.reason))
      );
    }
    throw error;
  }
}

/**
 * Exponential backoff retry strategy
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
