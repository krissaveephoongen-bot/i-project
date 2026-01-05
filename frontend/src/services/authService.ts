/**
 * Authentication Service
 * Handles login, logout, token management, and user profile operations
 */

import { apiClient } from './api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  phone?: string;
  status: string;
  timezone?: string;
  created_at: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/logout', {});
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ success: boolean; data: UserProfile }> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<{ success: boolean; data: UserProfile }> {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(request: PasswordChangeRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put('/auth/password', request);
    return response.data;
  },

  /**
   * Verify token validity
   */
  async verifyToken(): Promise<{ success: boolean; user: any }> {
    const response = await apiClient.post('/auth/verify', {});
    return response.data;
  },

  /**
   * Store token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  },

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  /**
   * Remove token from localStorage
   */
  clearToken(): void {
    localStorage.removeItem('authToken');
  },

  /**
   * Refresh access token
   */
  async refreshToken(request: RefreshTokenRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', request);
    return response.data;
  },

  /**
   * Request password reset
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/forgot-password', request);
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(request: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/reset-password', request);
    return response.data;
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
  },

  /**
   * Set refresh token
   */
  setRefreshToken(token: string, rememberMe = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('refreshToken', token);
  },

  /**
   * Clear refresh token
   */
  clearRefreshToken(): void {
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('refreshToken');
  }
};
