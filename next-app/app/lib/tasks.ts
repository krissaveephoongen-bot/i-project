
import { supabase } from './supabaseClient';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  projectId: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
  projects?: { id: string; name: string };
  assigned_user?: { id: string; name: string };
}

export async function getTasks(params?: { q?: string; status?: string; priority?: string; projectId?: string; assignedTo?: string }): Promise<Task[]> {
  try {
    const u = new URLSearchParams();
    if (params?.q) u.append('q', params.q);
    if (params?.status) u.append('status', params.status);
    if (params?.priority) u.append('priority', params.priority);
    if (params?.projectId) u.append('projectId', params.projectId);
    if (params?.assignedTo) u.append('assignedTo', params.assignedTo);
    
    const res = await fetch(`/api/tasks?${u.toString()}`, { cache: 'no-store' });
    if (res.ok) {
        return await res.json();
    }
  } catch (e) {
      console.error('API fetch failed, falling back to Supabase:', e);
  }

  // Fallback to Supabase
  if (typeof window !== 'undefined') {
      let query = supabase
        .from('tasks')
        .select(`
            *,
            projects:projects(id,name),
            assigned_user:users(id,name)
        `)
        .order('created_at', { ascending: false });

      if (params?.status && params.status !== 'all') query = query.eq('status', params.status);
      if (params?.priority && params.priority !== 'all') query = query.eq('priority', params.priority);
      if (params?.q) query = query.ilike('title', `%${params.q}%`);
      if (params?.projectId) query = query.eq('projectId', params.projectId); // Note: Schema check for column name (projectId vs project_id) needed if issue persists
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Map Supabase response to Task interface if needed (case sensitivity)
      return (data || []).map((t: any) => ({
          ...t,
          projects: t.projects || (t.project_id ? { id: t.project_id, name: 'Unknown' } : undefined), // Simplified fallback
          projectId: t.projectId || t.project_id,
          assignedTo: t.assignedTo || t.assigned_to,
          dueDate: t.dueDate || t.due_date,
          estimatedHours: t.estimatedHours || t.estimated_hours,
          actualHours: t.actualHours || t.actual_hours,
          createdAt: t.createdAt || t.created_at,
          updatedAt: t.updatedAt || t.updated_at
      }));
  }
  return [];
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete task');
}
