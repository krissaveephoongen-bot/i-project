/**
 * Task Management Service
 * Handles all task-related API calls
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const taskService = {
    /**
     * Get all tasks with filters
     */
    async getTasks(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.projectId) params.append('projectId', filters.projectId);
            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.assignee) params.append('assignee', filters.assignee);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await axios.get(`${API_BASE_URL}/tasks?${params}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },

    /**
     * Get single task
     */
    async getTask(taskId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching task:', error);
            throw error;
        }
    },

    /**
     * Create a new task
     */
    async createTask(taskData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/tasks`, taskData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    /**
     * Update a task
     */
    async updateTask(taskId, updates) {
        try {
            const response = await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, updates, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    /**
     * Update task status
     */
    async updateTaskStatus(taskId, status) {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/tasks/${taskId}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    },

    /**
     * Delete a task
     */
    async deleteTask(taskId) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    /**
     * Get project tasks
     */
    async getProjectTasks(projectId, status = null) {
        try {
            const url = status
                ? `${API_BASE_URL}/projects/${projectId}/tasks?status=${status}`
                : `${API_BASE_URL}/projects/${projectId}/tasks`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching project tasks:', error);
            throw error;
        }
    }
};

export default taskService;
