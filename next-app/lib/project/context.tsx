"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Types
export type ProjectPhase = 
  | 'initiation' 
  | 'execution' 
  | 'financials' 
  | 'delivery' 
  | 'warranty';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  managerId?: string;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhaseProgress {
  phase: ProjectPhase;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: string;
}

export interface ProjectPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canManageBudget: boolean;
  canApprove: boolean;
}

export interface ProjectState {
  // Core Project Data
  project: Project | null;
  projectId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Phase Management
  currentPhase: ProjectPhase;
  availablePhases: ProjectPhase[];
  phaseProgress: PhaseProgress[];
  
  // User Context
  userRole: 'owner' | 'manager' | 'member' | 'viewer';
  permissions: ProjectPermissions;
  
  // Navigation
  breadcrumbs: Array<{ label: string; href?: string }>;
  navigationHistory: Array<{ phase: ProjectPhase; timestamp: string }>;
}

// Phase Configuration
export const PHASE_CONFIG = {
  initiation: {
    name: 'Initiation',
    description: 'Terms of Reference & Contracts',
    icon: '📋',
    order: 1,
    features: ['tor', 'contracts', 'approvals'],
  },
  execution: {
    name: 'Execution',
    description: 'Tasks & Timesheets',
    icon: '⚡',
    order: 2,
    features: ['tasks', 'timesheets', 'progress', 'resources'],
  },
  financials: {
    name: 'Financials',
    description: 'Budget & Milestones',
    icon: '💰',
    order: 3,
    features: ['milestones', 'budget', 'expenses', 'invoices'],
  },
  delivery: {
    name: 'Delivery',
    description: 'Go-Live & Handover',
    icon: '🚀',
    order: 4,
    features: ['go-live', 'handover', 'acceptance', 'documentation'],
  },
  warranty: {
    name: 'Warranty',
    description: 'MA & SLA Management',
    icon: '🛡️',
    order: 5,
    features: ['sla', 'maintenance', 'support', 'renewals'],
  },
} as const;

// Action Types
type ProjectAction =
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PHASE'; payload: ProjectPhase }
  | { type: 'UPDATE_PHASE_PROGRESS'; payload: { phase: ProjectPhase; progress: PhaseProgress } }
  | { type: 'SET_PERMISSIONS'; payload: ProjectPermissions }
  | { type: 'SET_USER_ROLE'; payload: ProjectState['userRole'] }
  | { type: 'ADD_BREADCRUMB'; payload: { label: string; href?: string } }
  | { type: 'CLEAR_BREADCRUMBS' }
  | { type: 'UPDATE_PROJECT'; payload: Partial<Project> };

// Reducer
function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT':
      return {
        ...state,
        project: action.payload,
        projectId: action.payload.id,
        isLoading: false,
        error: null,
        breadcrumbs: [
          { label: 'แดชบอร์ด', href: '/' },
          { label: 'โครงการ', href: '/projects' },
          { label: action.payload.name, href: `/projects/${action.payload.id}` },
        ],
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_PHASE':
      return { 
        ...state, 
        currentPhase: action.payload,
        navigationHistory: [
          ...state.navigationHistory,
          { phase: action.payload, timestamp: new Date().toISOString() }
        ]
      };
    
    case 'UPDATE_PHASE_PROGRESS':
      return {
        ...state,
        phaseProgress: state.phaseProgress.map(p =>
          p.phase === action.payload.phase ? action.payload.progress : p
        )
      };
    
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
    
    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload };
    
    case 'ADD_BREADCRUMB':
      return { ...state, breadcrumbs: [...state.breadcrumbs, action.payload] };
    
    case 'CLEAR_BREADCRUMBS':
      return { ...state, breadcrumbs: [] };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        project: state.project ? { ...state.project, ...action.payload } : null,
      };
    
    default:
      return state;
  }
}

// Initial State
const initialState: ProjectState = {
  project: null,
  projectId: null,
  isLoading: true,
  error: null,
  currentPhase: 'initiation',
  availablePhases: ['initiation', 'execution', 'financials', 'delivery', 'warranty'],
  phaseProgress: [
    { phase: 'initiation', progress: 0, status: 'not_started' },
    { phase: 'execution', progress: 0, status: 'not_started' },
    { phase: 'financials', progress: 0, status: 'not_started' },
    { phase: 'delivery', progress: 0, status: 'not_started' },
    { phase: 'warranty', progress: 0, status: 'not_started' },
  ],
  userRole: 'viewer',
  permissions: {
    canView: false,
    canEdit: false,
    canDelete: false,
    canManageTeam: false,
    canManageBudget: false,
    canApprove: false,
  },
  breadcrumbs: [],
  navigationHistory: [],
};

