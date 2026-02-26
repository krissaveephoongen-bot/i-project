// Enterprise Audit Logging System

export enum AuditEventType {
  // Authentication events
  LOGIN = "login",
  LOGOUT = "logout",
  LOGIN_FAILED = "login_failed",
  PASSWORD_RESET = "password_reset",

  // Project events
  PROJECT_CREATED = "project_created",
  PROJECT_UPDATED = "project_updated",
  PROJECT_DELETED = "project_deleted",
  PROJECT_STATUS_CHANGED = "project_status_changed",

  // Task events
  TASK_CREATED = "task_created",
  TASK_UPDATED = "task_updated",
  TASK_DELETED = "task_deleted",
  TASK_ASSIGNED = "task_assigned",
  TASK_STATUS_CHANGED = "task_status_changed",

  // Time tracking events
  TIMESHEET_CREATED = "timesheet_created",
  TIMESHEET_UPDATED = "timesheet_updated",
  TIMESHEET_APPROVED = "timesheet_approved",
  TIMESHEET_REJECTED = "timesheet_rejected",

  // Expense events
  EXPENSE_CREATED = "expense_created",
  EXPENSE_UPDATED = "expense_updated",
  EXPENSE_APPROVED = "expense_approved",
  EXPENSE_REJECTED = "expense_rejected",

  // User management events
  USER_CREATED = "user_created",
  USER_UPDATED = "user_updated",
  USER_DELETED = "user_deleted",
  USER_ROLE_CHANGED = "user_role_changed",

  // System events
  SYSTEM_CONFIG_CHANGED = "system_config_changed",
  PERMISSION_CHANGED = "permission_changed",
  DATA_EXPORTED = "data_exported",
}

