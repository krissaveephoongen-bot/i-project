import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedApi } from '../lib/api-client';

// Advanced analytics interfaces
export interface ProjectHealthScore {
  id: string;
  projectId: string;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: Record<string, any>;
  predictions?: Record<string, any>;
  recommendations: string[];
  calculatedAt: string;
  nextReviewDate?: string;
}

export interface PredictiveInsight {
  entityId: string;
  entityType: 'project' | 'task' | 'user';
  predictionType: string;
  predictionData: Record<string, any>;
  confidenceScore: number;
  validUntil: string;
}

export interface ResourceBottleneck {
  userId: string;
  userName: string;
  bottleneckType: 'overloaded' | 'underutilized' | 'skill_gap';
  severityScore: number;
  affectedProjects: string[];
  recommendations: string[];
  detectedAt: string;
  status: 'active' | 'resolved';
}

export interface WorkflowTrigger {
  id: string;
  name: string;
  description?: string;
  triggerType: 'time' | 'event' | 'condition';
  triggerConfig: Record<string, any>;
  actions: Record<string, any>[];
  isActive: boolean;
  priority: number;
  cooldownMinutes: number;
  lastTriggeredAt?: string;
}

// Advanced analytics hooks

export function useProjectHealthScores(projectId?: string) {
  return useQuery({
    queryKey: ['project-health-scores', projectId],
    queryFn: () => enhancedApi.get(`/analytics/project-health${projectId ? `?projectId=${projectId}` : ''}`),
    staleTime: 1000 * 60 * 15, // 15 minutes - health scores change moderately
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes for fresh insights
  });
}

export function usePredictiveInsights(entityType: string, entityId?: string) {
  return useQuery({
    queryKey: ['predictive-insights', entityType, entityId],
    queryFn: () => enhancedApi.get(`/analytics/predictions?entityType=${entityType}${entityId ? `&entityId=${entityId}` : ''}`),
    staleTime: 1000 * 60 * 30, // 30 minutes - predictions are moderately stable
    gcTime: 1000 * 60 * 120, // 2 hours
  });
}

export function useResourceBottlenecks(severityThreshold: number = 50) {
  return useQuery({
    queryKey: ['resource-bottlenecks', severityThreshold],
    queryFn: () => enhancedApi.get(`/analytics/resource-bottlenecks?severityThreshold=${severityThreshold}`),
    staleTime: 1000 * 60 * 10, // 10 minutes - bottlenecks change frequently
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 5, // Check every 5 minutes for critical issues
  });
}

export function useWorkflowTriggers() {
  return useQuery({
    queryKey: ['workflow-triggers'],
    queryFn: () => enhancedApi.get('/analytics/workflow-triggers'),
    staleTime: 1000 * 60 * 60, // 1 hour - triggers change infrequently
    gcTime: 1000 * 60 * 120, // 2 hours
  });
}

export function useIntelligentSearch() {
  const queryClient = useQueryClient();

  const searchMutation = useMutation({
    mutationFn: (query: string) => enhancedApi.post('/analytics/intelligent-search', { query }),
    onSuccess: (data) => {
      // Cache search results for better UX
      queryClient.setQueryData(['search-results', data.query], data.results);
    },
  });

  return {
    search: searchMutation.mutate,
    isSearching: searchMutation.isPending,
    searchResults: searchMutation.data,
    error: searchMutation.error,
  };
}

export function useProjectRiskAssessment() {
  return useQuery({
    queryKey: ['project-risk-assessment'],
    queryFn: () => enhancedApi.get('/analytics/project-risk-assessment'),
    staleTime: 1000 * 60 * 20, // 20 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 15, // Update every 15 minutes
  });
}

export function useTeamProductivityInsights(department?: string) {
  return useQuery({
    queryKey: ['team-productivity-insights', department],
    queryFn: () => enhancedApi.get(`/analytics/team-productivity${department ? `?department=${department}` : ''}`),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 120, // 2 hours
  });
}

export function usePredictiveCompletion() {
  return useQuery({
    queryKey: ['predictive-completion'],
    queryFn: () => enhancedApi.get('/analytics/predictive-completion'),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 45, // 45 minutes
    refetchInterval: 1000 * 60 * 10, // Update every 10 minutes for fresh predictions
  });
}

// ML-powered recommendations hook
export function useSmartRecommendations(entityType: 'project' | 'task' | 'user', entityId: string) {
  return useQuery({
    queryKey: ['smart-recommendations', entityType, entityId],
    queryFn: () => enhancedApi.get(`/analytics/recommendations?entityType=${entityType}&entityId=${entityId}`),
    staleTime: 1000 * 60 * 60, // 1 hour - recommendations are stable
    gcTime: 1000 * 60 * 180, // 3 hours
  });
}

// Real-time collaboration analytics
export function useCollaborationMetrics(projectId: string) {
  return useQuery({
    queryKey: ['collaboration-metrics', projectId],
    queryFn: () => enhancedApi.get(`/analytics/collaboration?projectId=${projectId}`),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchInterval: 1000 * 60 * 2, // Update every 2 minutes for real-time feel
  });
}

// User behavior analytics for personalization
export function useUserBehaviorAnalytics(userId: string, timeRange: 'day' | 'week' | 'month' = 'week') {
  return useQuery({
    queryKey: ['user-behavior-analytics', userId, timeRange],
    queryFn: () => enhancedApi.get(`/analytics/user-behavior?userId=${userId}&timeRange=${timeRange}`),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 180, // 3 hours
  });
}

// Automated workflow management
export function useWorkflowAutomation() {
  const queryClient = useQueryClient();

  const createTrigger = useMutation({
    mutationFn: (trigger: Omit<WorkflowTrigger, 'id'>) =>
      enhancedApi.post('/analytics/workflow-triggers', trigger),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-triggers'] });
    },
  });

  const updateTrigger = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WorkflowTrigger> }) =>
      enhancedApi.put(`/analytics/workflow-triggers/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-triggers'] });
    },
  });

  const deleteTrigger = useMutation({
    mutationFn: (id: string) =>
      enhancedApi.delete(`/analytics/workflow-triggers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-triggers'] });
    },
  });

  return {
    createTrigger: createTrigger.mutate,
    updateTrigger: updateTrigger.mutate,
    deleteTrigger: deleteTrigger.mutate,
    isCreating: createTrigger.isPending,
    isUpdating: updateTrigger.isPending,
    isDeleting: deleteTrigger.isPending,
  };
}

// Advanced reporting with AI insights
export function useAdvancedReporting(reportType: string, filters: Record<string, any>) {
  return useQuery({
    queryKey: ['advanced-reporting', reportType, filters],
    queryFn: () => enhancedApi.post('/analytics/advanced-reports', {
      reportType,
      filters,
      includeAIInsights: true,
    }),
    staleTime: 1000 * 60 * 60, // 1 hour - reports are expensive to generate
    gcTime: 1000 * 60 * 240, // 4 hours
  });
}

// Anomaly detection for project metrics
export function useAnomalyDetection(metricType: string, projectId?: string) {
  return useQuery({
    queryKey: ['anomaly-detection', metricType, projectId],
    queryFn: () => enhancedApi.get(`/analytics/anomalies?metricType=${metricType}${projectId ? `&projectId=${projectId}` : ''}`),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 120, // 2 hours
    refetchInterval: 1000 * 60 * 15, // Check for anomalies every 15 minutes
  });
}