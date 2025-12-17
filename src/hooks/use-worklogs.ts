import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export interface Worklog {
  id: string;
  date: string;
  user_id?: string;
  user_name?: string;
  work_type: 'project' | 'office' | 'other';
  project_id?: string;
  task_id?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  hours: number;
  manday: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

interface WorklogStats {
  total_hours: number;
  total_mandays: number;
  total_entries: number;
}

interface UseWorklogsReturn {
  worklogs: Worklog[];
  stats: WorklogStats;
  loading: boolean;
  error: string | null;
  fetchWorklogs: (filters?: WorklogFilters) => Promise<void>;
  createWorklog: (data: Omit<Worklog, 'id' | 'created_at' | 'updated_at' | 'manday'>) => Promise<Worklog>;
  updateWorklog: (id: string, data: Partial<Worklog>) => Promise<Worklog>;
  deleteWorklog: (id: string) => Promise<void>;
  getProjectWorklogs: (projectId: string, filters?: DateRange) => Promise<void>;
  getUserWorklogs: (userId: string, filters?: DateRange) => Promise<void>;
  getWorklogSummary: (filters?: WorklogFilters) => Promise<WorklogStats>;
}

interface WorklogFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  projectId?: string;
  status?: string;
}

interface DateRange {
  startDate?: string;
  endDate?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export function useWorklogs(): UseWorklogsReturn {
  const [worklogs, setWorklogs] = useState<Worklog[]>([]);
  const [stats, setStats] = useState<WorklogStats>({
    total_hours: 0,
    total_mandays: 0,
    total_entries: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch worklogs with optional filters
  const fetchWorklogs = useCallback(async (filters?: WorklogFilters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.status) params.append('status', filters.status);

      const response = await fetch(`${API_BASE_URL}/worklogs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch worklogs');
      }

      const data = await response.json();
      setWorklogs(Array.isArray(data) ? data : []);

      // Calculate stats
      const total_hours = data.reduce((sum: number, w: Worklog) => sum + (w.hours || 0), 0);
      const total_mandays = data.reduce((sum: number, w: Worklog) => sum + (w.manday || 0), 0);
      
      setStats({
        total_hours: Math.round(total_hours * 100) / 100,
        total_mandays: Math.round(total_mandays * 100) / 100,
        total_entries: data.length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Error fetching worklogs: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new worklog
  const createWorklog = useCallback(async (
    data: Omit<Worklog, 'id' | 'created_at' | 'updated_at' | 'manday'>
  ): Promise<Worklog> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/worklogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create worklog');
      }

      const newWorklog = await response.json();
      setWorklogs(prev => [newWorklog, ...prev]);
      toast.success('Worklog created successfully');
      
      return newWorklog;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Error creating worklog: ${message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a worklog
  const updateWorklog = useCallback(async (
    id: string,
    data: Partial<Worklog>
  ): Promise<Worklog> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/worklogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update worklog');
      }

      const updatedWorklog = await response.json();
      setWorklogs(prev =>
        prev.map(w => w.id === id ? updatedWorklog : w)
      );
      toast.success('Worklog updated successfully');
      
      return updatedWorklog;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Error updating worklog: ${message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a worklog
  const deleteWorklog = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/worklogs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete worklog');
      }

      setWorklogs(prev => prev.filter(w => w.id !== id));
      toast.success('Worklog deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Error deleting worklog: ${message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get worklogs for a specific project
  const getProjectWorklogs = useCallback(async (projectId: string, filters?: DateRange) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(
        `${API_BASE_URL}/worklogs/project/${projectId}?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch project worklogs');
      }

      const data = await response.json();
      setWorklogs(data.entries || []);
      setStats({
        total_hours: data.total_hours || 0,
        total_mandays: data.total_mandays || 0,
        total_entries: data.total_entries || 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Error fetching project worklogs: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get worklogs for a specific user
  const getUserWorklogs = useCallback(async (userId: string, filters?: DateRange) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(
        `${API_BASE_URL}/worklogs/user/${userId}?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user worklogs');
      }

      const data = await response.json();
      setWorklogs(Array.isArray(data) ? data : []);

      // Calculate stats
      const total_hours = (Array.isArray(data) ? data : []).reduce(
        (sum: number, w: Worklog) => sum + (w.hours || 0),
        0
      );
      const total_mandays = (Array.isArray(data) ? data : []).reduce(
        (sum: number, w: Worklog) => sum + (w.manday || 0),
        0
      );

      setStats({
        total_hours: Math.round(total_hours * 100) / 100,
        total_mandays: Math.round(total_mandays * 100) / 100,
        total_entries: Array.isArray(data) ? data.length : 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Error fetching user worklogs: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get worklog summary with statistics
  const getWorklogSummary = useCallback(async (filters?: WorklogFilters): Promise<WorklogStats> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.userId) params.append('userId', filters.userId);

      const response = await fetch(
        `${API_BASE_URL}/worklogs/analytics/summary?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch worklog summary');
      }

      const data = await response.json();
      setStats({
        total_hours: data.total_hours || 0,
        total_mandays: data.total_mandays || 0,
        total_entries: data.total_entries || 0,
      });

      return {
        total_hours: data.total_hours || 0,
        total_mandays: data.total_mandays || 0,
        total_entries: data.total_entries || 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Error fetching worklog summary: ${message}`);
      return stats;
    } finally {
      setLoading(false);
    }
  }, [stats]);

  return {
    worklogs,
    stats,
    loading,
    error,
    fetchWorklogs,
    createWorklog,
    updateWorklog,
    deleteWorklog,
    getProjectWorklogs,
    getUserWorklogs,
    getWorklogSummary,
  };
}
