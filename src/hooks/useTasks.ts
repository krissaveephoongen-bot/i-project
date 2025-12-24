import { useState, useEffect, useCallback } from 'react';
import { taskService } from '@/services/taskService';
import { Task, TaskStatus } from '../types/task';

interface UseTasksProps {
  initialFilters?: {
    status?: TaskStatus;
    projectId?: string;
    assigneeId?: string;
    search?: string;
  };
}

export const useTasks = ({ initialFilters = {} }: UseTasksProps = {}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState(initialFilters);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      setTasks(data.data);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create task'));
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskService.updateTask(id, updates);
      setTasks(prev => 
        prev.map(task => (task.id === id ? { ...task, ...updatedTask } : task))
      );
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task'));
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete task'));
      throw err;
    }
  };

  const updateStatus = async (id: string, status: TaskStatus) => {
    try {
      const updatedTask = await taskService.updateTaskStatus(id, status);
      setTasks(prev => 
        prev.map(task => (task.id === id ? { ...task, ...updatedTask } : task))
      );
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task status'));
      throw err;
    }
  };

  const setPage = (page: number) => {
    setPagination(prev => ({
      ...prev,
      page,
    }));
  };

  const setLimit = (limit: number) => {
    setPagination(prev => ({
      ...prev,
      limit,
      page: 1, // Reset to first page when changing limit
    }));
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  return {
    tasks,
    loading,
    error,
    pagination,
    filters,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    setPage,
    setLimit,
    updateFilters,
    refetch: fetchTasks,
  };
};
