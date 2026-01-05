import { apiClient } from './api-client';
import { 
  ResourceCapacity, 
  ResourceAllocation, 
  ResourceUtilization, 
  TeamCapacity 
} from '@/types/resource';

interface ResourceAllocationRequest extends Omit<ResourceAllocation, 'projectName'> {
  projectId: string;
}

interface ResourceUtilizationParams {
  userId: string;
  startDate: string;
  endDate: string;
}

interface TeamCapacityParams {
  projectId: string;
  startDate: string;
  endDate: string;
}

export const resourceService = {
  /**
   * Get resource capacity for a user
   * @param userId - The ID of the user
   * @returns The resource capacity data
   */
  async getResourceCapacity(userId: string): Promise<ResourceCapacity> {
    const response = await apiClient.get<ResourceCapacity>(`/api/resources/${userId}/capacity`);
    return response.data;
  },

  /**
   * Update resource capacity for a user
   * @param userId - The ID of the user
   * @param totalCapacity - The total capacity to set
   * @returns The updated resource capacity
   */
  async updateResourceCapacity(userId: string, totalCapacity: number): Promise<ResourceCapacity> {
    const response = await apiClient.put<ResourceCapacity>(
      `/api/resources/${userId}/capacity`,
      { totalCapacity }
    );
    return response.data;
  },

  /**
   * Allocate resource to a project
   * @param userId - The ID of the user
   * @param projectId - The ID of the project
   * @param allocation - The allocation details
   * @returns The updated resource capacity
   */
  async allocateResource(
    userId: string,
    projectId: string,
    allocation: Omit<ResourceAllocation, 'projectName'>
  ): Promise<ResourceCapacity> {
    const payload: ResourceAllocationRequest = {
      ...allocation,
      projectId
    };
    
    const response = await apiClient.post<ResourceCapacity>(
      `/api/resources/${userId}/allocate`,
      payload
    );
    
    return response.data;
  },

  /**
   * Deallocate resource from a project
   * @param userId - The ID of the user
   * @param projectId - The ID of the project to deallocate from
   * @returns The updated resource capacity
   */
  async deallocateResource(userId: string, projectId: string): Promise<ResourceCapacity> {
    const response = await apiClient.post<ResourceCapacity>(
      `/api/resources/${userId}/deallocate`,
      { projectId }
    );
    return response.data;
  },

  /**
   * Get resource utilization for a user in a date range
   * @param userId - The ID of the user
   * @param startDate - Start date of the period
   * @param endDate - End date of the period
   * @returns Resource utilization data
   */
  async getResourceUtilization(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ResourceUtilization> {
    const params: ResourceUtilizationParams = {
      userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    
    const response = await apiClient.get<ResourceUtilization>(
      '/api/resource-utilization',
      { params }
    );
    
    return response.data;
  },

  /**
   * Get team capacity for a project
   * @param projectId - The ID of the project
   * @param startDate - Start date of the period
   * @param endDate - End date of the period
   * @returns Team capacity data
   */
  async getTeamCapacity(
    projectId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<TeamCapacity> {
    const params: TeamCapacityParams = {
      projectId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    
    const response = await apiClient.get<TeamCapacity>(
      '/api/team-capacity',
      { params }
    );
    
    return response.data;
  },

  /**
   * Get all resources with their capacities
   * @returns Array of resource capacities
   */
  async getAllResources(): Promise<ResourceCapacity[]> {
    const response = await apiClient.get<ResourceCapacity[]>('/api/resources');
    return response.data;
  }
};
