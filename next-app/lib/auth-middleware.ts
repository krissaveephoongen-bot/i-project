import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from './auth-utils';
import { supabase } from '@/app/lib/supabaseClient';

/**
 * Middleware to verify JWT token and attach user info to request
 * Usage in route handler:
 * const result = await verifyAuth(request);
 * if (!result.user) return result.response;
 * const user = result.user;
 */
export async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'Unauthorized', code: 'MISSING_AUTH_HEADER' },
          { status: 401 }
        )
      };
    }

    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'Invalid authorization header format', code: 'INVALID_AUTH_FORMAT' },
          { status: 401 }
        )
      };
    }

    // Verify JWT
    const payload = verifyToken(token);

    if (!payload || payload.type !== 'access') {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
          { status: 401 }
        )
      };
    }

    // Check if token is revoked in database
    const { data: authTokens } = await supabase
      .from('auth_tokens')
      .select('revoked_at')
      .eq('token', token)
      .eq('token_type', 'access')
      .limit(1);

    const authToken = authTokens?.[0];

    if (!authToken || authToken.revoked_at) {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'Token has been revoked', code: 'TOKEN_REVOKED' },
          { status: 401 }
        )
      };
    }

    // Get user
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .limit(1);

    const user = users?.[0];

    if (!user) {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'User not found', code: 'USER_NOT_FOUND' },
          { status: 401 }
        )
      };
    }

    if (!user.is_active || user.is_deleted) {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'User account is inactive or deleted', code: 'USER_INACTIVE' },
          { status: 401 }
        )
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        position: user.position,
        department: user.department,
        avatar: user.avatar,
        isActive: user.is_active
      },
      response: null
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    };
  }
}

/**
 * Verify user has required role
 */
export function requireRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Verify user is admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === 'admin';
}

/**
 * Verify user is manager or admin
 */
export function isManagerOrAdmin(userRole: string): boolean {
  return ['admin', 'manager'].includes(userRole);
}
