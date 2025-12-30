import { useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { Task, Project, User } from '../services/dataService';

export function useAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateProjectDashboardAnalytics = async (projects: Project[], tasks: Task[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await analyticsService.generateProjectDashboardAnalytics(projects, tasks);
      setAnalyticsData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analytics');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateProjectReport = async (project: Project, tasks: Task[], users: User[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await analyticsService.generateProjectReport(project, tasks, users);
      setAnalyticsData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate project report');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectHealthScore = async (project: Project, tasks: Task[]): Promise<number> => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the analytics service method to calculate health score
      const healthScore = await this.calculateProjectHealthScore(project, tasks);
      return healthScore;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate health score');
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper method to calculate project health score
  const calculateProjectHealthScore = async (project: Project, tasks: Task[]): Promise<number> => {
    // This would be a public method in the analytics service in a real implementation
    // For now, we'll use a simplified calculation
    let score = 100;

    // Progress factor
    score -= (100 - project.progress) * 0.3;

    // Task completion factor
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 100;
    score -= (100 - taskCompletionRate) * 0.25;

    // Overdue tasks factor
    const overdueTasks = tasks.filter(t =>
      t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length;
    const overduePenalty = Math.min(100, overdueTasks * 5);
    score -= overduePenalty * 0.20;

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  return {
    isLoading,
    analyticsData,
    error,
    generateProjectDashboardAnalytics,
    generateProjectReport,
    getProjectHealthScore,
  };
}