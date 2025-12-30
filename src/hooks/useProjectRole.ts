import { useAuth } from './use-auth';

interface ProjectRolePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canView: boolean;
  role: 'manager' | 'member' | 'viewer';
}

/**
 * Hook to determine user's role and permissions in a specific project
 * @param projectManagerId - ID of the project manager
 * @param currentUserId - ID of the current user
 * @param userRole - User's global role (admin, manager, member, etc.)
 * @returns Object containing role and permission flags
 */
export const useProjectRole = (
  projectManagerId: string,
  currentUserId?: string,
  userRole?: string
): ProjectRolePermissions => {
  const { user } = useAuth();
  const userId = currentUserId || user?.id || '';
  const role = userRole || user?.role || '';

  // Determine project role
  let projectRole: 'manager' | 'member' | 'viewer' = 'viewer';

  if (role === 'admin') {
    // Admin has full access
    projectRole = 'manager';
  } else if (userId === projectManagerId) {
    // Project manager can edit/delete
    projectRole = 'manager';
  } else if (role === 'manager' || role === 'member') {
    // Global managers and members are project members
    projectRole = 'member';
  } else {
    // Others are viewers
    projectRole = 'viewer';
  }

  return {
    canEdit: projectRole === 'manager',
    canDelete: projectRole === 'manager',
    canApprove: projectRole === 'manager',
    canView: true, // Everyone can view
    role: projectRole,
  };
};
