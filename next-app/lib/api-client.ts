/**
 * Type-Safe API Client
 * Replaces manual fetch calls with proper type safety
 * Includes built-in retry logic with exponential backoff
 */

import { ApiResponse, ApiError } from '@/types/api';
import { retryAsync, RetryOptions } from './retry-utils';

export interface ApiClientOptions extends RequestInit {
  timeout?: number;
}

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public error: ApiError,
    public path: string
  ) {
    super(error.message);
    this.name = 'ApiClientError';
  }
}

/**
 * Type-safe API client for making requests
 */
export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retryOptions: RetryOptions;

  constructor(
    baseUrl = process.env.NEXT_PUBLIC_API_URL || '',
    timeout = 30000,
    retryOptions?: RetryOptions
  ) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.retryOptions = retryOptions || {
      maxAttempts: 3,
      initialDelayMs: 1000,
      backoffFactor: 2,
      shouldRetry: (error: any) => {
        // Don't retry 4xx errors (validation, auth, etc.)
        if (error?.statusCode >= 400 && error?.statusCode < 500) {
          return false;
        }
        // Retry 5xx and network errors
        return true;
      },
    };
  }

  /**
   * Set custom retry options
   */
  setRetryOptions(options: RetryOptions): void {
    this.retryOptions = { ...this.retryOptions, ...options };
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, body?: any, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, body?: any, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(path: string, body?: any, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Internal method for making requests with retry logic
   */
  private async request<T>(path: string, options?: ApiClientOptions): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    // Wrap the request in retry logic
    return retryAsync(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options?.timeout || this.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });

        clearTimeout(timeoutId);

        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');

        if (!response.ok) {
          let errorData: ApiError;

          if (isJson) {
            const body: ApiResponse = await response.json();
            errorData = body.error || {
              code: 'UNKNOWN_ERROR',
              message: response.statusText || 'An error occurred',
              timestamp: new Date().toISOString(),
            };
          } else {
            errorData = {
              code: 'UNKNOWN_ERROR',
              message: await response.text() || response.statusText || 'An error occurred',
              timestamp: new Date().toISOString(),
            };
          }

          const error = new ApiClientError(response.status, errorData, path);
          (error as any).statusCode = response.status; // For retry logic
          throw error;
        }

        if (!isJson) {
          throw new Error('Invalid response format - expected JSON');
        }

        const body: ApiResponse<T> = await response.json();

        if (!body.success) {
          throw new ApiClientError(response.status, body.error || {
            code: 'API_ERROR',
            message: 'API returned error status',
            timestamp: new Date().toISOString(),
          }, path);
        }

        if (!body.data) {
          throw new Error('No data in response');
        }

        return body.data;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiClientError) {
          throw error;
        }

        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timeout');
          }
          throw error;
        }

        throw new Error('Unknown error occurred');
      }
    }, this.retryOptions);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
