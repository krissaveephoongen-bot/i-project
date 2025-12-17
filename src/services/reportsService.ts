/**
 * Reports Service
 * Handles all report-related API calls
 */

import { api } from '@/lib/api-client';
import { parseApiError, AppError } from '@/lib/error-handler';

export interface ReportFilter {
  period?: 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
  projectId?: string;
  userId?: string;
}

export interface ProjectSummary {
  id: string;
  code: string;
  name: string;
  status: string;
  progress: number;
  budget: number;
  contract_amount: number;
  start_date: string;
  end_date: string;
  project_manager: string;
  team_members: string[];
  total_hours: number;
  total_expenses: number;
}

export interface ProjectReport {
  project: ProjectSummary;
  tasks: any[];
  worklogs: any[];
  expenses: any[];
  statistics: {
    total_tasks: number;
    completed_tasks: number;
    total_hours: number;
    total_expenses: number;
    approved_expenses: number;
    pending_expenses: number;
    budget_remaining: number;
  };
}

export interface TimesheetSummary {
  summary: Array<{
    user_id: string;
    user_name: string;
    total_entries: number;
    total_hours: number;
    total_mandays: number;
    approved_entries: number;
    pending_entries: number;
  }>;
  totals: {
    total_users: number;
    total_entries: number;
    total_hours: number;
    total_mandays: number;
  };
}

export interface ExpenseSummary {
  by_category: Array<{
    category: string;
    count: number;
    total_amount: number;
    avg_amount: number;
  }>;
  by_status: Array<{
    status: string;
    count: number;
    total_amount: number;
  }>;
  totals: {
    total_count: number;
    total_amount: number;
  };
}

export interface TeamProductivity {
  team_productivity: Array<{
    id: string;
    name: string;
    email: string;
    position: string;
    days_worked: number;
    total_hours: number;
    avg_hours_per_day: number;
    projects_contributed: number;
  }>;
  summary: {
    total_team_members: number;
    total_hours: number;
    avg_hours_per_member: number;
  };
}

export interface MonthlySummary {
  worklogs_by_month: Array<{
    month: number;
    entry_count: number;
    total_hours: number;
    total_mandays: number;
  }>;
  expenses_by_month: Array<{
    month: number;
    expense_count: number;
    total_amount: number;
    approved_amount: number;
  }>;
  year: number;
}

class ReportsService {
  /**
   * Get project summary report
   */
  async getProjectSummary(): Promise<ProjectSummary[]> {
    try {
      const data = await api.get<ProjectSummary[]>('/reports/project-summary');
      return data;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'REPORT_FETCH_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Get detailed report for a specific project
   */
  async getProjectReport(
    projectId: string,
    filters?: ReportFilter
  ): Promise<ProjectReport> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const data = await api.get<ProjectReport>(
        `/reports/project/${projectId}?${params.toString()}`
      );
      return data;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'PROJECT_REPORT_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Get timesheet summary report
   */
  async getTimesheetSummary(filters?: ReportFilter): Promise<TimesheetSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.userId) params.append('userId', filters.userId);

      const data = await api.get<TimesheetSummary>(
        `/reports/timesheet-summary?${params.toString()}`
      );
      return data;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'TIMESHEET_SUMMARY_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Get expense summary report
   */
  async getExpenseSummary(filters?: ReportFilter): Promise<ExpenseSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.projectId) params.append('projectId', filters.projectId);

      const data = await api.get<ExpenseSummary>(
        `/reports/expense-summary?${params.toString()}`
      );
      return data;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'EXPENSE_SUMMARY_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Get team productivity report
   */
  async getTeamProductivity(filters?: ReportFilter): Promise<TeamProductivity> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const data = await api.get<TeamProductivity>(
        `/reports/team-productivity?${params.toString()}`
      );
      return data;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'TEAM_PRODUCTIVITY_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Get monthly summary report
   */
  async getMonthlySummary(year?: number): Promise<MonthlySummary> {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());

      const data = await api.get<MonthlySummary>(
        `/reports/monthly-summary?${params.toString()}`
      );
      return data;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'MONTHLY_SUMMARY_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Export reports to various formats
   */
  async exportReport(
    format: 'pdf' | 'csv' | 'json',
    filters?: ReportFilter
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/reports/export?${params.toString()}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new AppError(
          'Failed to export report',
          'EXPORT_ERROR',
          response.status
        );
      }

      return response.blob();
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'EXPORT_ERROR',
        apiError.status
      );
    }
  }
}

export const reportsService = new ReportsService();
