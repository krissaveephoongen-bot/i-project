import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-only-secret' : (() => { throw new Error('JWT_SECRET is required in production'); })());
const JWT_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  type: 'access' | 'refresh';
}

/**
 * Generate access token (24 hours)
 */
export function generateAccessToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    {
      userId,
      email,
      role,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY, algorithm: 'HS256' }
  );
}

/**
 * Generate refresh token (7 days)
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      userId,
      type: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY, algorithm: 'HS256' }
  );
}

/**
 * Generate a random token for password reset
 */
export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    return decoded as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Calculate token expiry dates
 */
export function getTokenExpiries() {
  const now = new Date();
  const accessTokenExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  const refreshTokenExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  return { accessTokenExpiry, refreshTokenExpiry };
}

/**
 * Get IP address from request headers
 */
export function getIPAddress(request: Request): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    null
  );
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: Request): string | null {
  return request.headers.get('user-agent');
}
