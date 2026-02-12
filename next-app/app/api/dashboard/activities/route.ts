import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Fetch recent audit logs
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('id, event_type, details, created_at, user:users(name)')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch recent timesheets
    const { data: timesheets } = await supabase
      .from('timesheets')
      .select('id, date, hours, description, user:users(name), project:projects(name)')
      .order('date', { ascending: false })
      .limit(10);

    // Fetch recent projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, createdAt, manager:users(name)')
      .order('createdAt', { ascending: false })
      .limit(5);

    const activities: any[] = [];

    (logs || []).forEach((l: any) => {
      activities.push({
        id: `log-${l.id}`,
        type: 'audit',
        title: l.event_type,
        description: l.details,
        user: l.user?.name || 'System',
        date: l.created_at
      });
    });

    (timesheets || []).forEach((t: any) => {
      activities.push({
        id: `ts-${t.id}`,
        type: 'timesheet',
        title: 'Time Logged',
        description: `${t.hours}h on ${t.project?.name || 'Unknown Project'}${t.description ? `: ${t.description}` : ''}`,
        user: t.user?.name || 'Unknown',
        date: t.date // Note: date is YYYY-MM-DD, might need time if available
      });
    });

    (projects || []).forEach((p: any) => {
      activities.push({
        id: `prj-${p.id}`,
        type: 'project',
        title: 'New Project',
        description: `Created project "${p.name}"`,
        user: p.manager?.name || 'System',
        date: p.createdAt
      });
    });

    // Sort by date desc
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(activities.slice(0, 20), { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
