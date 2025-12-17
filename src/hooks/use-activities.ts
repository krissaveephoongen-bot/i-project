/**
 * useActivities Hook
 * Complete CRUD operations for activity management with React Query integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getUserActivityHistory,
  getEntityActivityHistory,
  getActivityStats,
  cleanupOldActivities,
  createBulkActivities,
  type ActivityLog,
  type ActivityFilters,
  type ActivityStats
} from '@/services/activityService';

/**
 * Hook for managing activity operations
 */
export function useActivities() {
  const queryClient = useQueryClient();

  // Fetch all activities
  const useGetActivities = (filters?: ActivityFilters) => {
    return useQuery({
      queryKey: ['activities', filters],
      queryFn: () => getActivities(filters),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    });
  };

  // Fetch single activity
  const useGetActivity = (id: string) => {
    return useQuery({
      queryKey: ['activity', id],
      queryFn: () => getActivityById(id),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    });
  };

  // Create activity
  const createActivityMutation = useMutation({
    mutationFn: ({
      action,
      entity_type,
      entity_id,
      user_id,
      details
    }: {
      action: string;
      entity_type: ActivityLog['entity_type'];
      entity_id: string;
      user_id?: string;
      details?: Record<string, any>;
    }) =>
      createActivity(action, entity_type, entity_id, user_id, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });

  // Update activity
  const updateActivityMutation = useMutation({
    mutationFn: ({
      id,
      action,
      details
    }: {
      id: string;
      action?: string;
      details?: Record<string, any>;
    }) => updateActivity(id, action, details),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.setQueryData(['activity', data.id], data);
    }
  });

  // Delete activity
  const deleteActivityMutation = useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });

  // Create bulk activities
  const createBulkActivitiesMutation = useMutation({
    mutationFn: (activities: Array<{
      action: string;
      entity_type: ActivityLog['entity_type'];
      entity_id: string;
      user_id?: string;
      details?: Record<string, any>;
    }>) => createBulkActivities(activities),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });

  return {
    useGetActivities,
    useGetActivity,
    createActivity: createActivityMutation.mutate,
    createActivityAsync: createActivityMutation.mutateAsync,
    isCreating: createActivityMutation.isPending,
    updateActivity: updateActivityMutation.mutate,
    updateActivityAsync: updateActivityMutation.mutateAsync,
    isUpdating: updateActivityMutation.isPending,
    deleteActivity: deleteActivityMutation.mutate,
    deleteActivityAsync: deleteActivityMutation.mutateAsync,
    isDeleting: deleteActivityMutation.isPending,
    createBulkActivities: createBulkActivitiesMutation.mutate,
    createBulkActivitiesAsync: createBulkActivitiesMutation.mutateAsync,
    isCreatingBulk: createBulkActivitiesMutation.isPending
  };
}

/**
 * Hook for user activity history
 */
export function useUserActivityHistory(userId: string, limit?: number, offset?: number) {
  return useQuery({
    queryKey: ['userActivity', userId, limit, offset],
    queryFn: () => getUserActivityHistory(userId, limit, offset),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Hook for entity activity history (audit trail)
 */
export function useEntityActivityHistory(
  entityType: ActivityLog['entity_type'],
  entityId: string,
  limit?: number,
  offset?: number
) {
  return useQuery({
    queryKey: ['entityActivity', entityType, entityId, limit, offset],
    queryFn: () => getEntityActivityHistory(entityType, entityId, limit, offset),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Hook for activity statistics
 */
export function useActivityStats(
  entityType?: string,
  start_date?: string,
  end_date?: string
) {
  return useQuery({
    queryKey: ['activityStats', entityType, start_date, end_date],
    queryFn: () => getActivityStats(entityType, start_date, end_date),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook for cleanup old activities
 */
export function useCleanupActivities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (days?: number) => cleanupOldActivities(days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });
}

/**
 * Helper function to log activity
 * Convenience function for common logging patterns
 */
export async function logActivity(
  action: string,
  entityType: ActivityLog['entity_type'],
  entityId: string,
  userId?: string,
  details?: Record<string, any>
) {
  try {
    return await createActivity(action, entityType, entityId, userId, details);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw to prevent disrupting main operations
  }
}
