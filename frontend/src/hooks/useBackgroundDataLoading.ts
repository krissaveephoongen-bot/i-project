/**
 * Hook for handling data loading states in background mode
 * 
 * Provides utilities for components to gracefully handle loading states
 * when data is being loaded in the background.
 */

import { useDataInitialization } from '@/contexts/DataInitializationContext';
import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';

interface UseBackgroundDataLoadingOptions<T> {
  /** Query key for the data */
  queryKey: string[];
  /** Query function to fetch data */
  queryFn: () => Promise<T>;
  /** Whether to show skeleton while loading */
  showSkeleton?: boolean;
  /** Default data to show while loading */
  defaultData?: T;
  /** Whether this data is critical (blocks access) */
  isCritical?: boolean;
}

interface UseBackgroundDataLoadingResult<T> {
  /** The loaded data (or default while loading) */
  data: T | undefined;
  /** Whether the query is currently loading */
  isLoading: boolean;
 /** Whether there was an error loading */
  error: Error | null;
  /** Whether this specific data is ready */
  isReady: boolean;
  /** Refetch the data */
  refetch: () => Promise<void>;
  /** Skeleton component props (if showSkeleton is true) */
  skeletonProps?: {
    className: string;
    animate: boolean;
  };
}

/**
 * Hook for background data loading with graceful fallback
 */
export function useBackgroundDataLoading<T>({
  queryKey,
  queryFn,
  showSkeleton = true,
  defaultData,
  isCritical = false,
}: UseBackgroundDataLoadingOptions<T>): UseBackgroundDataLoadingResult<T> {
  const { status: initStatus, isInitialized, backgroundMode } = useDataInitialization();
  
  const [localData, setLocalData] = useState<T | undefined>(defaultData);
  const [localError, setLocalError] = useState<Error | null>(null);

  // Query for the data
  const query = useQuery({
    queryKey,
    queryFn,
    enabled: isInitialized || !backgroundMode, // Only run if initialized or not in background mode
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update local state based on query state
  useEffect(() => {
    if (query.data) {
      setLocalData(query.data);
    }
    if (query.error) {
      setLocalError(query.error as Error);
    }
  }, [query.data, query.error]);

  // Determine if we're in loading state
  const isLoading = query.isLoading || (backgroundMode && !isInitialized && !localData);

  // Determine if data is ready
  const isReady = !!localData && !isLoading;

  // Refetch function
  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query.refetch]);

  // Skeleton props
  const skeletonProps = showSkeleton ? {
    className: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
    animate: isLoading,
  } : undefined;

  return {
    data: localData,
    isLoading,
    error: localError,
    isReady,
    refetch,
    skeletonProps,
  };
}

/**
 * Hook to check if initialization is complete
 */
export function useInitializationStatus() {
  const { status, isInitialized, backgroundMode, progress } = useDataInitialization();
  
  return {
    /** Overall initialization status */
    status,
    /** Whether initialization is complete */
    isInitialized,
    /** Whether running in background mode */
    isBackgroundMode: backgroundMode,
    /** Progress percentage */
    progressPercentage: progress.percentage,
    /** Whether still loading */
    isLoading: status === 'loading',
    /** Whether there was an error */
    hasError: status === 'error',
  };
}

/**
 * Hook to get loading progress for display
 */
export function useLoadingProgress() {
  const { progress, status, error } = useDataInitialization();
  
  return {
    /** Total items to load */
    total: progress.total,
    /** Number of items loaded */
    loaded: progress.loaded,
    /** Number of items failed */
    failed: progress.failed,
    /** Overall percentage */
    percentage: progress.percentage,
    /** Current item being loaded */
    currentItem: progress.currentItem,
    /** Current item name */
    currentItemName: progress.currentItemName,
    /** Overall status */
    status,
    /** Error message if any */
    error,
    /** Whether loading is in progress */
    isLoading: status === 'loading',
    /** Whether loading is complete */
    isComplete: status === 'completed',
  };
}

export default {
  useBackgroundDataLoading,
  useInitializationStatus,
  useLoadingProgress,
};
