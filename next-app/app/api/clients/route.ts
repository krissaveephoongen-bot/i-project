
import { ok, err } from '../_lib/db';
import { NextRequest } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const q = u.searchParams.get('q');

    let query = supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (q) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return ok(data || [], 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, taxId, notes } = body;

    if (!name) return err('Name is required', 400);

    const { data, error } = await supabase
      .from('clients')
      .insert([{ name, email, phone, address, taxId, notes }])
      .select()
      .single();

    if (error) throw error;
    return ok(data, 201);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
