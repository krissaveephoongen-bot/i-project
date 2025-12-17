import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { CACHE_TIMES } from '../lib/queryClient';

export interface Project {
  id: string;
  name: string;
  status: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

/**
 * Hook for paginated project loading
 * 
 * Benefits:
 * - Only loads requested page of data
 * - Reduces memory usage
 * - Faster initial load time
 * - Better user experience with progressive loading
 * 
 * Usage:
 * ```
 * const { data, isLoading, isFetching } = usePaginatedProjects({
 *   page: 1,
 *   pageSize: 20,
 *   search: 'my project'
 * });
 * ```
 */
export const usePaginatedProjects = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['projects', 'paginated', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        limit: String(params.pageSize),
        ...(params.search && { search: params.search }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
        ...(params.filters && { filters: JSON.stringify(params.filters) }),
      });

      const response = await apiClient.get<PaginatedResponse<Project>>(
        `/api/projects?${searchParams}`
      );
      return response.data;
    },
    staleTime: CACHE_TIMES.projects,
    keepPreviousData: true, // Keep previous page while loading next page
  });
};

/**
 * Hook for infinite scroll project loading
 * 
 * Benefits:
 * - Progressive loading as user scrolls
 * - No pagination controls needed
 * - Better mobile experience
 * 
 * Usage:
 * ```
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteProjects();
 * ```
 */
export const useInfiniteProjects = (pageSize = 20) => {
  return useQuery({
    queryKey: ['projects', 'infinite', pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<PaginatedResponse<Project>>(
        `/api/projects?page=${pageParam}&limit=${pageSize}`
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: CACHE_TIMES.projects,
  });
};

/**
 * Hook for lazy-loading a single project
 * 
 * Benefits:
 * - Only loads when needed
 * - Uses `enabled` flag for conditional loading
 * - Reduces initial bundle size
 * 
 * Usage:
 * ```
 * const { data: project } = useLazyProject(projectId, {
 *   enabled: shouldLoad
 * });
 * ```
 */
export const useLazyProject = (projectId: string | undefined, options = {}) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await apiClient.get<Project>(`/api/projects/${projectId}`);
      return response.data;
    },
    enabled: !!projectId, // Only fetch if projectId exists
    staleTime: CACHE_TIMES.projects,
    ...options,
  });
};

export default usePaginatedProjects;
