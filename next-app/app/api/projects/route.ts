
import { ok, err } from '../_lib/db';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export const revalidate = 60;

export async function GET() {
  try {
    if (!supabaseAdmin) return err('admin client missing', 500);

    // Fetch projects first
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
      .order('name', { ascending: true });
      
    if (error) throw error;

    if (!projects || projects.length === 0) return ok([], 200);

    // Manually fetch managers and clients to avoid "ambiguous relationship" errors
    const manager_ids = Array.from(new Set(projects.map((p: any) => p.manager_id || p.manager_id).filter(Boolean)));
    const client_ids = Array.from(new Set(projects.map((p: any) => p.client_id || p.client_id).filter(Boolean)));

    let managersMap: Record<string, any> = {};
    let clientsMap: Record<string, any> = {};

    if (manager_ids.length > 0) {
      const { data: managers } = await supabaseAdmin.from('users').select('id,name').in('id', manager_ids);
      managers?.forEach((m: any) => managersMap[m.id] = m);
    }

    if (client_ids.length > 0) {
      const { data: clients } = await supabaseAdmin.from('clients').select('id,name').in('id', client_ids);
      clients?.forEach((c: any) => clientsMap[c.id] = c);
    }

    // Attach details
    const enrichedProjects = projects.map((p: any) => ({
      ...p,
      manager: managersMap[p.manager_id || p.manager_id] || null,
      client: clientsMap[p.client_id || p.client_id] || null
    }));
    
    return ok(enrichedProjects, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
