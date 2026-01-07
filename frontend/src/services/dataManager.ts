/**
 * Enhanced Data Manager Service - Production Ready
 * 
 * Features:
 * - Priority-based loading
 * - Request deduplication
 * - Background refresh
 * - Graceful error handling
 * - Production-safe with error boundaries
 */

import { apiClient } from './api-client';

export const DATA_CACHE_KEYS = {
  USER_PROFILE: 'cache_user_profile',
  USER_PERMISSIONS: 'cache_user_permissions',
  PROJECTS: 'cache_projects',
  USERS: 'cache_users',
  TEAMS: 'cache_teams',
  TASKS: 'cache_tasks',
  CUSTOMERS: 'cache_customers',
  TIMESHEETS: 'cache_timesheets',
  EXPENSES: 'cache_expenses',
  NOTIFICATIONS: 'cache_notifications',
  DASHBOARD_STATS: 'cache_dashboard_stats',
  SETTINGS: 'cache_settings',
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
  refreshInterval?: number;
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
  percentage: number;
}

interface UserData { role?: string }

class EnhancedDataManager {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();
  private abortController: AbortController | null = null;
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  /**
   * Initialize with safe error handling
   */
  async initialize(): Promise<LoadProgress> {
    if (this.isInitialized) {
      return { total: 0, loaded: 0, failed: 0, percentage: 100 };
    }

    try {
      this.abortController = new AbortController();
      this.cache.clear();
      this.loadCachedData();
      
      const definitions = this.getDataDefinitions();
      const progress = await this.loadAllData(definitions);
      
      this.isInitialized = true;
      this.startBackgroundRefresh();
      
      return progress;
    } catch (error) {
      console.error('DataManager initialization error:', error);
      return { total: 0, loaded: 0, failed: 0, percentage: 0 };
    }
  }

  private getDataDefinitions(): LoadDataDefinition[] {
    const user = this.getStoredUser();
    const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';
    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'project_manager';

    // Only define endpoints that exist in the backend
    return [
      { key: DATA_CACHE_KEYS.USER_PROFILE, endpoint: '/auth/me', priority: DataPriority.CRITICAL, required: true },
      { key: DATA_CACHE_KEYS.PROJECTS, endpoint: '/projects', priority: DataPriority.HIGH, required: false },
      ...(isAdmin || isPM ? [{ key: DATA_CACHE_KEYS.USERS, endpoint: '/users', priority: DataPriority.MEDIUM, required: false }] : []),
      { key: DATA_CACHE_KEYS.TEAMS, endpoint: '/teams', priority: DataPriority.MEDIUM, required: false },
      { key: DATA_CACHE_KEYS.TASKS, endpoint: '/tasks', priority: DataPriority.MEDIUM, required: false },
      { key: DATA_CACHE_KEYS.CUSTOMERS, endpoint: '/customers', priority: DataPriority.LOW, required: false },
      { key: DATA_CACHE_KEYS.TIMESHEETS, endpoint: '/timesheets', priority: DataPriority.LOW, required: false },
    ];
  }

  async loadAllData(definitions: LoadDataDefinition[]): Promise<LoadProgress> {
    const progress: LoadProgress = { total: definitions.length, loaded: 0, failed: 0, percentage: 0 };
    const sorted = [...definitions].sort((a, b) => a.priority - b.priority);
    
    for (const item of sorted) {
      if (this.abortController?.signal.aborted) break;
      progress.currentItem = item.key;
      
      try {
        const result = await this.loadWithDeduplication(item);
        if (result.success) progress.loaded++;
        else progress.failed++;
      } catch {
        progress.failed++;
      }
      
      progress.percentage = Math.round(((progress.loaded + progress.failed) / progress.total) * 100);
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

  private startBackgroundRefresh(): void {
    this.stopBackgroundRefresh();
    // Only start refresh for critical data
    const criticalKeys = [DATA_CACHE_KEYS.USER_PROFILE];
    
    for (const key of criticalKeys) {
      if (this.cache.has(key)) {
        const timer = setTimeout(() => {
          const def = this.getDataDefinitions().find(d => d.key === key);
          if (def) this.refreshItem(key, def);
        }, CACHE_CONFIG.BACKGROUND_REFRESH_INTERVAL);
        this.refreshTimers.set(key, timer);
      }
    }
  }

  private async refreshItem(key: string, definition: LoadDataDefinition): Promise<void> {
    try {
      const data = await this.fetchWithRetry(definition.endpoint);
      const processed = definition.transform ? definition.transform(data) : data;
      this.cache.set(key, { data: processed, timestamp: Date.now() });
      this.persistAllData();
    } catch (error) {
      console.warn(`Background refresh skipped for ${key}:`, error);
    }
  }

  stopBackgroundRefresh(): void {
    for (const timer of this.refreshTimers.values()) clearTimeout(timer);
    this.refreshTimers.clear();
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
        
        // Don't retry on network/CORS errors in production
        if (i < attempts - 1) {
          await this.delay(DATA_LOAD_CONFIG.RETRY_DELAY * (i + 1));
        }
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
    this.stopBackgroundRefresh();
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

export const dataManager = new EnhancedDataManager();
export { EnhancedDataManager };
