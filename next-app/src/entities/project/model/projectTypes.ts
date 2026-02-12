import type { Project } from '@/shared/types';

export interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  managerId: string;
  teamMembers: string[];
}

export interface ProjectFilters {
  status?: Project['status'];
  managerId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  planning: number;
  totalBudget: number;
  totalActualCost: number;
  averageProgress: number;
}

export interface ProjectMetrics {
  budgetUtilization: number;
  schedulePerformance: number;
  resourceUtilization: number;
  qualityScore: number;
}
