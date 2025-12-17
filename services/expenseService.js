/**
 * Expense Management Service
 * Handles all expense-related API calls
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const expenseService = {
    /**
     * Get all expenses with filters
     */
    async getExpenses(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.projectId) params.append('projectId', filters.projectId);
            if (filters.status) params.append('status', filters.status);
            if (filters.userId) params.append('userId', filters.userId);
            if (filters.category) params.append('category', filters.category);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await axios.get(`${API_BASE_URL}/expenses?${params}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching expenses:', error);
            throw error;
        }
    },

    /**
     * Get single expense
     */
    async getExpense(expenseId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/expenses/${expenseId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching expense:', error);
            throw error;
        }
    },

    /**
     * Submit a new expense
     */
    async submitExpense(expenseData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/expenses`, expenseData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error submitting expense:', error);
            throw error;
        }
    },

    /**
     * Update an expense
     */
    async updateExpense(expenseId, updates) {
        try {
            const response = await axios.patch(`${API_BASE_URL}/expenses/${expenseId}`, updates, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    },

    /**
     * Approve an expense
     */
    async approveExpense(expenseId, approvalNotes = '') {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/expenses/${expenseId}/approve`,
                { approvalNotes },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error approving expense:', error);
            throw error;
        }
    },

    /**
     * Reject an expense
     */
    async rejectExpense(expenseId, approvalNotes) {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/expenses/${expenseId}/reject`,
                { approvalNotes },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error rejecting expense:', error);
            throw error;
        }
    },

    /**
     * Delete an expense
     */
    async deleteExpense(expenseId) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/expenses/${expenseId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    },

    /**
     * Get pending expenses for approval
     */
    async getPendingExpenses() {
        try {
            const response = await axios.get(`${API_BASE_URL}/expenses/pending/approval`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching pending expenses:', error);
            throw error;
        }
    },

    /**
     * Get expense summary statistics
     */
    async getExpenseSummary(projectId = null) {
        try {
            const url = projectId
                ? `${API_BASE_URL}/expenses/summary/stats?projectId=${projectId}`
                : `${API_BASE_URL}/expenses/summary/stats`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching expense summary:', error);
            throw error;
        }
    }
};

export default expenseService;
