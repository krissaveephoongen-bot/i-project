import { Cost, CostApproval, CostSummary } from '@/types/cost';

export const costService = {
  // Cost Management
  async createCost(cost: Omit<Cost, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cost> {
    const response = await fetch('/api/costs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(cost),
    });
    if (!response.ok) throw new Error('Failed to create cost');
    return response.json();
  },

  async updateCost(costId: string, updates: Partial<Cost>): Promise<Cost> {
    const response = await fetch(`/api/costs/${costId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update cost');
    return response.json();
  },

  async deleteCost(costId: string): Promise<void> {
    const response = await fetch(`/api/costs/${costId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete cost');
  },

  async getCostsByProject(projectId: string): Promise<Cost[]> {
    const response = await fetch(`/api/costs?projectId=${projectId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch costs');
    return response.json();
  },

  async getCostsByUser(userId: string): Promise<Cost[]> {
    const response = await fetch(`/api/costs?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch costs');
    return response.json();
  },

  // Cost Approvals
  async getPendingCostApprovals(approverId: string): Promise<Cost[]> {
    const response = await fetch(`/api/costs/approvals/pending?approverId=${approverId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch pending approvals');
    return response.json();
  },

  async approveCost(costId: string, comment?: string): Promise<CostApproval> {
    const response = await fetch(`/api/costs/${costId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ comment }),
    });
    if (!response.ok) throw new Error('Failed to approve cost');
    return response.json();
  },

  async rejectCost(costId: string, reason: string): Promise<CostApproval> {
    const response = await fetch(`/api/costs/${costId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to reject cost');
    return response.json();
  },

  // Cost Summary
  async getCostSummary(projectId: string, startDate: Date, endDate: Date): Promise<CostSummary> {
    const response = await fetch(
      `/api/costs/summary?projectId=${projectId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch cost summary');
    return response.json();
  },
};
