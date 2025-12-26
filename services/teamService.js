/**
 * Team Management Service
 * Handles all team-related API calls
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const teamService = {
    /**
     * Get all members of a project
     */
    async getProjectMembers(projectId) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/projects/${projectId}/members`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching project members:', error);
            throw error;
        }
    },

    /**
     * Add a member to a project
     */
    async addMember(projectId, userId, role = 'member') {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/projects/${projectId}/members`,
                { userId, role },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error adding project member:', error);
            throw error;
        }
    },

    /**
     * Remove a member from a project
     */
    async removeMember(projectId, userId) {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/projects/${projectId}/members/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error removing project member:', error);
            throw error;
        }
    },

    /**
     * Update member role
     */
    async updateMemberRole(projectId, userId, role) {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/projects/${projectId}/members/${userId}`,
                { role },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating member role:', error);
            throw error;
        }
    },

    /**
     * Get member count for a project
     */
    async getMemberCount(projectId) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/projects/${projectId}/members/count`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error getting member count:', error);
            throw error;
        }
    }
};

export default teamService;
