/**
 * Role Management Service
 * Manages user roles and permissions
 */

import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/lib/api-config';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
  user_count?: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface CreateRoleInput {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
}

// Get all roles
export async function getAllRoles(): Promise<Role[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/roles`, { timeout: API_TIMEOUT });
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    return [];
  }
}

// Get role by ID
export async function getRoleById(id: string): Promise<Role | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/roles/${id}`, { timeout: API_TIMEOUT });
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Failed to fetch role:', error);
    return null;
  }
}

// Create role
export async function createRole(data: CreateRoleInput): Promise<Role> {
  try {
    const response = await axios.post(`${API_BASE_URL}/roles`, data, { timeout: API_TIMEOUT });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to create role:', error);
    throw error;
  }
}

// Update role
export async function updateRole(id: string, data: UpdateRoleInput): Promise<Role> {
  try {
    const response = await axios.put(`${API_BASE_URL}/roles/${id}`, data, { timeout: API_TIMEOUT });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to update role:', error);
    throw error;
  }
}

// Delete role
export async function deleteRole(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/roles/${id}`, { timeout: API_TIMEOUT });
  } catch (error) {
    console.error('Failed to delete role:', error);
    throw error;
  }
}

// Get all permissions
export async function getAllPermissions(): Promise<Permission[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/permissions`, { timeout: API_TIMEOUT });
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Failed to fetch permissions:', error);
    return [];
  }
}

// Assign role to user
export async function assignRoleToUser(userId: string, roleId: string): Promise<void> {
  try {
    await axios.post(`${API_BASE_URL}/users/${userId}/roles/${roleId}`, {}, { timeout: API_TIMEOUT });
  } catch (error) {
    console.error('Failed to assign role:', error);
    throw error;
  }
}

// Remove role from user
export async function removeRoleFromUser(userId: string, roleId: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/users/${userId}/roles/${roleId}`, { timeout: API_TIMEOUT });
  } catch (error) {
    console.error('Failed to remove role:', error);
    throw error;
  }
}

// Get user roles
export async function getUserRoles(userId: string): Promise<Role[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/roles`, { timeout: API_TIMEOUT });
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Failed to fetch user roles:', error);
    return [];
  }
}

// Get role statistics
export async function getRoleStats(): Promise<{
  totalRoles: number;
  rolesDistribution: Record<string, number>;
  permissionsCount: number;
}> {
  try {
    const response = await axios.get(`${API_BASE_URL}/roles/stats`, { timeout: API_TIMEOUT });
    return response.data.data || { totalRoles: 0, rolesDistribution: {}, permissionsCount: 0 };
  } catch (error) {
    console.error('Failed to fetch role stats:', error);
    return { totalRoles: 0, rolesDistribution: {}, permissionsCount: 0 };
  }
}
