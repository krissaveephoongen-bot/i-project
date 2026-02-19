import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'
import redis from '@/lib/redis';

async function anyRecordExists(table: string, columns: string[], id: string) {
  let lastError: any = null;
  for (const col of columns) {
    const { data, error } = await supabaseAdmin.from(table).select('id').eq(col, id).limit(1);
    if (!error) return (data || []).length > 0;
    lastError = error;
    const msg = `${error.message || ''}`;
    if (msg.includes('Could not find the') || msg.includes('schema cache')) continue;
    break;
  }
  throw lastError ?? new Error(`Failed to query ${table}`);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });

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
      let updErr: any = null;
      for (const p of [
        { is_archived: true, updated_at: nowIso },
        { isArchived: true, updatedAt: nowIso },
      ]) {
        const { error } = await supabaseAdmin.from('projects').update(p as any).eq('id', id);
        if (!error) {
          updErr = null;
          break;
        }
        updErr = error;
        const msg = `${error.message || ''}`;
        if (msg.includes('Could not find the') || msg.includes('schema cache')) continue;
        break;
      }
      if (updErr) throw updErr
      
      // Invalidate projects cache after archiving
      await redis.del('projects:all');
      
      return NextResponse.json({ success: true, mode: 'archived' }, { status: 200 })
    } else {
      const { error: delErr } = await supabaseAdmin.from('projects').delete().eq('id', id)
      if (delErr) throw delErr
      
      // Invalidate projects cache after deletion
      await redis.del('projects:all');
      
      return NextResponse.json({ success: true, mode: 'deleted' }, { status: 200 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
