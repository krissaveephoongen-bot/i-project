import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { isSchemaColumnError } from '../../_lib/supabaseCompat';

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
    const minimalBase: any = {
      id: crypto.randomUUID(),
      email,
      name: name || email,
      role,
      created_at: now,
      updated_at: now
    };
    const richBase: any = {
      ...minimalBase,
      department: department || null,
      position: position || null,
      phone: phone || null,
      avatar: avatar || null,
      status: 'active',
      is_active: true,
      is_deleted: false,
      failed_login_attempts: 0,
      last_login: null,
      locked_until: null,
      hourly_rate: 0,
      timezone: 'Asia/Bangkok'
    };

    const passwordVariants: any[] = [
      { password: hash, password_hash: hash, hashed_password: hash },
      { password: hash, password_hash: hash },
      { password: hash },
      { password_hash: hash },
      { hashed_password: hash }
    ];

    let userRow: any = null;
    let lastErr: any = null;
    for (const base of [richBase, minimalBase]) {
      for (const pw of passwordVariants) {
        const payload: any = { ...base, ...pw };
        const res = await supabase.from('users').insert(payload).select('*').single();
        if (!res.error) {
          userRow = res.data;
          lastErr = null;
          break;
        }
        lastErr = res.error;
        if (isSchemaColumnError(res.error)) continue;
        break;
      }
      if (userRow) break;
      if (lastErr && !isSchemaColumnError(lastErr)) break;
    }
    if (!userRow) return NextResponse.json({ error: lastErr?.message || 'Register failed' }, { status: 500 });

    const prof = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      avatar_url: userRow.avatar,
      role: userRow.role,
      created_at: now,
      updated_at: now
    };
    try {
      const pRes = await supabase.from('profiles').insert(prof);
      if (pRes.error && !isSchemaColumnError(pRes.error)) {
        return NextResponse.json({ error: pRes.error.message }, { status: 500 });
      }
    } catch {}
    return NextResponse.json({ user: userRow, profile: prof, token: userRow.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}
