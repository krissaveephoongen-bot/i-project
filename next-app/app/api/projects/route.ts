
import { ok, err } from '../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, manager:users(id,name), client:clients(id,name)')
      .order('updatedAt', { ascending: false })
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    // Transform if necessary, or return as is.
    // The frontend expects manager and client objects if joined.
    // Supabase returns { ..., manager: {id, name}, client: {id, name} } which is perfect.
    
    return ok(data || [], 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
