
import { ok, err } from '../_lib/db';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import redis from '@/lib/redis';

export const revalidate = 60;

export async function GET() {
  try {
    if (!supabaseAdmin) return err('admin client missing', 500);

    // Try to get from Redis cache first
    const cacheKey = 'projects:all';
    const cachedProjects = await redis.get(cacheKey);
    
    if (cachedProjects) {
      console.log('Cache hit for projects');
      return ok(JSON.parse(cachedProjects), 200);
    }

    console.log('Cache miss for projects, fetching from database');

    // Fetch projects first
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
      .order('name', { ascending: true });
      
    if (error) throw error;

    if (!projects || projects.length === 0) {
      await redis.set(cacheKey, '[]', { EX: 300 }); // Cache for 5 minutes
      return ok([], 200);
    }

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

    // Cache the enriched projects for 5 minutes
    await redis.set(cacheKey, JSON.stringify(enrichedProjects), { EX: 300 });
    console.log('Cached enriched projects for 5 minutes');
    
    return ok(enrichedProjects, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
