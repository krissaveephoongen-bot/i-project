import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  department?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    // For demo purposes, return a mock user
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
    };
    return mockUser;
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Replace with actual API call
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: credentials.email,
      role: 'admin',
    };
    
    const tokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };
    
    toast.success('Logged in successfully');
    return { user: mockUser, tokens };
  }, []);

  const logout = useCallback(() => {
    queryClient.clear();
    toast.success('Logged out successfully');
  }, [queryClient]);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    // Replace with actual API call
    console.log('Register:', data);
    toast.success('Registration successful! Please check your email.');
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    // Replace with actual API call
    console.log('Forgot password:', email);
    toast.success('Password reset email sent!');
  }, []);

  const resetPassword = useCallback(async (data: { token: string; password: string }): Promise<void> => {
    // Replace with actual API call
    console.log('Reset password:', data);
    toast.success('Password reset successful!');
  }, []);

  const refreshToken = useCallback(async (token: string): Promise<AuthResponse> => {
    // Replace with actual API call
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
    };
    
    const tokens = {
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
    };
    
    return { user: mockUser, tokens };
  }, []);

  return {
    getCurrentUser,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    refreshToken,
  };
}
