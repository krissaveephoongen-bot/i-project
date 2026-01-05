/**
 * Custom hook for fetching project data from API
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface ProjectData {
  id: number;
  name: string;
  code: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: string | number;
  spent: string | number;
  remaining: string | number;
  managerId: number;
  clientId: number;
  hourlyRate: string | number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskData {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  estimatedHours: string | number;
  actualHours: string | number;
  weight: string | number;
  completedAt: string | null;
  projectId: number;
  assignedTo: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntryData {
  id: number;
  date: string;
  workType: string;
  projectId: number;
  taskId: number;
  userId: number;
  startTime: string;
  endTime: string;
  hours: string | number;
  description: string;
  status: string;
  approvedBy: number | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseData {
  id: number;
  date: string;
  projectId: number;
  taskId: number | null;
  userId: number;
  amount: string | number;
  category: string;
  description: string;
  receiptUrl: string | null;
  status: string;
  approvedBy: number | null;
  approvedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// useProjects hook
export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      setProjects(response.data.data || response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
};

// useProjectById hook
export const useProjectById = (projectId: number | null) => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
        setProject(response.data.data || response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error(`Error fetching project ${projectId}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return { project, loading, error };
};

// useTimeEntries hook
export const useTimeEntries = () => {
  const [entries, setEntries] = useState<TimeEntryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/time-entries`);
      setEntries(response.data.data || response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching time entries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, error, refetch: fetchEntries };
};

// useProjectTimeEntries hook
export const useProjectTimeEntries = (projectId: number | null) => {
  const [entries, setEntries] = useState<TimeEntryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchEntries = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/time-entries`);
        setEntries(response.data.data || response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error(`Error fetching time entries for project ${projectId}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [projectId]);

  return { entries, loading, error };
};

// useExpenses hook
export const useExpenses = () => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses`);
      setExpenses(response.data.data || response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { expenses, loading, error, refetch: fetchExpenses };
};

// useProjectExpenses hook
export const useProjectExpenses = (projectId: number | null) => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/expenses`);
        setExpenses(response.data.data || response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error(`Error fetching expenses for project ${projectId}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [projectId]);

  return { expenses, loading, error };
};

// useProjectTasks hook
export const useProjectTasks = (projectId: number | null) => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/tasks`);
        setTasks(response.data.data || response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error(`Error fetching tasks for project ${projectId}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  return { tasks, loading, error };
};
