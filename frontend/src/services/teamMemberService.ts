/**
 * Team Member Service
 * Handles all team member management API calls
 */

import { apiClient } from './api-client';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface TeamMemberResponse {
  success: boolean;
  teamMembers: TeamMember[];
  message?: string;
}

export interface CreateTeamMemberInput {
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateTeamMemberInput {
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  position?: string;
  status?: 'active' | 'inactive';
}

export const teamMemberService = {
  /**
   * Get all team members with optional filtering
   * @param role Optional role filter (e.g., "Project Manager")
   * @param status Optional status filter (active/inactive)
   * @param department Optional department filter
   */
  async getTeamMembers(filters?: {
    role?: string;
    status?: 'active' | 'inactive';
    department?: string;
    search?: string;
  }): Promise<TeamMember[]> {
    try {
      const response = await apiClient.get<TeamMemberResponse>('/api/team-members', {
        params: filters,
      });
      return response.data.teamMembers || [];
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  /**
   * Get project managers only
   */
  async getProjectManagers(): Promise<TeamMember[]> {
    try {
      return await this.getTeamMembers({ role: 'Project Manager' });
    } catch (error) {
      console.error('Error fetching project managers:', error);
      throw error;
    }
  },

  /**
   * Get team members by role
   * @param role The role to filter by
   */
  async getTeamMembersByRole(role: string): Promise<TeamMember[]> {
    try {
      return await this.getTeamMembers({ role });
    } catch (error) {
      console.error(`Error fetching team members with role ${role}:`, error);
      throw error;
    }
  },

  /**
   * Get team members by department
   * @param department The department to filter by
   */
  async getTeamMembersByDepartment(department: string): Promise<TeamMember[]> {
    try {
      return await this.getTeamMembers({ department });
    } catch (error) {
      console.error(`Error fetching team members from department ${department}:`, error);
      throw error;
    }
  },

  /**
   * Get active team members only
   */
  async getActiveTeamMembers(): Promise<TeamMember[]> {
    try {
      return await this.getTeamMembers({ status: 'active' });
    } catch (error) {
      console.error('Error fetching active team members:', error);
      throw error;
    }
  },

  /**
   * Get a specific team member
   * @param memberId The ID of the team member
   */
  async getTeamMember(memberId: string): Promise<TeamMember> {
    try {
      const response = await apiClient.get<{ success: boolean; teamMember: TeamMember }>(
        `/api/team-members/${memberId}`
      );
      return response.data.teamMember;
    } catch (error) {
      console.error(`Error fetching team member ${memberId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new team member
   * @param data Team member creation data
   */
  async createTeamMember(data: CreateTeamMemberInput): Promise<TeamMember> {
    try {
      const response = await apiClient.post<{ success: boolean; teamMember: TeamMember }>(
        '/api/team-members',
        data
      );
      return response.data.teamMember;
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  },

  /**
   * Update a team member
   * @param memberId The ID of the team member to update
   * @param data Updated team member data
   */
  async updateTeamMember(memberId: string, data: UpdateTeamMemberInput): Promise<TeamMember> {
    try {
      const response = await apiClient.put<{ success: boolean; teamMember: TeamMember }>(
        `/api/team-members/${memberId}`,
        data
      );
      return response.data.teamMember;
    } catch (error) {
      console.error(`Error updating team member ${memberId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a team member
   * @param memberId The ID of the team member to delete
   */
  async deleteTeamMember(memberId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `/api/team-members/${memberId}`
      );
      return response.data.success;
    } catch (error) {
      console.error(`Error deleting team member ${memberId}:`, error);
      throw error;
    }
  },

  /**
   * Update team member status (active/inactive)
   * @param memberId The ID of the team member
   * @param status The new status
   */
  async updateTeamMemberStatus(
    memberId: string,
    status: 'active' | 'inactive'
  ): Promise<TeamMember> {
    return this.updateTeamMember(memberId, { status });
  },

  /**
   * Get team member statistics
   */
  async getTeamMemberStatistics(): Promise<{
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    byRole: Array<{ role: string; count: number }>;
    byDepartment: Array<{ department: string; count: number }>;
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        statistics: {
          totalMembers: number;
          activeMembers: number;
          inactiveMembers: number;
          byRole: Array<{ role: string; count: number }>;
          byDepartment: Array<{ department: string; count: number }>;
        };
      }>('/api/team-members/statistics');
      return response.data.statistics;
    } catch (error) {
      console.error('Error fetching team member statistics:', error);
      throw error;
    }
  },
};

export default teamMemberService;
