import { supabase } from './supabaseClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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
  try {
    const sp = new URLSearchParams();
    if (params?.q) sp.set('q', params.q);
    if (params?.role) sp.set('role', params.role);
    if (params?.status) sp.set('status', params.status);
    if (params?.page) sp.set('page', String(params.page));
    if (params?.pageSize) sp.set('pageSize', String(params.pageSize));
    const res = await fetch(`${API_BASE}/api/users?${sp.toString()}`, { cache: 'no-store' });
    if (res.ok) {
        const data = await res.json();
        return (data?.rows || data || []);
    }
  } catch (e) {
      console.error('API fetch failed, falling back to Supabase:', e);
  }

  // Fallback to Supabase
  if (typeof window !== 'undefined') {
      let query = supabase.from('users').select('*').eq('is_deleted', false);
      if (params?.role) query = query.eq('role', params.role);
      if (params?.status === 'active') query = query.eq('is_active', true);
      if (params?.status === 'inactive') query = query.eq('is_active', false);
      if (params?.q) query = query.ilike('name', `%${params.q}%`);
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapDbUserToUser);
  }
  return [];
}

export async function getManagers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/api/users`, { cache: 'no-store' });
    if (res.ok) {
        const data = await res.json();
        return (data || []).filter((u: User) => u.isActive && !u.isDeleted && (u.role === 'manager' || u.role === 'admin' || u.isProjectManager));
    }
  } catch (e) {
    console.error('API fetch failed, falling back to Supabase:', e);
  }

  // Fallback
  if (typeof window !== 'undefined') {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_deleted', false)
        .eq('is_active', true)
        .or('role.in.(admin,manager),is_project_manager.eq.true');
      
      if (error) throw error;
      return (data || []).map(mapDbUserToUser);
  }
  return [];
}

function mapDbUserToUser(u: any): User {
    return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        employeeCode: u.employee_code,
        department: u.department,
        position: u.position,
        avatar: u.avatar,
        phone: u.phone,
        isActive: u.is_active,
        isDeleted: u.is_deleted,
        failedLoginAttempts: u.failed_login_attempts,
        lastLogin: u.last_login,
        lockedUntil: u.locked_until,
        isProjectManager: u.is_project_manager,
        isSupervisor: u.is_supervisor,
        hourlyRate: Number(u.hourly_rate),
        timezone: u.timezone,
        createdAt: u.created_at,
        updatedAt: u.updated_at
    };
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
