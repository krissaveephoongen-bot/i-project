import { api } from '../lib/api';
import { Task, TaskStatus, TaskPriority } from '../types/task';

interface GetTasksParams {
  page?: number;
  limit?: number;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
}

export const taskService = {
  // Get all tasks with pagination and filters
  async getTasks(params: GetTasksParams = {}) {
    const { page = 1, limit = 10, ...filters } = params;
    const response = await api.get('/tasks', {
      params: {
        page,
        limit,
        ...filters
      }
    });
    return response.data;
  },

  // Get a single task by ID
  async getTaskById(id: string) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create a new task
  async createTask(taskData: Partial<Task>) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update an existing task
  async updateTask(id: string, taskData: Partial<Task>) {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Delete a task (soft delete)
  async deleteTask(id: string) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Update task status
  async updateTaskStatus(id: string, status: TaskStatus) {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Get tasks assigned to the current user
  async getMyTasks() {
    const response = await api.get('/tasks/me');
    return response.data;
  },

  // Get tasks by project
  async getTasksByProject(projectId: string) {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  }
};
