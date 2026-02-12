 import { NextRequest, NextResponse } from 'next/server';
 import { supabase } from '@/app/lib/supabaseClient';
 
 export async function GET(request: NextRequest) {
   try {
     const { searchParams } = new URL(request.url);
     const start = searchParams.get('start') || new Date().toISOString().slice(0, 10);
     const end = searchParams.get('end') || new Date().toISOString().slice(0, 10);
     const userId = searchParams.get('userId') || '';
 
     const q = supabase
       .from('time_entries')
       .select('projectId,hours,date,userId')
       .gte('date', start)
       .lte('date', end);
     const { data: entries, error } = userId ? await q.eq('userId', userId) : await q;
     if (error) {
       return NextResponse.json([], { status: 200 });
     }
     const totals: Record<string, number> = {};
     for (const e of entries || []) {
       const pid = e.projectId || 'unknown';
       totals[pid] = (totals[pid] || 0) + Number(e.hours || 0);
     }
     const projectIds = Object.keys(totals).filter(id => id && id !== 'unknown');
     let projects: Record<string, string> = {};
     if (projectIds.length) {
       const { data: projRows } = await supabase.from('projects').select('id,name,title').in('id', projectIds);
       for (const p of projRows || []) {
         projects[p.id] = p.name || p.title || p.id;
       }
     }
     const rows = Object.entries(totals)
       .map(([pid, total]) => ({
         project_id: pid,
         project_name: projects[pid] || pid,
         total_hours: total
       }))
       .sort((a, b) => Number(b.total_hours) - Number(a.total_hours));
 
     return NextResponse.json(rows, { status: 200 });
   } catch {
     return NextResponse.json([], { status: 200 });
   }
 }
