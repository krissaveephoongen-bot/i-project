"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// TYPES
// ============================================================

export interface Project {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status: string;
  progress: number;
  progressPlan: number;
  spi: number;
  riskLevel: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  remaining?: number;
  hourlyRate?: number;
  managerId?: string;
  clientId?: string;
  priority: string;
  category?: string;
  isArchived: boolean;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  closureChecklist?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectState {
  activeProject: Project | null;
  activeProjectId: string | null;
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

export interface ProjectContextType extends ProjectState {
  setActiveProject: (projectId: string) => Promise<void>;
  clearActiveProject: () => void;
  loadProjects: () => Promise<void>;
  refreshProject: (projectId: string) => Promise<void>;
  updateProject: (projectId: string, data: Partial<Project>) => Promise<void>;
  getProjectsByStatus: (status: string) => Project[];
  getProjectsByRiskLevel: (riskLevel: string) => Project[];
  searchProjects: (query: string) => Project[];
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// ============================================================
// ACTION TYPES
// ============================================================

type ProjectAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_ACTIVE_PROJECT'; payload: Project }
  | { type: 'CLEAR_ACTIVE_PROJECT' }
  | { type: 'UPDATE_PROJECT'; payload: { projectId: string; data: Partial<Project> } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_LAST_UPDATED' };

// ============================================================
// REDUCER
// ============================================================

const initialState: ProjectState = {
  activeProject: null,
  activeProjectId: null,
  projects: [],
  isLoading: false,
  error: null,
  lastUpdated: Date.now(),
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.payload,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      };

    case 'SET_ACTIVE_PROJECT':
      return {
        ...state,
        activeProject: action.payload,
        activeProjectId: action.payload.id,
        error: null,
        lastUpdated: Date.now(),
      };

    case 'CLEAR_ACTIVE_PROJECT':
      return {
        ...state,
        activeProject: null,
        activeProjectId: null,
      };

    case 'UPDATE_PROJECT':
      const { projectId, data } = action.payload;
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === projectId ? { ...project, ...data } : project
        ),
        activeProject:
          state.activeProject?.id === projectId
            ? { ...state.activeProject, ...data }
            : state.activeProject,
        lastUpdated: Date.now(),
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'UPDATE_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: Date.now(),
      };

    default:
      return state;
  }
}

