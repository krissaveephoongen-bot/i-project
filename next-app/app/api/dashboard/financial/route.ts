import { ok } from '../../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET() {
  try {
    const { data } = await supabase
      .from('financial_data')
      .select('month,revenue,cost')
      .order('month', { ascending: true });
    const rows = (data || []).map((r: any) => ({
      month: new Date(r.month).toLocaleString('en-US', { month: 'short' }),
      revenue: Number(r.revenue || 0),
      cost: Number(r.cost || 0),
    }));
    return ok(rows, 200);
  } catch (error) {
    return ok([], 200);
  } finally { }
}
