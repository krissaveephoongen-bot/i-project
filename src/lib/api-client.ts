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
  || 'http://localhost:5000/api';

export const api = new ApiClient(baseUrl);
export const enhancedApi = new EnhancedApiClient(baseUrl);
