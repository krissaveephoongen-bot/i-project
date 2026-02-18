/**
 * Database Enumerated Types
 * 
 * This file contains all enumerated types used across the application.
 * These enums are synchronized between:
 * - PostgreSQL database enums
 * - Prisma schema (prisma/schema.prisma)
 * - Drizzle ORM schema (backend/lib/schema.ts)
 * - TypeScript types (frontend and backend)
 * 
 * When adding new enums, ensure they are:
 * 1. Added to this file
 * 2. Added to Prisma schema
 * 3. Added to Drizzle schema
 * 4. A migration is created for PostgreSQL
 */

// ============================================================
// USER RELATED ENUMS
// ============================================================

/**
 * User roles for access control
 * @see backend/src/features/auth/schemas/authSchemas.ts
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VENDOR = 'vendor',
  PROJECT_MANAGER = 'project_manager',
}

export const USER_ROLES = Object.values(UserRole);

/**
 * User account status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export const USER_STATUSES = Object.values(UserStatus);

// ============================================================
// PROJECT RELATED ENUMS
// ============================================================

/**
 * Project status lifecycle
 * @see backend/src/features/projects/schemas/projectSchemas.ts
 * Note: API uses both 'todo'/'in_progress' and 'planning'/'active' conventions
 */
export enum ProjectStatus {
  // API convention
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  // Database convention
  PLANNING = 'planning',
  ON_HOLD = 'onHold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const PROJECT_STATUSES = Object.values(ProjectStatus);

/**
 * Project priority levels
 */
export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export const PROJECT_PRIORITIES = Object.values(ProjectPriority);

/**
 * Project risk levels
 */
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export const RISK_LEVELS = Object.values(RiskLevel);

// ============================================================
// TASK RELATED ENUMS
// ============================================================

/**
 * Task status workflow
 * @see backend/src/features/tasks/schemas/taskSchemas.ts
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled',
  INACTIVE = 'inactive',
}

export const TASK_STATUSES = Object.values(TaskStatus);

/**
 * Task priority levels
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export const TASK_PRIORITIES = Object.values(TaskPriority);

/**
 * Task categories for classification
 */
export enum TaskCategory {
  DEVELOPMENT = 'development',
  DESIGN = 'design',
  TESTING = 'testing',
  DOCUMENTATION = 'documentation',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

export const TASK_CATEGORIES = Object.values(TaskCategory);

// ============================================================
// TIMESHEET & TIME ENTRY ENUMS
// ============================================================

/**
 * Work type for time entries
 */
export enum WorkType {
  PROJECT = 'project',      // Billable project work
  OFFICE = 'office',        // Office/admin work
  TRAINING = 'training',    // Professional development
  LEAVE = 'leave',          // Approved leave
  OVERTIME = 'overtime',    // Overtime work
  OTHER = 'other',          // Other work
}

export const WORK_TYPES = Object.values(WorkType);

/**
 * Time entry approval status
 */
export enum TimeEntryStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const TIME_ENTRY_STATUSES = Object.values(TimeEntryStatus);

// ============================================================
// LEAVE MANAGEMENT ENUMS
// ============================================================

/**
 * Leave types available for employees
 */
export enum LeaveType {
  ANNUAL = 'annual',        // Annual vacation leave
  SICK = 'sick',            // Sick leave
  PERSONAL = 'personal',    // Personal leave
  MATERNITY = 'maternity',  // Maternity leave
  UNPAID = 'unpaid',        // Unpaid leave
}

export const LEAVE_TYPES = Object.values(LeaveType);

/**
 * Leave request status
 */
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export const LEAVE_STATUSES = Object.values(LeaveStatus);

// ============================================================
// EXPENSE ENUMS
// ============================================================

/**
 * Expense categories
 */
export enum ExpenseCategory {
  TRAVEL = 'travel',
  SUPPLIES = 'supplies',
  EQUIPMENT = 'equipment',
  TRAINING = 'training',
  OTHER = 'other',
}

export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

/**
 * Expense approval status
 */
export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REIMBURSED = 'reimbursed',
}

export const EXPENSE_STATUSES = Object.values(ExpenseStatus);

/**
 * Payment methods for expenses
 */
export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  OTHER = 'other',
}

export const PAYMENT_METHODS = Object.values(PaymentMethod);

// ============================================================
// CLIENT ENUMS
// ============================================================

/**
 * Client status
 */
export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export const CLIENT_STATUSES = Object.values(ClientStatus);

/**
 * Client types
 */
export enum ClientType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  GOVERNMENT = 'government',
}

export const CLIENT_TYPES = Object.values(ClientType);

// ============================================================
// SALES ENUMS
// ============================================================

/**
 * Sales deal status
 */
