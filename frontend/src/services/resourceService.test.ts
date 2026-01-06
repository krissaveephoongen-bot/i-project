import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resourceService } from './resourceService';

// Mock api-client used by resourceService
vi.mock('./api-client', () => {
  return {
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

import { apiClient } from './api-client';

describe('resourceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch resource capacity for a user', async () => {
    const userId = 'user-1';
    const mockData = { userId, totalCapacity: 40, allocations: [] } as any;
    (apiClient.get as any).mockResolvedValueOnce({ data: mockData });

    const result = await resourceService.getResourceCapacity(userId);

    expect(apiClient.get).toHaveBeenCalledWith(`/api/resources/${userId}/capacity`);
    expect(result).toEqual(mockData);
  });

  it('should update resource capacity for a user', async () => {
    const userId = 'user-1';
    const totalCapacity = 32;
    const mockData = { userId, totalCapacity, allocations: [] } as any;
    (apiClient.put as any).mockResolvedValueOnce({ data: mockData });

    const result = await resourceService.updateResourceCapacity(userId, totalCapacity);

    expect(apiClient.put).toHaveBeenCalledWith(`/api/resources/${userId}/capacity`, { totalCapacity });
    expect(result).toEqual(mockData);
  });

  it('should allocate resource to a project', async () => {
    const userId = 'user-1';
    const projectId = 'proj-1';
    const allocation = { hours: 8, date: '2024-01-02' } as any;
    const mockData = { userId, totalCapacity: 40, allocations: [allocation] } as any;
    (apiClient.post as any).mockResolvedValueOnce({ data: mockData });

    const result = await resourceService.allocateResource(userId, projectId, allocation);

    expect(apiClient.post).toHaveBeenCalledWith(`/api/resources/${userId}/allocate`, {
      ...allocation,
      projectId,
    });
    expect(result).toEqual(mockData);
  });

  it('should deallocate resource from a project', async () => {
    const userId = 'user-1';
    const projectId = 'proj-1';
    const mockData = { userId, totalCapacity: 40, allocations: [] } as any;
    (apiClient.post as any).mockResolvedValueOnce({ data: mockData });

    const result = await resourceService.deallocateResource(userId, projectId);

    expect(apiClient.post).toHaveBeenCalledWith(`/api/resources/${userId}/deallocate`, { projectId });
    expect(result).toEqual(mockData);
  });

  it('should get resource utilization for a user in a date range', async () => {
    const userId = 'user-1';
    const startDate = new Date('2024-01-01T00:00:00.000Z');
    const endDate = new Date('2024-01-07T00:00:00.000Z');
    const expectedParams = {
      params: {
        userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
    const mockUtil = { userId, days: [], totalHours: 0, utilizationPercent: 0 } as any;
    (apiClient.get as any).mockResolvedValueOnce({ data: mockUtil });

    const result = await resourceService.getResourceUtilization(userId, startDate, endDate);

    expect(apiClient.get).toHaveBeenCalledWith('/api/resource-utilization', expectedParams);
    expect(result).toEqual(mockUtil);
  });

  it('should get team capacity for a project within date range', async () => {
    const projectId = 'proj-1';
    const startDate = new Date('2024-01-01T00:00:00.000Z');
    const endDate = new Date('2024-01-31T00:00:00.000Z');
    const expectedParams = {
      params: {
        projectId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
    const mockTeam = { projectId, members: [], totalCapacity: 0 } as any;
    (apiClient.get as any).mockResolvedValueOnce({ data: mockTeam });

    const result = await resourceService.getTeamCapacity(projectId, startDate, endDate);

    expect(apiClient.get).toHaveBeenCalledWith('/api/team-capacity', expectedParams);
    expect(result).toEqual(mockTeam);
  });

  it('should return all resources with their capacities', async () => {
    const mockList = [
      { userId: 'u1', totalCapacity: 40, allocations: [] },
      { userId: 'u2', totalCapacity: 35, allocations: [] },
    ] as any;
    (apiClient.get as any).mockResolvedValueOnce({ data: mockList });

    const result = await resourceService.getAllResources();

    expect(apiClient.get).toHaveBeenCalledWith('/api/resources');
    expect(result).toEqual(mockList);
  });

  it('should propagate API errors as thrown exceptions', async () => {
    const error = Object.assign(new Error('Network error'), { status: 500 });
    (apiClient.get as any).mockRejectedValueOnce(error);

    await expect(resourceService.getAllResources()).rejects.toMatchObject({ message: 'Network error' });
    expect(apiClient.get).toHaveBeenCalledWith('/api/resources');
  });
});
