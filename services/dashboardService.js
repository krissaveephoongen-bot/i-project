/**
 * Dashboard Service
 * Handles all dashboard and statistics API calls
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const dashboardService = {
    /**
     * Get dashboard statistics
     */
    async getDashboardStats(projectId = null) {
        try {
            const url = projectId
                ? `${API_BASE_URL}/dashboard/stats?projectId=${projectId}`
                : `${API_BASE_URL}/dashboard/stats`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    /**
     * Get project progress chart data
     */
    async getProjectCharts() {
        try {
            const response = await axios.get(`${API_BASE_URL}/dashboard/charts/projects`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching project charts:', error);
            throw error;
        }
    },

    /**
     * Get expense breakdown chart data
     */
    async getExpenseCharts() {
        try {
            const response = await axios.get(`${API_BASE_URL}/dashboard/charts/expenses`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching expense charts:', error);
            throw error;
        }
    },

    /**
     * Get task status distribution chart data
     */
    async getTaskCharts(projectId = null) {
        try {
            const url = projectId
                ? `${API_BASE_URL}/dashboard/charts/tasks?projectId=${projectId}`
                : `${API_BASE_URL}/dashboard/charts/tasks`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching task charts:', error);
            throw error;
        }
    },

    /**
     * Get team utilization chart data
     */
    async getTeamCharts() {
        try {
            const response = await axios.get(`${API_BASE_URL}/dashboard/charts/team`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching team charts:', error);
            throw error;
        }
    },

    /**
     * Get dashboard summary data
     */
    async getDashboardSummary() {
        try {
            const response = await axios.get(`${API_BASE_URL}/dashboard/summary`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            throw error;
        }
    },

    /**
     * Get project-specific dashboard
     */
    async getProjectDashboard(projectId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/dashboard/project/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching project dashboard:', error);
            throw error;
        }
    }
};

export default dashboardService;
