/**
 * API Type Definitions
 * Replaces widespread `any` usage with proper TypeScript types
 */

// ===================
// AUTH TYPES
// ===================
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "employee";
  avatar?: string;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

// ===================
// PROJECT TYPES
// ===================
export interface Project {
  id: string;
  name: string;
  description?: string;
  budget: number;
  spent: number;
  status: "planning" | "active" | "completed" | "archived";
  managerId: string;
  startDate: string;
  endDate?: string;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithDetails extends Project {
  manager?: AuthUser;
  tasks?: Task[];
  team?: AuthUser[];
}

// ===================
// TASK TYPES
// ===================
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
  dueDate?: string;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskWithDetails extends Task {
  assignee?: AuthUser;
  project?: Project;
  subtasks?: Task[];
}

// ===================
// TIMESHEET TYPES
// ===================
export interface TimesheetEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  date: string;
  hours: number;
  description?: string;
  workType: "project" | "office" | "other";
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetSubmission {
  id: string;
  userId: string;
  month: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  entries: TimesheetEntry[];
  submittedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

// ===================
// EXPENSE TYPES
// ===================
export interface Expense {
  id: string;
  userId: string;
  projectId?: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "paid";
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

// ===================
// CLIENT TYPES
// ===================
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  address?: string;
  taxId?: string;
  status: "active" | "inactive" | "archived";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ===================
// DASHBOARD TYPES
// ===================
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  onTimeProjects: number;
  delayedProjects: number;
}

export interface PortfolioItem {
  id: string;
  name: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  spi: number;
  remaining: number;
}

// ===================
// API RESPONSE TYPES
// ===================
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
  requestId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  requestId?: string;
  timestamp?: string;
}

// ===================
// FILTER TYPES
// ===================
export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

export interface FilterState {
  search?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  managerId?: string;
  startDate?: string;
  endDate?: string;
}

// ===================
// PAGINATION TYPES
// ===================
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
