// next-app/lib/users.ts
import { supabase } from './supabaseClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getManagers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role')
    .in('role', ['Manager', 'Admin', 'manager', 'admin']);

  if (error) {
    console.error('Error fetching managers:', error);
    throw error;
  }
  return data || [];
}