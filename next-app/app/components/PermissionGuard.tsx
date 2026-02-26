import { ReactNode } from "react";
import { Permission, UserRole } from "../lib/auth";
import { usePermissions } from "../hooks/usePermissions";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  mode?: "any" | "all";
  requireAll?: boolean; // Alternative to mode
  fallback?: ReactNode;
  roles?: UserRole[];
  requireRole?: UserRole;
  inverse?: boolean; // Show when permission is NOT granted
}

/**
 * PermissionGuard component for conditional rendering based on user permissions
 *
 * @example
 * // Single permission
 * <PermissionGuard permission={Permission.PROJECT_CREATE}>
 *   <Button>Create Project</Button>
 * </PermissionGuard>
 *
 * @example
 * // Multiple permissions (any)
 * <PermissionGuard permissions={[Permission.TASK_UPDATE, Permission.TASK_ASSIGN]}>
 *   <Button>Edit Task</Button>
 * </PermissionGuard>
 *
 * @example
 * // Multiple permissions (all required)
 * <PermissionGuard permissions={[Permission.USER_READ, Permission.USER_UPDATE]} mode="all">
 *   <UserManagement />
 * </PermissionGuard>
 *
 * @example
 * // Role-based access
 * <PermissionGuard roles={[UserRole.ADMIN, UserRole.MANAGER]}>
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * @example
 * // Inverse logic (show when permission NOT granted)
 * <PermissionGuard permission={Permission.PROJECT_DELETE} inverse fallback={<span>Cannot delete</span>}>
 *   <Button>Delete</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  mode = "any",
  requireAll = false,
  fallback = null,
  roles,
  requireRole,
  inverse = false,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, userRole } =
    usePermissions();

  // Determine if user has required access
  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    // Multiple permissions check
    const checkMode = requireAll ? "all" : mode;
    hasAccess =
      checkMode === "all"
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
  } else if (roles) {
    // Role-based check
    hasAccess = roles.includes(userRole);
  } else if (requireRole) {
    // Single role check
    hasAccess = userRole === requireRole;
  } else {
    // No permissions specified, allow access
    hasAccess = true;
  }

  // Apply inverse logic if requested
  if (inverse) {
    hasAccess = !hasAccess;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Specialized permission guard for common use cases
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard requireRole={UserRole.ADMIN} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function ManagerOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard requireRole={UserRole.MANAGER} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function AdminOrManager({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      roles={[UserRole.ADMIN, UserRole.MANAGER]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function CanCreateProjects({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard permission={Permission.PROJECT_CREATE} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanEditProjects({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard permission={Permission.PROJECT_UPDATE} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanApproveTimesheets({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      permission={Permission.TIMESHEET_APPROVE}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function CanApproveExpenses({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      permission={Permission.EXPENSE_APPROVE}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}
