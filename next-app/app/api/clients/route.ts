
import { ok, err } from '../_lib/db';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

function mapDbClientToApiClient(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    taxId: row.taxId ?? row.tax_id ?? undefined,
    createdAt: row.createdAt ?? row.created_at ?? undefined,
    updatedAt: row.updatedAt ?? row.updated_at ?? undefined,
  };
}

async function insertClient(row: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}) {
  const base = {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
  } as Record<string, any>;

  const attempts: Array<Record<string, any>> = [
    row.taxId ? { ...base, taxId: row.taxId } : base,
    row.taxId ? { ...base, tax_id: row.taxId } : base,
    base,
  ];

  let lastError: any = null;
  for (const payload of attempts) {
    const { data, error } = await supabaseAdmin.from('clients').insert([payload]).select().single();
    if (!error) return data;
    lastError = error;
    const message = `${error.message || ''}`;
    if (message.includes("Could not find the 'taxId' column") || message.includes("Could not find the 'tax_id' column")) {
      continue;
    }
    break;
  }
  throw lastError ?? new Error('Failed to create client');
}

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) return err('Supabase is not configured', 500);

    const u = new URL(req.url);
    const q = u.searchParams.get('q');

    let query = supabaseAdmin.from('clients').select('*').order('name', { ascending: true });
    if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) throw error;

    return ok((data || []).map(mapDbClientToApiClient), 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return err('Supabase is not configured', 500);

    const body = await req.json();
    const { id, name, email, phone, address, taxId } = body;

    if (!name) return err('Name is required', 400);

    const newId = id ?? globalThis.crypto?.randomUUID?.() ?? `client-${Date.now()}`;
    const data = await insertClient({ id: newId, name, email, phone, address, taxId });
    return ok(mapDbClientToApiClient(data), 201);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
