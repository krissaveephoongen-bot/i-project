import { api as apiClient } from '@/lib/api-client';

export interface MenuStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  pendingTasks: number;
  totalTeamMembers: number;
  pendingTimesheets: number;
  pendingCosts: number;
  myProjectsCount: number;
  assignedTasksCount: number;
  overdueTasks: number;
}

export interface RecentItem {
  id: string;
  title: string;
  type: 'project' | 'task';
  projectId?: string;
  path: string;
  lastAccessed: Date;
  status?: string;
}

export interface ProjectQuickAccess {
  id: string;
  name: string;
  code: string;
  status: string;
  progress: number;
  priority: string;
}

export interface TaskQuickAccess {
  id: string;
  title: string;
  status: string;
  projectId: string;
  projectName: string;
  dueDate?: string;
  priority: string;
  assigneeName: string;
}

/**
 * Menu Service
 * Fetches real data from the backend for menu enhancements
 */
export const menuService = {
  /**
   * Get dashboard statistics for menu display
   */
  async getMenuStats(): Promise<MenuStats> {
    try {
      const response = await apiClient.get('/api/menu/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching menu stats:', error);
      return {
        totalProjects: 0,
        activeProjects: 0,
        totalTasks: 0,
        pendingTasks: 0,
        totalTeamMembers: 0,
        pendingTimesheets: 0,
        pendingCosts: 0,
        myProjectsCount: 0,
        assignedTasksCount: 0,
        overdueTasks: 0,
      };
    }
  },

  /**
   * Get recent items accessed by current user
   */
  async getRecentItems(limit: number = 5): Promise<RecentItem[]> {
    try {
      const response = await apiClient.get('/api/menu/recent', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent items:', error);
      return [];
    }
  },

  /**
   * Get user's active projects for quick access
   */
  async getActiveProjects(limit: number = 5): Promise<ProjectQuickAccess[]> {
    try {
      const response = await apiClient.get('/api/menu/projects', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active projects:', error);
      return [];
    }
  },

  /**
   * Get user's assigned tasks
   */
  async getAssignedTasks(limit: number = 5): Promise<TaskQuickAccess[]> {
    try {
      const response = await apiClient.get('/api/menu/tasks', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      return [];
    }
  },

  /**
   * Save item access to track recent items
   */
  async trackItemAccess(itemId: string, type: 'project' | 'task'): Promise<void> {
    try {
      await apiClient.post('/api/menu/track', {
        itemId,
        type,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking item access:', error);
      // Silently fail - tracking should not break functionality
    }
  },

  /**
   * Get notifications count
   */
  async getNotificationCount(): Promise<number> {
    try {
      const response = await apiClient.get('/api/menu/notifications/unread-count');
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching notification count:', error);
      return 0;
    }
  },
};
