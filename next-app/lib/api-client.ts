/**
 * Type-Safe API Client
 * Replaces manual fetch calls with proper type safety
 */

import { ApiResponse, ApiError } from '@/app/types/api';

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

  constructor(baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', timeout = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
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
   * Internal method for making requests
   */
  private async request<T>(path: string, options?: ApiClientOptions): Promise<T> {
    const url = `${this.baseUrl}${path}`;
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

        throw new ApiClientError(response.status, errorData, path);
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
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
