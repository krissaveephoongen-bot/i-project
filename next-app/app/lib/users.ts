const API_BASE = '';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  employeeCode?: string | number;
  department?: string;
  position?: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  isDeleted: boolean;
  failedLoginAttempts: number;
  lastLogin?: string;
  lockedUntil?: string;
  isProjectManager: boolean;
  isSupervisor: boolean;
  hourlyRate: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUsers(params?: { q?: string; role?: 'admin'|'manager'|'employee'|''; status?: 'active'|'inactive'|''; page?: number; pageSize?: number }): Promise<User[]> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set('q', params.q);
  if (params?.role) sp.set('role', params.role);
  if (params?.status) sp.set('status', params.status);
  if (params?.page) sp.set('page', String(params.page));
  if (params?.pageSize) sp.set('pageSize', String(params.pageSize));
  const res = await fetch(`${API_BASE}/api/users?${sp.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return (data?.rows || data || []);
}

export async function getManagers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/api/users`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return (data || []).filter((u: User) => u.isActive && !u.isDeleted && (u.role === 'manager' || u.role === 'admin' || u.isProjectManager));
}

export async function getUserById(id: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  const found = (data || []).find((u: User) => u.id === id);
  if (!found) throw new Error('User not found');
  return found;
}

export async function createUser(userData: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return await res.json();
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates: userData }),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return await res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
}
