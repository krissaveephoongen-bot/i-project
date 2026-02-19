
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import redis from '@/lib/redis';
import { pool } from '../../_lib/db';

function quoteIdent(name: string) {
  return /^[a-z_][a-z0-9_]*$/.test(name) ? name : `"${name.replace(/"/g, '""')}"`;
}

async function pickColumn(table: string, candidates: string[]) {
  const res = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name = ANY($2::text[]) LIMIT 1`,
    [table, candidates]
  );
  return res.rows[0]?.column_name as string | undefined;
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });

    const body = await request.json();
    
    const { id, updatedFields = {} } = body || {};
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const nowIso = new Date().toISOString();
    const candidates: Record<string, string[]> = {
      name: ['name'],
      code: ['code'],
      description: ['description'],
      status: ['status'],
      progress: ['progress'],
      budget: ['budget'],
      spent: ['spent'],
      remaining: ['remaining'],
      spi: ['spi'],
      cpi: ['cpi'],
      priority: ['priority'],
      category: ['category'],
      startDate: ['start_date', 'startDate'],
      endDate: ['end_date', 'endDate'],
      managerId: ['manager_id', 'managerId'],
      clientId: ['client_id', 'clientId'],
      progressPlan: ['progress_plan', 'progressPlan', 'progress_plan'],
      riskLevel: ['risk_level', 'riskLevel'],
      hourlyRate: ['hourly_rate', 'hourlyRate'],
      isArchived: ['is_archived', 'isArchived'],
    };

    const sets: string[] = [];
    const values: any[] = [];
    for (const [field, cols] of Object.entries(candidates)) {
      if (!(field in updatedFields)) continue;
      const col = await pickColumn('projects', cols);
      if (!col) continue;
      values.push((updatedFields as any)[field]);
      sets.push(`${quoteIdent(col)} = $${values.length}`);
    }

    const colUpdated = await pickColumn('projects', ['updated_at', 'updatedAt']);
    if (colUpdated) {
      values.push(nowIso);
      sets.push(`${quoteIdent(colUpdated)} = $${values.length}`);
    }

    if (sets.length === 0) return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });

    values.push(id);
    await pool.query(`UPDATE projects SET ${sets.join(', ')} WHERE id = $${values.length}`, values);

    // Track Progress History if progress changed
    if ('progress' in updatedFields) {
      const progress = Number(updatedFields.progress);
      if (!isNaN(progress)) {
        const colPid = await pickColumn('project_progress_history', ['project_id', 'projectId']);
        const colProg = await pickColumn('project_progress_history', ['progress']);
        const colWeek = await pickColumn('project_progress_history', ['week_date', 'weekDate']);
        const colCreated = await pickColumn('project_progress_history', ['created_at', 'createdAt']);
        if (colPid && colProg && colWeek) {
          const hCols = [colPid, colProg, colWeek].concat(colCreated ? [colCreated] : []);
          const hVals = [id, progress, nowIso].concat(colCreated ? [nowIso] : []);
          const hPh = hVals.map((_, i) => `$${i + 1}`).join(', ');
          await pool.query(
            `INSERT INTO project_progress_history (${hCols.map(quoteIdent).join(', ')}) VALUES (${hPh})`,
            hVals
          );
        }
      }
    }

    await redis.del('projects:all');
    const pRes = await pool.query('SELECT * FROM projects WHERE id = $1 LIMIT 1', [id]);
    return NextResponse.json(pRes.rows[0] || {}, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
