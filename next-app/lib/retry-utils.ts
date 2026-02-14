/**
 * Retry Utilities
 * Implements exponential backoff with jitter for API calls
 */

export interface RetryOptions {
  maxAttempts?: number; // Default: 3
  initialDelayMs?: number; // Default: 1000
  maxDelayMs?: number; // Default: 30000
  backoffFactor?: number; // Default: 2 (exponential)
  jitterFactor?: number; // Default: 0.1 (10% jitter)
  shouldRetry?: (error: any, attempt: number) => boolean; // Custom retry logic
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2,
  jitterFactor: 0.1,
  shouldRetry: (error: any) => {
    // Retry on network errors and 5xx errors
    if (error instanceof TypeError) return true; // Network error
    if (error.statusCode === 408) return true; // Request timeout
    if (error.statusCode === 429) return true; // Rate limit
    if (error.statusCode >= 500) return true; // Server error
    return false;
  },
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  // Exponential backoff: initialDelay * (backoffFactor ^ attempt)
  const exponentialDelay = Math.min(
    options.initialDelayMs * Math.pow(options.backoffFactor, attempt),
    options.maxDelayMs
  );

  // Add jitter to prevent thundering herd
  const jitter = exponentialDelay * options.jitterFactor * Math.random();
  return exponentialDelay + jitter;
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns - Result from the function
 * 
 * @example
 * const data = await retryAsync(
 *   () => fetch('/api/data'),
 *   { maxAttempts: 3 }
 * );
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt < mergedOptions.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (!mergedOptions.shouldRetry(error, attempt)) {
        throw error;
      }

      // Don't sleep on the last attempt
      if (attempt < mergedOptions.maxAttempts - 1) {
        const delay = calculateDelay(attempt, mergedOptions);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Retry fetch requests with exponential backoff
 * 
 * @param url - URL to fetch
 * @param options - Fetch options + retry options
 * @returns - Fetch response
 * 
 * @example
 * const response = await fetchWithRetry('/api/data', { 
 *   method: 'GET',
 *   maxAttempts: 5
 * });
 */
export async function fetchWithRetry(
  url: string,
  options?: (RequestInit & RetryOptions) | undefined
): Promise<Response> {
  const { maxAttempts, initialDelayMs, maxDelayMs, backoffFactor, jitterFactor, shouldRetry, ...fetchOptions } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const retryOptions: Required<RetryOptions> = {
    maxAttempts,
    initialDelayMs,
    maxDelayMs,
    backoffFactor,
    jitterFactor,
    shouldRetry,
  };

  return retryAsync(
    () => fetch(url, fetchOptions),
    retryOptions
  );
}

/**
 * Wrap any async function with retry logic
 * 
 * @example
 * const withRetry = withRetryLogic(myAsyncFunction);
 * const result = await withRetry();
 */
export function withRetryLogic<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options?: RetryOptions
): (...args: T) => Promise<R> {
  return (...args: T) => retryAsync(() => fn(...args), options);
}

/**
 * Class-based retry executor for more complex scenarios
 */
export class RetryExecutor {
  private options: Required<RetryOptions>;

  constructor(options?: RetryOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Execute function with retry
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return retryAsync(fn, this.options);
  }

  /**
   * Execute fetch with retry
   */
  async fetchWithRetry(url: string, options?: RequestInit): Promise<Response> {
    return fetchWithRetry(url, { ...options, ...this.options });
  }

  /**
   * Update retry options
   */
  setOptions(options: RetryOptions): void {
    this.options = { ...this.options, ...options };
  }
}
