
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
  const u = new URLSearchParams();
  if (params?.q) u.append('q', params.q);
  if (params?.status) u.append('status', params.status);
  if (params?.priority) u.append('priority', params.priority);
  if (params?.projectId) u.append('projectId', params.projectId);
  if (params?.assignedTo) u.append('assignedTo', params.assignedTo);
  
  const res = await fetch(`/api/tasks?${u.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const json = await res.json();
  return json; // The API returns { data: ... } wrapped? No, my generic 'ok' wrapper returns the data directly if using NextResponse.json?
  // Wait, my 'ok' function in _lib/db.ts returns NextResponse.json(data, { status }).
  // So res.json() is the data.
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
