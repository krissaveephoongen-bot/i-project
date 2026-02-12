import { ok } from '../../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET() {
  try {
    const { data: rows } = await supabase.from('projects').select('*').order('id', { ascending: false });
    const clientIds = (rows || [])
      .map((r: any) => r.clientId)
      .filter((v: any, i: number, a: any[]) => !!v && a.indexOf(v) === i);
    let clientMap: Record<string, string> = {};
    if (clientIds.length > 0) {
      const { data: clients } = await supabase.from('clients').select('id,name').in('id', clientIds);
      clientMap = Object.fromEntries((clients || []).map((r: any) => [r.id, r.name || '']));
    }
    const out = (rows || []).map((r: any) => {
      const plan = Number(r.progressPlan ?? 100);
      const actual = Number(r.progress ?? r.progressActual ?? 0);
      const spi = Number(r.spi ?? (plan > 0 ? actual / plan : 1));
      const risk = String(r.riskLevel ?? 'low');
      const clientId = r.clientId;
      const client = clientId ? (clientMap[clientId] || '') : '';
      return {
        id: r.id,
        name: r.name,
        progress_plan: plan,
        progress_actual: actual,
        spi,
        risk_level: risk,
        client
      };
    });
    return ok(out, 200);
  } catch (error) {
    return ok([], 200);
  } finally { }
}
