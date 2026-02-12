 import { NextRequest, NextResponse } from 'next/server';
 import { supabase } from '@/app/lib/supabaseClient';
 
 export async function GET(request: NextRequest) {
   try {
     const { searchParams } = new URL(request.url);
     const start = searchParams.get('start') || new Date().toISOString().slice(0, 10);
     const end = searchParams.get('end') || new Date().toISOString().slice(0, 10);
     const projectId = searchParams.get('projectId') || '';
 
     const q = supabase
       .from('time_entries')
       .select('userId,hours,date,projectId')
       .gte('date', start)
       .lte('date', end);
     const { data: entries, error } = projectId ? await q.eq('projectId', projectId) : await q;
     if (error) {
       return NextResponse.json([], { status: 200 });
     }
     const totals: Record<string, number> = {};
     for (const e of entries || []) {
       const uid = e.userId || 'unknown';
       totals[uid] = (totals[uid] || 0) + Number(e.hours || 0);
     }
     const userIds = Object.keys(totals).filter(id => id && id !== 'unknown');
     let users: Record<string, string> = {};
     if (userIds.length) {
       const { data: userRows } = await supabase.from('users').select('id,name,full_name').in('id', userIds);
       for (const u of userRows || []) {
         users[u.id] = u.name || u.full_name || u.id;
       }
     }
     const rows = Object.entries(totals)
       .map(([uid, total]) => ({
         user_id: uid,
         user_name: users[uid] || uid,
         total_hours: total
       }))
       .sort((a, b) => Number(b.total_hours) - Number(a.total_hours));
 
     return NextResponse.json(rows, { status: 200 });
   } catch {
     return NextResponse.json([], { status: 200 });
   }
 }
