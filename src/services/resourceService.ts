import { ResourceCapacity, ResourceAllocation, ResourceUtilization, TeamCapacity } from '@/types/resource';

export const resourceService = {
  // Resource Capacity
  async getResourceCapacity(userId: string): Promise<ResourceCapacity> {
    const response = await fetch(`/api/resources/${userId}/capacity`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch resource capacity');
    return response.json();
  },

  async updateResourceCapacity(userId: string, totalCapacity: number): Promise<ResourceCapacity> {
    const response = await fetch(`/api/resources/${userId}/capacity`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ totalCapacity }),
    });
    if (!response.ok) throw new Error('Failed to update resource capacity');
    return response.json();
  },

  // Resource Allocation
  async allocateResource(
    userId: string,
    projectId: string,
    allocation: Omit<ResourceAllocation, 'projectName'>
  ): Promise<ResourceCapacity> {
    const response = await fetch(`/api/resources/${userId}/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ projectId, ...allocation }),
    });
    if (!response.ok) throw new Error('Failed to allocate resource');
    return response.json();
  },

  async deallocateResource(userId: string, projectId: string): Promise<ResourceCapacity> {
    const response = await fetch(`/api/resources/${userId}/deallocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ projectId }),
    });
    if (!response.ok) throw new Error('Failed to deallocate resource');
    return response.json();
  },

  // Resource Utilization
  async getResourceUtilization(userId: string, startDate: Date, endDate: Date): Promise<ResourceUtilization> {
    const response = await fetch(
      `/api/resources/${userId}/utilization?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch resource utilization');
    return response.json();
  },

  // Team Capacity
  async getTeamCapacity(projectId: string, startDate: Date, endDate: Date): Promise<TeamCapacity> {
    const response = await fetch(
      `/api/resources/team/capacity?projectId=${projectId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch team capacity');
    return response.json();
  },

  // All Resources
  async getAllResources(): Promise<ResourceCapacity[]> {
    const response = await fetch('/api/resources', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch resources');
    return response.json();
  },
};
