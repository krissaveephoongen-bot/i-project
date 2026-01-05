/**
 * Timesheet Reports Service
 * Handles timesheet analytics and reporting
 */

import { api } from '@/lib/api-client';
import { parseApiError, AppError } from '@/lib/error-handler';

export interface TimesheetStats {
  totalHours: number;
  daysWorked: number;
  averageHoursPerDay: number;
  overtimeHours: number;
  projectBreakdown: ProjectTimeBreakdown[];
  typeBreakdown: TimeTypeBreakdown[];
}

export interface ProjectTimeBreakdown {
  projectId: string;
  projectName: string;
  hours: number;
  percentage: number;
  taskCount: number;
}

export interface TimeTypeBreakdown {
  type: string;
  hours: number;
  percentage: number;
}

export interface TimesheetReportFilter {
  period?: 'week' | 'month' | 'quarter' | 'year';
  year?: number;
  week?: number;
  month?: number;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  filters?: TimesheetReportFilter;
}

class TimesheetReportsService {
  /**
   * Get timesheet statistics for a user
   */
  async getTimesheetStats(
    filters?: TimesheetReportFilter
  ): Promise<TimesheetStats> {
    try {
      const params = new URLSearchParams();
      if (filters?.period) params.append('period', filters.period);
      if (filters?.year) params.append('year', filters.year.toString());
      if (filters?.week) params.append('week', filters.week.toString());
      if (filters?.month) params.append('month', filters.month.toString());
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const data = await api.get<any>(`/worklogs/stats?${params.toString()}`);
      
      // Transform API response to match expected format
      return this.transformStats(data);
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'STATS_FETCH_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Get weekly timesheet summary
   */
  async getWeeklySummary(
    year: number,
    week: number,
    userId?: string
  ): Promise<TimesheetStats> {
    try {
      const params = new URLSearchParams();
      params.append('period', 'week');
      params.append('year', year.toString());
      params.append('week', week.toString());
      if (userId) params.append('userId', userId);

      const data = await api.get<any>(
        `/worklogs/stats?${params.toString()}`
      );
      return this.transformStats(data);
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'WEEKLY_SUMMARY_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Get monthly timesheet summary
   */
  async getMonthlySummary(
    year: number,
    month: number,
    userId?: string
  ): Promise<TimesheetStats> {
    try {
      const params = new URLSearchParams();
      params.append('period', 'month');
      params.append('year', year.toString());
      params.append('month', month.toString());
      if (userId) params.append('userId', userId);

      const data = await api.get<any>(
        `/worklogs/stats?${params.toString()}`
      );
      return this.transformStats(data);
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
   * Export timesheet data
   */
  async exportTimesheets(options: ExportOptions): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', options.format);
      if (options.filters?.period)
        params.append('period', options.filters.period);
      if (options.filters?.year)
        params.append('year', options.filters.year.toString());
      if (options.filters?.week)
        params.append('week', options.filters.week.toString());
      if (options.filters?.month)
        params.append('month', options.filters.month.toString());
      if (options.filters?.userId)
        params.append('userId', options.filters.userId);
      if (options.filters?.startDate)
        params.append('startDate', options.filters.startDate);
      if (options.filters?.endDate)
        params.append('endDate', options.filters.endDate);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/worklogs/export?${params.toString()}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new AppError(
          'Failed to export timesheets',
          'EXPORT_ERROR',
          response.status
        );
      }

      return response.blob();
    } catch (error) {
      if (error instanceof AppError) throw error;
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'EXPORT_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Get project-wise time breakdown
   */
  async getProjectTimeBreakdown(
    userId?: string,
    filters?: TimesheetReportFilter
  ): Promise<ProjectTimeBreakdown[]> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const data = await api.get<ProjectTimeBreakdown[]>(
        `/worklogs/breakdown/projects?${params.toString()}`
      );
      return data;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'PROJECT_BREAKDOWN_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Get time-type breakdown (project vs admin, etc.)
   */
  async getTimeTypeBreakdown(
    userId?: string,
    filters?: TimesheetReportFilter
  ): Promise<TimeTypeBreakdown[]> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const data = await api.get<TimeTypeBreakdown[]>(
        `/worklogs/breakdown/types?${params.toString()}`
      );
      return data;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'TYPE_BREAKDOWN_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Transform API response to TimesheetStats format
   */
  private transformStats(apiData: any): TimesheetStats {
    // This assumes the backend returns data in a specific format
    // Adjust based on your actual API response structure
    return {
      totalHours: apiData.totalHours || 0,
      daysWorked: apiData.daysWorked || 0,
      averageHoursPerDay: apiData.averageHoursPerDay || 0,
      overtimeHours: apiData.overtimeHours || 0,
      projectBreakdown: apiData.projectBreakdown || [],
      typeBreakdown: apiData.typeBreakdown || [],
    };
  }
}

export const timesheetReportsService = new TimesheetReportsService();
