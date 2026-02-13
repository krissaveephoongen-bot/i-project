import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let start = searchParams.get('start');
    let end = searchParams.get('end');

    // Default to current week (Monday to Sunday) if not provided
    if (!start || !end) {
        const now = new Date();
        const day = now.getDay(); // 0 is Sunday
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        const monday = new Date(now.setDate(diff));
        const sunday = new Date(now.setDate(monday.getDate() + 6));
        start = monday.toISOString().slice(0, 10);
        end = sunday.toISOString().slice(0, 10);
    }

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    // 1. Fetch Users
    const { data: users, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, name, avatar')
        .order('name');
    
    if (userError) throw userError;

    // 2. Fetch Time Entries for the period
    const { data: entries, error: entryError } = await supabaseAdmin
        .from('time_entries')
        .select('userId, date, hours')
        .gte('date', start)
        .lte('date', end);

    if (entryError) throw entryError;

    // 3. Aggregate Data
    const loadMap: Record<string, Record<string, number>> = {};
    
    // Initialize map for all users
    users?.forEach((u: any) => {
        loadMap[u.id] = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
    });

    entries?.forEach((e: any) => {
        if (!loadMap[e.userId]) return; // Skip if user not found
        
        const date = new Date(e.date);
        const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const hours = Number(e.hours || 0);

        if (day === 1) loadMap[e.userId].mon += hours;
        else if (day === 2) loadMap[e.userId].tue += hours;
        else if (day === 3) loadMap[e.userId].wed += hours;
        else if (day === 4) loadMap[e.userId].thu += hours;
        else if (day === 5) loadMap[e.userId].fri += hours;
        else if (day === 6) loadMap[e.userId].sat += hours;
        else if (day === 0) loadMap[e.userId].sun += hours;
    });

    // 4. Format for Frontend
    const result = users?.map((u: any) => {
        const load = loadMap[u.id];
        return {
            id: u.id,
            name: u.name,
            avatar: u.avatar,
            mon: load.mon,
            tue: load.tue,
            wed: load.wed,
            thu: load.thu,
            fri: load.fri,
            total: load.mon + load.tue + load.wed + load.thu + load.fri + load.sat + load.sun
        };
    }) || [];

    // Sort by total load descending
    result.sort((a: any, b: any) => b.total - a.total);

    return NextResponse.json({ data: result, start, end }, { status: 200 });

  } catch (error: any) {
    console.error('Team Load API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
