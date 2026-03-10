import { ProjectPhase, Project } from './context';

export interface ProjectPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canManageBudget: boolean;
  canApprove: boolean;
  canAccessPhase: (phase: ProjectPhase) => boolean;
  canAccessFeature: (phase: ProjectPhase, feature: string) => boolean;
}

export interface ProjectRole {
  id: string;
  name: string;
  permissions: ProjectPermissions;
  level: number; // 1=viewer, 2=member, 3=manager, 4=owner
}

export interface UserProjectRole {
  userId: string;
  projectId: string;
  role: keyof typeof PROJECT_ROLES;
  assignedAt: string;
  assignedBy: string;
}

// Role definitions
export const PROJECT_ROLES: Record<string, ProjectRole> = {
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    level: 1,
    permissions: {
      canView: true,
      canEdit: false,
      canDelete: false,
      canManageTeam: false,
      canManageBudget: false,
      canApprove: false,
      canAccessPhase: (phase: ProjectPhase) => {
        // Viewers can access all phases but with limited features
        return true;
      },
      canAccessFeature: (phase: ProjectPhase, feature: string) => {
        // Viewers can only view, not edit
        return feature.startsWith('view-') || feature === 'read';
      },
    },
  },
  member: {
    id: 'member',
    name: 'Team Member',
    level: 2,
    permissions: {
      canView: true,
      canEdit: true,
      canDelete: false,
      canManageTeam: false,
      canManageBudget: false,
      canApprove: false,
      canAccessPhase: (phase: ProjectPhase) => {
        // Members can access execution and financials for their tasks
        return ['execution', 'financials'].includes(phase);
      },
      canAccessFeature: (phase: ProjectPhase, feature: string) => {
        const phaseFeatures = {
          initiation: [],
          execution: ['tasks', 'timesheets', 'progress'],
          financials: ['expenses', 'budget-view'],
          delivery: [],
          warranty: [],
        };
        return phaseFeatures[phase]?.includes(feature) || false;
      },
    },
  },
  manager: {
    id: 'manager',
    name: 'Project Manager',
    level: 3,
    permissions: {
      canView: true,
      canEdit: true,
      canDelete: false,
      canManageTeam: true,
      canManageBudget: true,
      canApprove: true,
      canAccessPhase: (phase: ProjectPhase) => {
        // Managers can access all phases except certain admin functions
        return true;
      },
      canAccessFeature: (phase: ProjectPhase, feature: string) => {
        // Managers can access most features except project deletion
        return feature !== 'delete-project';
      },
    },
  },
  owner: {
    id: 'owner',
    name: 'Project Owner',
    level: 4,
    permissions: {
      canView: true,
      canEdit: true,
      canDelete: true,
      canManageTeam: true,
      canManageBudget: true,
      canApprove: true,
      canAccessPhase: (phase: ProjectPhase) => {
        // Owners can access everything
        return true;
      },
      canAccessFeature: (phase: ProjectPhase, feature: string) => {
        // Owners can access all features
        return true;
      },
    },
  },
};

export function getUserProjectRole(
  userId: string,
  projectId: string,
  userRoles: UserProjectRole[]
): ProjectRole | null {
  const userRole = userRoles.find(
    role => role.userId === userId && role.projectId === projectId
  );
  
  if (!userRole) return null;
  
  return PROJECT_ROLES[userRole.role] || null;
}

export function hasPermission(
  userId: string,
  projectId: string,
  permission: keyof ProjectPermissions,
  userRoles: UserProjectRole[]
): boolean {
  const role = getUserProjectRole(userId, projectId, userRoles);
  return role ? role.permissions[permission] : false;
}

export function canAccessPhase(
  userId: string,
  projectId: string,
  phase: ProjectPhase,
  userRoles: UserProjectRole[],
  projectProgress?: Array<{ phase: ProjectPhase; status: string }>
): boolean {
  const role = getUserProjectRole(userId, projectId, userRoles);
  if (!role) return false;
  
  // Check basic phase access
  if (!role.permissions.canAccessPhase(phase)) return false;
  
  // Check phase progression (except for initiation)
  if (phase !== 'initiation' && projectProgress) {
    const phaseOrder: ProjectPhase[] = ['initiation', 'execution', 'financials', 'delivery', 'warranty'];
    const currentIndex = phaseOrder.indexOf(phase);
    
    if (currentIndex > 0) {
      const previousPhase = phaseOrder[currentIndex - 1];
      const previousProgress = projectProgress.find(p => p.phase === previousPhase);
      
      // Previous phase must be completed (except for owners and managers)
      if (role.level < 3 && previousProgress?.status !== 'completed') {
        return false;
      }
    }
  }
  
  return true;
}

