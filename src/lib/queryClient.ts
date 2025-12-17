import { QueryClient } from '@tanstack/react-query';

/**
 * Optimized React Query configuration
 * 
 * Performance improvements:
 * - Increased staleTime to reduce unnecessary refetches
 * - Proper cache time management
 * - Disabled refetch on window focus (can trigger unnecessary requests)
 * - Retry logic to handle temporary failures
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long until fetched data is considered "stale"
      // After stale, it refetches in background on certain triggers
      staleTime: 1000 * 60 * 5, // 5 minutes for most queries
      
      // How long to keep unused/inactive query data in memory
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      
      // Retry failed requests once automatically
      retry: 1,
      
      // Don't refetch when user switches back to window
      // This prevents unnecessary API calls and improves perceived performance
      refetchOnWindowFocus: false,
      
      // Don't refetch on reconnection automatically
      refetchOnReconnect: 'stale',
      
      // Don't refetch on mount if data exists and not stale
      refetchOnMount: 'stale',
    },
    mutations: {
      retry: 1,
    },
  },
});

// Cache time configuration by query type
export const CACHE_TIMES = {
  // Static data - cache for 30 minutes
  users: 1000 * 60 * 30,
  roles: 1000 * 60 * 30,
  settings: 1000 * 60 * 60, // 1 hour
  
  // Dynamic data - cache for 5 minutes
  projects: 1000 * 60 * 5,
  tasks: 1000 * 60 * 5,
  expenses: 1000 * 60 * 3, // 3 minutes (more dynamic)
  
  // Real-time data - don't cache
  notifications: 0,
  activity: 1000 * 60, // 1 minute
  
  // Frequently updated
  dashboard: 1000 * 60 * 2, // 2 minutes
} as const;

// Garbage collection time configuration
export const GARBAGE_COLLECTION_TIMES = {
  long: 1000 * 60 * 60, // 1 hour - for rarely used queries
  medium: 1000 * 60 * 30, // 30 minutes - default
  short: 1000 * 60 * 10, // 10 minutes - for frequently changing data
} as const;

export default queryClient;
