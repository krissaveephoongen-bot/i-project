import { useMemo } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Permission, UserRole, hasPermission, hasAnyPermission, hasAllPermissions, canAccessProject, canAccessTask } from '../lib/auth';

export function usePermissions() {
  const { user, profile } = useAuth();

  const userRole = ((user?.role as UserRole) || (profile?.role as UserRole) || UserRole.EMPLOYEE);
  const userId = user?.id || '';
  const userName = user?.name || '';

  const permissions = useMemo(() => ({
    // Check single permission
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),

    // Check multiple permissions (any)
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),

    // Check multiple permissions (all)
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),

    // Resource-specific access checks
    canAccessProject: (projectManagerId?: string) =>
      canAccessProject(userId, userRole, projectManagerId),

    canAccessTask: (taskAssigneeId?: string, projectManagerId?: string) =>
      canAccessTask(userId, userRole, taskAssigneeId, projectManagerId),

    // Common permission checks
    canCreateProjects: () => hasPermission(userRole, Permission.PROJECT_CREATE),
    canEditProjects: () => hasPermission(userRole, Permission.PROJECT_UPDATE),
    canDeleteProjects: () => hasPermission(userRole, Permission.PROJECT_DELETE),
    canManageProjects: () => hasPermission(userRole, Permission.PROJECT_MANAGE),

    canCreateTasks: () => hasPermission(userRole, Permission.TASK_CREATE),
    canEditTasks: () => hasPermission(userRole, Permission.TASK_UPDATE),
    canAssignTasks: () => hasPermission(userRole, Permission.TASK_ASSIGN),

    canApproveTimesheets: () => hasPermission(userRole, Permission.TIMESHEET_APPROVE),
    canApproveExpenses: () => hasPermission(userRole, Permission.EXPENSE_APPROVE),

    canManageUsers: () => hasPermission(userRole, Permission.USER_UPDATE),
    canCreateUsers: () => hasPermission(userRole, Permission.USER_CREATE),
    canDeleteUsers: () => hasPermission(userRole, Permission.USER_DELETE),

    canViewReports: () => hasPermission(userRole, Permission.REPORT_READ),
    canExportReports: () => hasPermission(userRole, Permission.REPORT_EXPORT),

    canViewAuditLogs: () => hasPermission(userRole, Permission.AUDIT_READ),
    canConfigureSystem: () => hasPermission(userRole, Permission.SYSTEM_CONFIG),

    // Role checks
    isAdmin: () => userRole === UserRole.ADMIN,
    isManager: () => userRole === UserRole.MANAGER,
    isEmployee: () => userRole === UserRole.EMPLOYEE,
    isViewer: () => userRole === UserRole.VIEWER,

    // Current user info
    userRole,
    userId,
    userName,
  }), [userRole, userId, userName]);

  return permissions;
}

// Hook for conditional rendering based on permissions
export function usePermissionCheck(permission: Permission) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

// Hook for multiple permission checks
export function usePermissionsCheck(permissions: Permission[], mode: 'any' | 'all' = 'any') {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  if (mode === 'all') {
    return hasAllPermissions(permissions);
  }

  return hasAnyPermission(permissions);
}
