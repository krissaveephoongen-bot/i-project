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
     const userId = searchParams.get('userId') || '';
     const projectId = searchParams.get('projectId') || '';
     const team = searchParams.get('team') || '';
     const days = getWeekDates(start);
 
    const q = supabase
      .from('time_entries')
      .select('date,hours,startTime,endTime,projectId,taskId,userId')
      .gte('date', days[0])
      .lte('date', days[6]);
    let rq = q;
    if (userId) rq = rq.eq('userId', userId);
    if (projectId) rq = rq.eq('projectId', projectId);
    const { data: entries, error } = await rq;
    if (error) {
      return NextResponse.json({ days, rows: [] }, { status: 200 });
    }
    const userIds = new Set<string>();
    const projectIds = new Set<string>();
    const taskIds = new Set<string>();
    for (const e of entries || []) {
      if (e.userId) userIds.add(e.userId);
      if (e.projectId) projectIds.add(e.projectId);
      if (e.taskId) taskIds.add(e.taskId);
    }
    const [{ data: users }, { data: projects }, { data: tasks }] = await Promise.all([
      supabase.from('users').select('id,name,full_name,team,department').in('id', Array.from(userIds)),
      supabase.from('projects').select('id,name,title').in('id', Array.from(projectIds)),
      supabase.from('tasks').select('id,title,name').in('id', Array.from(taskIds)),
    ]);
    const uMap: Record<string, { name: string; team: string }> = {};
    for (const u of users || []) uMap[u.id] = { name: u.name || u.full_name || u.id, team: u.team || u.department || '' };
    const pMap: Record<string, string> = {};
    for (const p of projects || []) pMap[p.id] = p.name || p.title || p.id;
    const tMap: Record<string, string> = {};
    for (const t of tasks || []) tMap[t.id] = t.name || t.title || t.id;
    let rows = (entries || []).map((e: any) => ({
      date: e.date,
      hours: e.hours,
      start_time: e.startTime,
      end_time: e.endTime,
      project: pMap[e.projectId] || e.projectId || '',
      task: tMap[e.taskId] || e.taskId || '',
      user: (uMap[e.userId]?.name) || e.userId || '',
      team: (uMap[e.userId]?.team) || '',
    }));
    if (team) {
      const tFilter = team.toLowerCase();
      rows = rows.filter((r: any) => (r.team || '').toLowerCase().includes(tFilter));
    }
    rows.sort((a: any, b: any) => {
      if (a.date === b.date) {
        const au = a.user.localeCompare(b.user);
        if (au !== 0) return au;
        const ap = a.project.localeCompare(b.project);
        if (ap !== 0) return ap;
        return a.task.localeCompare(b.task);
      }
      return a.date.localeCompare(b.date);
    });
 
    return NextResponse.json({ days, rows }, { status: 200 });
   } catch {
     return NextResponse.json({ days: [], rows: [] }, { status: 200 });
   }
 }