export enum SalesStatus {
  PROSPECT = 'prospect',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export const SALES_STATUSES = Object.values(SalesStatus);

/**
 * Sales pipeline stages
 */
export enum SalesStage {
  LEAD = 'lead',
  CONTACT = 'contact',
  MEETING = 'meeting',
  DEMO = 'demo',
  PROPOSAL = 'proposal',
  CONTRACT = 'contract',
  WON = 'won',
  LOST = 'lost',
}

export const SALES_STAGES = Object.values(SalesStage);

// ============================================================
// STAKEHOLDER ENUMS
// ============================================================

/**
 * Stakeholder roles
 */
export enum StakeholderRole {
  EXECUTIVE = 'executive',
  MANAGER = 'manager',
  TEAM_MEMBER = 'team_member',
  CLIENT = 'client',
  VENDOR = 'vendor',
  CONSULTANT = 'consultant',
  OTHER = 'other',
}

export const STAKEHOLDER_ROLES = Object.values(StakeholderRole);

/**
 * Stakeholder types
 */
export enum StakeholderType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  PARTNER = 'partner',
}

export const STAKEHOLDER_TYPES = Object.values(StakeholderType);

/**
 * Stakeholder involvement levels
 */
export enum InvolvementLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  MINIMAL = 'minimal',
}

export const INVOLVEMENT_LEVELS = Object.values(InvolvementLevel);

// ============================================================
// RESOURCE ENUMS
// ============================================================

/**
 * Resource types
 */
export enum ResourceType {
  HUMAN = 'human',
  EQUIPMENT = 'equipment',
  MATERIAL = 'material',
  SOFTWARE = 'software',
  FACILITY = 'facility',
  OTHER = 'other',
}

export const RESOURCE_TYPES = Object.values(ResourceType);

/**
 * Resource status
 */
export enum ResourceStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
  ARCHIVED = 'archived',
}

export const RESOURCE_STATUSES = Object.values(ResourceStatus);

/**
 * Resource allocation status
 */
export enum AllocationStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  ALLOCATED = 'allocated',
  DEALLOCATED = 'deallocated',
  REJECTED = 'rejected',
}

export const ALLOCATION_STATUSES = Object.values(AllocationStatus);

// ============================================================
// AUDIT & ACTIVITY ENUMS
// ============================================================

/**
 * Activity log types
 */
export enum ActivityType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  COMMENT = 'comment',
  ASSIGN = 'assign',
  STATUS_CHANGE = 'status_change',
}

export const ACTIVITY_TYPES = Object.values(ActivityType);

/**
 * Audit event types
 */
export enum AuditEventType {
  // Authentication events
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',
  
  // User management events
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_ROLE_CHANGE = 'user_role_change',
  
  // Project events
  PROJECT_CREATE = 'project_create',
  PROJECT_UPDATE = 'project_update',
  PROJECT_DELETE = 'project_delete',
  PROJECT_STATUS_CHANGE = 'project_status_change',
  
  // Task events
  TASK_CREATE = 'task_create',
  TASK_UPDATE = 'task_update',
  TASK_DELETE = 'task_delete',
  TASK_ASSIGN = 'task_assign',
  
  // Data events
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  DATA_BULK_DELETE = 'data_bulk_delete',
  
  // System events
  SYSTEM_CONFIG_CHANGE = 'system_config_change',
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',
}

export const AUDIT_EVENT_TYPES = Object.values(AuditEventType);

/**
 * Audit severity levels
 */
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export const AUDIT_SEVERITIES = Object.values(AuditSeverity);

// ============================================================
// MILESTONE ENUMS
// ============================================================

/**
 * Milestone status
 */
export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const MILESTONE_STATUSES = Object.values(MilestoneStatus);

// ============================================================
// RISK ENUMS
// ============================================================

/**
 * Risk impact levels
 */
export enum RiskImpact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export const RISK_IMPACTS = Object.values(RiskImpact);

/**
 * Risk probability levels
 */
export enum RiskProbability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export const RISK_PROBABILITIES = Object.values(RiskProbability);

/**
 * Risk status
 */
export enum RiskStatus {
  OPEN = 'open',
  MITIGATED = 'mitigated',
  CLOSED = 'closed',
  ACCEPTED = 'accepted',
}

export const RISK_STATUSES = Object.values(RiskStatus);

// ============================================================
// GENERIC STATUS ENUM (for backward compatibility)
// ============================================================

/**
 * Generic status enum used across multiple entities
 * This is a superset of statuses for backward compatibility
 */
