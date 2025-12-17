import { useState, useEffect } from 'react';
import { dataService, Project } from '../services/dataService';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
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
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: loadProjects,
    initializeSampleData,
  };
}