// Context
const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
  actions: {
    setProject: (project: Project) => void;
    switchPhase: (phase: ProjectPhase) => void;
    updateProject: (updates: Partial<Project>) => void;
    updatePhaseProgress: (phase: ProjectPhase, progress: Partial<PhaseProgress>) => void;
    addBreadcrumb: (crumb: { label: string; href?: string }) => void;
    clearBreadcrumbs: () => void;
    getPhaseConfig: (phase: ProjectPhase) => typeof PHASE_CONFIG[ProjectPhase];
    isPhaseAccessible: (phase: ProjectPhase) => boolean;
  };
} | null>(null);

// Provider Component
export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const params = useParams();
  const router = useRouter();

  // Actions
  const actions = {
    setProject: (project: Project) => {
      dispatch({ type: 'SET_PROJECT', payload: project });
    },

    switchPhase: (phase: ProjectPhase) => {
      dispatch({ type: 'SET_PHASE', payload: phase });
      // Update URL to reflect phase change
      if (state.projectId) {
        router.push(`/projects/${state.projectId}/${phase}`);
      }
    },

    updateProject: (updates: Partial<Project>) => {
      dispatch({ type: 'UPDATE_PROJECT', payload: updates });
    },

    updatePhaseProgress: (phase: ProjectPhase, progress: Partial<PhaseProgress>) => {
      const updatedProgress = {
        phase,
        ...state.phaseProgress.find(p => p.phase === phase),
        ...progress,
      } as PhaseProgress;
      
      dispatch({ type: 'UPDATE_PHASE_PROGRESS', payload: { phase, progress: updatedProgress } });
    },

    addBreadcrumb: (crumb: { label: string; href?: string }) => {
      dispatch({ type: 'ADD_BREADCRUMB', payload: crumb });
    },

    clearBreadcrumbs: () => {
      dispatch({ type: 'CLEAR_BREADCRUMBS' });
    },

    getPhaseConfig: (phase: ProjectPhase) => {
      return PHASE_CONFIG[phase];
    },

    isPhaseAccessible: (phase: ProjectPhase) => {
      // Check if user has permission to access this phase
      if (!state.permissions.canView) return false;
      
      // Check if previous phases are completed (except for initiation)
      const phaseIndex = PHASE_CONFIG[phase].order;
      if (phaseIndex > 1) {
        const previousPhase = Object.entries(PHASE_CONFIG)
          .find(([_, config]) => config.order === phaseIndex - 1)?.[0] as ProjectPhase;
        
        if (previousPhase) {
          const previousProgress = state.phaseProgress.find(p => p.phase === previousPhase);
          return previousProgress?.status === 'completed';
        }
      }
      
      return true;
    },
  };

  // Effects
  useEffect(() => {
    // Load project when projectId changes
    const projectId = params?.id as string;
    if (projectId && projectId !== state.projectId) {
      // Fetch project data
      fetchProjectData(projectId);
    }
  }, [params?.id]);

  useEffect(() => {
    // Update current phase from URL
    const phase = params?.phase as ProjectPhase;
    if (phase && phase !== state.currentPhase) {
      dispatch({ type: 'SET_PHASE', payload: phase });
    }
  }, [params?.phase]);

  // Helper function to fetch project data
  async function fetchProjectData(projectId: string) {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      
      const project = await response.json();
      actions.setProject(project);
      
      // Fetch phase progress
      const progressResponse = await fetch(`/api/projects/${projectId}/progress`);
      if (progressResponse.ok) {
        const phaseProgress = await progressResponse.json();
        phaseProgress.forEach((progress: PhaseProgress) => {
          dispatch({ type: 'UPDATE_PHASE_PROGRESS', payload: { phase: progress.phase, progress } });
        });
      }
      
      // Fetch user permissions
      const permissionsResponse = await fetch(`/api/projects/${projectId}/permissions`);
      if (permissionsResponse.ok) {
        const { role, permissions } = await permissionsResponse.json();
        dispatch({ type: 'SET_USER_ROLE', payload: role });
        dispatch({ type: 'SET_PERMISSIONS', payload: permissions });
      }
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  const value = { state, dispatch, actions };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

// Hook
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

// Phase-specific hooks
export function useCurrentPhase() {
  const { state, actions } = useProject();
  const phaseConfig = actions.getPhaseConfig(state.currentPhase);
  
  return {
    phase: state.currentPhase,
    config: phaseConfig,
    progress: state.phaseProgress.find(p => p.phase === state.currentPhase),
    isAccessible: actions.isPhaseAccessible(state.currentPhase),
    switchTo: actions.switchPhase,
    updateProgress: actions.updatePhaseProgress,
  };
}

export function useProjectPermissions() {
  const { state } = useProject();
  return state.permissions;
}

export function useProjectNavigation() {
  const { state, actions } = useProject();
  
  return {
    breadcrumbs: state.breadcrumbs,
    addBreadcrumb: actions.addBreadcrumb,
    clearBreadcrumbs: actions.clearBreadcrumbs,
    currentPhase: state.currentPhase,
    availablePhases: state.availablePhases,
    history: state.navigationHistory,
  };
}
