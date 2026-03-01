import { Task as DBTask } from "../types/database.types";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  projectId?: string; // mapped from project_id, optional to support partial data or loose types
  milestoneId?: string | null; // mapped from milestone_id
  assignedTo?: string | null; // mapped from assignee_id
  
  dueDate?: string | null; // mapped from due_date
  startDate?: string | null; // mapped from start_date (if exists in DB) or derived
  endDate?: string | null; // mapped from end_date (if exists in DB) or derived
  
  estimatedHours?: number | null; // mapped from estimated_hours
  actualHours?: number | null; // mapped from actual_hours
  
  weight?: number; // mapped from weight, changed to number | undefined to satisfy components
  progressPlan?: number; // mapped from progress_plan
  progressActual?: number; // mapped from progress_actual
  
  phase?: string | null; // Added for KanbanCard compatibility
  
  createdAt?: string | null;
  updatedAt?: string | null;

  // Joined/Display fields
  projects?: { id: string; name: string };
  assigned_user?: { id: string; name: string };
  
  // Handling inconsistent naming in components (optional)
  assigned_to?: string; // Some components might use this for name or ID
}

export type { DBTask };
