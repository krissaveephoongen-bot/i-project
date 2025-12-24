import { useState, useEffect } from 'react';
import { Project } from '@/types/project';

interface ProjectsResponse {
  success: boolean;
  data: Project[];
  isEmpty?: boolean;
  message?: string;
  error?: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsEmpty(false);
        
        const response = await fetch('/api/projects', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data: ProjectsResponse = await response.json();
        
        if (data.isEmpty) {
          setIsEmpty(true);
          setEmptyMessage(data.message || 'No projects available.');
          setProjects([]);
        } else {
          setProjects(Array.isArray(data.data) ? data.data : []);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, loading, error, isEmpty, emptyMessage };
};

export default useProjects;
