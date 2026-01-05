import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedApi, ProjectSummary } from '../lib/api-client';
import { dataService, Project } from '../services/dataService';

export function useProjects(filters?: {
  status?: string;
  category?: string;
  priority?: string;
  isArchived?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  // Use performance view for better performance
  const {
    data: projectSummaries,
    isLoading: summariesLoading,
    error: summariesError,
    refetch: refetchSummaries
  } = useQuery({
    queryKey: ['project-summaries', filters],
    queryFn: () => enhancedApi.getProjectSummaries(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Fallback to local data service if API fails
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataService.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await dataService.createProject(project);
      await loadProjects(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      await dataService.updateProject(id, updates);
      await loadProjects(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await dataService.deleteProject(id);
      await loadProjects(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    }
  };

  const initializeSampleData = async () => {
    try {
      await dataService.initializeSampleData();
      await loadProjects(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize sample data');
      throw err;
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return {
    // Performance view data (preferred)
    projectSummaries,
    summariesLoading,
    summariesError,

    // Fallback local data
    projects,
    loading: loading || summariesLoading,
    error: error || (summariesError?.message) || null,

    // CRUD operations
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: () => {
      refetchSummaries();
      loadProjects();
    },
    initializeSampleData,
  };
}
