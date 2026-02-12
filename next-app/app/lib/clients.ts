
import { supabase } from './supabaseClient';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getClients(params?: { q?: string }): Promise<Client[]> {
  try {
    const q = params?.q ? `?q=${encodeURIComponent(params.q)}` : '';
    const res = await fetch(`/api/clients${q}`, { cache: 'no-store' });
    if (res.ok) return res.json();
  } catch (e) {
      console.error('API fetch failed, falling back to Supabase:', e);
  }

  // Fallback to Supabase
  if (typeof window !== 'undefined') {
      let query = supabase.from('clients').select('*');
      if (params?.q) query = query.ilike('name', `%${params.q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapDbClientToClient);
  }
  return [];
}

export async function getClient(id: string): Promise<Client> {
    try {
        const res = await fetch(`/api/clients/${id}`);
        if (res.ok) return res.json();
    } catch (e) {
        console.error('API fetch failed, falling back to Supabase:', e);
    }

    // Fallback to Supabase
    if (typeof window !== 'undefined') {
        const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
        if (error) throw error;
        return mapDbClientToClient(data);
    }
    throw new Error('Client not found');
}

export async function createClient(data: Partial<Client>): Promise<Client> {
  const res = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create client');
  return res.json();
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  const res = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update client');
  return res.json();
}

export async function deleteClient(id: string): Promise<void> {
  const res = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete client');
}

function mapDbClientToClient(c: any): Client {
    return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        taxId: c.taxId || c.tax_id,
        notes: c.notes,
        createdAt: c.createdAt || c.created_at,
        updatedAt: c.updatedAt || c.updated_at
    };
}
