import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import {
  extractTokenFromHeader,
  verifyToken,
  generateAccessToken,
  getTokenExpiries
} from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Invalid authorization header format' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyToken(token);

    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Check if token is revoked
    const { data: tokenRecord } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('token', token)
      .eq('token_type', 'refresh')
      .limit(1);

    const authToken = tokenRecord?.[0];

    if (!authToken || authToken.revoked_at) {
      return NextResponse.json(
        { error: 'Refresh token has been revoked' },
        { status: 401 }
      );
    }

    // Get user
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .limit(1);

    const user = users?.[0];

    if (!user || !user.is_active || user.is_deleted) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);
    const { accessTokenExpiry } = getTokenExpiries();

    // Store new access token
    await supabase.from('auth_tokens').insert({
      id: uuidv4(),
      user_id: user.id,
      token: newAccessToken,
      token_type: 'access',
      expires_at: accessTokenExpiry.toISOString()
    });

    return NextResponse.json(
      {
        accessToken: newAccessToken,
        expiresIn: 86400, // 24 hours in seconds
        message: 'Token refreshed successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
