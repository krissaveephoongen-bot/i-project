export interface Project {
  id: number;
  name: string;
  code?: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'pending' | 'approved' | 'rejected';
  start_date?: string;
  end_date?: string;
  budget?: number;
  spent?: number;
  remaining?: number;
  manager_id?: number;
  client_id?: number;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  project_id: number;
  assigned_to?: number;
  created_by: number;
  parent_task_id?: number;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: number;
  user_id: number;
  date: string;
  work_type: 'project' | 'office' | 'other';
  project_id?: number;
  task_id?: number;
  start_time: string;
  end_time: string;
  hours: number;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  project_name?: string;
  task_title?: string;
}

export interface Expense {
  id: number;
  user_id: number;
  project_id: number;
  task_id?: number;
  date: string;
  amount: number;
  category: 'travel' | 'supplies' | 'equipment' | 'training' | 'other';
  description: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  approved_by?: number;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetRevision {
  id: number;
  project_id: number;
  previous_budget: number;
  new_budget: number;
  reason: string;
  changed_by: number;
  changed_at: string;
}

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseQueryResult<T> {
  rows: T[];
  rowCount: number;
  command: string;
  fields: any[];
  oid: number;
}
