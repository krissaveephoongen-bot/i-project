import { AppError } from './error-handler';
import { API_BASE_URL, API_TIMEOUT } from './api-config';

type HeadersObject = Record<string, string>;

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  timeout?: number;
  skipAuth?: boolean;
  headers?: HeadersObject | Headers;
}

/**
 * Get default headers for API requests
 */
const getDefaultHeaders = (): HeadersObject => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
});

/**
 * Enhanced fetch wrapper with error handling, timeout, and CORS support
 */
export const fetchWithTimeout = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { 
    timeout = API_TIMEOUT, 
    headers = {},
    skipAuth = false,
    ...fetchOptions 
  } = options;

  // Ensure URL is absolute for API requests
  const isAbsoluteUrl = url.startsWith('http');
  const requestUrl = isAbsoluteUrl ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  // Convert headers to plain object if they're in Headers format
  const normalizeHeaders = (headers: HeadersObject | Headers): HeadersObject => {
    if (headers instanceof Headers) {
      const result: HeadersObject = {};
      headers.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }
    return headers;
  };

  // Merge headers
  const defaultHeaders = getDefaultHeaders();
  const normalizedHeaders = normalizeHeaders(headers);
  const requestHeaders: HeadersObject = {
    ...defaultHeaders,
    ...normalizedHeaders,
  };

  // Add auth token if available and not skipped
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token && !skipAuth && !requestHeaders['Authorization']) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(requestUrl, {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
      credentials: 'include', // Include cookies for CORS
      mode: 'cors', // Enable CORS
    });

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorCode = `HTTP_${response.status}`;
      
      // Try to parse error details from response
      try {
        const errorData = await response.json().catch(() => ({}));
        if (errorData && typeof errorData === 'object' && 'message' in errorData) {
          errorMessage = String(errorData.message);
        }
        if (errorData && typeof errorData === 'object' && 'code' in errorData) {
          errorCode = String(errorData.code);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }

      throw new AppError(
        errorMessage,
        errorCode,
        response.status
      );
    }

    return response;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AppError('Request timeout', 'REQUEST_TIMEOUT', 408);
    } 
    
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new AppError('Network error. Please check your connection.', 'NETWORK_ERROR', 0);
      }
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        error.message || 'An unknown error occurred',
        'UNKNOWN_ERROR',
        0
      );
    }
    
    throw new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 0);
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Typed API request helper with better error handling
 */
export const apiRequest = async <T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> => {
  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
      },
    });

    // Handle empty responses (e.g., 204 No Content)
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    // Try to parse as JSON, fallback to text
    const contentType = response.headers.get('content-type');
    try {
      if (contentType?.includes('application/json')) {
        return (await response.json()) as T;
      }
      return (await response.text()) as unknown as T;
    } catch (error) {
      console.error('Error parsing response:', error);
      throw new AppError(
        'Failed to parse response',
        'PARSE_ERROR',
        response.status,
        { contentType, status: response.status, statusText: response.statusText }
      );
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new AppError(
      errorMessage,
      'API_REQUEST_ERROR',
      0,
      { url, options }
    );
  }
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

// Performance view interfaces
export interface ProjectSummary {
  id: string;
  name: string;
  code: string;
  status: string;
  progress: number;
  budget: number;
  actual_cost: number;
  start_date: string;
  end_date: string;
  client_name: string;
  project_manager_name: string;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  total_hours: number;
  created_at: string;
}

export interface UserWorkload {
  user_id: string;
  user_name: string;
  user_email: string;
  role: string;
  department: string;
  active_tasks: number;
  overdue_tasks: number;
  total_hours_this_week: number;
  total_hours_this_month: number;
  projects_count: number;
  last_activity: string;
}

export interface TaskProgress {
  id: string;
  title: string;
  project_id: string;
  project_name: string;
  assignee_id: string;
  assignee_name: string;
  status: string;
  priority: string;
  planned_start_date: string;
  planned_end_date: string;
  actual_progress: number;
  planned_progress_weight: number;
  estimated_hours: number;
  actual_hours: number;
  due_date: string;
  is_overdue: boolean;
  days_overdue: number;
  created_at: string;
}

export interface DashboardMetrics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_users: number;
  active_users: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  total_hours_this_month: number;
  total_expenses_this_month: number;
  pending_approvals: number;
}

// Enhanced API client with performance views
export class EnhancedApiClient extends ApiClient {
  // Performance view endpoints
  async getProjectSummaries(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    isArchived?: boolean;
  }): Promise<ProjectSummary[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.isArchived !== undefined) params.append('isArchived', filters.isArchived.toString());

    const queryString = params.toString();
    const endpoint = `performance/project-summaries${queryString ? `?${queryString}` : ''}`;

    return this.get(endpoint);
  }

  async getUserWorkloads(department?: string, role?: string): Promise<UserWorkload[]> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (role) params.append('role', role);

    const queryString = params.toString();
    const endpoint = `performance/user-workloads${queryString ? `?${queryString}` : ''}`;

    return this.get(endpoint);
  }

  async getTaskProgress(projectId?: string, assigneeId?: string): Promise<TaskProgress[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (assigneeId) params.append('assigneeId', assigneeId);

    const queryString = params.toString();
    const endpoint = `performance/task-progress${queryString ? `?${queryString}` : ''}`;

    return this.get(endpoint);
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.get('performance/dashboard-metrics');
  }

  // Enhanced project endpoints with new fields
  async getProjects(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    isArchived?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.isArchived !== undefined) params.append('isArchived', filters.isArchived.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = `projects${queryString ? `?${queryString}` : ''}`;

    return this.get(endpoint);
  }

  // Enhanced task endpoints with new agile fields
  async getTasks(filters?: {
    projectId?: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
    category?: string;
    sprintId?: string;
    isOverdue?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.sprintId) params.append('sprintId', filters.sprintId);
    if (filters?.isOverdue !== undefined) params.append('isOverdue', filters.isOverdue.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = `tasks${queryString ? `?${queryString}` : ''}`;

    return this.get(endpoint);
  }
}

// Create default API client instance
const baseUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL)
  || (typeof process !== 'undefined' && (process as any).env?.REACT_APP_API_URL)
  || 'http://localhost:3001/api';

export const api = new ApiClient(baseUrl);
export const enhancedApi = new EnhancedApiClient(baseUrl);
