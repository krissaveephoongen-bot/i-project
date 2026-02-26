// Enterprise Role-Based Access Control (RBAC) System

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  EMPLOYEE = "employee",
  VIEWER = "viewer",
}

export enum Permission {
  // Project permissions
  PROJECT_CREATE = "project:create",
  PROJECT_READ = "project:read",
  PROJECT_UPDATE = "project:update",
  PROJECT_DELETE = "project:delete",
  PROJECT_MANAGE = "project:manage",

  // Task permissions
  TASK_CREATE = "task:create",
  TASK_READ = "task:read",
  TASK_UPDATE = "task:update",
  TASK_DELETE = "task:delete",
  TASK_ASSIGN = "task:assign",

  // Time tracking permissions
  TIMESHEET_CREATE = "timesheet:create",
  TIMESHEET_READ = "timesheet:read",
  TIMESHEET_UPDATE = "timesheet:update",
  TIMESHEET_APPROVE = "timesheet:approve",

  // Expense permissions
  EXPENSE_CREATE = "expense:create",
  EXPENSE_READ = "expense:read",
  EXPENSE_UPDATE = "expense:update",
  EXPENSE_APPROVE = "expense:approve",

  // User management permissions
  USER_CREATE = "user:create",
  USER_READ = "user:read",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",

  // Report permissions
  REPORT_READ = "report:read",
  REPORT_EXPORT = "report:export",
  REPORT_ADMIN = "report:admin",

  // System permissions
  SYSTEM_CONFIG = "system:config",
  AUDIT_READ = "audit:read",
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // All permissions
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_MANAGE,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
    Permission.TIMESHEET_CREATE,
    Permission.TIMESHEET_READ,
    Permission.TIMESHEET_UPDATE,
    Permission.TIMESHEET_APPROVE,
    Permission.EXPENSE_CREATE,
    Permission.EXPENSE_READ,
    Permission.EXPENSE_UPDATE,
    Permission.EXPENSE_APPROVE,
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.REPORT_READ,
    Permission.REPORT_EXPORT,
    Permission.REPORT_ADMIN,
    Permission.SYSTEM_CONFIG,
    Permission.AUDIT_READ,
  ],
  [UserRole.MANAGER]: [
    // Project management
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_MANAGE,
    // Task management
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_ASSIGN,
    // Time and expense approval
    Permission.TIMESHEET_READ,
    Permission.TIMESHEET_APPROVE,
    Permission.EXPENSE_READ,
    Permission.EXPENSE_APPROVE,
    // Limited user management
    Permission.USER_READ,
    // Reports
    Permission.REPORT_READ,
    Permission.REPORT_EXPORT,
  ],
  [UserRole.EMPLOYEE]: [
    // Basic project access
    Permission.PROJECT_READ,
    // Task management
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    // Time tracking
    Permission.TIMESHEET_CREATE,
    Permission.TIMESHEET_READ,
    Permission.TIMESHEET_UPDATE,
    // Expenses
    Permission.EXPENSE_CREATE,
    Permission.EXPENSE_READ,
    Permission.EXPENSE_UPDATE,
    // Basic reports
    Permission.REPORT_READ,
  ],
  [UserRole.VIEWER]: [
    // Read-only access
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.TIMESHEET_READ,
    Permission.EXPENSE_READ,
    Permission.REPORT_READ,
  ],
};

// Permission checking functions
export function hasPermission(
  userRole: UserRole,
  permission: Permission,
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(
  userRole: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

export function hasAllPermissions(
  userRole: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

// Resource ownership checking
export function canAccessProject(
  userId: string,
  userRole: UserRole,
  projectManagerId?: string,
): boolean {
  // Admins and managers can access all projects
  if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
    return true;
  }

  // Project managers can access their own projects
  if (projectManagerId && userId === projectManagerId) {
    return true;
  }

  // Employees can access projects they're assigned to (would need additional logic)
  return false;
}

export function canAccessTask(
  userId: string,
  userRole: UserRole,
  taskAssigneeId?: string,
  projectManagerId?: string,
): boolean {
  // Admins can access all tasks
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  // Managers can access tasks in projects they manage
  if (
    userRole === UserRole.MANAGER &&
    projectManagerId &&
    userId === projectManagerId
  ) {
    return true;
  }

  // Users can access tasks assigned to them
  if (taskAssigneeId && userId === taskAssigneeId) {
    return true;
  }

  return false;
}

// Permission groups for UI rendering
export const PERMISSION_GROUPS = {
  projects: [
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_MANAGE,
  ],
  tasks: [
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
  ],
  timesheets: [
    Permission.TIMESHEET_CREATE,
    Permission.TIMESHEET_READ,
    Permission.TIMESHEET_UPDATE,
    Permission.TIMESHEET_APPROVE,
  ],
  expenses: [
    Permission.EXPENSE_CREATE,
    Permission.EXPENSE_READ,
    Permission.EXPENSE_UPDATE,
    Permission.EXPENSE_APPROVE,
  ],
  users: [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
  ],
  reports: [
    Permission.REPORT_READ,
    Permission.REPORT_EXPORT,
    Permission.REPORT_ADMIN,
  ],
  system: [Permission.SYSTEM_CONFIG, Permission.AUDIT_READ],
};

// Permission display names
export const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.PROJECT_CREATE]: "Create Projects",
  [Permission.PROJECT_READ]: "View Projects",
  [Permission.PROJECT_UPDATE]: "Edit Projects",
  [Permission.PROJECT_DELETE]: "Delete Projects",
  [Permission.PROJECT_MANAGE]: "Manage All Projects",
  [Permission.TASK_CREATE]: "Create Tasks",
  [Permission.TASK_READ]: "View Tasks",
  [Permission.TASK_UPDATE]: "Edit Tasks",
  [Permission.TASK_DELETE]: "Delete Tasks",
  [Permission.TASK_ASSIGN]: "Assign Tasks",
  [Permission.TIMESHEET_CREATE]: "Create Timesheets",
  [Permission.TIMESHEET_READ]: "View Timesheets",
  [Permission.TIMESHEET_UPDATE]: "Edit Timesheets",
  [Permission.TIMESHEET_APPROVE]: "Approve Timesheets",
  [Permission.EXPENSE_CREATE]: "Create Expenses",
  [Permission.EXPENSE_READ]: "View Expenses",
  [Permission.EXPENSE_UPDATE]: "Edit Expenses",
  [Permission.EXPENSE_APPROVE]: "Approve Expenses",
  [Permission.USER_CREATE]: "Create Users",
  [Permission.USER_READ]: "View Users",
  [Permission.USER_UPDATE]: "Edit Users",
  [Permission.USER_DELETE]: "Delete Users",
  [Permission.REPORT_READ]: "View Reports",
  [Permission.REPORT_EXPORT]: "Export Reports",
  [Permission.REPORT_ADMIN]: "Admin Reports",
  [Permission.SYSTEM_CONFIG]: "System Configuration",
  [Permission.AUDIT_READ]: "View Audit Logs",
};
