import { ProjectPhase } from './context';

export interface ProjectState {
  project: {
    id: string;
    name: string;
    status: string;
    progress: number;
    currentPhase: ProjectPhase;
    phaseProgress: Array<{
      phase: ProjectPhase;
      progress: number;
      status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
      completedAt?: string;
    }>;
  } | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

export interface ProjectStateAction {
  type: 'SET_PROJECT' | 'UPDATE_PROJECT' | 'SET_LOADING' | 'SET_ERROR' | 'UPDATE_PHASE_PROGRESS' | 'SET_CURRENT_PHASE';
  payload?: any;
}

export function projectStateReducer(state: ProjectState, action: ProjectStateAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT':
      return {
        ...state,
        project: action.payload,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    case 'UPDATE_PROJECT':
      if (!state.project) return state;
      return {
        ...state,
        project: { ...state.project, ...action.payload },
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'UPDATE_PHASE_PROGRESS':
      if (!state.project) return state;
      
      const updatedPhaseProgress = state.project.phaseProgress.map(phase =>
        phase.phase === action.payload.phase
          ? { ...phase, ...action.payload.updates }
          : phase
      );

      return {
        ...state,
        project: {
          ...state.project,
          phaseProgress: updatedPhaseProgress,
        },
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_CURRENT_PHASE':
      if (!state.project) return state;
      
      return {
        ...state,
        project: {
          ...state.project,
          currentPhase: action.payload,
        },
        lastUpdated: new Date().toISOString(),
      };

    default:
      return state;
  }
}

export function createInitialProjectState(): ProjectState {
  return {
    project: null,
    isLoading: true,
    error: null,
    lastUpdated: new Date().toISOString(),
  };
}

export function calculateProjectProgress(phaseProgress: Array<{
  phase: ProjectPhase;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: string;
}>): number {
  if (!phaseProgress || phaseProgress.length === 0) return 0;
  
  const totalProgress = phaseProgress.reduce((sum: number, phase) => sum + phase.progress, 0);
  return Math.round(totalProgress / phaseProgress.length);
}

export function getPhaseStatus(phaseProgress: Array<{
  phase: ProjectPhase;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: string;
}>, phase: ProjectPhase): string {
  const progress = phaseProgress.find(p => p.phase === phase);
  return progress?.status || 'not_started';
}

export function isPhaseCompleted(phaseProgress: Array<{
  phase: ProjectPhase;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: string;
}>, phase: ProjectPhase): boolean {
  return getPhaseStatus(phaseProgress, phase) === 'completed';
}

export function canTransitionToNextPhase(
  phaseProgress: Array<{
  phase: ProjectPhase;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: string;
}>,
  currentPhase: ProjectPhase
): boolean {
  const phaseOrder: ProjectPhase[] = ['initiation', 'execution', 'financials', 'delivery', 'warranty'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  
  if (currentIndex >= phaseOrder.length - 1) return false;
  
  const currentPhaseProgress = phaseProgress.find(p => p.phase === currentPhase);
  return currentPhaseProgress?.status === 'completed';
}

export function getNextPhase(
  phaseProgress: Array<{
  phase: ProjectPhase;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: string;
}>,
  currentPhase: ProjectPhase
): ProjectPhase | null {
  const phaseOrder: ProjectPhase[] = ['initiation', 'execution', 'financials', 'delivery', 'warranty'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  
  if (currentIndex >= phaseOrder.length - 1) return null;
  
  const nextPhase = phaseOrder[currentIndex + 1];
  return canTransitionToNextPhase(phaseProgress, currentPhase) ? nextPhase : null;
}

export function getPhaseCompletionPercentage(phaseProgress: Array<{
  phase: ProjectPhase;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: string;
}>): Record<ProjectPhase, number> {
  const completion: Record<ProjectPhase, number> = {
    initiation: 0,
    execution: 0,
    financials: 0,
    delivery: 0,
    warranty: 0,
  };

  phaseProgress.forEach((phase) => {
    completion[phase.phase] = phase.progress;
  });

  return completion;
}

export function validateProjectState(state: ProjectState): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!state.project) {
    errors.push('No project data available');
    return { isValid: false, errors };
  }

  if (!state.project.id) {
    errors.push('Project ID is required');
  }

  if (!state.project.name) {
    errors.push('Project name is required');
  }

  if (!state.project.currentPhase) {
    errors.push('Current phase is required');
  }

  if (!Array.isArray(state.project.phaseProgress)) {
    errors.push('Phase progress must be an array');
  }

  const validPhases: ProjectPhase[] = ['initiation', 'execution', 'financials', 'delivery', 'warranty'];
  const invalidPhases = state.project.phaseProgress.filter(
    (phase) => !validPhases.includes(phase.phase)
  );

  if (invalidPhases.length > 0) {
    errors.push(`Invalid phases found: ${invalidPhases.map((p) => p.phase).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getProjectHealthStatus(
  phaseProgress: Array<{
    phase: ProjectPhase;
    progress: number;
    status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
    completedAt?: string;
  }>,
  overallProgress: number
): 'healthy' | 'warning' | 'critical' {
  const completedPhases = phaseProgress.filter((p) => p.status === 'completed').length;
  const totalPhases = phaseProgress.length;
  const completionRate = completedPhases / totalPhases;

  if (completionRate >= 0.8 && overallProgress >= 80) {
    return 'healthy';
  } else if (completionRate >= 0.5 && overallProgress >= 50) {
    return 'warning';
  } else {
    return 'critical';
  }
}

export function getProjectSummary(state: ProjectState): {
  name: string;
  status: string;
  progress: number;
  currentPhase: ProjectPhase;
  completedPhases: number;
  totalPhases: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
} | null {
  if (!state.project) return null;

  const completedPhases = state.project.phaseProgress.filter((p) => p.status === 'completed').length;
  const totalPhases = state.project.phaseProgress.length;
  const overallProgress = calculateProjectProgress(state.project.phaseProgress);
  const healthStatus = getProjectHealthStatus(state.project.phaseProgress, overallProgress);

  return {
    name: state.project.name,
    status: state.project.status,
    progress: overallProgress,
    currentPhase: state.project.currentPhase,
    completedPhases,
    totalPhases,
    healthStatus,
    lastUpdated: state.lastUpdated,
  };
}
