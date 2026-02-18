import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'employee', department, position, phone, avatar } = body || {};
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    const { data: exists } = await supabase.from('users').select('id').eq('email', email).limit(1);
    if ((exists || []).length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const payload: any = {
      id: `u-${Date.now()}`,
      email,
      name: name || email,
      role,
      department: department || null,
      position: position || null,
      phone: phone || null,
      avatar: avatar || null,
      is_active: true,
      is_deleted: false,
      failed_login_attempts: 0,
      last_login: null,
      locked_until: null,
      hourly_rate: 0,
      timezone: 'Asia/Bangkok',
      created_at: now,
      updated_at: now,
      password: hash,
      password_hash: hash,
      hashed_password: hash
    };
    const { data: userRow, error } = await supabase.from('users').insert(payload).select('*').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const prof = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      avatar_url: userRow.avatar,
      role: userRow.role,
      created_at: now,
      updated_at: now
    };
    await supabase.from('profiles').insert(prof);
    return NextResponse.json({ user: userRow, profile: prof, token: userRow.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}

