/**
 * Enum Constants - Aligned with API Validation Schemas
 * 
 * This file contains all enum values used across the application.
 * Values are extracted from actual API validation schemas and route handlers.
 * 
 * @module backend/lib/enums/constants
 */

// ============================================================
// USER & AUTHENTICATION ENUMS
// ============================================================

/**
 * User roles - used in auth schemas and user management
 * @see backend/src/features/auth/schemas/authSchemas.ts
 */
export const USER_ROLES = ['admin', 'manager', 'employee', 'vendor', 'project_manager'] as const;
export type UserRole = typeof USER_ROLES[number];

/**
 * User status - used in user routes and team management
 * @see backend/routes/user-routes.js
 */
export const USER_STATUSES = ['active', 'inactive', 'locked'] as const;
export type UserStatus = typeof USER_STATUSES[number];

// ============================================================
// TASK ENUMS
// ============================================================

/**
 * Task status - used in task schemas and routes
 * @see backend/src/features/tasks/schemas/taskSchemas.ts
 */
export const TASK_STATUSES = ['todo', 'in_progress', 'in_review', 'done', 'cancelled', 'inactive'] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

/**
 * Task priority - used in task schemas
 * @see backend/src/features/tasks/schemas/taskSchemas.ts
 */
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

/**
 * Task category - used in task filtering and reporting
 */
export const TASK_CATEGORIES = ['development', 'design', 'testing', 'documentation', 'maintenance', 'other'] as const;
export type TaskCategory = typeof TASK_CATEGORIES[number];

// ============================================================
// PROJECT ENUMS
// ============================================================

/**
 * Project status - used in project schemas and routes
 * @see backend/src/features/projects/schemas/projectSchemas.ts
 * Note: API uses 'todo', 'in_progress', 'in_review', 'done', 'active', 'inactive'
 * Database uses 'planning', 'active', 'onHold', 'completed', 'cancelled'
 * This mapping aligns both
 */
export const PROJECT_STATUSES = ['todo', 'in_progress', 'in_review', 'done', 'active', 'inactive', 'planning', 'onHold', 'completed', 'cancelled'] as const;
export type ProjectStatus = typeof PROJECT_STATUSES[number];

/**
 * Project priority - used in project schemas
 * @see backend/src/features/projects/schemas/projectSchemas.ts
 */
export const PROJECT_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type ProjectPriority = typeof PROJECT_PRIORITIES[number];

// ============================================================
// TIMESHEET & TIME ENTRY ENUMS
// ============================================================

/**
 * Time entry status - used in timesheet routes
 * @see backend/routes/timesheets-routes.js
 */
export const TIME_ENTRY_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type TimeEntryStatus = typeof TIME_ENTRY_STATUSES[number];

/**
 * Work type - used in timesheet validation
 * @see backend/src/features/timesheet/timesheet.validation.ts
 */
export const WORK_TYPES = ['project', 'office', 'training', 'leave', 'overtime', 'other'] as const;
export type WorkType = typeof WORK_TYPES[number];

// ============================================================
// LEAVE MANAGEMENT ENUMS
// ============================================================

/**
 * Leave type - used in leave request validation
 * @see backend/src/features/timesheet/timesheet.validation.ts
 */
export const LEAVE_TYPES = ['annual', 'sick', 'personal', 'maternity', 'unpaid'] as const;
export type LeaveType = typeof LEAVE_TYPES[number];

/**
 * Leave status - used in leave management
 */
export const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const;
export type LeaveStatus = typeof LEAVE_STATUSES[number];

// ============================================================
// EXPENSE ENUMS
// ============================================================

/**
 * Expense status - used in expense schemas
 * @see backend/src/features/expenses/schemas/expenseSchemas.ts
 */
export const EXPENSE_STATUSES = ['pending', 'approved', 'rejected', 'reimbursed'] as const;
export type ExpenseStatus = typeof EXPENSE_STATUSES[number];

/**
 * Expense category - used in expense schemas
 * @see backend/src/features/expenses/schemas/expenseSchemas.ts
 */
export const EXPENSE_CATEGORIES = ['travel', 'supplies', 'equipment', 'training', 'other'] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

/**
 * Payment method - used in expense processing
 */
