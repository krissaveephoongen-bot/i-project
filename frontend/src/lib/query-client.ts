import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Create a query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests 3 times
      retry: 3,
      // Stale time of 5 minutes
      staleTime: 5 * 60 * 1000,
      // Garbage collection time of 10 minutes
      gcTime: 10 * 60 * 1000,
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Show error toast on failure
      onError: (error: any) => {
        console.error('Query error:', error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('An unexpected error occurred');
        }
      },
    },
    mutations: {
      // Show success toast on successful mutations
      onSuccess: () => {
        toast.success('Operation completed successfully');
      },
      // Show error toast on failed mutations
      onError: (error: any) => {
        console.error('Mutation error:', error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Operation failed');
        }
      },
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistent query key management
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },

  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },

  // Team
  team: {
    all: ['team'] as const,
    members: () => [...queryKeys.team.all, 'members'] as const,
    member: (id: string) => [...queryKeys.team.members(), id] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeys.reports.all, 'list'] as const,
    list: (type?: string) => [...queryKeys.reports.lists(), type] as const,
    detail: (id: string) => [...queryKeys.reports.all, 'detail', id] as const,
  },
} as const;