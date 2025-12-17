import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { AuthUser, AuthState } from '@/types/auth';

// Action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

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
interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Check if user was previously logged in
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          // For demo purposes, restore mock user if token exists
          const mockUser: AuthUser = {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'admin'],
          };

          dispatch({ type: 'SET_USER', payload: mockUser });
        } else {
          // No stored session, remain logged out
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, _password: string, rememberMe = false) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Mock login - replace with actual API call
      const mockUser: AuthUser = {
        id: '1',
        name: 'John Doe',
        email,
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin'],
      };
      
      // Store tokens
      localStorage.setItem('accessToken', 'mock-access-token');
      if (rememberMe) {
        localStorage.setItem('refreshToken', 'mock-refresh-token');
      }

      dispatch({ type: 'SET_USER', payload: mockUser });
      toast.success('Logged in successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
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
