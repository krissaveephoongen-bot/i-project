import { Project, Task, SCurveDataPoint } from '@/types/project';
import { buildApiUrl } from '@/lib/api-config';

// Calculate S-Curve data based on tasks
export const calculateSCurveData = (tasks: Task[], startDate: Date, endDate: Date): SCurveDataPoint[] => {
  const data: SCurveDataPoint[] = [];
  const totalWeight = tasks.reduce((sum, task) => sum + task.plannedProgressWeight, 0);
  
  if (totalWeight === 0) return data;

  const oneDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / oneDay);
  const weekLength = 7;

  for (let i = 0; i <= totalDays; i += weekLength) {
    const currentDate = new Date(startDate.getTime() + i * oneDay);
    const week = Math.ceil((i + 1) / weekLength);

    // Calculate planned progress
    let plannedProgress = 0;
    tasks.forEach(task => {
      if (currentDate >= task.plannedStartDate && currentDate <= task.plannedEndDate) {
        const taskDuration = Math.ceil(
          (task.plannedEndDate.getTime() - task.plannedStartDate.getTime()) / oneDay
        );
        const daysElapsed = Math.ceil((currentDate.getTime() - task.plannedStartDate.getTime()) / oneDay);
        const progress = (daysElapsed / taskDuration) * (task.plannedProgressWeight / totalWeight);
        plannedProgress += Math.min(progress, task.plannedProgressWeight / totalWeight);
      } else if (currentDate > task.plannedEndDate) {
        plannedProgress += task.plannedProgressWeight / totalWeight;
      }
    });

    // Calculate actual progress
    let actualProgress = 0;
    tasks.forEach(task => {
      const actualPercentage = (task.actualProgress / 100) * (task.plannedProgressWeight / totalWeight);
      actualProgress += actualPercentage;
    });

    data.push({
      date: currentDate,
      week,
      plannedProgress: Math.min(plannedProgress * 100, 100),
      actualProgress: Math.min(actualProgress * 100, 100),
      variance: Math.min(actualProgress * 100, 100) - Math.min(plannedProgress * 100, 100),
    });
  }

  return data;
};

// API calls for projects
export const projectService = {
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await fetch(buildApiUrl('/projects'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(project),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const response = await fetch(buildApiUrl(`/projects/${projectId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  async getProject(projectId: string): Promise<Project> {
    const response = await fetch(buildApiUrl(`/projects/${projectId}`), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },

  async deleteProject(projectId: string): Promise<void> {
    const response = await fetch(buildApiUrl(`/projects/${projectId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete project');
  },

  async addTask(projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await fetch(buildApiUrl(`/projects/${projectId}/tasks`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error('Failed to add task');
    return response.json();
  },

  async updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    const response = await fetch(buildApiUrl(`/projects/${projectId}/tasks/${taskId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    const response = await fetch(buildApiUrl(`/projects/${projectId}/tasks/${taskId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete task');
  },
};