export function canAccessFeature(
  userId: string,
  projectId: string,
  phase: ProjectPhase,
  feature: string,
  userRoles: UserProjectRole[]
): boolean {
  const role = getUserProjectRole(userId, projectId, userRoles);
  if (!role) return false;
  
  return role.permissions.canAccessFeature(phase, feature);
}

export function getProjectPermissions(
  userId: string,
  projectId: string,
  userRoles: UserProjectRole[],
  projectProgress?: Array<{ phase: ProjectPhase; status: string }>
): ProjectPermissions {
  const role = getUserProjectRole(userId, projectId, userRoles);
  
  if (!role) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canManageTeam: false,
      canManageBudget: false,
      canApprove: false,
      canAccessPhase: () => false,
      canAccessFeature: () => false,
    };
  }
  
  return {
    ...role.permissions,
    canAccessPhase: (phase: ProjectPhase) => 
      canAccessPhase(userId, projectId, phase, userRoles, projectProgress),
    canAccessFeature: (phase: ProjectPhase, feature: string) => 
      canAccessFeature(userId, projectId, phase, feature, userRoles),
  };
}

export function validateProjectAccess(
  userId: string,
  projectId: string,
  requiredPermission: keyof ProjectPermissions,
  userRoles: UserProjectRole[]
): { hasAccess: boolean; reason?: string } {
  const role = getUserProjectRole(userId, projectId, userRoles);
  
  if (!role) {
    return { hasAccess: false, reason: 'User is not assigned to this project' };
  }
  
  if (!role.permissions[requiredPermission]) {
    return { hasAccess: false, reason: `Insufficient permissions for ${requiredPermission}` };
  }
  
  return { hasAccess: true };
}

export function getAccessiblePhases(
  userId: string,
  projectId: string,
  userRoles: UserProjectRole[],
  projectProgress?: Array<{ phase: ProjectPhase; status: string }>
): ProjectPhase[] {
  const allPhases: ProjectPhase[] = ['initiation', 'execution', 'financials', 'delivery', 'warranty'];
  
  return allPhases.filter(phase => 
    canAccessPhase(userId, projectId, phase, userRoles, projectProgress)
  );
}

export function getPhaseFeatures(
  phase: ProjectPhase,
  userRole: ProjectRole
): string[] {
  const phaseFeatures = {
    initiation: ['tor', 'contracts', 'approvals', 'documents'],
    execution: ['tasks', 'timesheets', 'progress', 'resources', 'team'],
    financials: ['milestones', 'budget', 'expenses', 'invoices', 'reports'],
    delivery: ['go-live', 'handover', 'acceptance', 'documentation', 'testing'],
    warranty: ['sla', 'maintenance', 'support', 'renewals', 'monitoring'],
  };
  
  const features = phaseFeatures[phase] || [];
  
  // Filter features based on user role permissions
  return features.filter(feature => 
    userRole.permissions.canAccessFeature(phase, feature)
  );
}

export function checkPhaseTransition(
  fromPhase: ProjectPhase,
  toPhase: ProjectPhase,
  userRoles: UserProjectRole[],
  projectProgress: Array<{ phase: ProjectPhase; status: string }>
): { canTransition: boolean; reason?: string } {
  const phaseOrder: ProjectPhase[] = ['initiation', 'execution', 'financials', 'delivery', 'warranty'];
  const fromIndex = phaseOrder.indexOf(fromPhase);
  const toIndex = phaseOrder.indexOf(toPhase);
  
  // Can only move to adjacent phases
  if (Math.abs(toIndex - fromIndex) > 1) {
    return { canTransition: false, reason: 'Can only transition between adjacent phases' };
  }
  
  // Check if current phase is completed (except for owners and managers)
  const currentProgress = projectProgress.find(p => p.phase === fromPhase);
  if (currentProgress?.status !== 'completed') {
    return { canTransition: false, reason: 'Current phase must be completed before transitioning' };
  }
  
  return { canTransition: true };
}
