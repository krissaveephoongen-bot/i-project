/**
 * API Client with automatic token management
 * Handles token refresh on 401 responses
 */

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  retryOnUnauth?: boolean;
}

interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  code?: string;
}

let getAuthToken: (() => string | null) | null = null;
let refreshAccessToken: (() => Promise<boolean>) | null = null;

/**
 * Initialize the API client with auth token functions
 * Call this from your auth context/provider
 */
export function initializeApiClient(
  getToken: () => string | null,
  refresh: () => Promise<boolean>
) {
  getAuthToken = getToken;
  refreshAccessToken = refresh;
}

async function performFetch(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  // Add auth token if not skipped
  if (!options.skipAuth && getAuthToken) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return fetch(url, {
    ...options,
    headers
  });
}

/**
 * Main API request function with automatic token refresh
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    let response = await performFetch(url, options);

    // If unauthorized and retryOnUnauth is true (default), try to refresh token
    if (
      response.status === 401 &&
      options.retryOnUnauth !== false &&
      refreshAccessToken
    ) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        response = await performFetch(url, options);
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data?.error || 'Request failed',
        code: data?.code,
        data: data?.data
      };
    }

    return {
      ok: true,
      status: response.status,
      data: data?.data || data
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Convenience methods
 */
export const api = {
  get: <T = any>(url: string, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),

  put: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }),

  patch: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    }),

  delete: <T = any>(url: string, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: 'DELETE' })
};
