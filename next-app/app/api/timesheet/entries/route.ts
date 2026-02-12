import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';
 
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
 
     // Use correct table 'timesheets' and snake_case columns as per schema
     let q = supabase
       .from('timesheets')
       .select('id, project_id, user_id, date, hours')
       .eq('user_id', userId)
       .gte('date', start)
       .lte('date', end);
     if (projects.length > 0) {
       q = q.in('project_id', projects);
     }
     const { data, error } = await q.order('date', { ascending: true });
     
     if (error) {
        console.error('Error fetching timesheets:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
     }
     
     // Map back to camelCase for frontend if needed, or keep consistent. 
     // Frontend likely expects camelCase if it was built that way.
     // Checking previous code: select('id,projectId,userId,date,hours')
     // So we should map it.
     const mappedData = (data || []).map((d: any) => ({
         id: d.id,
         projectId: d.project_id,
         userId: d.user_id,
         date: d.date,
         hours: d.hours
     }));

     return NextResponse.json(mappedData, { status: 200 });
   } catch (error: any) {
    console.error('Timesheet entries error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
   }
 }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, project_id, task_id, date, hours, start_time, end_time } = body || {};
    if (!user_id || !project_id || !date) {
      return NextResponse.json({ error: 'user_id, project_id, date required' }, { status: 400 });
    }
    
    // Schema uses snake_case
    const payload: any = {
      id: crypto.randomUUID(),
      user_id: user_id,
      project_id: project_id,
      task_id: task_id || null,
      date,
      hours: Number(hours || 0),
      start_time: start_time || null,
      end_time: end_time || null,
      // timesheets table in schema doesn't have createdAt/updatedAt based on schema.ts audit. 
      // Checking schema.ts again:
      // CREATE TABLE IF NOT EXISTS timesheets ( ... date date NOT NULL, hours numeric DEFAULT 0, start_time timestamp, end_time timestamp );
      // No createdAt/updatedAt columns in schema.ts for timesheets!
    };

    const { data, error } = await supabase.from('timesheets').insert(payload).select().single();
    
    if (error) {
        console.error('Error inserting timesheet:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Map response
    const res = {
        id: data.id,
        userId: data.user_id,
        projectId: data.project_id,
        date: data.date,
        hours: data.hours
    };

    return NextResponse.json(res, { status: 200 });
  } catch (e: any) {
    console.error('POST Timesheet Error:', e);
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, hours, task_id, start_time, end_time } = body || {};
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    
    const payload: any = {};
    if (typeof hours !== 'undefined') payload.hours = Number(hours || 0);
    if (typeof task_id !== 'undefined') payload.task_id = task_id || null;
    if (typeof start_time !== 'undefined') payload.start_time = start_time || null;
    if (typeof end_time !== 'undefined') payload.end_time = end_time || null;

    const { data, error } = await supabase.from('timesheets').update(payload).eq('id', id).select().single();
    
    if (error) {
        console.error('Error updating timesheet:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const res = {
        id: data.id,
        userId: data.user_id,
        projectId: data.project_id,
        date: data.date,
        hours: data.hours
    };

    return NextResponse.json(res, { status: 200 });
  } catch (e: any) {
    console.error('PUT Timesheet Error:', e);
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    const { error } = await supabase.from('timesheets').delete().eq('id', id);
    if (error) {
        console.error('Error deleting timesheet:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error('DELETE Timesheet Error:', e);
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}
