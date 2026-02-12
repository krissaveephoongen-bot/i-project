import { apiClient } from '@/shared/lib/api/client';
import type { Project, ApiResponse, PaginatedResponse, PaginationParams } from '@/shared/types';

export interface CreateProjectData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  managerId: string;
  teamMembers: string[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: Project['status'];
  progress?: number;
  actualCost?: number;
}

export class ProjectApi {
  static async getProjects(params?: PaginationParams): Promise<PaginatedResponse<Project>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }

  static async getProject(id: string): Promise<ApiResponse<Project>> {
    return apiClient.get(`/api/projects/${id}`);
  }

  static async createProject(data: CreateProjectData): Promise<ApiResponse<Project>> {
    return apiClient.post('/api/projects', data);
  }

  static async updateProject(id: string, data: UpdateProjectData): Promise<ApiResponse<Project>> {
    return apiClient.put(`/api/projects/${id}`, data);
  }

  static async deleteProject(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/projects/${id}`);
  }

  static async getProjectsByManager(managerId: string): Promise<ApiResponse<Project[]>> {
    return apiClient.get(`/api/projects/manager/${managerId}`);
  }

  static async getProjectsByTeamMember(userId: string): Promise<ApiResponse<Project[]>> {
    return apiClient.get(`/api/projects/team-member/${userId}`);
  }
}
