
import { ok, err } from '../../_lib/db';
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

async function updateClient(
  id: string,
  body: { name?: string; email?: string; phone?: string; address?: string; taxId?: string }
) {
  const base = {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.email !== undefined ? { email: body.email } : {}),
    ...(body.phone !== undefined ? { phone: body.phone } : {}),
    ...(body.address !== undefined ? { address: body.address } : {}),
  } as Record<string, any>;

  const attempts: Array<Record<string, any>> = [
    body.taxId !== undefined ? { ...base, taxId: body.taxId } : base,
    body.taxId !== undefined ? { ...base, tax_id: body.taxId } : base,
    body.taxId !== undefined ? { ...base, notes: `taxId=${body.taxId}` } : base,
  ];

  let lastError: any = null;
  for (const payload of attempts) {
    if (Object.keys(payload).length === 0) return null;
    const { data, error } = await supabaseAdmin.from('clients').update(payload).eq('id', id).select().single();
    if (!error) return data;
    lastError = error;
    const message = `${error.message || ''}`;
    if (message.includes("Could not find the 'taxId' column") || message.includes("Could not find the 'tax_id' column")) {
      continue;
    }
    break;
  }
  throw lastError ?? new Error('Failed to update client');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!supabaseAdmin) return err('Supabase is not configured', 500);

    const { data, error } = await supabaseAdmin.from('clients').select('*').eq('id', id).single();
    if (error) throw error;
    return ok(mapDbClientToApiClient(data), 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    if (!supabaseAdmin) return err('Supabase is not configured', 500);

    const data = await updateClient(id, body);
    if (!data) return err('No valid fields to update', 400);
    return ok(mapDbClientToApiClient(data), 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!supabaseAdmin) return err('Supabase is not configured', 500);

    const { error } = await supabaseAdmin.from('clients').delete().eq('id', id);
    if (error) throw error;
    return ok({ success: true }, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
