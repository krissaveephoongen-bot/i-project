/**
 * Activity Service
 * Complete CRUD operations for activity log
 */

import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/lib/api-config';

export interface ActivityLog {
  id: string;
  action: string;
  entity_type: 'project' | 'task' | 'user' | 'comment' | 'worklog' | 'expense';
  entity_id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface ActivityFilters {
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ActivityStats {
  total_activities: number;
  unique_entities: number;
  active_users: number;
  entity_type: string;
  activity_date: string;
  actions: string[];
}

// Create activity log entry
export async function createActivity(
  action: string,
  entity_type: ActivityLog['entity_type'],
  entity_id: string,
  user_id?: string,
  details?: Record<string, any>
): Promise<ActivityLog> {
  try {
    const response = await axios.post(`${API_BASE_URL}/activities`, {
      action,
      entity_type,
      entity_id,
      user_id,
      details
    }, { timeout: API_TIMEOUT });

    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to create activity:', error);
    throw error;
  }
}

// Get all activities with filters
export async function getActivities(filters?: ActivityFilters): Promise<{
  data: ActivityLog[];
  count: number;
  total: number;
}> {
  try {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.entity_type) params.append('entity_type', filters.entity_type);
      if (filters.entity_id) params.append('entity_id', filters.entity_id);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.action) params.append('action', filters.action);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    }

    const response = await axios.get(`${API_BASE_URL}/activities?${params.toString()}`, { timeout: API_TIMEOUT });

    return response.data || { data: [], count: 0, total: 0 };
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return { data: [], count: 0, total: 0 };
  }
}

// Get activity by ID
export async function getActivityById(id: string): Promise<ActivityLog> {
  try {
    const response = await axios.get(`${API_BASE_URL}/activities/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch activity:', error);
    throw error;
  }
}

// Update activity
export async function updateActivity(
  id: string,
  action?: string,
  details?: Record<string, any>
): Promise<ActivityLog> {
  try {
    const response = await axios.put(`${API_BASE_URL}/activities/${id}`, {
      action,
      details
    });

    return response.data.data;
  } catch (error) {
    console.error('Failed to update activity:', error);
    throw error;
  }
}

// Delete activity
export async function deleteActivity(id: string): Promise<ActivityLog> {
  try {
    const response = await axios.delete(`${API_BASE_URL}/activities/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to delete activity:', error);
    throw error;
  }
}

// Get user activity history
export async function getUserActivityHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  data: ActivityLog[];
  count: number;
}> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/activities/user/${userId}?limit=${limit}&offset=${offset}`
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch user activity history:', error);
    throw error;
  }
}

// Get entity activity history
export async function getEntityActivityHistory(
  entityType: ActivityLog['entity_type'],
  entityId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  data: ActivityLog[];
  count: number;
}> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/activities/entity/${entityType}/${entityId}?limit=${limit}&offset=${offset}`
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch entity activity history:', error);
    throw error;
  }
}

// Get activity statistics
export async function getActivityStats(
  entityType?: string,
  start_date?: string,
  end_date?: string
): Promise<ActivityStats[]> {
  try {
    const params = new URLSearchParams();
    if (entityType) params.append('entity_type', entityType);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);

    const response = await axios.get(`${API_BASE_URL}/activities/stats/summary?${params.toString()}`);

    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch activity stats:', error);
    throw error;
  }
}

// Cleanup old activities
export async function cleanupOldActivities(days: number = 90): Promise<{
  message: string;
  deleted_count: number;
}> {
  try {
    const response = await axios.delete(`${API_BASE_URL}/activities/cleanup/old?days=${days}`);

    return {
      message: response.data.message,
      deleted_count: response.data.deleted_count
    };
  } catch (error) {
    console.error('Failed to cleanup activities:', error);
    throw error;
  }
}

// Bulk operations

/**
 * Create activity log for multiple entity types
 * Useful for tracking batch operations
 */
export async function createBulkActivities(
  activities: Array<{
    action: string;
    entity_type: ActivityLog['entity_type'];
    entity_id: string;
    user_id?: string;
    details?: Record<string, any>;
  }>
): Promise<ActivityLog[]> {
  try {
    const promises = activities.map(activity =>
      createActivity(
        activity.action,
        activity.entity_type,
        activity.entity_id,
        activity.user_id,
        activity.details
      )
    );

    return await Promise.all(promises);
  } catch (error) {
    console.error('Failed to create bulk activities:', error);
    throw error;
  }
}
