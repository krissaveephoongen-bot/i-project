import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'admin client missing' }, { status: 500 });

    const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, name, position, avatar')
        .in('role', ['employee', 'manager']);

    if (usersError) throw usersError;

    // For simplicity, we'll calculate for the last 30 days.
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
    const date30DaysAgoStr = date30DaysAgo.toISOString().slice(0, 10);

    const { data: timesheetData, error: timesheetError } = await supabaseAdmin
        .from('time_entries')
        .select('userId, hours')
        .gte('date', date30DaysAgoStr);
    
    if (timesheetError) throw timesheetError;

    const userStats = (users || []).map((user: any) => {
        const userHours = (timesheetData || [])
            .filter((t: any) => t.userId === user.id)
            .reduce((sum: number, t: any) => sum + (Number(t.hours || 0)), 0);
        
        // Assuming 8 hours a day, 22 working days in the last 30 days
        const capacity = 8 * 22;
        const utilization = capacity > 0 ? (userHours / capacity) * 100 : 0;

        return {
            id: user.id,
            name: user.name,
            position: user.position || 'Employee',
            avatar: user.avatar,
            total_hours: userHours,
            utilization: Math.round(utilization)
        };
    });

    const totalTeamMembers = (users || []).length;
    const totalHoursLogged = userStats.reduce((sum: number, u: any) => sum + u.total_hours, 0);
    const avgUtilization = totalTeamMembers > 0 ? userStats.reduce((sum: number, u: any) => sum + u.utilization, 0) / totalTeamMembers : 0;

    const kpis = {
        totalTeamMembers,
        totalHoursLogged,
        averageUtilization: Math.round(avgUtilization)
    };

    return NextResponse.json({ userStats, kpis }, { status: 200 });
  } catch (e: any) {
    console.error('Resource Report API Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
