export interface Project {
  id: string;
  name: string;
  color: string;
  is_billable?: boolean;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
}

export interface TimesheetEntry {
  id: string;
  projectId: string;
  taskId?: string;
  date: string;
  hours: number;
  description?: string;
}

export type SubmissionStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface WeeklyData {
  days: string[];
  data: Array<{ 
    userId: string; 
    name: string; 
    hours: Record<string, number> 
  }>;
}

export interface ActivityRow {
  date: string;
  user: string;
  project: string;
  task: string;
  hours: number;
  start?: string;
  end?: string;
}

export interface ActivityData {
  days: string[];
  rows: ActivityRow[];
}

export interface ModalRow {
  id?: string;
  taskId?: string;
  hours: number;
  description?: string;
  start?: string;
  end?: string;
  deleted?: boolean;
}
