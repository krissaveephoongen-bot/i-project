import { useState, useEffect, useCallback } from 'react';
import { AuthApi } from '../api/auth-api';
import type {
  AuthUser,
  AuthState,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  ForgotPasswordData,
  UseAuthReturn
} from './types';

const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
} as const;

/**
 * Custom hook for authentication management
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
        const userJson = localStorage.getItem(AUTH_STORAGE_KEYS.USER);

        if (token && userJson) {
          const user = JSON.parse(userJson);
          setState(prev => ({
            ...prev,
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          }));

          // Verify token with server
          try {
            await AuthApi.verify();
          } catch (error) {
            // Token is invalid, clear auth state
            clearAuth();
          }
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      }
    };

    initializeAuth();
  }, []);

  // Clear authentication state
  const clearAuth = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // Set authentication state
  const setAuth = useCallback((user: AuthUser, token: string) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }, []);

  // Set error state
  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await AuthApi.login(credentials);
      setAuth(response.user, response.token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เข้าสู่ระบบล้มเหลว';
      setError(errorMessage);
      throw error;
    }
  }, [setAuth, setError]);

  // Register function
  const register = useCallback(async (data: RegisterData): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await AuthApi.register(data);
      // Note: Registration doesn't automatically log in the user
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    }
  }, [setError]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      await AuthApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state regardless of API call success
      clearAuth();
    }
  }, [clearAuth]);

  // Verify token function
  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await AuthApi.verify();
      return response.valid;
    } catch (error) {
      console.error('Token verification error:', error);
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  // Forgot password function
  const forgotPassword = useCallback(async (data: ForgotPasswordData): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await AuthApi.forgotPassword(data);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      setError(errorMessage);
      throw error;
    }
  }, [setError]);

  // Reset password function
  const resetPassword = useCallback(async (data: ResetPasswordData): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await AuthApi.resetPassword(data);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      throw error;
    }
  }, [setError]);

  return {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    verifyToken,
    forgotPassword,
    resetPassword,
    clearError,
  };
}