export enum AuditSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  resourceType: string;
  resourceId: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AuditLogFilter {
  userId?: string;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  resourceType?: string;
  resourceId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

// Audit logging functions
export function createAuditLog(
  userId: string,
  userName: string,
  userRole: string,
  eventType: AuditEventType,
  severity: AuditSeverity,
  resourceType: string,
  resourceId: string,
  action: string,
  description: string,
  changes?: Record<string, any>,
  metadata?: Record<string, any>,
): AuditLogEntry {
  return {
    id: generateAuditId(),
    timestamp: new Date(),
    userId,
    userName,
    userRole,
    eventType,
    severity,
    resourceType,
    resourceId,
    action,
    description,
    changes,
    metadata,
  };
}

// Helper function to generate unique audit log IDs
function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Audit event type labels
export const AUDIT_EVENT_LABELS: Record<AuditEventType, string> = {
  [AuditEventType.LOGIN]: "User Login",
  [AuditEventType.LOGOUT]: "User Logout",
  [AuditEventType.LOGIN_FAILED]: "Login Failed",
  [AuditEventType.PASSWORD_RESET]: "Password Reset",
  [AuditEventType.PROJECT_CREATED]: "Project Created",
  [AuditEventType.PROJECT_UPDATED]: "Project Updated",
  [AuditEventType.PROJECT_DELETED]: "Project Deleted",
  [AuditEventType.PROJECT_STATUS_CHANGED]: "Project Status Changed",
  [AuditEventType.TASK_CREATED]: "Task Created",
  [AuditEventType.TASK_UPDATED]: "Task Updated",
  [AuditEventType.TASK_DELETED]: "Task Deleted",
  [AuditEventType.TASK_ASSIGNED]: "Task Assigned",
  [AuditEventType.TASK_STATUS_CHANGED]: "Task Status Changed",
  [AuditEventType.TIMESHEET_CREATED]: "Timesheet Created",
  [AuditEventType.TIMESHEET_UPDATED]: "Timesheet Updated",
  [AuditEventType.TIMESHEET_APPROVED]: "Timesheet Approved",
  [AuditEventType.TIMESHEET_REJECTED]: "Timesheet Rejected",
  [AuditEventType.EXPENSE_CREATED]: "Expense Created",
  [AuditEventType.EXPENSE_UPDATED]: "Expense Updated",
  [AuditEventType.EXPENSE_APPROVED]: "Expense Approved",
  [AuditEventType.EXPENSE_REJECTED]: "Expense Rejected",
  [AuditEventType.USER_CREATED]: "User Created",
  [AuditEventType.USER_UPDATED]: "User Updated",
  [AuditEventType.USER_DELETED]: "User Deleted",
  [AuditEventType.USER_ROLE_CHANGED]: "User Role Changed",
  [AuditEventType.SYSTEM_CONFIG_CHANGED]: "System Configuration Changed",
  [AuditEventType.PERMISSION_CHANGED]: "Permission Changed",
  [AuditEventType.DATA_EXPORTED]: "Data Exported",
};

// Severity colors for UI
export const AUDIT_SEVERITY_COLORS: Record<AuditSeverity, string> = {
  [AuditSeverity.LOW]: "text-blue-600 bg-blue-100",
  [AuditSeverity.MEDIUM]: "text-yellow-600 bg-yellow-100",
  [AuditSeverity.HIGH]: "text-orange-600 bg-orange-100",
  [AuditSeverity.CRITICAL]: "text-red-600 bg-red-100",
};

// Common audit logging helper functions
export function logUserAction(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  description: string,
  severity: AuditSeverity = AuditSeverity.LOW,
  metadata?: Record<string, any>,
): AuditLogEntry {
  return createAuditLog(
    userId,
    userName,
    userRole,
    AuditEventType.USER_UPDATED,
    severity,
    "user",
    userId,
    action,
    description,
    undefined,
    metadata,
  );
}

export function logProjectAction(
  userId: string,
  userName: string,
  userRole: string,
  projectId: string,
  action: string,
  description: string,
  changes?: Record<string, any>,
  severity: AuditSeverity = AuditSeverity.MEDIUM,
): AuditLogEntry {
  const eventType = getProjectEventType(action);
  return createAuditLog(
    userId,
    userName,
    userRole,
    eventType,
    severity,
    "project",
    projectId,
    action,
    description,
    changes,
  );
}

export function logTaskAction(
  userId: string,
  userName: string,
  userRole: string,
  taskId: string,
  action: string,
  description: string,
  changes?: Record<string, any>,
  severity: AuditSeverity = AuditSeverity.MEDIUM,
): AuditLogEntry {
  const eventType = getTaskEventType(action);
  return createAuditLog(
    userId,
    userName,
    userRole,
    eventType,
    severity,
    "task",
    taskId,
    action,
    description,
    changes,
  );
}

export function logSecurityEvent(
  userId: string,
  userName: string,
  userRole: string,
  eventType: AuditEventType,
  description: string,
  severity: AuditSeverity = AuditSeverity.HIGH,
  metadata?: Record<string, any>,
): AuditLogEntry {
  return createAuditLog(
    userId,
    userName,
    userRole,
    eventType,
    severity,
    "security",
    userId,
    "security_event",
    description,
    undefined,
    metadata,
  );
}

// Helper functions to map actions to event types
function getProjectEventType(action: string): AuditEventType {
  switch (action.toLowerCase()) {
    case "create":
    case "created":
      return AuditEventType.PROJECT_CREATED;
    case "update":
    case "updated":
      return AuditEventType.PROJECT_UPDATED;
    case "delete":
    case "deleted":
      return AuditEventType.PROJECT_DELETED;
    case "status_change":
      return AuditEventType.PROJECT_STATUS_CHANGED;
    default:
      return AuditEventType.PROJECT_UPDATED;
  }
}

function getTaskEventType(action: string): AuditEventType {
  switch (action.toLowerCase()) {
    case "create":
    case "created":
      return AuditEventType.TASK_CREATED;
    case "update":
    case "updated":
      return AuditEventType.TASK_UPDATED;
    case "delete":
    case "deleted":
      return AuditEventType.TASK_DELETED;
    case "assign":
    case "assigned":
      return AuditEventType.TASK_ASSIGNED;
    case "status_change":
      return AuditEventType.TASK_STATUS_CHANGED;
    default:
      return AuditEventType.TASK_UPDATED;
  }
}

// Audit log storage interface (to be implemented with actual database)
export interface AuditLogStorage {
  store(entry: AuditLogEntry): Promise<void>;
  query(filter: AuditLogFilter): Promise<AuditLogEntry[]>;
  getById(id: string): Promise<AuditLogEntry | null>;
  getRecent(limit: number): Promise<AuditLogEntry[]>;
}

// Compliance helpers
export function requiresRetention(entry: AuditLogEntry): boolean {
  // Critical security events and user management should be retained longer
  return [
    AuditEventType.LOGIN_FAILED,
    AuditEventType.USER_CREATED,
    AuditEventType.USER_DELETED,
    AuditEventType.USER_ROLE_CHANGED,
    AuditEventType.PERMISSION_CHANGED,
    AuditEventType.SYSTEM_CONFIG_CHANGED,
  ].includes(entry.eventType);
}

export function getRetentionPeriod(entry: AuditLogEntry): number {
  // Return retention period in days
  if (requiresRetention(entry)) {
    return 2555; // 7 years for compliance
  }
  return 365; // 1 year for regular logs
}
