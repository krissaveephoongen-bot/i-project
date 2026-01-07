/**
 * Data Manager Service - Production Ready
 * 
 * Calls all available backend endpoints:
 * - /api/auth/me
 * - /api/users
 * - /api/projects
 * - /api/tasks
 * - /api/customers
 * - /api/analytics/*
 * - /api/expenses
 * - /api/timesheets
 * - /api/reports/*
 * - /api/teams
 * - /api/search
 * - /api/performance/*
 * - /api/resources
 */

import { apiClient } from './api-client';

export const DATA_CACHE_KEYS = {
  USER_PROFILE: 'cache_user_profile',
  PROJECTS: 'cache_projects',
  USERS: 'cache_users',
  TASKS: 'cache_tasks',
  CUSTOMERS: 'cache_customers',
  ANALYTICS: 'cache_analytics',
  EXPENSES: 'cache_expenses',
  TIMESHEETS: 'cache_timesheets',
  TEAMS: 'cache_teams',
  PERFORMANCE: 'cache_performance',
  SEARCH: 'cache_search',
  REPORTS: 'cache_reports',
  RESOURCES: 'cache_resources',
  LAST_UPDATED: 'cache_last_updated',
};

export const DataPriority = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

const CACHE_CONFIG = {
  TTL: 30 * 60 * 1000,
  STALE_THRESHOLD: 5 * 60 * 1000,
  BACKGROUND_REFRESH_INTERVAL: 5 * 60 * 1000,
};

export const DATA_LOAD_CONFIG = {
  MAX_CONCURRENT: 2,
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 1,
  RETRY_DELAY: 1000,
};

export interface LoadDataDefinition {
  key: string;
  endpoint: string;
  priority: number;
  required: boolean;
  transform?: (data: unknown) => unknown;
}

export interface LoadResult {
  key: string;
  success: boolean;
  data?: unknown;
  error?: string;
  cached?: boolean;
  timestamp: number;
}

export interface LoadProgress {
  total: number;
  loaded: number;
  failed: number;
  currentItem?: string;
  currentItemName?: string;
  percentage: number;
  stages: LoadingStageInfo[];
}

export interface LoadingStageInfo {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
}

export interface ProgressCallback {
  (progress: LoadProgress): void;
}

interface UserData { role?: string }

class DataManager {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();
  private abortController: AbortController | null = null;
  private isInitialized = false;
  private progressCallback: ProgressCallback | null = null;
  private stages: Map<string, LoadingStageInfo> = new Map();

  // Stage display names mapping
  private readonly stageDisplayNames: Record<string, { name: string; description?: string }> = {
    [DATA_CACHE_KEYS.USER_PROFILE]: { name: 'User Profile', description: 'Loading your account information' },
    [DATA_CACHE_KEYS.PROJECTS]: { name: 'Projects', description: 'Loading your projects and tasks' },
    [DATA_CACHE_KEYS.USERS]: { name: 'Team Members', description: 'Loading user data' },
    [DATA_CACHE_KEYS.TASKS]: { name: 'Tasks', description: 'Loading task assignments' },
    [DATA_CACHE_KEYS.CUSTOMERS]: { name: 'Customers', description: 'Loading customer information' },
    [DATA_CACHE_KEYS.ANALYTICS]: { name: 'Analytics', description: 'Loading dashboard statistics' },
    [DATA_CACHE_KEYS.EXPENSES]: { name: 'Expenses', description: 'Loading expense records' },
    [DATA_CACHE_KEYS.TIMESHEETS]: { name: 'Timesheets', description: 'Loading time tracking data' },
    [DATA_CACHE_KEYS.TEAMS]: { name: 'Teams', description: 'Loading team information' },
    [DATA_CACHE_KEYS.PERFORMANCE]: { name: 'Performance', description: 'Loading performance metrics' },
    [DATA_CACHE_KEYS.RESOURCES]: { name: 'Resources', description: 'Loading resource allocation' },
  };

  // Set progress callback
  setProgressCallback(callback: ProgressCallback | null): void {
    this.progressCallback = callback;
  }

  // Get current loading stages
  getLoadingStages(): LoadingStageInfo[] {
    return Array.from(this.stages.values());
  }

