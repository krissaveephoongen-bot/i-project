// ============================================================
// ENUMERATIONS
// ============================================================

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled',
  BLOCKED = 'blocked',
}

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum MilestoneStatus {
  PENDING = 'pending',
  INVOICED = 'invoiced',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

export enum TimesheetStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum WorkType {
  PROJECT = 'project',
  OFFICE = 'office',
  TRAINING = 'training',
  LEAVE = 'leave',
  OVERTIME = 'overtime',
  OTHER = 'other',
}

export enum ExpenseCategory {
  TRAVEL = 'travel',
  SUPPLIES = 'supplies',
  EQUIPMENT = 'equipment',
  TRAINING = 'training',
  OTHER = 'other',
}

// Legacy constant exports for backward compatibility
export const USER_ROLES = Object.values(UserRole);
export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);
export const EXPENSE_STATUSES = Object.values(ExpenseStatus);
export const TASK_STATUSES = Object.values(TaskStatus);
export const PROJECT_STATUSES = Object.values(ProjectStatus);
