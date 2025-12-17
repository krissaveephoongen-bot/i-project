/**
 * User Management Service
 * Complete CRUD operations for user management
 */

import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/lib/api-config';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'member';
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role?: 'admin' | 'manager' | 'member';
  password: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  avatar_url?: string;
  role?: 'admin' | 'manager' | 'member';
}

// Create user
export async function createUser(data: CreateUserInput): Promise<User> {
  try {
    const response = await axios.post(`${API_BASE_URL}/users`, data, { timeout: API_TIMEOUT });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

// Get all users
export async function getUsers(
  limit: number = 50,
  offset: number = 0,
  role?: string,
  search?: string
): Promise<{
  data: User[];
  count: number;
  total: number;
}> {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (role) params.append('role', role);
    if (search) params.append('search', search);

    const response = await axios.get(`${API_BASE_URL}/users?${params.toString()}`, { timeout: API_TIMEOUT });
    return response.data || { data: [], count: 0, total: 0 };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return { data: [], count: 0, total: 0 };
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User> {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`, { timeout: API_TIMEOUT });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// Update user
export async function updateUser(id: string, data: UpdateUserInput): Promise<User> {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, data, { timeout: API_TIMEOUT });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
}

// Delete user
export async function deleteUser(id: string): Promise<User> {
  try {
    const response = await axios.delete(`${API_BASE_URL}/users/${id}`, { timeout: API_TIMEOUT });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
}

// Get current user
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/me`, { timeout: API_TIMEOUT });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    throw error;
  }
}

// Update current user profile
export async function updateCurrentUserProfile(data: UpdateUserInput): Promise<User> {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/me`, data, { timeout: API_TIMEOUT });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/email/${email}`, { timeout: API_TIMEOUT });
    return response.data.data || response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error('Failed to fetch user by email:', error);
    throw error;
  }
}

// Bulk operations

// Bulk create users
export async function bulkCreateUsers(
  users: CreateUserInput[]
): Promise<{
  successful: User[];
  failed: Array<{ email: string; error: string }>;
}> {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/bulk/create`, { users }, { timeout: API_TIMEOUT });
    return response.data || { successful: [], failed: [] };
  } catch (error) {
    console.error('Failed to bulk create users:', error);
    return { successful: [], failed: [] };
  }
}

// Bulk update user roles
export async function bulkUpdateUserRoles(
  userIds: string[],
  role: 'admin' | 'manager' | 'member'
): Promise<{
  updated: string[];
  failed: string[];
}> {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/bulk/roles`, {
      userIds,
      role
    }, { timeout: API_TIMEOUT });
    return response.data || { updated: [], failed: [] };
  } catch (error) {
    console.error('Failed to bulk update user roles:', error);
    return { updated: [], failed: [] };
  }
}

// Deactivate multiple users
export async function deactivateUsers(userIds: string[]): Promise<{
  deactivated: string[];
  failed: string[];
}> {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/bulk/deactivate`, {
      userIds
    }, { timeout: API_TIMEOUT });
    return response.data || { deactivated: [], failed: [] };
  } catch (error) {
    console.error('Failed to deactivate users:', error);
    return { deactivated: [], failed: [] };
  }
}

// Get user activity/statistics
export async function getUserStats(): Promise<{
  total_users: number;
  active_users: number;
  users_by_role: Record<string, number>;
  new_users_this_month: number;
}> {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/stats`, { timeout: API_TIMEOUT });
    return response.data.data || { total_users: 0, active_users: 0, users_by_role: {}, new_users_this_month: 0 };
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return { total_users: 0, active_users: 0, users_by_role: {}, new_users_this_month: 0 };
  }
}

// Export users as CSV
export async function exportUsers(
  format: 'csv' | 'json' = 'csv'
): Promise<Blob> {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/export?format=${format}`, {
      responseType: 'blob',
      timeout: API_TIMEOUT
    });
    return response.data;
  } catch (error) {
    console.error('Failed to export users:', error);
    throw error;
  }
}

// Export userService object for compatibility
export const userService = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUserProfile,
  getUserByEmail,
  bulkCreateUsers,
  bulkUpdateUserRoles,
  deactivateUsers,
  getUserStats,
  exportUsers
};
