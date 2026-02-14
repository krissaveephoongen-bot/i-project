/**
 * Timesheet Service - Safe data fetching with AbortController
 * Prevents race conditions and memory leaks
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface Project {
  id: string;
  name: string;
  color: string;
  is_billable: boolean;
  tasks: any[];
}

export interface TimesheetEntry {
  id: string;
  projectId: string;
  taskId?: string;
  date: string;
  hours: number;
  description?: string;
}

export interface SubmissionStatus {
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  submittedAt?: string;
}

export interface WeeklyData {
  data: any[];
  summary: any;
}

/**
 * Fetch submission status for a user
 */
export async function fetchSubmissionStatus(
  userId: string,
  month: Date,
  signal: AbortSignal
): Promise<SubmissionStatus> {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const url = `${API_BASE}/api/timesheet/submission?userId=${userId}&start=${startOfMonth
    .toISOString()
    .split('T')[0]}`;

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * Fetch projects for a user
 */
export async function fetchProjects(
  userId: string,
  signal: AbortSignal
): Promise<Project[]> {
  const url = `${API_BASE}/api/timesheet/projects?userId=${userId}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  return (data || []).map((project: any, index: number) => ({
    id: project.id,
    name: project.name,
    color: `hsl(${index * 60}, 70%, 50%)`,
    is_billable: !!project.is_billable,
    tasks: project.tasks || [],
  }));
}

/**
 * Fetch timesheet entries for a month
 */
export async function fetchTimesheetEntries(
  userId: string,
  month: Date,
  projectIds: string[] = [],
  signal: AbortSignal
): Promise<TimesheetEntry[]> {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const params = new URLSearchParams({
    userId,
    start: startOfMonth.toISOString().split('T')[0],
    end: endOfMonth.toISOString().split('T')[0],
    projects: projectIds.join(','),
  }).toString();

  const url = `${API_BASE}/api/timesheet/entries?${params}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  return (data || []).map((entry: any) => ({
    id: entry.id,
    projectId: entry.projectId || entry.project_id,
    taskId: entry.taskId || entry.task_id,
    date: entry.date,
    hours: entry.hours,
    description: entry.description,
  }));
}

/**
 * Fetch weekly data
 */
export async function fetchWeeklyData(
  weekStart: Date,
  signal: AbortSignal
): Promise<WeeklyData> {
  const url = `${API_BASE}/api/timesheet/weekly?start=${weekStart
    .toISOString()
    .split('T')[0]}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * Fetch activities
 */
export async function fetchActivities(
  userId: string,
  teamId: string,
  signal: AbortSignal
): Promise<any> {
  const params = new URLSearchParams({
    ...(userId && { userId }),
    ...(teamId && { teamId }),
  }).toString();

  const url = `${API_BASE}/api/timesheet/activities?${params}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * Submit timesheet
 */
export async function submitTimesheet(
  userId: string,
  month: Date,
  entries: TimesheetEntry[],
  signal: AbortSignal
): Promise<any> {
  const url = `${API_BASE}/api/timesheet/submit`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      month: month.toISOString().split('T')[0],
      entries,
    }),
    signal,
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
