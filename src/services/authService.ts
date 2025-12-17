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
  created_at: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
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
  }
};
