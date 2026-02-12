// Project Types for Backend
export interface ProjectEntity {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  spent: number;
  remaining: number;
  managerId?: string;
  clientId?: string;
  hourlyRate: number;
  priority: string;
  category?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientEntity {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEntity {
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
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  managerId?: string;
  clientId?: string;
  hourlyRate?: number;
  priority?: string;
  category?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  spent?: number;
  remaining?: number;
  isArchived?: boolean;
}

export interface ProjectFilters {
  status?: string;
  managerId?: string;
  clientId?: string;
  priority?: string;
  isArchived?: boolean;
  search?: string;
}

export interface ProjectWithRelations extends ProjectEntity {
  manager?: UserEntity;
  client?: ClientEntity;
}

export interface ProjectListResponse {
  projects: ProjectWithRelations[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalBudget: number;
  totalSpent: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Export insights types
export * from './insights';