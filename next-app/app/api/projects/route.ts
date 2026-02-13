
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
      .order('updatedAt', { ascending: false })
      .order('name', { ascending: true });
      
    if (error) throw error;

    if (!projects || projects.length === 0) return ok([], 200);

    // Manually fetch managers and clients to avoid "ambiguous relationship" errors
    const managerIds = Array.from(new Set(projects.map((p: any) => p.managerId || p.manager_id).filter(Boolean)));
    const clientIds = Array.from(new Set(projects.map((p: any) => p.clientId || p.client_id).filter(Boolean)));

    let managersMap: Record<string, any> = {};
    let clientsMap: Record<string, any> = {};

    if (managerIds.length > 0) {
      const { data: managers } = await supabaseAdmin.from('users').select('id,name').in('id', managerIds);
      managers?.forEach((m: any) => managersMap[m.id] = m);
    }

    if (clientIds.length > 0) {
      const { data: clients } = await supabaseAdmin.from('clients').select('id,name').in('id', clientIds);
      clients?.forEach((c: any) => clientsMap[c.id] = c);
    }

    // Attach details
    const enrichedProjects = projects.map((p: any) => ({
      ...p,
      manager: managersMap[p.managerId || p.manager_id] || null,
      client: clientsMap[p.clientId || p.client_id] || null
    }));
    
    return ok(enrichedProjects, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
