/**
 * useDataInitialization Hook
 * 
 * Custom hook for managing data initialization and caching.
 * Provides easy access to loading state and cached data.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useDataInitialization as useDataInitCtx } from '@/contexts/DataInitializationContext';
import { DATA_CACHE_KEYS, dataManager } from '@/services/dataManager';

// Re-export types from context for convenience
export type { LoadProgress } from '@/services/dataManager';

/**
 * Hook return type
 */
interface UseDataInitReturn {
  // State
  isLoading: boolean;
  isInitialized: boolean;
  isError: boolean;
  error: string | null;
  progress: {
    total: number;
    loaded: number;
    failed: number;
    percentage: number;
  };
  
  // Actions
  initialize: () => Promise<void>;
  retry: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
  
  // Data access
  getData: <T = unknown>(key: string) => T | null;
  getUserProfile: <T = unknown>() => T | null;
  getProjects: <T = unknown>() => T | null;
  getUsers: <T = unknown>() => T | null;
  getTeams: <T = unknown>() => T | null;
  getTasks: <T = unknown>() => T | null;
  
  // Cache utilities
  isDataFresh: (key: string) => boolean;
  refreshData: (key: string) => Promise<unknown>;
  clearCache: () => void;
}

/**
 * Main hook for data initialization
 */
export function useDataInitialization(): UseDataInitReturn {
  const ctx = useDataInitCtx();
  
  const { 
    status, 
    progress, 
    error, 
    startInitialization,
    retryInitialization,
    cancelInitialization,
    reset: ctxReset,
    getData: getDataFromCtx,
    isInitialized: ctxIsInitialized 
  } = ctx;

  const initializedRef = useRef(false);

  // Check if currently loading
  const isLoading = status === 'loading';
  
  // Check if in error state
  const isError = status === 'error';
  
  // Check if initialized (completed with data)
  const isInitialized = ctxIsInitialized;

  // Initialize on mount if not already done
  useEffect(() => {
    if (!initializedRef.current && status === 'idle') {
      initializedRef.current = true;
      startInitialization();
    }
  }, [status, startInitialization]);

  // Initialize function
  const initialize = useCallback(async () => {
    initializedRef.current = false;
    await startInitialization();
  }, [startInitialization]);

  // Retry function
  const retry = useCallback(async () => {
    await retryInitialization();
  }, [retryInitialization]);

  // Cancel function
  const cancel = useCallback(() => {
    cancelInitialization();
  }, [cancelInitialization]);

  // Reset function
  const clearCache = useCallback(() => {
    dataManager.clearCache();
    ctxReset();
    initializedRef.current = false;
  }, [ctxReset]);

  // Get cached data helper
  const getData = useCallback(<T = unknown>(key: string): T | null => {
    const data = getDataFromCtx(key);
    return data as T | null;
  }, [getDataFromCtx]);

  // Convenience getters for common data
  const getUserProfile = useCallback(<T = unknown>(): T | null => {
    return getData<T>(DATA_CACHE_KEYS.USER_PROFILE);
  }, [getData]);

  const getProjects = useCallback(<T = unknown>(): T | null => {
    return getData<T>(DATA_CACHE_KEYS.PROJECTS);
  }, [getData]);

  const getUsers = useCallback(<T = unknown>(): T | null => {
    return getData<T>(DATA_CACHE_KEYS.USERS);
  }, [getData]);

  const getTeams = useCallback(<T = unknown>(): T | null => {
    return getData<T>(DATA_CACHE_KEYS.TEAMS);
  }, [getData]);

  const getTasks = useCallback(<T = unknown>(): T | null => {
    return getData<T>(DATA_CACHE_KEYS.TASKS);
  }, [getData]);

  // Check if cached data is fresh
  const isDataFresh = useCallback((key: string): boolean => {
    const cached = dataManager.getData(key);
    return cached !== null;
  }, []);

  // Refresh single data item
  const refreshData = useCallback(async (_key: string): Promise<unknown> => {
    console.warn('refreshData not fully implemented');
    return null;
  }, []);

  return {
    // State
    isLoading,
    isInitialized,
    isError,
    error,
    progress,
    
    // Actions
    initialize,
    retry,
    cancel,
    reset: clearCache,
    
    // Data access
    getData,
    getUserProfile,
    getProjects,
    getUsers,
    getTeams,
    getTasks,
    
    // Cache utilities
    isDataFresh,
    refreshData,
    clearCache,
  };
}

/**
 * Hook for accessing specific cached data with auto-initialization
 */
export function useCachedData<T = unknown>(key: string): {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const hook = useDataInitialization();
  const data = hook.getData<T>(key);

  const refresh = useCallback(async () => {
    await hook.refreshData(key);
  }, [key, hook.refreshData]);

  return {
    data,
    isLoading: hook.isLoading && !hook.isInitialized,
    isError: hook.isError,
    error: hook.error,
    refresh,
  };
}

/**
 * Hook for accessing user profile with type safety
 */
export function useUserProfile<T = unknown>() {
  return useCachedData<T>(DATA_CACHE_KEYS.USER_PROFILE);
}

/**
 * Hook for accessing projects with type safety
 */
export function useProjects<T = unknown>() {
  return useCachedData<T>(DATA_CACHE_KEYS.PROJECTS);
}

/**
 * Hook for accessing users with type safety
 */
export function useUsers<T = unknown>() {
  return useCachedData<T>(DATA_CACHE_KEYS.USERS);
}
