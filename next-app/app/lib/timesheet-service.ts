import { TimeEntry, WorkType, EntryStatus } from '@/app/timesheet/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Maps database entry (snake_case) to frontend model (camelCase)
 */
function mapToTimeEntry(dbEntry: any): TimeEntry {
  return {
    id: dbEntry.id,
    date: dbEntry.date ? new Date(dbEntry.date).toISOString().split('T')[0] : '',
    startTime: dbEntry.start_time || dbEntry.startTime || '',
    endTime: dbEntry.end_time || dbEntry.endTime || null,
    breakDuration: dbEntry.break_duration || dbEntry.breakDuration || 0,
    workType: (dbEntry.work_type || dbEntry.workType || dbEntry.activity_type || WorkType.PROJECT) as WorkType,
    projectId: dbEntry.project_id || dbEntry.projectId || null,
    taskId: dbEntry.task_id || dbEntry.taskId || null,
    userId: dbEntry.user_id || dbEntry.userId || '',
    hours: Number(dbEntry.hours || 0),
    billableHours: Number(dbEntry.billable_hours || dbEntry.billableHours || 0),
    description: dbEntry.description || '',
    status: (dbEntry.status || EntryStatus.PENDING) as EntryStatus,
    approvedBy: dbEntry.approved_by || dbEntry.approvedBy || null,
    approvedAt: dbEntry.approved_at || dbEntry.approvedAt || null,
    rejectedReason: dbEntry.rejected_reason || dbEntry.rejectedReason || null,
    createdAt: dbEntry.created_at || dbEntry.createdAt || new Date().toISOString(),
    updatedAt: dbEntry.updated_at || dbEntry.updatedAt || new Date().toISOString(),
  };
}

/**
 * Maps frontend model to API payload (snake_case where expected by API)
 */
function mapToApiPayload(entry: Partial<TimeEntry>): any {
  const payload: any = {};
  
  if (entry.id) payload.id = entry.id;
  if (entry.userId) payload.user_id = entry.userId;
  if (entry.projectId) payload.project_id = entry.projectId;
  if (entry.taskId) payload.task_id = entry.taskId;
  if (entry.date) payload.date = entry.date;
  if (entry.hours !== undefined) payload.hours = entry.hours;
  if (entry.startTime) payload.start_time = entry.startTime;
  if (entry.endTime) payload.end_time = entry.endTime;
  if (entry.description) payload.description = entry.description;
  if (entry.workType) payload.activity_type = entry.workType; // API expects activity_type based on my previous read
  if (entry.breakDuration !== undefined) payload.break_duration = entry.breakDuration;
  if (entry.billableHours !== undefined) payload.billable_hours = entry.billableHours;
  
  // Some fields might need to be passed as is if the API handles them differently
  // but based on route.ts, it expects snake_case properties in the body
  
  return payload;
}

export const timesheetService = {
  /**
   * Fetch timesheet entries for a user within a date range
   */
  getEntries: async (userId: string, start: string, end: string, projectIds?: string[]): Promise<TimeEntry[]> => {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        start,
        end,
      });
      
      if (projectIds && projectIds.length > 0) {
        params.append('projects', projectIds.join(','));
      }

      const res = await fetch(`${API_BASE}/api/timesheet/entries?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch entries: ${res.statusText}`);
      }

      const data = await res.json();
      return (data || []).map(mapToTimeEntry);
    } catch (error) {
      console.error('Error fetching timesheet entries:', error);
      return [];
    }
  },

  /**
   * Create a new timesheet entry
   */
  createEntry: async (entry: Partial<TimeEntry>): Promise<TimeEntry | null> => {
    try {
      const payload = mapToApiPayload(entry);
      
      const res = await fetch(`${API_BASE}/api/timesheet/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create entry');
      }

      const data = await res.json();
      return mapToTimeEntry(data);
    } catch (error) {
      console.error('Error creating timesheet entry:', error);
      throw error;
    }
  },

  /**
   * Update an existing timesheet entry
   */
  updateEntry: async (entry: Partial<TimeEntry>): Promise<TimeEntry | null> => {
    if (!entry.id) throw new Error('Entry ID is required for update');

    try {
      const payload = mapToApiPayload(entry);
      
      const res = await fetch(`${API_BASE}/api/timesheet/entries`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update entry');
      }

      const data = await res.json();
      return mapToTimeEntry(data);
    } catch (error) {
      console.error('Error updating timesheet entry:', error);
      throw error;
    }
  },

  /**
   * Delete a timesheet entry
   */
  deleteEntry: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/timesheet/entries?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete entry');
      }

      return true;
    } catch (error) {
      console.error('Error deleting timesheet entry:', error);
      return false;
    }
  },

  /**
   * Get submission status for a month
   */
  getSubmissionStatus: async (userId: string, date: string): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE}/api/timesheet/submission?userId=${userId}&start=${date}`);
      if (!res.ok) return 'Draft';
      const data = await res.json();
      return data.status || 'Draft';
    } catch (error) {
      console.error('Error fetching submission status:', error);
      return 'Draft';
    }
  },

  /**
   * Submit timesheet for approval
   */
  submitTimesheet: async (userId: string, start: string, end: string, totalHours: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/timesheet/submission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, period_start_date: start, period_end_date: end, total_hours: totalHours }),
      });
      return res.ok;
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      return false;
    }
  },

  /**
   * Get weekly summary
   */
  getWeeklySummary: async (start: string, projectId?: string): Promise<any> => {
    try {
      const url = new URL(`${API_BASE}/api/timesheet/weekly`);
      url.searchParams.set('start', start);
      if (projectId && projectId !== 'all') url.searchParams.set('projectId', projectId);
      
      const res = await fetch(url.toString());
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
      return null;
    }
  }
};
