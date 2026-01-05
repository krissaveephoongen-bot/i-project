import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Project {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: string | null;
  spent: string;
  remaining: string;
  managerId: number | null;
  clientId: number | null;
  hourlyRate: string;
  priority: string | null;
  category: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/projects`);
        setProjects(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch projects');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [apiUrl]);

  const getProjectById = (id: number): Project | undefined => {
    return projects.find(project => project.id === id);
  };

  const updateProject = async (id: number, updates: Partial<Project>): Promise<void> => {
    try {
      const response = await axios.put(`${apiUrl}/projects/${id}`, updates);
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === id ? response.data : project
        )
      );
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const addProject = async (newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      const response = await axios.post(`${apiUrl}/projects`, newProject);
      setProjects(prevProjects => [...prevProjects, response.data]);
    } catch (err) {
      console.error('Error adding project:', err);
      throw err;
    }
  };

  const deleteProject = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${apiUrl}/projects/${id}`);
      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    getProjectById,
    updateProject,
    addProject,
    deleteProject,
  };
}