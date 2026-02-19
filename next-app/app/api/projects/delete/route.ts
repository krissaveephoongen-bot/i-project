 import { NextRequest, NextResponse } from 'next/server';
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
 
 async function anyRecordExists(table: string, columns: string[], id: string) {
   const col = await pickColumn(table, columns);
   if (!col) return false;
   const res = await pool.query(`SELECT 1 FROM ${quoteIdent(table)} WHERE ${quoteIdent(col)} = $1 LIMIT 1`, [id]);
   return res.rows.length > 0;
 }
 
 export async function POST(request: NextRequest) {
   try {
     const body = await request.json();
     const { id } = body || {};
     if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
 
     const nowIso = new Date().toISOString();
     const hasDeps =
       (await anyRecordExists('tasks', ['project_id', 'projectId', 'projectid'], id)) ||
       (await anyRecordExists('time_entries', ['project_id', 'projectId', 'projectid'], id)) ||
       (await anyRecordExists('expenses', ['project_id', 'projectId', 'projectid'], id)) ||
       (await anyRecordExists('documents', ['project_id', 'projectId', 'projectid'], id));
 
     if (hasDeps) {
       const colArchived = await pickColumn('projects', ['is_archived', 'isArchived']);
       if (!colArchived) return NextResponse.json({ error: 'projects schema missing archive flag' }, { status: 500 });
 
       const sets: string[] = [`${quoteIdent(colArchived)} = true`];
       const values: any[] = [];
       const colUpdated = await pickColumn('projects', ['updated_at', 'updatedAt']);
       if (colUpdated) {
         values.push(nowIso);
         sets.push(`${quoteIdent(colUpdated)} = $${values.length}`);
       }
       values.push(id);
       await pool.query(`UPDATE projects SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
       await redis.del('projects:all');
       return NextResponse.json({ ok: true, mode: 'archived' }, { status: 200 });
     }
 
     await pool.query('DELETE FROM projects WHERE id = $1', [id]);
     await redis.del('projects:all');
     return NextResponse.json({ ok: true, mode: 'deleted' }, { status: 200 });
   } catch {
     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
   }
 }
