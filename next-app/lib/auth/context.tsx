"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// TYPES
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  employeeCode?: string;
  phone?: string;
  avatar?: string;
  status: string;
  isActive: boolean;
  isProjectManager: boolean;
  isSupervisor: boolean;
  notificationPreferences?: any;
  timezone: string;
  hourlyRate?: string;
  weeklyCapacity?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUser extends User {
  roles: Role[];
  permissions: Permission[];
  preferences: {
    timezone: string;
    language: string;
    theme: 'light' | 'dark';
  };
}

export interface AuthState {
  user: CurrentUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  lastActivity: number;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// ============================================================
// ACTION TYPES
// ============================================================

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: CurrentUser; token: string; refreshToken: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'UPDATE_TOKENS'; payload: { token: string; refreshToken: string } }
  | { type: 'UPDATE_LAST_ACTIVITY' };

// ============================================================
// REDUCER
// ============================================================

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  lastActivity: Date.now(),
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastActivity: Date.now(),
      };

    case 'CLEAR_USER':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'UPDATE_PROFILE':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case 'UPDATE_TOKENS':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        lastActivity: Date.now(),
      };

    case 'UPDATE_LAST_ACTIVITY':
      return {
        ...state,
        lastActivity: Date.now(),
      };

    default:
      return state;
  }
}

// ============================================================
// CONTEXT
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // ============================================================
  // API HELPERS
  // ============================================================

  const apiCall = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    if (state.token) {
      defaultHeaders['Authorization'] = `Bearer ${state.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  };

  // ============================================================
  // AUTH ACTIONS
  // ============================================================

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        
        // Store tokens in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);

        dispatch({
          type: 'SET_USER',
          payload: { user, token, refreshToken },
        });

        // Redirect to dashboard or intended page
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (state.token && state.refreshToken) {
        // Call logout endpoint to invalidate session
        await apiCall('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ 
            token: state.token, 
            refreshToken: state.refreshToken 
          }),
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');

      // Clear state
      dispatch({ type: 'CLEAR_USER' });

      // Redirect to login
      router.push('/login');
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      if (!state.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiCall('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: state.refreshToken }),
      });

      if (response.success && response.data) {
        const { token, refreshToken } = response.data;
        
        // Update localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);

        dispatch({
          type: 'UPDATE_TOKENS',
          payload: { token, refreshToken },
        });
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: response.data,
        });
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Profile update failed' });
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiCall('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Password change failed' });
      throw error;
    }
  };

  // ============================================================
  // PERMISSION HELPERS
  // ============================================================

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    return state.user.permissions.some(p => p.name === permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!state.user) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!state.user) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  const hasRole = (role: string): boolean => {
    if (!state.user) return false;
    return state.user.roles.some(r => r.name === role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!state.user) return false;
    return roles.some(role => hasRole(role));
  };

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setLoading = (loading: boolean): void => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (token && refreshToken) {
          // Validate current token
          const response = await apiCall('/auth/me');
          
          if (response.success && response.data) {
            dispatch({
              type: 'SET_USER',
              payload: { user: response.data, token, refreshToken },
            });
          } else {
            // Token invalid, try refresh
            await refreshToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        dispatch({ type: 'CLEAR_USER' });
      }
    };

    initializeAuth();
  }, []);

  // ============================================================
  // TOKEN REFRESH TIMER
  // ============================================================

  useEffect(() => {
    if (!state.isAuthenticated) return;

    // Check token every 5 minutes
    const interval = setInterval(async () => {
      try {
        // Check if token is close to expiring (less than 5 minutes left)
        const timeSinceActivity = Date.now() - state.lastActivity;
        
        if (timeSinceActivity > 4 * 60 * 1000) { // 4 minutes
          await refreshToken();
        }
      } catch (error) {
        console.error('Auto refresh error:', error);
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.lastActivity]);

  // ============================================================
  // ACTIVITY TRACKING
  // ============================================================

  useEffect(() => {
    if (!state.isAuthenticated) return;

    const handleActivity = () => {
      dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
    };

    // Track user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [state.isAuthenticated]);

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    clearError,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// HOOK
// ============================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================
// HIGHER-ORDER COMPONENTS
// ============================================================

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole,
  fallback = <div>Access denied</div>
}: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback;
  }

  return <>{children}</>;
}

// ============================================================
// PERMISSION GATES
// ============================================================

interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGate({ 
  children, 
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  fallback = null
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = useAuth();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  if (hasAccess && role) {
    hasAccess = hasRole(role);
  } else if (hasAccess && roles.length > 0) {
    hasAccess = hasAnyRole(roles);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
