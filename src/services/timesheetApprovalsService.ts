/**
 * Timesheet Approvals Service
 * Handles timesheet approval/rejection operations
 */

import { api } from '@/lib/api-client';
import { parseApiError, AppError } from '@/lib/error-handler';

export interface TimesheetApprovalRecord {
  id: string;
  user_id: string;
  user_name: string;
  submitted_date: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  rejection_reason?: string;
  approved_by?: string;
  approved_date?: string;
  total_hours: number;
  total_mandays: number;
}

export interface ApprovalFilter {
  status?: 'pending' | 'approved' | 'rejected';
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface ApprovalStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  pending_hours: number;
  approved_hours: number;
}

class TimesheetApprovalsService {
  /**
   * Fetch timesheet approvals for a manager
   */
  async getApprovals(filters?: ApprovalFilter): Promise<TimesheetApprovalRecord[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.userId) params.append('userId', filters.userId);

      const data = await api.get<TimesheetApprovalRecord[]>(
        `/worklogs/approvals?${params.toString()}`
      );
      return data;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'APPROVAL_FETCH_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Get approval statistics
   */
  async getApprovalStats(): Promise<ApprovalStats> {
    try {
      const data = await api.get<ApprovalStats>('/worklogs/approvals/stats');
      return data;
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
   * Approve a timesheet
   */
  async approveTimesheet(
    worklogId: string,
    comment?: string
  ): Promise<TimesheetApprovalRecord> {
    try {
      const data = await api.post<TimesheetApprovalRecord>(
        `/worklogs/${worklogId}/approve`,
        { comment }
      );
      return data;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'APPROVAL_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Reject a timesheet
   */
  async rejectTimesheet(
    worklogId: string,
    rejectionReason: string
  ): Promise<TimesheetApprovalRecord> {
    try {
      if (!rejectionReason || rejectionReason.trim().length < 10) {
        throw new AppError(
          'Rejection reason must be at least 10 characters',
          'VALIDATION_ERROR',
          400
        );
      }

      const data = await api.post<TimesheetApprovalRecord>(
        `/worklogs/${worklogId}/reject`,
        { rejection_reason: rejectionReason }
      );
      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'REJECTION_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Bulk approve timesheets
   */
  async bulkApprove(worklogIds: string[], comment?: string): Promise<any> {
    try {
      if (!worklogIds || worklogIds.length === 0) {
        throw new AppError(
          'Select at least one timesheet',
          'VALIDATION_ERROR',
          400
        );
      }

      const data = await api.post('/worklogs/bulk-approve', {
        worklog_ids: worklogIds,
        comment,
      });
      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'BULK_APPROVAL_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Bulk reject timesheets
   */
  async bulkReject(
    worklogIds: string[],
    rejectionReason: string
  ): Promise<any> {
    try {
      if (!worklogIds || worklogIds.length === 0) {
        throw new AppError(
          'Select at least one timesheet',
          'VALIDATION_ERROR',
          400
        );
      }

      if (!rejectionReason || rejectionReason.trim().length < 10) {
        throw new AppError(
          'Rejection reason must be at least 10 characters',
          'VALIDATION_ERROR',
          400
        );
      }

      const data = await api.post('/worklogs/bulk-reject', {
        worklog_ids: worklogIds,
        rejection_reason: rejectionReason,
      });
      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'BULK_REJECTION_ERROR',
        apiError.status
      );
    }
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovals(userId?: string): Promise<TimesheetApprovalRecord[]> {
    try {
      const params = new URLSearchParams();
      params.append('status', 'pending');
      if (userId) params.append('userId', userId);

      const data = await api.get<TimesheetApprovalRecord[]>(
        `/worklogs/approvals?${params.toString()}`
      );
      return data;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new AppError(
        apiError.message,
        'PENDING_FETCH_ERROR',
        apiError.status
      );
    }
  }
}

export const timesheetApprovalsService = new TimesheetApprovalsService();