export const PAYMENT_METHODS = ['cash', 'credit_card', 'bank_transfer', 'check', 'other'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

// ============================================================
// CLIENT ENUMS
// ============================================================

/**
 * Client status - used in client management
 */
export const CLIENT_STATUSES = ['active', 'inactive', 'archived'] as const;
export type ClientStatus = typeof CLIENT_STATUSES[number];

/**
 * Client type - used in client classification
 */
export const CLIENT_TYPES = ['individual', 'company', 'government'] as const;
export type ClientType = typeof CLIENT_TYPES[number];

// ============================================================
// RISK MANAGEMENT ENUMS
// ============================================================

/**
 * Risk status - used in risk tracking
 */
export const RISK_STATUSES = ['open', 'mitigated', 'closed', 'accepted'] as const;
export type RiskStatus = typeof RISK_STATUSES[number];

/**
 * Risk level - used in risk assessment
 */
export const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export type RiskLevel = typeof RISK_LEVELS[number];

/**
 * Risk probability - used in risk analysis
 */
export const RISK_PROBABILITIES = ['low', 'medium', 'high', 'very_high'] as const;
export type RiskProbability = typeof RISK_PROBABILITIES[number];

/**
 * Risk impact - used in risk evaluation
 */
export const RISK_IMPACTS = ['low', 'medium', 'high', 'critical'] as const;
export type RiskImpact = typeof RISK_IMPACTS[number];

// ============================================================
// SALES & CRM ENUMS
// ============================================================

/**
 * Sales status - used in sales pipeline
 */
export const SALES_STATUSES = ['prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;
export type SalesStatus = typeof SALES_STATUSES[number];

/**
 * Sales stage - used in sales funnel
 */
export const SALES_STAGES = ['lead', 'contact', 'meeting', 'demo', 'proposal', 'contract', 'won', 'lost'] as const;
export type SalesStage = typeof SALES_STAGES[number];

// ============================================================
// RESOURCE MANAGEMENT ENUMS
// ============================================================

/**
 * Resource type - used in resource allocation
 */
export const RESOURCE_TYPES = ['human', 'equipment', 'material', 'software', 'facility', 'other'] as const;
export type ResourceType = typeof RESOURCE_TYPES[number];

/**
 * Resource status - used in resource tracking
 */
export const RESOURCE_STATUSES = ['available', 'in_use', 'maintenance', 'retired', 'archived'] as const;
export type ResourceStatus = typeof RESOURCE_STATUSES[number];

/**
 * Allocation status - used in resource allocation
 */
export const ALLOCATION_STATUSES = ['requested', 'approved', 'allocated', 'deallocated', 'rejected'] as const;
export type AllocationStatus = typeof ALLOCATION_STATUSES[number];

// ============================================================
// STAKEHOLDER ENUMS
// ============================================================

/**
 * Stakeholder type - used in stakeholder management
 */
export const STAKEHOLDER_TYPES = ['internal', 'external', 'partner'] as const;
export type StakeholderType = typeof STAKEHOLDER_TYPES[number];

/**
 * Stakeholder role - used in stakeholder identification
 */
export const STAKEHOLDER_ROLES = ['executive', 'manager', 'team_member', 'client', 'vendor', 'consultant', 'other'] as const;
export type StakeholderRole = typeof STAKEHOLDER_ROLES[number];

/**
 * Involvement level - used in stakeholder analysis
 */
export const INVOLVEMENT_LEVELS = ['high', 'medium', 'low', 'minimal'] as const;
export type InvolvementLevel = typeof INVOLVEMENT_LEVELS[number];

// ============================================================
// MILESTONE ENUMS
// ============================================================

/**
 * Milestone status - used in project milestones
 */
export const MILESTONE_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
export type MilestoneStatus = typeof MILESTONE_STATUSES[number];

// ============================================================
// ACTIVITY & AUDIT ENUMS
// ============================================================

/**
 * Activity type - used in activity logging
 */
export const ACTIVITY_TYPES = ['create', 'update', 'delete', 'comment', 'assign', 'status_change'] as const;
export type ActivityType = typeof ACTIVITY_TYPES[number];

/**
 * Audit severity - used in audit logging
 */
export const AUDIT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export type AuditSeverity = typeof AUDIT_SEVERITIES[number];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if a value is a valid enum value
 */
export function isValidEnumValue<T extends string>(value: string, enumValues: readonly T[]): value is T {
  return enumValues.includes(value as T);
}

/**
 * Get enum values as an array
 */
export function getEnumValues<T extends string>(enumValues: readonly T[]): T[] {
  return [...enumValues];
}

/**
 * Create a validation function for an enum
 */
export function createEnumValidator<T extends string>(enumValues: readonly T[]) {
  return (value: string): value is T => isValidEnumValue(value, enumValues);
}

// ============================================================
// VALIDATION HELPERS FOR JOI
// ============================================================

/**
 * Get valid values for Joi validation
 * Usage: Joi.string().valid(...getJoiValidValues(TASK_STATUSES))
 */
export function getJoiValidValues<T extends string>(enumValues: readonly T[]): T[] {
  return [...enumValues];
}

// ============================================================
// STATUS MAPPING (API to Database)
// ============================================================

/**
 * Map API project status to database project status
 */
export const PROJECT_STATUS_API_TO_DB: Record<string, string> = {
  'todo': 'planning',
  'in_progress': 'active',
  'in_review': 'active',
  'done': 'completed',
  'active': 'active',
  'inactive': 'cancelled',
  'planning': 'planning',
  'onHold': 'onHold',
  'completed': 'completed',
  'cancelled': 'cancelled',
};

/**
 * Map database project status to API project status
 */
export const PROJECT_STATUS_DB_TO_API: Record<string, string> = {
  'planning': 'todo',
  'active': 'in_progress',
  'onHold': 'onHold',
  'completed': 'done',
  'cancelled': 'cancelled',
};