// Project Types for Frontend
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
  spent: number;
  remaining: number;
  managerId?: string;
  clientId?: string;
  hourlyRate: number;
  priority: string;
  category?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  client?: {
    id: string;
    name: string;
  };
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  department?: string;
  position?: string;
}

export interface CreateProjectData {
  name: string;
  code?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  managerId?: string;
  clientId?: string;
  hourlyRate?: number;
  priority?: string;
  category?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

export interface ProjectFilters {
  search?: string;
  status?: string;
  manager?: string;
  priority?: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
}

// Enhanced project with computed fields
export interface EnhancedProject extends Project {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  statusColor: string;
  daysRemaining: number;
  isOverdue: boolean;
}

// Form types
export interface ProjectFormData extends CreateProjectData {}

export interface ProjectFiltersFormData extends ProjectFilters {}

// API Response types
export interface ProjectsResponse {
  projects: Project[];
  total?: number;
}

export interface ProjectResponse {
  project: Project;
}

export interface CreateProjectResponse {
  project: Project;
  message: string;
}

export interface UpdateProjectResponse {
  project: Project;
  message: string;
}

export interface DeleteProjectResponse {
  message: string;
}

// API Error types
export interface ApiError {
  error: string;
  message?: string;
  code?: string;
}

// Hook return types
export interface UseProjectsReturn {
  projects: EnhancedProject[];
  isLoading: boolean;
  error: string | null;
  stats: ProjectStats;
  filters: ProjectFilters;
  setFilters: (filters: ProjectFilters) => void;
  refetch: () => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  recalculateProjectData: (id: string) => Promise<void>;
}

export interface UseProjectReturn {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProject: (data: UpdateProjectData) => Promise<Project>;
  deleteProject: () => Promise<void>;
}

// Table column types
export interface ProjectTableColumn {
  id: string;
  name: string;
  status: string;
  progress: number;
  manager?: string;
  budget?: number;
  dueDate?: string;
  riskLevel: string;
  actions?: any;
}