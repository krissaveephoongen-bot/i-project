// Project Related Types

export interface Task {
  id: string;
  name: string;
  description?: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  plannedProgressWeight: number; // 0-100, represents weight in overall progress
  actualProgress: number; // 0-100
  assignedTo?: string; // userId
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
}

export interface Milestone {
  id: string;
  name: string;
  targetDate: Date;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  taskIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectBudget {
  total: number;
  spent: number;
  allocated: {
    labor: number;
    materials: number;
    equipment: number;
    other: number;
  };
  currency: string;
}

export interface ProjectProgress {
  plannedProgress: number; // 0-100
  actualProgress: number; // 0-100
  variance: number; // actualProgress - plannedProgress
  lastUpdated: Date;
}

export interface SCurveDataPoint {
  date: Date;
  week: number;
  plannedProgress: number;
  actualProgress: number;
  variance: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  projectManager?: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  budget: ProjectBudget;
  progress: ProjectProgress;
  tasks: Task[];
  milestones: Milestone[];
  sCurveData: SCurveDataPoint[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  teamMembers: string[]; // userIds
}

export interface ProjectFilters {
  status?: string;
  projectManager?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}
