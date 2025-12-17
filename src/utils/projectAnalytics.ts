import type { Project } from '@/services/dataService';

export interface ProjectAnalytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  planningProjects: number;
  reviewProjects: number;
  overdueProjects: number;
  totalBudget: number;
  totalTeamMembers: number;
  averageProgress: number;
  averageBudget: number;
  onTimeProjects: number;
}

/**
 * Calculate comprehensive project analytics
 */
export function calculateProjectAnalytics(projects: Project[]): ProjectAnalytics {
  if (!projects || projects.length === 0) {
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      planningProjects: 0,
      reviewProjects: 0,
      overdueProjects: 0,
      totalBudget: 0,
      totalTeamMembers: 0,
      averageProgress: 0,
      averageBudget: 0,
      onTimeProjects: 0,
    };
  }

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const planningProjects = projects.filter(p => p.status === 'planning').length;
  const reviewProjects = projects.filter(p => p.status === 'review').length;

  const now = new Date();
  const overdueProjects = projects.filter(
    p => p.status !== 'completed' && new Date(p.endDate) < now
  ).length;

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const averageBudget = totalProjects > 0 ? totalBudget / totalProjects : 0;

  const totalTeamMembers = new Set(
    projects.flatMap(p => p.teamMembers || []).map(m => typeof m === 'string' ? m : m.toString())
  ).size;

  const averageProgress = totalProjects > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects)
    : 0;

  const onTimeProjects = projects.filter(p => {
    if (p.status === 'completed') return true;
    return new Date(p.endDate) > now;
  }).length;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    planningProjects,
    reviewProjects,
    overdueProjects,
    totalBudget,
    totalTeamMembers,
    averageProgress,
    averageBudget,
    onTimeProjects,
  };
}

/**
 * Sort projects by specified field
 */
export function sortProjects(
  projects: Project[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): Project[] {
  const sorted = [...projects].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'progress':
        aValue = a.progress || 0;
        bValue = b.progress || 0;
        break;
      case 'dueDate':
        aValue = new Date(a.endDate).getTime();
        bValue = new Date(b.endDate).getTime();
        break;
      case 'budget':
        aValue = a.budget || 0;
        bValue = b.budget || 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
        break;
      case 'team':
        aValue = a.teamMembers?.length || 0;
        bValue = b.teamMembers?.length || 0;
        break;
      case 'created':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return sorted;
}

/**
 * Filter projects by search query and status
 */
export function filterProjects(
  projects: Project[],
  searchQuery: string,
  status: string,
  priority: string
): Project[] {
  return projects.filter(project => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags?.some(tag => tag.toLowerCase().includes(query));

      if (!matchesSearch) return false;
    }

    // Status filter
    if (status !== 'all' && project.status !== status) {
      return false;
    }

    // Priority filter
    if (priority !== 'all' && project.priority !== priority) {
      return false;
    }

    return true;
  });
}

/**
 * Get project health status
 */
export function getProjectHealth(project: Project) {
  const now = new Date();
  const endDate = new Date(project.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Determine schedule health
  let scheduleHealth: 'on-track' | 'at-risk' | 'overdue';
  if (project.status === 'completed') {
    scheduleHealth = 'on-track';
  } else if (daysRemaining < 0) {
    scheduleHealth = 'overdue';
  } else if (daysRemaining < 7 || (project.progress || 0) < 30) {
    scheduleHealth = 'at-risk';
  } else {
    scheduleHealth = 'on-track';
  }

  // Determine budget health (assuming progress indicates budget spend)
  let budgetHealth: 'healthy' | 'at-risk' | 'over-budget';
  const progress = project.progress || 0;
  if (progress <= 80) {
    budgetHealth = 'healthy';
  } else if (progress <= 100) {
    budgetHealth = 'at-risk';
  } else {
    budgetHealth = 'over-budget';
  }

  // Overall health
  const overallHealth = scheduleHealth === 'overdue' || budgetHealth === 'over-budget'
    ? 'critical'
    : scheduleHealth === 'at-risk' || budgetHealth === 'at-risk'
      ? 'warning'
      : 'healthy';

  return {
    scheduleHealth,
    budgetHealth,
    overallHealth: overallHealth as 'healthy' | 'warning' | 'critical',
    daysRemaining,
  };
}

/**
 * Calculate project burndown/burn-up
 */
export function calculateProjectBurndown(project: Project) {
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const now = new Date();

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const elapsedPercentage = (elapsedDays / totalDays) * 100;
  const progressPercentage = project.progress || 0;

  // Ideal burn should match elapsed time
  const isOnTrack = Math.abs(progressPercentage - elapsedPercentage) <= 10;

  return {
    totalDays,
    elapsedDays,
    elapsedPercentage: Math.round(elapsedPercentage),
    progressPercentage: Math.round(progressPercentage),
    isOnTrack,
    projectedEndDate: new Date(
      startDate.getTime() + (totalDays * 1000 * 60 * 60 * 24 * (elapsedDays / progressPercentage || 1))
    ),
  };
}

/**
 * Get project milestones (estimated)
 */
export function getProjectMilestones(project: Project) {
  const milestones = [];
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const totalMs = endDate.getTime() - startDate.getTime();

  // Create 4 equal milestones
  for (let i = 1; i <= 4; i++) {
    const milestone = new Date(startDate.getTime() + (totalMs * (i / 4)));
    milestones.push({
      id: `milestone-${i}`,
      name: `Phase ${i}`,
      targetDate: milestone.toISOString().split('T')[0],
      targetProgress: i * 25,
      actualProgress: i === 4 ? project.progress : Math.min(project.progress || 0, i * 25),
      isCompleted: milestone < new Date() && (project.progress || 0) >= i * 25,
    });
  }

  return milestones;
}

/**
 * Get projects requiring attention
 */
export function getProjectsAtRisk(projects: Project[]) {
  return projects.filter(project => {
    if (project.status === 'completed') return false;

    const health = getProjectHealth(project);
    const burndown = calculateProjectBurndown(project);

    return (
      health.overallHealth !== 'healthy' ||
      !burndown.isOnTrack ||
      project.status === 'review'
    );
  });
}