export enum Status {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export const STATUSES = Object.values(Status);

// ============================================================
// TYPE EXPORTS
// ============================================================

export type UserRoleType = typeof UserRole[keyof typeof UserRole];
export type UserStatusType = typeof UserStatus[keyof typeof UserStatus];
export type ProjectStatusType = typeof ProjectStatus[keyof typeof ProjectStatus];
export type ProjectPriorityType = typeof ProjectPriority[keyof typeof ProjectPriority];
export type RiskLevelType = typeof RiskLevel[keyof typeof RiskLevel];
export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];
export type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority];
export type TaskCategoryType = typeof TaskCategory[keyof typeof TaskCategory];
export type WorkTypeType = typeof WorkType[keyof typeof WorkType];
export type TimeEntryStatusType = typeof TimeEntryStatus[keyof typeof TimeEntryStatus];
export type LeaveTypeType = typeof LeaveType[keyof typeof LeaveType];
export type LeaveStatusType = typeof LeaveStatus[keyof typeof LeaveStatus];
export type ExpenseCategoryType = typeof ExpenseCategory[keyof typeof ExpenseCategory];
export type ExpenseStatusType = typeof ExpenseStatus[keyof typeof ExpenseStatus];
export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];
export type ClientStatusType = typeof ClientStatus[keyof typeof ClientStatus];
export type ClientTypeType = typeof ClientType[keyof typeof ClientType];
export type SalesStatusType = typeof SalesStatus[keyof typeof SalesStatus];
export type SalesStageType = typeof SalesStage[keyof typeof SalesStage];
export type StakeholderRoleType = typeof StakeholderRole[keyof typeof StakeholderRole];
export type StakeholderTypeType = typeof StakeholderType[keyof typeof StakeholderType];
export type InvolvementLevelType = typeof InvolvementLevel[keyof typeof InvolvementLevel];
export type ResourceTypeType = typeof ResourceType[keyof typeof ResourceType];
export type ResourceStatusType = typeof ResourceStatus[keyof typeof ResourceStatus];
export type AllocationStatusType = typeof AllocationStatus[keyof typeof AllocationStatus];
export type ActivityTypeType = typeof ActivityType[keyof typeof ActivityType];
export type AuditEventTypeType = typeof AuditEventType[keyof typeof AuditEventType];
export type AuditSeverityType = typeof AuditSeverity[keyof typeof AuditSeverity];
export type MilestoneStatusType = typeof MilestoneStatus[keyof typeof MilestoneStatus];
export type RiskImpactType = typeof RiskImpact[keyof typeof RiskImpact];
export type RiskProbabilityType = typeof RiskProbability[keyof typeof RiskProbability];
export type RiskStatusType = typeof RiskStatus[keyof typeof RiskStatus];
export type StatusType = typeof Status[keyof typeof Status];

// ============================================================
// LABEL FUNCTIONS (for UI display)
// ============================================================

/**
 * Get display label for task status
 */
export function getTaskStatusLabel(status: TaskStatusType, lang: 'en' | 'th' = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [TaskStatus.TODO]: 'To Do',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.IN_REVIEW]: 'In Review',
      [TaskStatus.DONE]: 'Done',
      [TaskStatus.CANCELLED]: 'Cancelled',
      [TaskStatus.INACTIVE]: 'Inactive',
    },
    th: {
      [TaskStatus.TODO]: 'รอดำเนินการ',
      [TaskStatus.IN_PROGRESS]: 'กำลังดำเนินการ',
      [TaskStatus.IN_REVIEW]: 'รอตรวจสอบ',
      [TaskStatus.DONE]: 'เสร็จสิ้น',
      [TaskStatus.CANCELLED]: 'ยกเลิก',
      [TaskStatus.INACTIVE]: 'ไม่ใช้งาน',
    },
  };
  return labels[lang]?.[status] ?? status;
}

/**
 * Get display label for project status
 */
export function getProjectStatusLabel(status: ProjectStatusType, lang: 'en' | 'th' = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [ProjectStatus.TODO]: 'To Do',
      [ProjectStatus.IN_PROGRESS]: 'In Progress',
      [ProjectStatus.IN_REVIEW]: 'In Review',
      [ProjectStatus.DONE]: 'Done',
      [ProjectStatus.ACTIVE]: 'Active',
      [ProjectStatus.INACTIVE]: 'Inactive',
      [ProjectStatus.PLANNING]: 'Planning',
      [ProjectStatus.ON_HOLD]: 'On Hold',
      [ProjectStatus.COMPLETED]: 'Completed',
      [ProjectStatus.CANCELLED]: 'Cancelled',
    },
    th: {
      [ProjectStatus.TODO]: 'รอดำเนินการ',
      [ProjectStatus.IN_PROGRESS]: 'กำลังดำเนินการ',
      [ProjectStatus.IN_REVIEW]: 'รอตรวจสอบ',
      [ProjectStatus.DONE]: 'เสร็จสิ้น',
      [ProjectStatus.ACTIVE]: 'ใช้งาน',
      [ProjectStatus.INACTIVE]: 'ไม่ใช้งาน',
      [ProjectStatus.PLANNING]: 'วางแผน',
      [ProjectStatus.ON_HOLD]: 'ระงับชั่วคราว',
      [ProjectStatus.COMPLETED]: 'เสร็จสิ้น',
      [ProjectStatus.CANCELLED]: 'ยกเลิก',
    },
  };
  return labels[lang]?.[status] ?? status;
}

