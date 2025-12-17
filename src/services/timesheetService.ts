import { TimesheetEntry, TimesheetWeek, TimesheetApproval } from '@/types/timesheet';

export const timesheetService = {
  // Timesheet Entries
  async createTimesheetEntry(entry: Omit<TimesheetEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimesheetEntry> {
    const response = await fetch('/api/timesheets/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(entry),
    });
    if (!response.ok) throw new Error('Failed to create timesheet entry');
    return response.json();
  },

  async updateTimesheetEntry(entryId: string, updates: Partial<TimesheetEntry>): Promise<TimesheetEntry> {
    const response = await fetch(`/api/timesheets/entries/${entryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update timesheet entry');
    return response.json();
  },

  async deleteTimesheetEntry(entryId: string): Promise<void> {
    const response = await fetch(`/api/timesheets/entries/${entryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete timesheet entry');
  },

  // Timesheet Weeks
  async getTimesheetWeek(userId: string, weekStartDate: Date): Promise<TimesheetWeek> {
    const response = await fetch(
      `/api/timesheets/weeks?userId=${userId}&weekStartDate=${weekStartDate.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch timesheet week');
    return response.json();
  },

  async submitTimesheetWeek(timesheetId: string): Promise<TimesheetWeek> {
    const response = await fetch(`/api/timesheets/weeks/${timesheetId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to submit timesheet');
    return response.json();
  },

  async getTimesheetWeeks(userId: string, filters?: any): Promise<TimesheetWeek[]> {
    const queryParams = new URLSearchParams({
      userId,
      ...filters,
    });
    const response = await fetch(`/api/timesheets/weeks?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch timesheets');
    return response.json();
  },

  // Timesheet Approvals
  async getPendingApprovals(managerId: string): Promise<TimesheetApproval[]> {
    const response = await fetch(`/api/timesheets/approvals/pending?managerId=${managerId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch pending approvals');
    return response.json();
  },

  async approveTimesheet(timesheetId: string, comment?: string): Promise<TimesheetApproval> {
    const response = await fetch(`/api/timesheets/${timesheetId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ comment }),
    });
    if (!response.ok) throw new Error('Failed to approve timesheet');
    return response.json();
  },

  async rejectTimesheet(timesheetId: string, reason: string): Promise<TimesheetApproval> {
    const response = await fetch(`/api/timesheets/${timesheetId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to reject timesheet');
    return response.json();
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
