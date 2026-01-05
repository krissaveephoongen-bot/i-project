import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';

// Types
type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
  department?: string;
  timezone?: string;
  displayName?: string;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// Action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Helper function to get permissions based on role
const getPermissionsForRole = (role: string): string[] => {
  switch (role) {
    case 'admin':
      return ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_projects'];
    case 'project_manager':
    case 'PROJECT_MANAGER':
      return ['read', 'write', 'manage_projects', 'manage_team'];
    case 'team_lead':
    case 'TEAM_LEAD':
      return ['read', 'write', 'manage_team'];
    case 'developer':
    case 'tester':
    case 'designer':
    case 'DEVELOPER':
    case 'TESTER':
    case 'DESIGNER':
      return ['read', 'write'];
    default:
      return ['read'];
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Context type
type AuthContextType = {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    avatar?: string;
    phone?: string;
    department?: string;
    timezone?: string;
    displayName?: string;
  } | null;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    avatar?: string;
    phone?: string;
    department?: string;
    timezone?: string;
    displayName?: string;
  } | null;
  isLoading: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType>({
  login: async () => {},
  logout: async () => {},
  clearError: () => {},
  isAuthenticated: false,
  user: null,
  currentUser: null,
  isLoading: true
});

// Auth Provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

   // Initialize auth state on mount - check for existing token
   useEffect(() => {
     const initializeAuth = async () => {
       try {
         dispatch({ type: 'SET_LOADING', payload: true });

         // Check for existing token
         const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

         if (token) {
           try {
             // Verify token and get user profile
             const verifyResponse = await authService.verifyToken();
             if (verifyResponse.success && verifyResponse.user) {
               const user: AuthUser = {
                 id: verifyResponse.user.id,
                 name: verifyResponse.user.name,
                 email: verifyResponse.user.email,
                 role: verifyResponse.user.role,
                 permissions: getPermissionsForRole(verifyResponse.user.role),
               };
               dispatch({ type: 'SET_USER', payload: user });

               // Schedule automatic token refresh for existing sessions
               scheduleTokenRefresh();
             } else {
               // Token invalid, clear it
               localStorage.removeItem('accessToken');
               sessionStorage.removeItem('accessToken');
               dispatch({ type: 'SET_USER', payload: null });
             }
           } catch (error) {
             console.warn('Token verification failed:', error);
             // Clear invalid tokens
             localStorage.removeItem('accessToken');
             sessionStorage.removeItem('accessToken');
             dispatch({ type: 'SET_USER', payload: null });
           }
         } else {
           dispatch({ type: 'SET_USER', payload: null });
         }
       } catch (error) {
         console.error('Failed to initialize auth:', error);
         dispatch({ type: 'SET_USER', payload: null });
       } finally {
         dispatch({ type: 'SET_LOADING', payload: false });
       }
     };

     initializeAuth();
   }, []);

   // Token refresh function
   const refreshToken = useCallback(async () => {
     try {
       const refreshToken = authService.getRefreshToken();
       if (!refreshToken) {
         throw new Error('No refresh token available');
       }

       const response = await authService.refreshToken({ refreshToken });

       if (response.success) {
         // Update stored token
         const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
         storage.setItem('accessToken', response.token);

         console.log('Token refreshed successfully');
         return true;
       } else {
         throw new Error('Token refresh failed');
       }
     } catch (error) {
       console.warn('Token refresh failed:', error);
       // Clear tokens and logout
       localStorage.removeItem('accessToken');
       sessionStorage.removeItem('accessToken');
       authService.clearRefreshToken();
       dispatch({ type: 'LOGOUT' });
       return false;
     }
   }, []);

   // Schedule automatic token refresh (every 50 minutes for 1-hour tokens)
   const scheduleTokenRefresh = useCallback(() => {
     if (refreshTimeoutRef.current) {
       clearTimeout(refreshTimeoutRef.current);
     }

     // Refresh 10 minutes before expiry (50 minutes for 1-hour tokens)
     refreshTimeoutRef.current = setTimeout(async () => {
       const success = await refreshToken();
       if (success) {
         // Schedule next refresh
         scheduleTokenRefresh();
       }
     }, 50 * 60 * 1000); // 50 minutes
   }, [refreshToken]);

   // Clear refresh timeout on unmount
   useEffect(() => {
     return () => {
       if (refreshTimeoutRef.current) {
         clearTimeout(refreshTimeoutRef.current);
       }
     };
   }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Call real API
      const response = await authService.login({ email, password });

      // Store tokens based on remember me preference
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', response.token);

      // Generate and store refresh token (for demo, using same token)
      // In production, backend should return separate refresh token
      const refreshToken = response.token; // Simplified for demo
      authService.setRefreshToken(refreshToken, rememberMe);

      // Set user data
      const user: AuthUser = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        permissions: getPermissionsForRole(response.user.role),
      };

      dispatch({ type: 'SET_USER', payload: user });

      // Schedule automatic token refresh
      scheduleTokenRefresh();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API
      await authService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with local logout even if API fails
    }

    // Remove tokens from both storages
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    authService.clearRefreshToken();

    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    login,
    logout,
    clearError,
    isAuthenticated: state.isAuthenticated,
    user: state.user ? {
      id: state.user.id,
      name: state.user.name,
      email: state.user.email,
      role: state.user.role,
      permissions: state.user.permissions
    } : null,
    currentUser: state.user ? {
      id: state.user.id,
      name: state.user.name,
      email: state.user.email,
      role: state.user.role,
      permissions: state.user.permissions
    } : null,
    isLoading: state.isLoading
  };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };

    // Custom hook to use auth context
    export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Export the hook for convenience
export const useAuth = () => useAuthContext();
