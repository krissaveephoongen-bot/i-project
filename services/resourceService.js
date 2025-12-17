/**
 * Resource Management Service
 * Handles all resource-related API calls
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const resourceService = {
    /**
     * Get all resources with capacity information
     */
    async getResources(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.department) params.append('department', filters.department);

            const response = await axios.get(`${API_BASE_URL}/resources?${params}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching resources:', error);
            throw error;
        }
    },

    /**
     * Get single resource details
     */
    async getResource(resourceId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/resources/${resourceId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching resource:', error);
            throw error;
        }
    },

    /**
     * Get team members for a project
     */
    async getProjectTeam(projectId) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/resources/team/${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching project team:', error);
            throw error;
        }
    },

    /**
     * Get resource allocation for a project
     */
    async getProjectAllocation(projectId) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/resources/allocation/${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching project allocation:', error);
            throw error;
        }
    },

    /**
     * Get team capacity and utilization
     */
    async getTeamCapacity(department = null) {
        try {
            const url = department
                ? `${API_BASE_URL}/resources/capacity/team?department=${department}`
                : `${API_BASE_URL}/resources/capacity/team`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching team capacity:', error);
            throw error;
        }
    },

    /**
     * Get available resources for allocation
     */
    async getAvailableResources() {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/resources/availability/list`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching available resources:', error);
            throw error;
        }
    }
};

export default resourceService;