  // Get stage info by key
  private getStageInfo(key: string): LoadingStageInfo {
    const displayName = this.stageDisplayNames[key] || { name: key.replace('cache_', '').replace(/_/g, ' ') };
    return {
      id: key,
      name: displayName.name.charAt(0).toUpperCase() + displayName.name.slice(1),
      description: displayName.description,
      status: this.stages.get(key)?.status || 'pending',
    };
  }

  // Notify progress update
  private notifyProgress(progress: LoadProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  async initialize(callback?: ProgressCallback): Promise<LoadProgress> {
    if (this.isInitialized) {
      return { total: 0, loaded: 0, failed: 0, percentage: 100, stages: [] };
    }

    if (callback) {
      this.setProgressCallback(callback);
    }

    try {
      this.abortController = new AbortController();
      this.cache.clear();
      this.stages.clear();
      this.loadCachedData();
      
      const definitions = this.getDataDefinitions();
      
      // Initialize stages
      definitions.forEach(def => {
        this.stages.set(def.key, this.getStageInfo(def.key));
      });
      
      const progress = await this.loadAllData(definitions);
      this.isInitialized = true;
      return progress;
    } catch (error) {
      console.error('DataManager initialization error:', error);
      return { total: 0, loaded: 0, failed: 0, percentage: 0, stages: [] };
    }
  }

  private getDataDefinitions(): LoadDataDefinition[] {
    const user = this.getStoredUser();
    const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';
    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'project_manager';

    return [
      // Critical - User profile is essential
      { key: DATA_CACHE_KEYS.USER_PROFILE, endpoint: '/auth/me', priority: DataPriority.CRITICAL, required: true },
      
      // High priority - Main data for dashboard
      { key: DATA_CACHE_KEYS.PROJECTS, endpoint: '/projects', priority: DataPriority.HIGH, required: false },
      { key: DATA_CACHE_KEYS.ANALYTICS, endpoint: '/analytics/dashboard-stats', priority: DataPriority.HIGH, required: false },
      
      // Medium priority - Additional data for PM/Admin
      ...(isAdmin || isPM ? [
        { key: DATA_CACHE_KEYS.USERS, endpoint: '/users', priority: DataPriority.MEDIUM, required: false },
        { key: DATA_CACHE_KEYS.EXPENSES, endpoint: '/expenses', priority: DataPriority.MEDIUM, required: false },
        { key: DATA_CACHE_KEYS.TIMESHEETS, endpoint: '/timesheets', priority: DataPriority.MEDIUM, required: false },
        { key: DATA_CACHE_KEYS.TEAMS, endpoint: '/teams', priority: DataPriority.MEDIUM, required: false },
        { key: DATA_CACHE_KEYS.PERFORMANCE, endpoint: '/performance/dashboard-metrics', priority: DataPriority.MEDIUM, required: false },
      ] : []),
      
      // Low priority - Secondary data
      { key: DATA_CACHE_KEYS.TASKS, endpoint: '/tasks', priority: DataPriority.LOW, required: false },
      { key: DATA_CACHE_KEYS.CUSTOMERS, endpoint: '/customers', priority: DataPriority.LOW, required: false },
      { key: DATA_CACHE_KEYS.RESOURCES, endpoint: '/resources', priority: DataPriority.LOW, required: false },
    ];
  }

  // Load additional data on demand
  async loadData(key: string, endpoint: string, priority: number = DataPriority.MEDIUM): Promise<LoadResult> {
    const definition: LoadDataDefinition = {
      key,
      endpoint,
      priority,
      required: false
    };
    return this.loadWithDeduplication(definition);
  }

  // Load analytics data
  async loadAnalytics(analyticsType: string): Promise<LoadResult> {
    const endpoint = `/analytics/${analyticsType}`;
    const key = `${DATA_CACHE_KEYS.ANALYTICS}_${analyticsType}`;
    return this.loadData(key, endpoint, DataPriority.MEDIUM);
  }

  // Load reports data
  async loadReports(reportType: string, params?: Record<string, string>): Promise<LoadResult> {
    let endpoint = `/reports/${reportType}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      endpoint += `?${searchParams.toString()}`;
    }
    const key = `${DATA_CACHE_KEYS.REPORTS}_${reportType}`;
    return this.loadData(key, endpoint, DataPriority.MEDIUM);
  }

  // Search data
  async search(query: string, type?: string): Promise<unknown> {
    let endpoint = `/search?q=${encodeURIComponent(query)}`;
    if (type) {
      endpoint += `&type=${encodeURIComponent(type)}`;
    }
    return apiClient.get(endpoint).then(response => response.data);
  }

  // Get team member details
  async getTeamMember(memberId: string): Promise<unknown> {
    return apiClient.get(`/teams/${memberId}`).then(response => response.data);
  }

  // Get team member projects
  async getTeamMemberProjects(memberId: string): Promise<unknown> {
    return apiClient.get(`/teams/${memberId}/projects`).then(response => response.data);
  }

  // Get team member tasks
  async getTeamMemberTasks(memberId: string, filters?: { status?: string; priority?: string }): Promise<unknown> {
    let endpoint = `/teams/${memberId}/tasks`;
    if (filters) {
      const searchParams = new URLSearchParams(filters as Record<string, string>);
      endpoint += `?${searchParams.toString()}`;
    }
    return apiClient.get(endpoint).then(response => response.data);
  }

  // Get team workload
  async getTeamWorkload(): Promise<unknown> {
    return apiClient.get('/teams/workload/overview').then(response => response.data);
  }

  // Get department stats
  async getDepartmentStats(): Promise<unknown> {
    return apiClient.get('/teams/departments/stats').then(response => response.data);
  }

  // Get project performance
  async getProjectPerformance(): Promise<unknown> {
    return apiClient.get('/performance/project-summaries').then(response => response.data);
  }

  // Get user workloads
  async getUserWorkloads(filters?: { department?: string; role?: string }): Promise<unknown> {
    let endpoint = '/performance/user-workloads';
    if (filters) {
      const searchParams = new URLSearchParams(filters as Record<string, string>);
      endpoint += `?${searchParams.toString()}`;
    }
    return apiClient.get(endpoint).then(response => response.data);
  }

  // Get resource utilization
  async getResourceUtilization(userId: string, startDate: string, endDate: string): Promise<unknown> {
    return apiClient.get(`/resource-utilization?userId=${userId}&startDate=${startDate}&endDate=${endDate}`)
      .then(response => response.data);
  }

  // Get team capacity
  async getTeamCapacity(projectId: string, startDate: string, endDate: string): Promise<unknown> {
    return apiClient.get(`/team-capacity?projectId=${projectId}&startDate=${startDate}&endDate=${endDate}`)
      .then(response => response.data);
  }

  // Get expenses with filters
  async getExpenses(filters?: { userId?: string; projectId?: string; startDate?: string; endDate?: string }): Promise<unknown> {
    let endpoint = '/expenses';
    if (filters) {
      const searchParams = new URLSearchParams(filters as Record<string, string>);
      endpoint += `?${searchParams.toString()}`;
    }
    return apiClient.get(endpoint).then(response => response.data);
  }

  // Get timesheets with filters
  async getTimesheets(filters?: { userId?: string; projectId?: string; startDate?: string; endDate?: string; status?: string }): Promise<unknown> {
    let endpoint = '/timesheets';
    if (filters) {
      const searchParams = new URLSearchParams(filters as Record<string, string>);
      endpoint += `?${searchParams.toString()}`;
    }
    return apiClient.get(endpoint).then(response => response.data);
  }

  // Get pending approvals
  async getPendingApprovals(approvalType: 'pm' | 'supervisor'): Promise<unknown> {
    const endpoint = approvalType === 'pm' 
      ? '/timesheets/pending-pm-approval' 
      : '/timesheets/pending-supervisor-approval';
    return apiClient.get(endpoint).then(response => response.data);
  }

  async loadAllData(definitions: LoadDataDefinition[]): Promise<LoadProgress> {
    const progress: LoadProgress = { 
      total: definitions.length, 
      loaded: 0, 
      failed: 0, 
      percentage: 0,
      stages: [] 
    };
    const sorted = [...definitions].sort((a, b) => a.priority - b.priority);
    
    for (const item of sorted) {
      if (this.abortController?.signal.aborted) break;
      
      // Update stage to loading
      const stageInfo = this.getStageInfo(item.key);
      stageInfo.status = 'loading';
      this.stages.set(item.key, stageInfo);
      progress.currentItem = item.key;
      progress.currentItemName = stageInfo.name;
      progress.stages = this.getLoadingStages();
      this.notifyProgress(progress);
      
      try {
        const result = await this.loadWithDeduplication(item);
        if (result.success) {
          progress.loaded++;
          stageInfo.status = 'completed';
        } else {
          progress.failed++;
          stageInfo.status = 'error';
        }
      } catch {
        progress.failed++;
        stageInfo.status = 'error';
      }
      
      this.stages.set(item.key, stageInfo);
      progress.percentage = Math.round(((progress.loaded + progress.failed) / progress.total) * 100);
      progress.stages = this.getLoadingStages();
      this.notifyProgress(progress);
    }

    if (progress.loaded > 0) {
      this.persistAllData();
    }
    
    return progress;
  }

  private async loadWithDeduplication(definition: LoadDataDefinition): Promise<LoadResult> {
    const { key, endpoint, required, transform } = definition;
    const cached = this.getCachedData(key);
    if (cached) return { key, success: true, data: cached.data, cached: true, timestamp: cached.timestamp };

    if (this.pendingRequests.has(endpoint)) {
      try {
        const data = await this.pendingRequests.get(endpoint)!;
        return { key, success: true, data, cached: false, timestamp: Date.now() };
      } catch {}
    }

    const requestPromise = this.fetchWithRetry(endpoint);
    this.pendingRequests.set(endpoint, requestPromise);

    try {
      const data = await requestPromise;
      this.pendingRequests.delete(endpoint);
      const processedData = transform ? transform(data) : data;
      this.cache.set(key, { data: processedData, timestamp: Date.now() });
      return { key, success: true, data: processedData, timestamp: Date.now() };
    } catch (error: unknown) {
      this.pendingRequests.delete(endpoint);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      
      // For non-required data, return cached data if available even if stale
      if (!required) {
        const staleData = this.cache.get(key);
        if (staleData) {
          return { key, success: true, data: staleData.data, cached: true, timestamp: staleData.timestamp };
        }
      }
      
      return { key, success: false, error: msg, timestamp: Date.now() };
    }
  }

  private async fetchWithRetry(endpoint: string, attempts = DATA_LOAD_CONFIG.RETRY_ATTEMPTS): Promise<unknown> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < attempts; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DATA_LOAD_CONFIG.TIMEOUT);
        
        const response = await apiClient.get(endpoint, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response.data;
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error('Unknown');
      }
    }
    
    throw lastError;
  }

  private getCachedData(key: string): { data: unknown; timestamp: number } | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.TTL) return cached;
    return null;
  }

  private loadCachedData(): void {
    try {
      const cached = localStorage.getItem('app_data_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        for (const [key, val] of Object.entries(parsed)) {
          if (key !== DATA_CACHE_KEYS.LAST_UPDATED) {
            const item = val as { data: unknown; timestamp: number };
            this.cache.set(key, item);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cached data:', error);
    }
  }

  private persistAllData(): void {
    const data: Record<string, { data: unknown; timestamp: number }> = {};
    for (const [key, val] of this.cache.entries()) data[key] = val;
    data[DATA_CACHE_KEYS.LAST_UPDATED] = { data: null, timestamp: Date.now() };
    
    try {
      localStorage.setItem('app_data_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  }

  private getStoredUser(): UserData | null {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch { return null; }
  }

  getData(key: string): unknown {
    return this.cache.get(key)?.data ?? null;
  }

  isDataComplete(): boolean {
    const critical = [DATA_CACHE_KEYS.USER_PROFILE];
    return critical.every(k => {
      const c = this.cache.get(k);
      return c && Date.now() - c.timestamp < CACHE_CONFIG.STALE_THRESHOLD;
    });
  }

  clearCache(): void {
    this.cache.clear();
    Object.values(DATA_CACHE_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('app_data_cache');
    this.isInitialized = false;
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const dataManager = new DataManager();
export { DataManager };
