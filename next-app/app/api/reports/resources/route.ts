import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    console.log('Resources Report API called');
    
    if (!supabaseAdmin) {
      console.error('Supabase admin client is null');
      return NextResponse.json({ error: 'admin client missing' }, { status: 500 });
    }

    console.log('Fetching users for resources report...');
    const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('*')
        .in('role', ['employee', 'manager']);

    if (usersError) {
      console.error('Users fetch error:', usersError);
      throw usersError;
    }

    console.log('Found users:', (users || []).length);

    // For simplicity, we'll calculate for the last 30 days.
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
    const date30DaysAgoStr = date30DaysAgo.toISOString().slice(0, 10);

    console.log('Fetching timesheet data since:', date30DaysAgoStr);
    // Be robust to snake_case vs camelCase columns
    let timesheetData: any[] = [];
    const t1 = await supabaseAdmin.from('time_entries').select('*').gte('date', date30DaysAgoStr);
    if (!t1.error) {
      timesheetData = t1.data || [];
    } else {
      console.warn('Timesheet fetch with date failed, trying work_date...', t1.error);
      const t2 = await supabaseAdmin.from('time_entries').select('*').gte('work_date' as any, date30DaysAgoStr);
      if (!t2.error) {
        timesheetData = t2.data || [];
      } else {
        console.error('Timesheet fetch error:', t2.error);
        throw t2.error;
      }
    }

    console.log('Found timesheet entries:', (timesheetData || []).length);

    const userStats = (users || []).map((user: any) => {
        const userHours = (timesheetData || [])
            .filter((t: any) => (t.userId ?? t.user_id) === user.id)
            .reduce((sum: number, t: any) => sum + (Number(t.hours || 0)), 0);
        
        // Assuming 8 hours a day, 22 working days in the last 30 days
        const capacity = 8 * 22;
        const utilization = capacity > 0 ? (userHours / capacity) * 100 : 0;

        const result = {
            id: user.id,
            name: user.name,
            position: user.position || user.job_title || 'Employee',
            avatar: user.avatar || null,
            total_hours: userHours,
            utilization: Math.round(utilization)
        };
        return result;
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
