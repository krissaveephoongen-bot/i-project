import { parseApiError, AppError } from './error-handler';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Enhanced fetch wrapper with error handling and timeout support
 */
export const fetchWithTimeout = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    // Handle HTTP errors
    if (!response.ok) {
      const error = new AppError(
        `HTTP ${response.status}: ${response.statusText}`,
        `HTTP_${response.status}`,
        response.status
      );
      throw error;
    }

    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AppError('Request timeout', 'REQUEST_TIMEOUT', 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Typed API request helper
 */
export const apiRequest = async <T,>(
  url: string,
  options?: FetchOptions
): Promise<T> => {
  const response = await fetchWithTimeout(url, options);

  // Try to parse as JSON, fallback to text
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
};

/**
 * API client for common CRUD operations
 */
export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string = '', timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  private getUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private getHeaders(headers?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  async get<T = any>(path: string, options?: FetchOptions): Promise<T> {
    return apiRequest<T>(this.getUrl(path), {
      method: 'GET',
      timeout: this.defaultTimeout,
      ...options,
      headers: this.getHeaders(options?.headers as Record<string, string>),
    });
  }

  async post<T = any>(
    path: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    return apiRequest<T>(this.getUrl(path), {
      method: 'POST',
      body: JSON.stringify(data),
      timeout: this.defaultTimeout,
      ...options,
      headers: this.getHeaders(options?.headers as Record<string, string>),
    });
  }

  async put<T = any>(
    path: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    return apiRequest<T>(this.getUrl(path), {
      method: 'PUT',
      body: JSON.stringify(data),
      timeout: this.defaultTimeout,
      ...options,
      headers: this.getHeaders(options?.headers as Record<string, string>),
    });
  }

  async patch<T = any>(
    path: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    return apiRequest<T>(this.getUrl(path), {
      method: 'PATCH',
      body: JSON.stringify(data),
      timeout: this.defaultTimeout,
      ...options,
      headers: this.getHeaders(options?.headers as Record<string, string>),
    });
  }

  async delete<T = any>(path: string, options?: FetchOptions): Promise<T> {
    return apiRequest<T>(this.getUrl(path), {
      method: 'DELETE',
      timeout: this.defaultTimeout,
      ...options,
      headers: this.getHeaders(options?.headers as Record<string, string>),
    });
  }
}

// Create default API client instance
const baseUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL)
  || (typeof process !== 'undefined' && (process as any).env?.REACT_APP_API_URL)
  || 'http://localhost:5000/api';

export const api = new ApiClient(baseUrl);
