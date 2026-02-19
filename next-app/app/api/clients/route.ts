
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
    console.log('Client API POST request:', body);
    const { name, email, phone, address, taxId } = body;

    if (!name) return err('Name is required', 400);

    console.log('Creating client with data:', { name, email, phone, address, taxId });

    const { data, error } = await supabase
      .from('clients')
      .insert([{ name, email, phone, address, taxId }])
      .select()
      .single();

    console.log('Supabase insert result:', { data, error });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Client created successfully:', data);
    return ok(data, 201);
  } catch (e: any) {
    console.error('Client API error:', e);
    return err(e?.message || 'error', 500);
  }
}
