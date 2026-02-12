 import { NextRequest, NextResponse } from 'next/server';
 import { supabase } from '@/app/lib/supabaseClient';
 
 function inferTimes(start: any, end: any, date: string, hours: number) {
   if (start && end) return { start, end };
   const startTime = `${date}T09:00:00.000Z`;
   const endDate = new Date(startTime);
   endDate.setHours(endDate.getHours() + Number(hours || 0));
   return { start: startTime, end: endDate.toISOString() };
 }
 
 export async function GET(request: NextRequest) {
   try {
     const { searchParams } = new URL(request.url);
     const year = Number(searchParams.get('year') || new Date().getFullYear());
     const month = Number(searchParams.get('month') || new Date().getMonth() + 1);
     const focus = (searchParams.get('focus') || 'project').toLowerCase();
    const mode = (searchParams.get('mode') || 'structure').toLowerCase();
     const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10);
     const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
 
    const { data: entries, error } = await supabase
      .from('time_entries')
      .select('id,date,hours,startTime,endTime,projectId,taskId,userId')
      .gte('date', start)
      .lte('date', end);
    if (error) {
      return NextResponse.json({ root: { name: 'No Data', value: 0, children: [] } }, { status: 200 });
    }
    const pids = Array.from(new Set((entries || []).map((e: any) => e.projectId).filter(Boolean)));
    const tids = Array.from(new Set((entries || []).map((e: any) => e.taskId).filter(Boolean)));
    const uids = Array.from(new Set((entries || []).map((e: any) => e.userId).filter(Boolean)));
    const [{ data: projects }, { data: tasks }, { data: users }] = await Promise.all([
      supabase.from('projects').select('id,name,title').in('id', pids),
      supabase.from('tasks').select('id,name,title').in('id', tids),
      supabase.from('users').select('id,name,full_name').in('id', uids),
    ]);
 
     const safeName = (v: any, fallback: string) => (v && String(v)) || fallback;
 
     const root: any = { name: 'Root', value: 0, children: [] };
     const level1 = new Map<string, any>();
     const level2 = new Map<string, any>();
 
    const pMap: Record<string, string> = {};
    for (const p of projects || []) pMap[p.id] = p.name || p.title || p.id;
    const tMap: Record<string, string> = {};
    for (const t of tasks || []) tMap[t.id] = t.name || t.title || t.id;
    const uMap: Record<string, string> = {};
    for (const u of users || []) uMap[u.id] = u.name || u.full_name || u.id;
 
    for (const r of entries || []) {
      const { start: st, end: et } = inferTimes(r.startTime, r.endTime, r.date, r.hours);
      const proj = safeName(pMap[r.projectId], `Project ${r.projectId || ''}`);
      const task = safeName(tMap[r.taskId], `Task ${r.taskId || ''}`);
      const user = safeName(uMap[r.userId], `User ${r.userId || ''}`);
 
      const a = focus === 'staff' ? user : proj;
      const b = mode === 'worktype' ? task : (focus === 'staff' ? proj : task);
       const c = focus === 'staff' ? task : user;
 
       const keyA = a;
       const keyB = `${a}::${b}`;
 
       if (!level1.has(keyA)) {
         const nodeA = { name: a, value: 0, children: [] };
         level1.set(keyA, nodeA);
         root.children.push(nodeA);
       }
       const nodeA = level1.get(keyA);
 
       if (!level2.has(keyB)) {
         const nodeB = { name: b, value: 0, children: [] };
         level2.set(keyB, nodeB);
         nodeA.children.push(nodeB);
       }
       const nodeB = level2.get(keyB);
 
       const leaf = { name: c, value: Number(r.hours || 0), meta: { start: st, end: et, date: r.date } };
       nodeB.children.push(leaf);
       nodeB.value += leaf.value;
       nodeA.value += leaf.value;
       root.value += leaf.value;
     }
 
     return NextResponse.json({ root }, { status: 200 });
   } catch (error) {
    return NextResponse.json({ root: { name: 'No Data', value: 0, children: [] } }, { status: 200 });
   }
 }
