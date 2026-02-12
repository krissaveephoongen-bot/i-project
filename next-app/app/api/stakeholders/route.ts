import { ok, err } from '../../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';
import crypto from 'node:crypto';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const id = u.searchParams.get('id');

    let query = supabase.from('stakeholders').select('*');
    if (id) query = query.eq('id', id).single();
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
        // Table might not exist yet, fallback mock for now if error is about relation not found
        // In real app, we should create migration.
        // Assuming table 'stakeholders' exists or we map to clients.
        // If error code is 42P01 (undefined_table), return empty array
        if (error.code === '42P01') return ok([], 200);
        return err(error.message, 500);
    }

    return ok(data || [], 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, organization, email, phone } = body;
    
    if (!name) return err('Name is required', 400);

    const payload = {
        id: crypto.randomUUID(),
        name,
        role,
        organization,
        email,
        phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('stakeholders').insert(payload);
    
    if (error) {
        // If table missing, create it via SQL exec (Not possible via client usually, need admin)
        // Or return error
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
    const { id, name, role, organization, email, phone } = body;
    
    if (!id) return err('ID required', 400);

    const payload = {
        name,
        role,
        organization,
        email,
        phone,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('stakeholders').update(payload).eq('id', id);
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

    const { error } = await supabase.from('stakeholders').delete().eq('id', id);
    if (error) return err(error.message, 500);
    
    return ok({ success: true }, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}