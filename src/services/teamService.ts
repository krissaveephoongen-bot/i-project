/**
 * Team Service
 * Handles all team management API calls
 */

import { apiClient } from './api-client';

export interface Team {
  id: string;
  name: string;
  description?: string;
  lead_id?: string;
  lead_name?: string;
  status: string;
  member_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  user_role: string;
  team_role: string;
  joined_at: string;
}

export interface TeamStatistics {
  total_members: number;
  by_role: Array<{
    role: string;
    count: number;
  }>;
}

export const teamService = {
  /**
   * Get all teams
   */
  async getTeams(filters?: {
    search?: string;
    status?: string;
  }): Promise<{ success: boolean; data: Team[] }> {
    const response = await apiClient.get('/teams', { params: filters });
    return response.data;
  },

  /**
   * Get specific team with members
   */
  async getTeam(teamId: string): Promise<{ success: boolean; data: Team & { members: TeamMember[] } }> {
    const response = await apiClient.get(`/teams/${teamId}`);
    return response.data;
  },

  /**
   * Create new team
   */
  async createTeam(data: {
    name: string;
    description?: string;
    lead_id?: string;
  }): Promise<{ success: boolean; data: Team }> {
    const response = await apiClient.post('/teams', data);
    return response.data;
  },

  /**
   * Update team
   */
  async updateTeam(teamId: string, data: Partial<Team>): Promise<{ success: boolean; data: Team }> {
    const response = await apiClient.put(`/teams/${teamId}`, data);
    return response.data;
  },

  /**
   * Delete team
   */
  async deleteTeam(teamId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/teams/${teamId}`);
    return response.data;
  },

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<{ success: boolean; data: TeamMember[] }> {
    const response = await apiClient.get(`/teams/${teamId}/members`);
    return response.data;
  },

  /**
   * Add member to team
   */
  async addTeamMember(
    teamId: string,
    userId: string,
    role: string = 'member'
  ): Promise<{ success: boolean; data: TeamMember }> {
    const response = await apiClient.post(`/teams/${teamId}/members`, {
      user_id: userId,
      role
    });
    return response.data;
  },

  /**
   * Update team member role
   */
  async updateTeamMember(
    teamId: string,
    userId: string,
    role: string
  ): Promise<{ success: boolean; data: TeamMember }> {
    const response = await apiClient.put(`/teams/${teamId}/members/${userId}`, { role });
    return response.data;
  },

  /**
   * Remove member from team
   */
  async removeTeamMember(teamId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  },

  /**
   * Get team statistics
   */
  async getTeamStatistics(teamId: string): Promise<{ success: boolean; data: TeamStatistics }> {
    const response = await apiClient.get(`/teams/${teamId}/statistics`);
    return response.data;
  }
};
