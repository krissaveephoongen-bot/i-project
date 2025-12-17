// API utility functions for admin console

const API_BASE_URL = '/api';

// Helper function to handle API responses
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || 'Something went wrong');
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    return handleResponse(response);
}

// Auth API
export const authAPI = {
    login: async (credentials) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: credentials,
        });
    },
    logout: async () => {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        
        // Call logout API if available
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        }
    },
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    isAuthenticated: () => {
        return localStorage.getItem('isLoggedIn') === 'true' && 
               localStorage.getItem('userRole') === 'admin';
    }
};

// Users API
export const usersAPI = {
    getUsers: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/users?${query}`);
    },
    getUser: async (userId) => {
        return apiRequest(`/users/${userId}`);
    },
    createUser: async (userData) => {
        return apiRequest('/users', {
            method: 'POST',
            body: userData,
        });
    },
    updateUser: async (userId, userData) => {
        return apiRequest(`/users/${userId}`, {
            method: 'PUT',
            body: userData,
        });
    },
    deleteUser: async (userId) => {
        return apiRequest(`/users/${userId}`, {
            method: 'DELETE',
        });
    },
};

// Projects API
export const projectsAPI = {
    getProjects: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/projects?${query}`);
    },
    getProject: async (projectId) => {
        return apiRequest(`/projects/${projectId}`);
    },
    createProject: async (projectData) => {
        return apiRequest('/projects', {
            method: 'POST',
            body: projectData,
        });
    },
    updateProject: async (projectId, projectData) => {
        return apiRequest(`/projects/${projectId}`, {
            method: 'PUT',
            body: projectData,
        });
    },
    deleteProject: async (projectId) => {
        return apiRequest(`/projects/${projectId}`, {
            method: 'DELETE',
        });
    },
};

// Analytics API
export const analyticsAPI = {
    getDashboardStats: async () => {
        return apiRequest('/analytics/dashboard-stats');
    },
    getProjectAnalytics: async (projectId) => {
        return apiRequest(`/analytics/projects/${projectId}`);
    },
    getUserAnalytics: async (userId) => {
        return apiRequest(`/analytics/users/${userId}`);
    },
};

// Export all API modules
export default {
    auth: authAPI,
    users: usersAPI,
    projects: projectsAPI,
    analytics: analyticsAPI,
};
