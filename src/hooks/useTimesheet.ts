import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeEntry } from '../types/database';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export function useTimesheet(userId: number, date: Date = new Date()) {
  const queryClient = useQueryClient();
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Fetch timesheet entries for the current month via API
  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ['timesheet', userId, format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      const response = await fetch(`/api/timeentries?userId=${userId}&startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch timesheet');
      return response.json();
    },
  });

  // Fetch projects for dropdown via API
  const { data: projectList = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const result = await response.json();
      // Handle both wrapped and unwrapped responses
      return result.data || result;
    },
  });

  // Fetch tasks for selected project
  const fetchTasks = async (projectId: number) => {
    if (!projectId) return [];
    const response = await fetch(`/api/projects/${projectId}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const result = await response.json();
    return result.data || result;
  };

  // Add new time entry
  const addEntry = useMutation({
    mutationFn: async (newEntry: any) => {
      const response = await fetch('/api/timeentries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      if (!response.ok) throw new Error('Failed to add time entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', userId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update time entry
  const updateEntry = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: any;
    }) => {
      const response = await fetch(`/api/timeentries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update time entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', userId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Delete time entry
  const deleteEntry = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/timeentries/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete time entry');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', userId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Calculate monthly statistics
  const getMonthlyStats = () => {
    const workingDays = 22; // Default working days in a month
    const loggedDays = new Set(entries.map((entry: any) => format(new Date(entry.date), 'yyyy-MM-dd'))).size;
    const totalHours = entries.reduce((sum: number, entry: any) => sum + Number(entry.hours), 0);
    const totalMandays = Number((totalHours / 8).toFixed(2));

    return {
      month: format(monthStart, 'MMMM yyyy'),
      year: monthStart.getFullYear(),
      workingDays,
      loggedDays,
      missingDays: workingDays - loggedDays,
      totalHours,
      totalMandays,
    };
  };

  return {
    entries,
    projectList,
    fetchTasks,
    addEntry,
    updateEntry,
    deleteEntry,
    isLoading,
    error,
    stats: getMonthlyStats(),
  };
}

// Hook for real-time budget tracking
export function useProjectBudget(projectId: number) {
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId, 'budget'],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!projectId,
    refetchInterval: 60000, // Refresh every minute
  });

  return { project, isLoading, error };
}
