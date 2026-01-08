import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const handleGlobalError = (error: unknown) => {
  // Check if error is an actual error object
  if (error instanceof Error) {
    // We can add more sophisticated logic here, e.g., inspect error.response.status
    // For now, a generic message is sufficient.
    toast.error(`An error occurred: ${error.message}`);
  } else {
    toast.error('An unknown error occurred.');
  }
};

/**
 * Optimized React Query configuration
 * 
 * Performance improvements:
 * - Increased staleTime to reduce unnecessary refetches
 * - Proper cache time management
 * - Disabled refetch on window focus (can trigger unnecessary requests)
 * - Retry logic to handle temporary failures
 * - Global error handling via toast notifications
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleGlobalError,
  }),
  mutationCache: new MutationCache({
    onError: handleGlobalError,
  }),
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
