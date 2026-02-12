import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any;
    
    // Read body once as text
    const text = await request.text();
    
    if (!text) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    try {
      body = JSON.parse(text);
    } catch {
      // Try form-urlencoded
      body = Object.fromEntries(new URLSearchParams(text));
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .select('id,email,name,name_th,role,position,department,avatar,phone,isActive,isDeleted,failedLoginAttempts,lastLogin,lockedUntil,createdAt,updatedAt,hourlyRate,timezone,password')
      .eq('email', email)
      .limit(1);

    const user: any = (data || [])[0] || null;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Column mapping fallback
    const isActive = user.isActive ?? true;
    const isDeleted = user.isDeleted ?? false;
    const lockedUntil = user.lockedUntil ?? null;
    const failedLoginAttempts = user.failedLoginAttempts ?? 0;
    const passwordHash = user.password ?? user.password_hash ?? user.hashed_password ?? null;

    // Check if user is active
    if (!isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Check if user is deleted
    if (isDeleted) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (lockedUntil && new Date(lockedUntil) > new Date()) {
      return NextResponse.json(
        { error: 'Account is temporarily locked' },
        { status: 423 }
      );
    }

    // Verify password
    if (!passwordHash) {
      return NextResponse.json(
        { error: 'Password not configured for this account' },
        { status: 400 }
      );
    }
    const isValidPassword = await bcrypt.compare(password, passwordHash);
    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = Number(failedLoginAttempts || 0) + 1;
      
      const updates: any = { failedLoginAttempts: failedAttempts };
      if (failedAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      }

      await supabase
        .from('users')
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', user.id);

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Reset failed login attempts on successful login
    await supabase
      .from('users')
      .update({ failedLoginAttempts: 0, lastLogin: new Date().toISOString(), lockedUntil: null, updatedAt: new Date().toISOString() })
      .eq('id', user.id);

    // Return user data without password
    const { password: _, password_hash: __, hashed_password: ___, ...userWithoutPassword } = user;

    // Convert camelCase to snake_case for response
    const responseUser = {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      name: userWithoutPassword.name,
      name_th: userWithoutPassword.name_th,
      role: userWithoutPassword.role,
      position: userWithoutPassword.position,
      department: userWithoutPassword.department,
      avatar: userWithoutPassword.avatar,
      phone: userWithoutPassword.phone,
      isActive: isActive,
      isDeleted: isDeleted,
      failedLoginAttempts: failedLoginAttempts,
      lastLogin: userWithoutPassword.lastLogin,
      lockedUntil: lockedUntil,
      createdAt: userWithoutPassword.createdAt,
      updatedAt: userWithoutPassword.updatedAt,
      hourlyRate: userWithoutPassword.hourlyRate,
      timezone: userWithoutPassword.timezone
    };

    // Ensure profile record exists in public.profiles
    let profileRow: any = null;
    try {
      const { data: pRows } = await supabase.from('profiles').select('*').eq('id', user.id).limit(1);
      profileRow = (pRows || [])[0] || null;
      if (!profileRow) {
        const insertPayload = {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email ?? null,
          avatar_url: user.avatar ?? null,
          role: user.role ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const { data: created } = await supabase.from('profiles').insert(insertPayload).select('*').limit(1);
        profileRow = (created || [])[0] || insertPayload;
      } else {
        // Sync role/name if changed
        const needUpdate = (profileRow.role !== user.role) || (profileRow.name !== user.name) || (profileRow.email !== user.email) || (profileRow.avatar_url !== user.avatar);
        if (needUpdate) {
          const upd = {
            name: user.name ?? profileRow.name,
            email: user.email ?? profileRow.email,
            avatar_url: user.avatar ?? profileRow.avatar_url,
            role: user.role ?? profileRow.role,
            updated_at: new Date().toISOString()
          };
          const { data: updated } = await supabase.from('profiles').update(upd).eq('id', user.id).select('*').limit(1);
          profileRow = (updated || [])[0] || { ...profileRow, ...upd };
        }
      }
    } catch {}

    return NextResponse.json({
      user: responseUser,
      profile: profileRow,
      token: user.id,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