/**
 * Get display label for priority
 */
export function getPriorityLabel(priority: TaskPriorityType | ProjectPriorityType, lang: 'en' | 'th' = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [TaskPriority.LOW]: 'Low',
      [TaskPriority.MEDIUM]: 'Medium',
      [TaskPriority.HIGH]: 'High',
      [TaskPriority.URGENT]: 'Urgent',
    },
    th: {
      [TaskPriority.LOW]: 'ต่ำ',
      [TaskPriority.MEDIUM]: 'ปานกลาง',
      [TaskPriority.HIGH]: 'สูง',
      [TaskPriority.URGENT]: 'เร่งด่วน',
    },
  };
  return labels[lang]?.[priority] ?? priority;
}

/**
 * Get display label for work type
 */
export function getWorkTypeLabel(workType: WorkTypeType, lang: 'en' | 'th' = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [WorkType.PROJECT]: 'Project Work',
      [WorkType.OFFICE]: 'Office Work',
      [WorkType.TRAINING]: 'Training',
      [WorkType.LEAVE]: 'Leave',
      [WorkType.OVERTIME]: 'Overtime',
      [WorkType.OTHER]: 'Other',
    },
    th: {
      [WorkType.PROJECT]: 'งานโครงการ',
      [WorkType.OFFICE]: 'งานสำนักงาน',
      [WorkType.TRAINING]: 'อบรม',
      [WorkType.LEAVE]: 'ลางาน',
      [WorkType.OVERTIME]: 'ล่วงเวลา',
      [WorkType.OTHER]: 'อื่นๆ',
    },
  };
  return labels[lang]?.[workType] ?? workType;
}

/**
 * Get display label for leave type
 */
export function getLeaveTypeLabel(leaveType: LeaveTypeType, lang: 'en' | 'th' = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [LeaveType.ANNUAL]: 'Annual Leave',
      [LeaveType.SICK]: 'Sick Leave',
      [LeaveType.PERSONAL]: 'Personal Leave',
      [LeaveType.MATERNITY]: 'Maternity Leave',
      [LeaveType.UNPAID]: 'Unpaid Leave',
    },
    th: {
      [LeaveType.ANNUAL]: 'ลาพักร้อน',
      [LeaveType.SICK]: 'ลาป่วย',
      [LeaveType.PERSONAL]: 'ลากิจ',
      [LeaveType.MATERNITY]: 'ลาคลอด',
      [LeaveType.UNPAID]: 'ลาไม่รับเงิน',
    },
  };
  return labels[lang]?.[leaveType] ?? leaveType;
}

/**
 * Get display label for expense status
 */
export function getExpenseStatusLabel(status: ExpenseStatusType, lang: 'en' | 'th' = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [ExpenseStatus.PENDING]: 'Pending',
      [ExpenseStatus.APPROVED]: 'Approved',
      [ExpenseStatus.REJECTED]: 'Rejected',
      [ExpenseStatus.REIMBURSED]: 'Reimbursed',
    },
    th: {
      [ExpenseStatus.PENDING]: 'รออนุมัติ',
      [ExpenseStatus.APPROVED]: 'อนุมัติแล้ว',
      [ExpenseStatus.REJECTED]: 'ปฏิเสธ',
      [ExpenseStatus.REIMBURSED]: 'เบิกคืนแล้ว',
    },
  };
  return labels[lang]?.[status] ?? status;
}

/**
 * Get display label for user role
 */
export function getUserRoleLabel(role: UserRoleType, lang: 'en' | 'th' = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.MANAGER]: 'Manager',
      [UserRole.EMPLOYEE]: 'Employee',
      [UserRole.VENDOR]: 'Vendor',
      [UserRole.PROJECT_MANAGER]: 'Project Manager',
    },
    th: {
      [UserRole.ADMIN]: 'ผู้ดูแลระบบ',
      [UserRole.MANAGER]: 'ผู้จัดการ',
      [UserRole.EMPLOYEE]: 'พนักงาน',
      [UserRole.VENDOR]: 'ผู้ขาย',
      [UserRole.PROJECT_MANAGER]: 'ผู้จัดการโครงการ',
    },
  };
  return labels[lang]?.[role] ?? role;
}