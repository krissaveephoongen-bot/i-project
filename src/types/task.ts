// Task related types

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED' | 'CANCELLED';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  taskId: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  projectId: string;
  project: Pick<Project, 'id' | 'name' | 'code' | 'status'>;
  assigneeId?: string;
  assignee?: User;
  reporterId: string;
  reporter: User;
  parentTaskId?: string;
  parentTask?: Pick<Task, 'id' | 'title' | 'status'>;
  subTasks?: Array<Pick<Task, 'id' | 'title' | 'status' | 'assignee' | 'dueDate' | 'priority'>>;
  labels?: string[];
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  progress?: number;
  commentsCount?: number;
  timeLogsCount?: number;
  timesheetsCount?: number;
  _count?: {
    comments: number;
    timeLogs: number;
    timesheets: number;
  };
}

// For task creation/update forms
export interface TaskFormData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  projectId: string;
  assigneeId?: string;
  parentTaskId?: string;
  labels?: string[];
}

// For task filters
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  assigneeId?: string;
  reporterId?: string;
  search?: string;
  labels?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
}
