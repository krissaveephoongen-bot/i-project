import { useState, useEffect } from 'react'
import { ProjectService } from '../lib/services/projects'
import { ProjectWithManager, ProjectInsert, ProjectUpdate } from '../types/database.types'

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await ProjectService.fetchProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch projects');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getProjectById = (id: string): ProjectWithManager | undefined => {
    return projects.find(project => project.id === id);
  };

  const updateProject = async (id: string, updates: ProjectUpdate): Promise<void> => {
    try {
      const updatedProject = await ProjectService.updateProject(id, updates);
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === id ? { ...project, ...updatedProject } : project
        )
      );
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const addProject = async (newProject: ProjectInsert): Promise<void> => {
    try {
      const createdProject = await ProjectService.createProject(newProject);
      // Fetch the full project with relations
      const projectWithDetails = await ProjectService.fetchProjectById(createdProject.id);
      if (projectWithDetails) {
        setProjects(prevProjects => [...prevProjects, projectWithDetails]);
      }
    } catch (err) {
      console.error('Error adding project:', err);
      throw err;
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    try {
      await ProjectService.deleteProject(id);
      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  const refreshProjects = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await ProjectService.fetchProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to refresh projects');
      console.error('Error refreshing projects:', err);
    } finally {
      setLoading(false);
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
    refreshProjects,
  };
}