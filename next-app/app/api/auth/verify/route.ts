import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Access token is required', code: 'TOKEN_MISSING' },
        { status: 401 }
      );
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid token format', code: 'TOKEN_INVALID' },
        { status: 401 }
      );
    }

    let userRow: any = null;
    const { data: uRows } = await supabase.from('users').select('*').eq('id', token).limit(1);
    userRow = (uRows || [])[0] || null;

    if (!userRow) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid token or user not found', code: 'TOKEN_INVALID' },
        { status: 401 }
      );
    }

    const isActive = userRow.isActive ?? userRow.isactive ?? userRow.is_active ?? true;
    const isDeleted = userRow.isDeleted ?? userRow.isdeleted ?? userRow.is_deleted ?? false;
    if (!isActive || isDeleted) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User inactive or deleted', code: 'USER_INACTIVE' },
        { status: 401 }
      );
    }

    const { password, password_hash, hashed_password, ...userWithoutPassword } = userRow;
    
    // Load profile from public.profiles
    let profileRow: any = null;
    try {
      const { data: pRows } = await supabase.from('profiles').select('*').eq('id', userRow.id).limit(1);
      profileRow = (pRows || [])[0] || null;
    } catch {}

    return NextResponse.json({
      user: userWithoutPassword,
      profile: profileRow,
      valid: true,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
