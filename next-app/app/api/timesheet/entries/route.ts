import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
 
 export async function GET(request: NextRequest) {
   try {
     const { searchParams } = new URL(request.url);
     const userId = searchParams.get('userId');
     const start = searchParams.get('start');
     const end = searchParams.get('end');
     const projects = (searchParams.get('projects') || '').split(',').filter(Boolean);
 
     if (!userId || !start || !end) {
       return NextResponse.json({ error: 'userId, start, end are required' }, { status: 400 });
     }
 
     let q = supabase
       .from('time_entries')
       .select('id,projectId,userId,date,hours')
       .eq('userId', userId)
       .gte('date', start)
       .lte('date', end);
     if (projects.length > 0) {
       q = q.in('projectId', projects);
     }
     const { data, error } = await q.order('date', { ascending: true });
     if (error) return NextResponse.json([], { status: 200 });
     return NextResponse.json(data || [], { status: 200 });
   } catch (error) {
    console.error('Timesheet entries error:', error);
    return NextResponse.json([], { status: 200 });
   }
 }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, project_id, task_id, date, hours, start_time, end_time } = body || {};
    if (!user_id || !project_id || !date) {
      return NextResponse.json({ error: 'user_id, project_id, date required' }, { status: 400 });
    }
    const payload: any = {
      id: crypto.randomUUID(),
      userId: user_id,
      projectId: project_id,
      taskId: task_id || null,
      date,
      hours: Number(hours || 0),
      startTime: start_time || null,
      endTime: end_time || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('time_entries').insert(payload).select('id,userId,projectId,date,hours').limit(1);
    if (error) return NextResponse.json({ id: undefined }, { status: 200 });
    return NextResponse.json((data || [])[0], { status: 200 });
  } catch {
    return NextResponse.json({ id: undefined }, { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, hours, task_id, start_time, end_time } = body || {};
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    const payload: any = { updatedAt: new Date().toISOString() };
    if (typeof hours !== 'undefined') payload.hours = Number(hours || 0);
    if (typeof task_id !== 'undefined') payload.taskId = task_id || null;
    if (typeof start_time !== 'undefined') payload.startTime = start_time || null;
    if (typeof end_time !== 'undefined') payload.endTime = end_time || null;
    const { data, error } = await supabase.from('time_entries').update(payload).eq('id', id).select('id,userId,projectId,date,hours').limit(1);
    if (error) return NextResponse.json({}, { status: 200 });
    return NextResponse.json((data || [])[0] || {}, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    const { error } = await supabase.from('time_entries').delete().eq('id', id);
    if (error) return NextResponse.json({ ok: false }, { status: 200 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
