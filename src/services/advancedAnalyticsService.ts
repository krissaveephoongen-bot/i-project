/**
 * Advanced Analytics Service
 * Real-time calculations and reporting for project data
 */

import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/lib/api-config';

export interface ProjectMetrics {
  id: string;
  name: string;
  totalBudget: number;
  spent: number;
  budgetVariance: number;
  budgetVariancePercent: number;
  progress: number;
  plannedProgress: number;
  scheduleVariance: number;
  scheduleVariancePercent: number;
  completedTasks: number;
  totalTasks: number;
  taskCompletionRate: number;
  teamSize: number;
  healthStatus: 'healthy' | 'at-risk' | 'critical';
  daysRemaining: number;
  timelineStatus: 'on-track' | 'behind' | 'ahead';
}

export interface DashboardMetrics {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
    cancelledProjects: number;
  };
  financials: {
    totalBudget: number;
    totalSpent: number;
    budgetUtilization: number;
    budgetVariance: number;
    costPercentageVariance: number;
    projectedOverrun: number;
  };
  schedule: {
    averageProgress: number;
    averageScheduleVariance: number;
    onTimeProjects: number;
    behindScheduleProjects: number;
    aheadOfScheduleProjects: number;
  };
  performance: {
    projectsAtRisk: number;
    projectsCritical: number;
    resourceUtilization: number;
    teamProductivity: number;
    qualityScore: number;
  };
  trends: {
    monthlyProgress: Array<{ month: string; value: number }>;
    monthlyBudgetUsage: Array<{ month: string; value: number }>;
    projectCompletionRate: number;
  };
}

export interface ReportData {
  period: { start: Date; end: Date };
  metrics: DashboardMetrics;
  topProjects: ProjectMetrics[];
  riskProjects: ProjectMetrics[];
  performanceInsights: string[];
  recommendations: string[];
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }>;
}

/**
 * Get comprehensive dashboard metrics
 */
export async function getDashboardMetrics(startDate?: Date, endDate?: Date): Promise<DashboardMetrics> {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await axios.get(
      `${API_BASE_URL}/analytics/dashboard-metrics?${params.toString()}`,
      { timeout: API_TIMEOUT }
    );

    return response.data.data || getDefaultMetrics();
  } catch (error) {
    console.error('Failed to fetch dashboard metrics:', error);
    return getDefaultMetrics();
  }
}

/**
 * Get project-specific metrics
 */
export async function getProjectMetrics(projectId: string): Promise<ProjectMetrics | null> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/projects/${projectId}/metrics`,
      { timeout: API_TIMEOUT }
    );

    return response.data.data || null;
  } catch (error) {
    console.error('Failed to fetch project metrics:', error);
    return null;
  }
}

/**
 * Get detailed report
 */
export async function getDetailedReport(startDate: Date, endDate: Date): Promise<ReportData> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/reports/detailed`,
      {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        timeout: API_TIMEOUT
      }
    );

    return response.data.data || getDefaultReport(startDate, endDate);
  } catch (error) {
    console.error('Failed to fetch detailed report:', error);
    return getDefaultReport(startDate, endDate);
  }
}

/**
 * Get chart data for dashboard
 */
export async function getChartData(chartType: string, period: 'week' | 'month' | 'quarter' | 'year'): Promise<ChartData> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/charts/${chartType}`,
      {
        params: { period },
        timeout: API_TIMEOUT
      }
    );

    return response.data.data || getDefaultChartData(chartType);
  } catch (error) {
    console.error('Failed to fetch chart data:', error);
    return getDefaultChartData(chartType);
  }
}

/**
 * Get KPIs (Key Performance Indicators)
 */
export async function getKPIs(): Promise<Record<string, any>> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/kpis`,
      { timeout: API_TIMEOUT }
    );

    return response.data.data || {};
  } catch (error) {
    console.error('Failed to fetch KPIs:', error);
    return {};
  }
}

/**
 * Export report as PDF
 */
export async function exportReportPDF(startDate: Date, endDate: Date): Promise<Blob> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/reports/export/pdf`,
      {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        responseType: 'blob',
        timeout: API_TIMEOUT
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to export report as PDF:', error);
    throw error;
  }
}

/**
 * Get resource utilization metrics
 */
export async function getResourceUtilization(): Promise<{
  teamMembers: Array<{
    id: string;
    name: string;
    utilization: number;
    assignedTasks: number;
    completedTasks: number;
  }>;
  departmentUtilization: Record<string, number>;
}> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/resource-utilization`,
      { timeout: API_TIMEOUT }
    );

    return response.data.data || { teamMembers: [], departmentUtilization: {} };
  } catch (error) {
    console.error('Failed to fetch resource utilization:', error);
    return { teamMembers: [], departmentUtilization: {} };
  }
}

/**
 * Calculate burn-down chart data
 */
export async function getBurndownData(projectId: string): Promise<ChartData> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/projects/${projectId}/burndown`,
      { timeout: API_TIMEOUT }
    );

    return response.data.data || getDefaultChartData('burndown');
  } catch (error) {
    console.error('Failed to fetch burndown data:', error);
    return getDefaultChartData('burndown');
  }
}

/**
 * Get risk assessment
 */
export async function getRiskAssessment(): Promise<{
  highRiskProjects: ProjectMetrics[];
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    affectedProjects: number;
  }>;
  mitigationStrategies: string[];
}> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/risk-assessment`,
      { timeout: API_TIMEOUT }
    );

    return response.data.data || {
      highRiskProjects: [],
      riskFactors: [],
      mitigationStrategies: []
    };
  } catch (error) {
    console.error('Failed to fetch risk assessment:', error);
    return {
      highRiskProjects: [],
      riskFactors: [],
      mitigationStrategies: []
    };
  }
}

// Helper functions

function getDefaultMetrics(): DashboardMetrics {
  return {
    overview: {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      onHoldProjects: 0,
      cancelledProjects: 0
    },
    financials: {
      totalBudget: 0,
      totalSpent: 0,
      budgetUtilization: 0,
      budgetVariance: 0,
      costPercentageVariance: 0,
      projectedOverrun: 0
    },
    schedule: {
      averageProgress: 0,
      averageScheduleVariance: 0,
      onTimeProjects: 0,
      behindScheduleProjects: 0,
      aheadOfScheduleProjects: 0
    },
    performance: {
      projectsAtRisk: 0,
      projectsCritical: 0,
      resourceUtilization: 0,
      teamProductivity: 0,
      qualityScore: 0
    },
    trends: {
      monthlyProgress: [],
      monthlyBudgetUsage: [],
      projectCompletionRate: 0
    }
  };
}

function getDefaultReport(startDate: Date, endDate: Date): ReportData {
  return {
    period: { start: startDate, end: endDate },
    metrics: getDefaultMetrics(),
    topProjects: [],
    riskProjects: [],
    performanceInsights: [],
    recommendations: []
  };
}

function getDefaultChartData(chartType: string): ChartData {
  return {
    labels: [],
    datasets: []
  };
}
