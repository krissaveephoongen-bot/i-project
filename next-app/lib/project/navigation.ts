import { ProjectPhase } from './context';

export interface PhaseNavigationItem {
  phase: ProjectPhase;
  name: string;
  description: string;
  icon: string;
  order: number;
  features: string[];
  href: string;
  isActive: boolean;
  isCompleted: boolean;
  isAccessible: boolean;
  progress: number;
}

export interface ProjectNavigation {
  currentPhase: ProjectPhase;
  phases: PhaseNavigationItem[];
  breadcrumbs: Array<{ label: string; href?: string }>;
  canNavigateTo: (phase: ProjectPhase) => boolean;
  navigateTo: (phase: ProjectPhase) => void;
  getPhaseUrl: (phase: ProjectPhase) => string;
}

export function createProjectNavigation(
  projectId: string,
  currentPhase: ProjectPhase,
  phaseProgress: Array<{ phase: ProjectPhase; status: string; progress: number }>,
  permissions: { canView: boolean; canEdit: boolean }
): ProjectNavigation {
  const phases: PhaseNavigationItem[] = [
    {
      phase: 'initiation',
      name: 'Initiation',
      description: 'Terms of Reference & Contracts',
      icon: '📋',
      order: 1,
      features: ['tor', 'contracts', 'approvals'],
      href: `/projects/${projectId}/initiation`,
      isActive: currentPhase === 'initiation',
      isCompleted: phaseProgress.find(p => p.phase === 'initiation')?.status === 'completed',
      isAccessible: true, // Always accessible as first phase
      progress: phaseProgress.find(p => p.phase === 'initiation')?.progress || 0,
    },
    {
      phase: 'execution',
      name: 'Execution',
      description: 'Tasks & Timesheets',
      icon: '⚡',
      order: 2,
      features: ['tasks', 'timesheets', 'progress', 'resources'],
      href: `/projects/${projectId}/execution`,
      isActive: currentPhase === 'execution',
      isCompleted: phaseProgress.find(p => p.phase === 'execution')?.status === 'completed',
      isAccessible: phaseProgress.find(p => p.phase === 'initiation')?.status === 'completed',
      progress: phaseProgress.find(p => p.phase === 'execution')?.progress || 0,
    },
    {
      phase: 'financials',
      name: 'Financials',
      description: 'Budget & Milestones',
      icon: '💰',
      order: 3,
      features: ['milestones', 'budget', 'expenses', 'invoices'],
      href: `/projects/${projectId}/financials`,
      isActive: currentPhase === 'financials',
      isCompleted: phaseProgress.find(p => p.phase === 'financials')?.status === 'completed',
      isAccessible: phaseProgress.find(p => p.phase === 'execution')?.status === 'completed',
      progress: phaseProgress.find(p => p.phase === 'financials')?.progress || 0,
    },
    {
      phase: 'delivery',
      name: 'Delivery',
      description: 'Go-Live & Handover',
      icon: '🚀',
      order: 4,
      features: ['go-live', 'handover', 'acceptance', 'documentation'],
      href: `/projects/${projectId}/delivery`,
      isActive: currentPhase === 'delivery',
      isCompleted: phaseProgress.find(p => p.phase === 'delivery')?.status === 'completed',
      isAccessible: phaseProgress.find(p => p.phase === 'financials')?.status === 'completed',
      progress: phaseProgress.find(p => p.phase === 'delivery')?.progress || 0,
    },
    {
      phase: 'warranty',
      name: 'Warranty',
      description: 'MA & SLA Management',
      icon: '🛡️',
      order: 5,
      features: ['sla', 'maintenance', 'support', 'renewals'],
      href: `/projects/${projectId}/warranty`,
      isActive: currentPhase === 'warranty',
      isCompleted: phaseProgress.find(p => p.phase === 'warranty')?.status === 'completed',
      isAccessible: phaseProgress.find(p => p.phase === 'delivery')?.status === 'completed',
      progress: phaseProgress.find(p => p.phase === 'warranty')?.progress || 0,
    },
  ];

  const breadcrumbs = [
    { label: 'แดชบอร์ด', href: '/' },
    { label: 'โครงการ', href: '/projects' },
    { label: getPhaseName(currentPhase), href: `/projects/${projectId}/${currentPhase}` },
  ];

  const canNavigateTo = (phase: ProjectPhase): boolean => {
    if (!permissions.canView) return false;
    
    const phaseData = phases.find(p => p.phase === phase);
    return phaseData?.isAccessible || false;
  };

  const navigateTo = (phase: ProjectPhase): void => {
    if (canNavigateTo(phase)) {
      window.location.href = `/projects/${projectId}/${phase}`;
    }
  };

  const getPhaseUrl = (phase: ProjectPhase): string => {
    return `/projects/${projectId}/${phase}`;
  };

  return {
    currentPhase,
    phases,
    breadcrumbs,
    canNavigateTo,
    navigateTo,
    getPhaseUrl,
  };
}

export function getPhaseName(phase: ProjectPhase): string {
  const phaseNames = {
    initiation: 'Initiation',
    execution: 'Execution',
    financials: 'Financials',
    delivery: 'Delivery',
    warranty: 'Warranty',
  };
  return phaseNames[phase];
}

export function getPhaseIcon(phase: ProjectPhase): string {
  const phaseIcons = {
    initiation: '📋',
    execution: '⚡',
    financials: '💰',
    delivery: '🚀',
    warranty: '🛡️',
  };
  return phaseIcons[phase];
}

export function getPhaseDescription(phase: ProjectPhase): string {
  const phaseDescriptions = {
    initiation: 'Terms of Reference & Contracts',
    execution: 'Tasks & Timesheets',
    financials: 'Budget & Milestones',
    delivery: 'Go-Live & Handover',
    warranty: 'MA & SLA Management',
  };
  return phaseDescriptions[phase];
}

export function getNextPhase(currentPhase: ProjectPhase): ProjectPhase | null {
  const phaseOrder: ProjectPhase[] = ['initiation', 'execution', 'financials', 'delivery', 'warranty'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  return currentIndex < phaseOrder.length - 1 ? phaseOrder[currentIndex + 1] : null;
}

export function getPreviousPhase(currentPhase: ProjectPhase): ProjectPhase | null {
  const phaseOrder: ProjectPhase[] = ['initiation', 'execution', 'financials', 'delivery', 'warranty'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  return currentIndex > 0 ? phaseOrder[currentIndex - 1] : null;
}

export function isPhaseCompleted(phaseProgress: Array<{ phase: ProjectPhase; status: string }>, phase: ProjectPhase): boolean {
  const progress = phaseProgress.find(p => p.phase === phase);
  return progress?.status === 'completed';
}

export function getPhaseProgressPercentage(phaseProgress: Array<{ phase: ProjectPhase; progress: number }>, phase: ProjectPhase): number {
  const progress = phaseProgress.find(p => p.phase === phase);
  return progress?.progress || 0;
}
