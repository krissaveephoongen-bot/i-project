/**
 * Role-Based Access Control Context
 * Provides role checking and permission validation throughout the app
 */

import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from '../hooks/use-auth';

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

export interface RoleContextType {
  userRole: UserRole;
  userId: string;
  userName: string;
  can: (action: string, resource?: string) => boolean;
  canAccess: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Permission map for different roles
const PERMISSIONS: Record<UserRole, Set<string>> = {
  admin: new Set([
    'create:user',
    'edit:user',
    'delete:user',
    'create:team',
    'edit:team',
    'delete:team',
    'create:project',
    'edit:project',
    'delete:project',
    'manage:members',
    'approve:worklog',
    'approve:expense',
    'view:reports',
    'view:analytics',
    'admin:settings',
    'admin:audit',
    'admin:roles'
  ]),
  manager: new Set([
    'create:team',
    'edit:team',
    'create:project',
    'edit:project',
    'manage:members',
    'approve:worklog',
    'approve:expense',
    'view:reports',
    'view:analytics'
  ]),
  employee: new Set([
    'view:project',
    'create:worklog',
    'edit:own:worklog',
    'create:expense',
    'edit:own:expense',
    'view:owndata',
    'view:team'
  ]),
  viewer: new Set([
    'view:project',
    'view:reports',
    'view:owndata'
  ])
};

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Check if user has specific permission
  const can = useCallback((action: string, resource?: string): boolean => {
    if (!user) return false;

    const role = (user.role as UserRole) || 'viewer';
    const permissions = PERMISSIONS[role] || new Set();

    if (resource) {
      return permissions.has(`${action}:${resource}`);
    }

    // Check both with and without resource
    return Array.from(permissions).some(perm => 
      perm.startsWith(`${action}:`)
    );
  }, [user]);

  // Check if user has one of the allowed roles
  const canAccess = useCallback((allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes((user.role as UserRole) || 'viewer');
  }, [user]);

  const contextValue: RoleContextType = {
    userRole: (user?.role as UserRole) || 'viewer',
    userId: user?.id || '',
    userName: user?.name || '',
    can,
    canAccess,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isEmployee: user?.role === 'employee'
  };

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};
