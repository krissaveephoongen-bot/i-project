import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
 
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
 
    const { data: entries } = await supabase
      .from('time_entries')
      .select('userId,date,hours,projectId')
      .gte('date', days[0])
      .lte('date', days[6])
      .order('date', { ascending: true });
    const filtered = (entries || []).filter((e: any) => (projectId ? e.projectId === projectId : true));
    const userIds = Array.from(new Set(filtered.map((e: any) => e.userId)));
    const { data: users } = userIds.length ? await supabase.from('users').select('id,name').in('id', userIds) : { data: [] };
    const nameMap = Object.fromEntries((users || []).map((u: any) => [u.id, u.name]));
    const map = new Map<string, any>();
    for (const r of filtered) {
      const key = r.userId;
      if (!map.has(key)) {
        map.set(key, { userId: r.userId, name: nameMap[r.userId] || r.userId, hours: Object.fromEntries(days.map(d => [d, 0])) });
      }
      const day = new Date(r.date).toISOString().slice(0, 10);
      map.get(key).hours[day] = Number(r.hours || 0) + Number(map.get(key).hours[day] || 0);
    }
    return NextResponse.json({ days, data: Array.from(map.values()) }, { status: 200 });
   } catch (error) {
     return NextResponse.json({ days: [], data: [] }, { status: 200 });
   }
 }
