 import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import { orEq } from '../../_lib/supabaseCompat';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start') || new Date().toISOString().slice(0, 10);
    const end = searchParams.get('end') || new Date().toISOString().slice(0, 10);
    const projectId = searchParams.get('projectId') || '';

    let q = supabase.from('time_entries').select('*').gte('date', start).lte('date', end);
    const res = projectId ? await orEq(q, ['project_id', 'projectId', 'projectid'], projectId) : await q;
    const entries = res.data as any[] | null;
    const error = res.error;
    
    if (error) {
      console.error('Error fetching utilization:', error);
      return NextResponse.json([], { status: 200 });
    }

    const totals: Record<string, { total: number; billable: number }> = {};
    for (const e of entries || []) {
      const uid = e.userId ?? e.user_id ?? 'unknown';
      if (!totals[uid]) totals[uid] = { total: 0, billable: 0 };
      const h = Number(e.hours || 0);
      totals[uid].total += h;
      if (e.billable !== false) { // Default to true if null
          totals[uid].billable += h;
      }
    }

    const userIds = Object.keys(totals).filter(id => id && id !== 'unknown');
    let users: Record<string, string> = {};
    if (userIds.length) {
      const { data: userRows } = await supabase.from('users').select('id,name').in('id', userIds);
      for (const u of userRows || []) {
        users[u.id] = u.name || u.id;
      }
    }

    const rows = Object.entries(totals)
      .map(([uid, stats]) => ({
        user_id: uid,
        user_name: users[uid] || uid,
        total_hours: stats.total,
        billable_hours: stats.billable,
        non_billable_hours: stats.total - stats.billable
      }))
      .sort((a, b) => b.total_hours - a.total_hours);

    return NextResponse.json(rows, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}
