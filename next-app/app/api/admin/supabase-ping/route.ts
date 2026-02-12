import { NextRequest } from 'next/server';
import { ok, err } from '../../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET(_req: NextRequest) {
  try {
    const { data, error } = await supabase.from('projects').select('id').limit(1);
    if (error) throw error;
    return ok({ connected: true, sample: data || [] }, 200);
  } catch (e: any) {
    return err('supabase ping error', 500, e?.message || String(e));
  }
}
