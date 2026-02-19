
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import redis from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });

    const body = await request.json();
    console.log('Update Project Request:', body);
    
    const { id, updatedFields = {} } = body || {};
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const allowed = [
      'name',
      'code',
      'description',
      'status',
      'progress',
      'budget',
      'spent',
      'remaining',
      'spi',
      'cpi',
      'priority',
      'category',
      'startDate',
      'start_date',
      'endDate',
      'end_date',
      'managerId',
      'manager_id',
      'clientId',
      'client_id',
      'progressPlan',
      'progress_plan',
      'riskLevel',
      'risk_level',
      'hourlyRate',
      'hourly_rate',
      'isArchived',
      'is_archived',
    ];

    const nowIso = new Date().toISOString();
    const toSnake: Record<string, string> = {
      startDate: 'start_date',
      endDate: 'end_date',
      managerId: 'manager_id',
      clientId: 'client_id',
      progressPlan: 'progress_plan',
      riskLevel: 'risk_level',
      hourlyRate: 'hourly_rate',
      isArchived: 'is_archived',
    };
    const toCamel: Record<string, string> = {
      start_date: 'startDate',
      end_date: 'endDate',
      manager_id: 'managerId',
      client_id: 'clientId',
      progress_plan: 'progressPlan',
      risk_level: 'riskLevel',
      hourly_rate: 'hourlyRate',
      is_archived: 'isArchived',
    };

    const snakePayload: any = {};
    const camelPayload: any = {};
    for (const k of allowed) {
      if (!(k in updatedFields)) continue;
      const v = (updatedFields as any)[k];
      const snakeKey = toSnake[k] ?? k;
      const camelKey = toCamel[k] ?? k;
      snakePayload[snakeKey] = v;
      camelPayload[camelKey] = v;
    }
    snakePayload.updated_at = nowIso;
    camelPayload.updatedAt = nowIso;

    let data: any = null;
    let error: any = null;
    for (const p of [snakePayload, camelPayload]) {
      if (Object.keys(p).length === 0) return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
      const res = await supabaseAdmin.from('projects').update(p).eq('id', id).select('*').limit(1);
      data = res.data;
      error = res.error;
      if (!error) break;
      const msg = `${error.message || ''}`;
      if (msg.includes('Could not find the') || msg.includes('schema cache')) continue;
      break;
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Track Progress History if progress changed
    if ('progress' in updatedFields) {
      const progress = Number(updatedFields.progress);
      if (!isNaN(progress)) {
        for (const h of [
          { project_id: id, progress, week_date: nowIso, created_at: nowIso },
          { projectId: id, progress, weekDate: nowIso, createdAt: nowIso },
        ]) {
          const { error: hErr } = await supabaseAdmin.from('project_progress_history').insert(h as any);
          if (!hErr) break;
          const msg = `${hErr.message || ''}`;
          if (msg.includes('Could not find the') || msg.includes('schema cache')) continue;
          break;
        }
      }
    }

    await redis.del('projects:all');
    console.log('Update Success:', data);
    return NextResponse.json((data || [])[0] || {}, { status: 200 });
  } catch (e: any) {
    console.error('Update Project Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
