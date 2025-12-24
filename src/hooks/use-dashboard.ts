import { useQuery } from '@tanstack/react-query';
import { enhancedApi, DashboardMetrics, ProjectSummary, UserWorkload } from '../lib/api-client';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => enhancedApi.getDashboardMetrics(),
    staleTime: 1000 * 60 * 2, // 2 minutes - dashboard data changes frequently
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes for live updates
  });
}

export function useProjectSummaries(filters?: {
  status?: string;
  category?: string;
  priority?: string;
  isArchived?: boolean;
}) {
  return useQuery({
    queryKey: ['project-summaries', filters],
    queryFn: () => enhancedApi.getProjectSummaries(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useUserWorkloads(department?: string, role?: string) {
  return useQuery({
    queryKey: ['user-workloads', { department, role }],
    queryFn: () => enhancedApi.getUserWorkloads(department, role),
    staleTime: 1000 * 60 * 10, // 10 minutes - workload data changes less frequently
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useTaskProgress(projectId?: string, assigneeId?: string) {
  return useQuery({
    queryKey: ['task-progress', { projectId, assigneeId }],
    queryFn: () => enhancedApi.getTaskProgress(projectId, assigneeId),
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for S-Curve analysis using task progress data
export function useSCurveData(projectId: string) {
  const { data: taskProgress, ...queryState } = useTaskProgress(projectId);

  const sCurveData = taskProgress ? {
    labels: taskProgress.map(task => task.title),
    datasets: [{
      label: 'Planned Progress',
      data: taskProgress.map(task => task.planned_progress_weight || 0),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    }, {
      label: 'Actual Progress',
      data: taskProgress.map(task => task.actual_progress),
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
    }]
  } : null;

  return {
    sCurveData,
    ...queryState
  };
}

// Hook for resource utilization analysis
export function useResourceUtilization() {
  const { data: userWorkloads, ...queryState } = useUserWorkloads();

  const utilizationData = userWorkloads ? {
    labels: userWorkloads.map(user => user.user_name),
    datasets: [{
      label: 'Active Tasks',
      data: userWorkloads.map(user => user.active_tasks),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    }, {
      label: 'Overdue Tasks',
      data: userWorkloads.map(user => user.overdue_tasks),
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
    }]
  } : null;

  return {
    utilizationData,
    userWorkloads,
    ...queryState
  };
}