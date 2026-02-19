import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

function getWeekDates(start: string) {
  const d = new Date(start);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    days.push(dd.toISOString().slice(0, 10));
  }
  return days;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start') || new Date().toISOString().slice(0, 10);
    const projectId = searchParams.get('projectId') || '';
    const days = getWeekDates(start);
    
    // Query using camelCase columns for time_entries
    let query = supabase
      .from('time_entries')
      .select('userId, date, hours, projectId') // camelCase columns
      .gte('date', days[0])
      .lte('date', days[6]);
      
    if (projectId && projectId !== 'all') {
        query = query.eq('projectId', projectId);
    }
    
    const { data: entries, error } = await query.order('date', { ascending: true });
    
    if (error) {
        console.error('Error fetching weekly entries:', error);
        return NextResponse.json({ days, data: [] }, { status: 500 });
    }

    const filtered = entries || [];
    
    // Get unique users
    const userIds = Array.from(new Set(filtered.map((e: any) => e.userId)));
    
    let usersMap: Record<string, string> = {};
    if (userIds.length > 0) {
        const { data: users } = await supabase
            .from('users')
            .select('id, name')
            .in('id', userIds);
        
        (users || []).forEach((u: any) => {
            usersMap[u.id] = u.name;
        });
    }

    const map = new Map<string, any>();
    
    for (const r of filtered) {
      const key = r.userId;
      if (!map.has(key)) {
        map.set(key, { 
            userId: r.userId,
            name: usersMap[r.userId] || r.userId, 
            hours: Object.fromEntries(days.map(d => [d, 0])) 
        });
      }
      
      const day = new Date(r.date).toISOString().slice(0, 10);
      const currentHours = map.get(key).hours[day] || 0;
      map.get(key).hours[day] = Number(r.hours || 0) + currentHours;
    }
    
    return NextResponse.json({ days, data: Array.from(map.values()) }, { status: 200 });
  } catch (error) {
    console.error('Weekly summary error:', error);
    return NextResponse.json({ days: [], data: [] }, { status: 500 });
  }
}
