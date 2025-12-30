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

  // alias for older callers/tests
  async createTimeEntry(entry: Omit<TimesheetEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimesheetWeek> {
    return this.createTimesheetEntry(entry);
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

  // older name used in some call sites
  async getTimesheetWeeks(userId: string, weekStartDate?: Date) {
    if (weekStartDate) return this.getTimesheetWeek(userId, weekStartDate as Date);
    // fallback to fetching all user timesheets
    return this.getUserTimesheets(userId);
  },

  // Submit timesheet for approval
  async submitTimesheet(timesheetId: string): Promise<TimesheetWeek> {
    const response = await api.post(`/timesheets/${timesheetId}/submit`);
    return response.data;
  },

  // alias for older callers
  async submitTimesheetWeek(timesheetId: string): Promise<TimesheetWeek> {
    return this.submitTimesheet(timesheetId);
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

  // alias for backwards compatibility
  async approveTimeEntry(timesheetId: string, approvedById: string | number) {
    return this.approveTimesheet(timesheetId, String(approvedById));
  },

  // Reject a timesheet
  async rejectTimesheet(timesheetId: string, rejectedById: string, rejectionReason: string) {
    const response = await api.post(`/timesheets/${timesheetId}/reject`, { 
      rejectedById, 
      rejectionReason 
    });
    return response.data;
  },

  // alias for backwards compatibility
  async rejectTimeEntry(timesheetId: string, rejectedById: string | number, rejectionReason: string) {
    return this.rejectTimesheet(timesheetId, String(rejectedById), rejectionReason);
  },

  // Get timesheet reports
  async getReports(filters: any = {}) {
    const response = await api.get('/timesheets/reports', { params: filters });
    return response.data;
  },

  // Backwards-compatible alias for older callers/tests
  async getReportsSummary(filters: any = {}) {
    return this.getReports(filters);
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

// Convenience named exports for tests and legacy imports
export async function fetchWorklogs(startDate: string, endDate: string) {
  const res = await fetch(`/worklogs?start=${startDate}&end=${endDate}`);
  if (!res.ok) throw new Error('Failed to fetch worklogs');
  return res.json();
}

export async function createWorklog(entry: any) {
  const res = await fetch('/worklogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to create worklog');
  return res.json();
}

export async function updateWorklog(id: string, updates: any) {
  const res = await fetch(`/worklogs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update worklog');
  return res.json();
}

export async function deleteWorklog(id: string) {
  const res = await fetch(`/worklogs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete worklog');
  return;
}

export function calculateHours(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  return (endMinutes - startMinutes) / 60;
}

export function getWeeklyStats(entries: Array<{ hours: number; status?: string }>) {
  const totalHours = entries.reduce((s, e) => s + (e.hours || 0), 0);
  const billableHours = entries.reduce((s, e) => s + ((e.status === 'approved' ? e.hours : 0) || 0), 0);
  const pendingApproval = entries.filter(e => e.status === 'pending').length;
  return { totalHours, billableHours, pendingApproval };
}

// keep default export object for other consumers
export default timesheetService;

// Backwards-compatible named exports (wrap the canonical service methods)
export async function createTimeEntry(entry: Omit<TimesheetEntry, 'id' | 'createdAt' | 'updatedAt'>) {
  return timesheetService.createTimesheetEntry(entry);
}

export async function approveTimeEntry(timesheetId: string, approvedById: string | number) {
  return timesheetService.approveTimeEntry(timesheetId, approvedById);
}

export async function rejectTimeEntry(timesheetId: string, rejectedById: string | number, rejectionReason: string) {
  return timesheetService.rejectTimeEntry(timesheetId, rejectedById, rejectionReason);
}

export async function getReportsSummary(filters: any = {}) {
  return timesheetService.getReportsSummary(filters);
}

export async function getTimesheetWeeks(userId: string, weekStartDate?: Date) {
  return timesheetService.getTimesheetWeeks(userId, weekStartDate);
}

export async function submitTimesheetWeek(timesheetId: string): Promise<TimesheetWeek> {
  return timesheetService.submitTimesheetWeek(timesheetId);
}
