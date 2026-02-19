import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis';
import { pool } from '../../_lib/db';

async function anyRecordExists(table: string, columns: string[], id: string) {
  const res = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name = ANY($2::text[]) LIMIT 1`,
    [table, columns]
  );
  const col = res.rows[0]?.column_name as string | undefined;
  if (!col) return false;

  const q = /^[a-z_][a-z0-9_]*$/.test(col) ? col : `"${col.replace(/"/g, '""')}"`;
  const qt = /^[a-z_][a-z0-9_]*$/.test(table) ? table : `"${table.replace(/"/g, '""')}"`;
  const eRes = await pool.query(`SELECT 1 FROM ${qt} WHERE ${q} = $1 LIMIT 1`, [id]);
  return eRes.rows.length > 0;
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    // Check dependent records: tasks, time_entries, expenses, documents
    const hasDeps =
      (await anyRecordExists('tasks', ['project_id', 'projectId', 'projectid'], id)) ||
      (await anyRecordExists('time_entries', ['project_id', 'projectId', 'projectid'], id)) ||
      (await anyRecordExists('expenses', ['project_id', 'projectId', 'projectid'], id)) ||
      (await anyRecordExists('documents', ['project_id', 'projectId', 'projectid'], id));

    if (hasDeps) {
      // Archive project to preserve Single Source of Truth
      const nowIso = new Date().toISOString();
      const cRes = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='projects' AND column_name = ANY($1::text[])`,
        [['is_archived', 'isArchived', 'updated_at', 'updatedAt']]
      );
      const cols = new Set<string>(cRes.rows.map(r => r.column_name));
      const colArchived = cols.has('is_archived') ? 'is_archived' : (cols.has('isArchived') ? 'isArchived' : null);
      if (!colArchived) return NextResponse.json({ error: 'projects schema missing archive flag' }, { status: 500 });
      const colUpdated = cols.has('updated_at') ? 'updated_at' : (cols.has('updatedAt') ? 'updatedAt' : null);

      const qArchived = /^[a-z_][a-z0-9_]*$/.test(colArchived) ? colArchived : `"${colArchived.replace(/"/g, '""')}"`;
      const sets: string[] = [`${qArchived} = true`];
      const values: any[] = [];
      if (colUpdated) {
        const qUpdated = /^[a-z_][a-z0-9_]*$/.test(colUpdated) ? colUpdated : `"${colUpdated.replace(/"/g, '""')}"`;
        values.push(nowIso);
        sets.push(`${qUpdated} = $${values.length}`);
      }
      values.push(id);
      await pool.query(`UPDATE projects SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
      
      // Invalidate projects cache after archiving
      await redis.del('projects:all');
      
      return NextResponse.json({ success: true, mode: 'archived' }, { status: 200 })
    } else {
      await pool.query('DELETE FROM projects WHERE id = $1', [id]);
      
      // Invalidate projects cache after deletion
      await redis.del('projects:all');
      
      return NextResponse.json({ success: true, mode: 'deleted' }, { status: 200 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
