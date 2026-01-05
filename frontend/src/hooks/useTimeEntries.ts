import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { timesheetService } from '@/services/timesheetService';
import { apiRequest } from '@/lib/api-client';

// Note: All mock data has been removed. Real database queries are now used.

export interface TimeEntryFormData {
  date: string;
  workType: 'project' | 'office' | 'other';
  projectId?: number;
  taskId?: number;
  startTime: string;
  endTime: string;
  hours: number;
  description: string;
}

export function useTimeEntries(userId: number, date: Date = new Date()) {
  const queryClient = useQueryClient();
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Fetch timesheet entries for the current month via API
  const { 
    data: entries = [], 
    isLoading: isLoadingEntries, 
    error: entriesError 
  } = useQuery({
    queryKey: ['time-entries', userId, format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      return timesheetService.getTimesheetEntries({
        userId: String(userId),
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
      });
    },
  });

  // Fetch projects for dropdown via API
  const {
    data: projectList = [],
    isLoading: isLoadingProjects,
    error: projectsError
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
       const result = await apiRequest<any>('/api/projects');
       // Handle both wrapped and unwrapped responses
       const projects = result.data || result;
       console.log('Fetched projects:', projects);
       return Array.isArray(projects) ? projects : [];
     },
  });

  // Fetch tasks for selected project via API
  const { 
    data: taskList = [], 
    isLoading: isLoadingTasks, 
    refetch: refetchTasks 
  } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const result = await apiRequest<any>(`/api/projects/${selectedProjectId}/tasks`);
      return result.data || result;
    },
    enabled: !!selectedProjectId,
  });

  // Add new time entry
  const addEntry = useMutation({
    mutationFn: async (newEntry: Omit<TimeEntryFormData, 'hours'>) => {
      return timesheetService.createTimeEntry({
        date: newEntry.date,
        workType: newEntry.workType,
        projectId: newEntry.projectId,
        taskId: newEntry.taskId,
        userId,
        startTime: newEntry.startTime,
        endTime: newEntry.endTime,
        hours: calculateHours(newEntry.startTime, newEntry.endTime),
        description: newEntry.description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', userId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update time entry
  const updateEntry = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<TimeEntryFormData> }) => {
      return timesheetService.updateTimeEntry(id, {
        date: updates.date,
        workType: updates.workType,
        projectId: updates.projectId,
        taskId: updates.taskId,
        startTime: updates.startTime,
        endTime: updates.endTime,
        description: updates.description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', userId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Delete time entry
  const deleteEntry = useMutation({
    mutationFn: async (id: number) => {
      return timesheetService.deleteTimeEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', userId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Calculate hours between two time strings
  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startDate = new Date();
    startDate.setHours(startHours || 0, startMinutes || 0, 0, 0);

    let endDate = new Date();
    endDate.setHours(endHours || 0, endMinutes || 0, 0, 0);

    // Handle overnight entries (end time is next day)
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
  };

  // Calculate monthly statistics
  const getMonthlyStats = () => {
    const workingDays = 22; // Default working days in a month
    const loggedDays = new Set(entries.map((entry: any) => 
      format(new Date(entry.date), 'yyyy-MM-dd'))
    ).size;
    
    const totalHours = entries.reduce(
      (sum: number, entry: any) => sum + Number(entry.hours || 0), 
      0
    );
    
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
    taskList,
    selectedProjectId,
    setSelectedProjectId,
    addEntry,
    updateEntry,
    deleteEntry,
    isLoading: isLoadingEntries || isLoadingProjects || isLoadingTasks,
    error: entriesError || projectsError,
    stats: getMonthlyStats(),
    refetchTasks,
  };
}

// Hook for real-time budget tracking
export function useProjectBudget(projectId: number) {
  const { data: project, isLoading, error, refetch } = useQuery({
    queryKey: ['project', projectId, 'budget'],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!projectId,
    refetchInterval: 60000, // Refresh every minute
  });

  return { 
    project, 
    isLoading, 
    error, 
    refetch,
    updateBudget: async (newBudget: number, reason: string) => {
      if (!projectId || !project) return null;
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: newBudget,
          budgetRevisionReason: reason,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update budget');
      await refetch();
      return response.json();
    }
  };
}
