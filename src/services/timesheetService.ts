import { api } from '@/lib/api';
import { 
  TimesheetEntry, 
  TimesheetWeek
} from '@/types/timesheet';

interface GetTimesheetsParams {
  page?: number;
  limit?: number;
  userId?: string;
  projectId?: string;
  taskId?: string;
  status?: TimesheetEntry['status'] | TimesheetWeek['status'];
  startDate?: string;
  endDate?: string;
}

export const timesheetService = {
  // Get all timesheets with pagination and filters
  async getTimesheets(params: GetTimesheetsParams = {}) {
    const { page = 1, limit = 10, ...filters } = params;
    const response = await api.get('/timesheets', {
      params: {
        page,
        limit,
        ...filters
      }
    });
    return response.data;
  },

  // Get a single timesheet by ID
  async getTimesheetById(id: string) {
    const response = await api.get(`/timesheets/${id}`);
    return response.data;
  },

  // Create a new timesheet entry
  async createTimesheetEntry(entry: Omit<TimesheetEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimesheetWeek> {
    const response = await api.post('/timesheets', entry);
    return response.data;
  },

  // Update an existing timesheet entry
  async updateTimesheetEntry(entryId: string, updates: Partial<TimesheetEntry>): Promise<TimesheetWeek> {
    const response = await api.put(`/timesheets/${entryId}`, updates);
    return response.data;
  },

  // Delete a timesheet entry
  async deleteTimesheetEntry(entryId: string): Promise<void> {
    await api.delete(`/timesheets/${entryId}`);
  },

  // Get timesheet for a specific week
  async getTimesheetWeek(userId: string, weekStartDate: Date) {
    const response = await api.get('/timesheets/week', {
      params: {
        userId,
        startDate: weekStartDate.toISOString().split('T')[0],
        endDate: new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    });
    return response.data;
  },

  // Submit timesheet for approval
  async submitTimesheet(timesheetId: string): Promise<TimesheetWeek> {
    const response = await api.post(`/timesheets/${timesheetId}/submit`);
    return response.data;
  },

  // Get timesheets for a specific user
  async getUserTimesheets(userId: string, filters: any = {}) {
    const response = await api.get('/timesheets', {
      params: {
        userId,
        ...filters
      }
    });
    return response.data;
  },

  // Timesheet Approvals
  async getPendingApprovals(managerId?: string) {
    const response = await api.get('/timesheets/pending-approval', {
      params: { managerId }
    });
    return response.data;
  },

  // Approve a timesheet
  async approveTimesheet(timesheetId: string, approvedById: string) {
    const response = await api.post(`/timesheets/${timesheetId}/approve`, { approvedById });
    return response.data;
  },

  // Reject a timesheet
  async rejectTimesheet(timesheetId: string, rejectedById: string, rejectionReason: string) {
    const response = await api.post(`/timesheets/${timesheetId}/reject`, { 
      rejectedById, 
      rejectionReason 
    });
    return response.data;
  },

  // Get timesheet reports
  async getReports(filters: any = {}) {
    const response = await api.get('/timesheets/reports', { params: filters });
    return response.data;
  },

  // Get timesheet statistics
  async getTimesheetStats(userId?: string) {
    const response = await api.get('/timesheets/stats', {
      params: { userId }
    });
    return response.data;
  },

  // Database status
  async getDbStatus(): Promise<any> {
    try {
      const response = await fetch('/api/health/db', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('DB check failed');
      return response.json();
    } catch (error) {
      return { status: 'disconnected' };
    }
  },
};
