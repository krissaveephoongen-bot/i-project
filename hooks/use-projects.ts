import { useState, useEffect } from 'react';

// Mock project data - replace with actual API calls
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete redesign of the company website with modern UI/UX',
    status: 'active',
    priority: 'high',
    progress: 65,
    budget: 50000,
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-04-30T00:00:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    teamMembers: ['user1', 'user2', 'user3'],
    tags: ['web', 'design', 'frontend']
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android',
    status: 'review',
    priority: 'medium',
    progress: 30,
    budget: 80000,
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-06-15T00:00:00Z',
    createdAt: '2024-01-25T00:00:00Z',
    teamMembers: ['user4', 'user5'],
    tags: ['mobile', 'react-native', 'backend']
  },
  {
    id: '3',
    name: 'Data Analytics Dashboard',
    description: 'Business intelligence dashboard for analytics and reporting',
    status: 'planning',
    priority: 'urgent',
    progress: 10,
    budget: 30000,
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-05-30T00:00:00Z',
    createdAt: '2024-02-15T00:00:00Z',
    teamMembers: ['user6'],
    tags: ['analytics', 'dashboard', 'bi']
  },
  {
    id: '4',
    name: 'API Integration',
    description: 'Integration with third-party payment and shipping APIs',
    status: 'completed',
    priority: 'low',
    progress: 100,
    budget: 20000,
    startDate: '2023-11-01T00:00:00Z',
    endDate: '2023-12-15T00:00:00Z',
    createdAt: '2023-10-20T00:00:00Z',
    teamMembers: ['user7', 'user8'],
    tags: ['api', 'integration', 'backend']
  }
];

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'review' | 'planning' | 'completed';
  priority: 'high' | 'medium' | 'low' | 'urgent';
  progress: number;
  budget: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  teamMembers: string[];
  tags: string[];
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setProjects(mockProjects);
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

  const getProjectById = (id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  };

  const updateProject = (id: string, updates: Partial<Project>): void => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };

  const addProject = (newProject: Omit<Project, 'id'>): void => {
    const project: Project = {
      ...newProject,
      id: Date.now().toString(), // Simple ID generation
    };
    setProjects(prevProjects => [...prevProjects, project]);
  };

  const deleteProject = (id: string): void => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
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