// ============================================================
// CONTEXT
// ============================================================

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const router = useRouter();

  // ============================================================
  // API HELPERS
  // ============================================================

  const apiCall = async (
    endpoint: string,
    options: RequestInit = {},
    includeProjectContext: boolean = true
  ): Promise<any> => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth token from localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add project context if available
    if (includeProjectContext && state.activeProjectId) {
      headers['x-project-id'] = state.activeProjectId;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  };

  // ============================================================
  // PROJECT ACTIONS
  // ============================================================

  const loadProjects = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiCall('/projects', {
        method: 'GET',
      }, false); // Don't require project context for listing projects

      if (response.success && response.data) {
        dispatch({ type: 'SET_PROJECTS', payload: response.data });
      } else {
        throw new Error(response.message || 'Failed to load projects');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load projects' });
      throw error;
    }
  };

  const setActiveProject = async (projectId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // First check if project is already loaded
      let project = state.projects.find(p => p.id === projectId);

      if (!project) {
        // Fetch project details
        const response = await apiCall(`/projects/${projectId}`, {
          method: 'GET',
        }, false); // Don't require project context for getting project details

        if (response.success && response.data) {
          project = response.data;
        } else {
          throw new Error(response.message || 'Project not found');
        }
      }

      if (project) {
        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project });

        // Store in localStorage for persistence
        localStorage.setItem('active_project_id', projectId);

        // Update URL if not already on project page
        const currentPath = window.location.pathname;
        if (!currentPath.includes(`/projects/${projectId}`)) {
          router.push(`/projects/${projectId}`);
        }
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to set active project' });
      throw error;
    }
  };

  const clearActiveProject = (): void => {
    dispatch({ type: 'CLEAR_ACTIVE_PROJECT' });
    localStorage.removeItem('active_project_id');
  };

  const refreshProject = async (projectId: string): Promise<void> => {
    try {
      const response = await apiCall(`/projects/${projectId}`, {
        method: 'GET',
      }, false);

      if (response.success && response.data) {
        dispatch({
          type: 'UPDATE_PROJECT',
          payload: { projectId, data: response.data },
        });
      } else {
        throw new Error(response.message || 'Failed to refresh project');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to refresh project' });
      throw error;
    }
  };

  const updateProject = async (projectId: string, data: Partial<Project>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiCall(`/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        dispatch({
          type: 'UPDATE_PROJECT',
          payload: { projectId, data: response.data },
        });
      } else {
        throw new Error(response.message || 'Failed to update project');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to update project' });
      throw error;
    }
  };

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  const getProjectsByStatus = (status: string): Project[] => {
    return state.projects.filter(project => project.status === status);
  };

  const getProjectsByRiskLevel = (riskLevel: string): Project[] => {
    return state.projects.filter(project => project.riskLevel === riskLevel);
  };

  const searchProjects = (query: string): Project[] => {
    const lowercaseQuery = query.toLowerCase();
    return state.projects.filter(project =>
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.code?.toLowerCase().includes(lowercaseQuery) ||
      project.description?.toLowerCase().includes(lowercaseQuery) ||
      project.category?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setLoading = (loading: boolean): void => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  useEffect(() => {
    const initializeProjectContext = async () => {
      try {
        // Load all projects
        await loadProjects();

        // Check for stored active project ID
        const storedProjectId = localStorage.getItem('active_project_id');
        
        if (storedProjectId) {
          // Validate that the project still exists
          const project = state.projects.find(p => p.id === storedProjectId);
          
          if (project) {
            dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project });
          } else {
            // Clear invalid project ID
            localStorage.removeItem('active_project_id');
          }
        }
      } catch (error) {
        console.error('Project context initialization error:', error);
      }
    };

    // Only initialize if we have an auth token
    const token = localStorage.getItem('auth_token');
    if (token) {
      initializeProjectContext();
    }
  }, []);

  // ============================================================
  // AUTO-REFRESH
  // ============================================================

  useEffect(() => {
    if (!state.activeProjectId) return;

    // Auto-refresh active project every 2 minutes
    const interval = setInterval(async () => {
      try {
        await refreshProject(state.activeProjectId!);
      } catch (error) {
        console.error('Auto-refresh error:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [state.activeProjectId]);

  // ============================================================
  // URL SYNCHRONIZATION
  // ============================================================

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const projectMatch = path.match(/\/projects\/([^\/]+)/);
      
      if (projectMatch && projectMatch[1]) {
        const projectId = projectMatch[1];
        
        // If URL has project ID but context doesn't, update context
        if (state.activeProjectId !== projectId) {
          setActiveProject(projectId).catch(console.error);
        }
      } else if (state.activeProjectId) {
        // If URL doesn't have project ID but context does, clear context
        clearActiveProject();
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Check current route
    handleRouteChange();

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [state.activeProjectId]);

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value: ProjectContextType = {
    ...state,
    setActiveProject,
    clearActiveProject,
    loadProjects,
    refreshProject,
    updateProject,
    getProjectsByStatus,
    getProjectsByRiskLevel,
    searchProjects,
    clearError,
    setLoading,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

// ============================================================
// HOOK
// ============================================================

export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

// ============================================================
// HIGHER-ORDER COMPONENTS
// ============================================================

interface ProjectRequiredProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProjectRequired({ 
  children, 
  fallback = <div>Please select a project to continue</div>
}: ProjectRequiredProps) {
  const { activeProject, isLoading } = useProject();

  if (isLoading) {
    return <div>Loading project...</div>;
  }

  if (!activeProject) {
    return fallback;
  }

  return <>{children}</>;
}

// ============================================================
// PROJECT GATES
// ============================================================

interface ProjectGateProps {
  children: ReactNode;
  projectId?: string;
  requireActive?: boolean;
  fallback?: ReactNode;
}

export function ProjectGate({ 
  children, 
  projectId,
  requireActive = false,
  fallback = null
}: ProjectGateProps) {
  const { activeProject, activeProjectId } = useProject();

  let hasAccess = true;

  if (requireActive && !activeProject) {
    hasAccess = false;
  } else if (projectId && activeProjectId !== projectId) {
    hasAccess = false;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
