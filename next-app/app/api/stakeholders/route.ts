import { ok, err } from '../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';
import crypto from 'node:crypto';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const id = u.searchParams.get('id');
    const projectId = u.searchParams.get('projectId');

    let query = supabase.from('contacts').select('*');
    if (id) query = query.eq('id', id).single();
    if (!id && projectId) query = query.eq('project_id', projectId);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
        if (error.code === '42P01') return ok([], 200);
        return err(error.message, 500);
    }

    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    const filtered = id
      ? rows
      : rows.filter((c: any) => ['stakeholder', 'client', 'Stakeholder', 'Client'].includes(String(c.type || '')));
    return ok(id ? (filtered[0] || null) : filtered, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, position, email, phone, project_id, projectId, type } = body;
    
    if (!name) return err('Name is required', 400);
    const pid = project_id || projectId;
    if (!pid) return err('Project is required', 400);

    const payload = {
        id: crypto.randomUUID(),
        name,
        position: position || null,
        email,
        phone,
        project_id: pid,
        type: type || 'stakeholder',
        is_key_person: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('contacts').insert(payload);
    
    if (error) {
        return err(error.message, 500);
    }
    
    return ok(payload, 201);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, position, email, phone, type, project_id, projectId, is_key_person } = body;
    
    if (!id) return err('ID required', 400);

    const payload = {
        name,
        position,
        email,
        phone,
        type,
        project_id: project_id || projectId,
        is_key_person,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('contacts').update(payload).eq('id', id);
    if (error) return err(error.message, 500);
    
    return ok({ id, ...payload }, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const id = u.searchParams.get('id');
    if (!id) return err('ID required', 400);

    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) return err(error.message, 500);
    
    return ok({ success: true }, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
