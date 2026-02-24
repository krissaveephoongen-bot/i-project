import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'admin client missing' }, { status: 500 });

    const { data: projects, error } = await supabaseAdmin
        .from('projects')
        .select('id, name, budget, spent, start_date');

    if (error) throw error;

    const { searchParams } = new URL(req.url);
    const includeInternalParam = (searchParams.get('includeInternal') || '').toLowerCase();
    const includeInternal = includeInternalParam === 'true' || includeInternalParam === '1' || includeInternalParam === 'yes';

    // Optionally exclude internal/department projects
    const visibleProjects = includeInternal
      ? (projects || [])
      : (projects || []).filter((p: any) => {
          const isInternal = p.is_internal === true;
          const cat = String(p.internal_category || p.category || '').toLowerCase();
          return !(isInternal || cat === 'internal' || cat.includes('department'));
        });

    const totalRevenue = (visibleProjects || []).reduce((sum: number, p: any) => sum + Number(p.budget || 0), 0);
    const totalCost = (visibleProjects || []).reduce((sum: number, p: any) => sum + Number(p.spent || 0), 0);
    const netProfit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const kpis = {
        totalRevenue,
        totalCost,
        netProfit,
        margin: Math.round(margin)
    };

    // Calculate monthly trends (Real Data if possible, or mock based on start date)
    // For now, let's use the start date to distribute budget/spent
    const monthlyMap: Record<string, { revenue: number, cost: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    (visibleProjects || []).forEach((p: any) => {
        if (!p.start_date) return;
        const date = new Date(p.start_date);
        const month = months[date.getMonth()];
        if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, cost: 0 };
        
        // Distribute budget/spent (simplified: allocate to start month)
        monthlyMap[month].revenue += Number(p.budget || 0);
        monthlyMap[month].cost += Number(p.spent || 0);
    });

    const chartData = months.map(m => ({
        name: m,
        revenue: monthlyMap[m]?.revenue || 0,
        cost: monthlyMap[m]?.cost || 0
    }));

    return NextResponse.json({ projects: visibleProjects, kpis, chartData }, { status: 200 });
  } catch (e: any) {
    console.error('Financial Report API Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
