import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  data?: any;
  message?: string;
  error?: string;
}

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  name: string;
}

const getToken = (req: NextApiRequest): string | null => {
  const authHeader = req.headers.authorization;
  return authHeader && authHeader.split(' ')[1];
};

const verifyToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as DecodedToken;
  } catch (error) {
    return null;
  }
};

async function handleLogin(req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (userResult.length === 0) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const user = userResult[0];

  if (!user.isActive) {
    return res.status(401).json({ success: false, error: 'Account is deactivated' });
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    return res.status(401).json({ success: false, error: 'Account is temporarily locked' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password || '');
  if (!isValidPassword) {
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    const updates: any = { failedLoginAttempts: failedAttempts };

    if (failedAttempts >= 5) {
      updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await db.update(users).set(updates).where(eq(users.id, user.id));
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  await db.update(users).set({
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLogin: new Date(),
  }).where(eq(users.id, user.id));

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );

  return res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      department: user.department || '',
      position: user.position || '',
    },
  });
}

async function handleLogout(_req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

async function handleProfile(req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  if (req.method === 'GET') {
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatar: users.avatar,
      department: users.department,
      position: users.position,
      phone: users.phone,
      status: users.status,
      lastLogin: users.lastLogin,
    }).from(users).where(eq(users.id, decoded.id)).limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, data: userResult[0] });
  } else if (req.method === 'PUT') {
    const { name, avatar, department, position, phone } = req.body;

    const updatedUser = await db.update(users)
      .set({
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(department && { department }),
        ...(position && { position }),
        ...(phone && { phone }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, decoded.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        department: users.department,
        position: users.position,
        phone: users.phone,
        status: users.status,
      });

    if (updatedUser.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, data: updatedUser[0] });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

async function handleVerify(req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  const userResult = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
  }).from(users).where(eq(users.id, decoded.id)).limit(1);

  if (userResult.length === 0) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  return res.status(200).json({ success: true, user: userResult[0] });
}

async function handlePassword(req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current and new passwords are required' });
  }

  const userResult = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);

  if (userResult.length === 0) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const user = userResult[0];
  const isValidPassword = await bcrypt.compare(currentPassword, user.password || '');
  if (!isValidPassword) {
    return res.status(401).json({ success: false, error: 'Current password is incorrect' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '10') || 10);

  await db.update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, decoded.id));

  return res.status(200).json({ success: true, message: 'Password changed successfully' });
}

async function handleRefresh(req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'Refresh token required' });
  }

  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }

  const userResult = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);

  if (userResult.length === 0) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const user = userResult[0];
  const newToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );

  return res.status(200).json({
    success: true,
    token: newToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

async function handleForgotPassword(req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (userResult.length === 0) {
    return res.status(200).json({ success: true, message: 'If email exists, password reset link has been sent' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000);

  await db.update(users)
    .set({ resetToken, resetTokenExpiry, updatedAt: new Date() })
    .where(eq(users.id, userResult[0].id));

  return res.status(200).json({
    success: true,
    message: 'If email exists, password reset link has been sent',
  });
}

async function handleResetPassword(req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, error: 'Token and new password are required' });
  }

  const userResult = await db.select()
    .from(users)
    .where(eq(users.resetToken, token))
    .limit(1);

  if (userResult.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
  }

  const user = userResult[0];

  if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
    return res.status(400).json({ success: false, error: 'Reset token has expired' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '10') || 10);

  await db.update(users)
    .set({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return res.status(200).json({ success: true, message: 'Password reset successfully' });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse>
) {
  try {
    // Parse action from query or use method-based routing
    const action = req.query.action as string | undefined;
    const pathname = req.url?.split('?')[0] || '';
    const routeAction = action || (
      pathname.includes('/login') ? 'login' :
      pathname.includes('/logout') ? 'logout' :
      pathname.includes('/profile') ? 'profile' :
      pathname.includes('/verify') ? 'verify' :
      pathname.includes('/password') ? 'password' :
      pathname.includes('/refresh') ? 'refresh' :
      pathname.includes('/forgot-password') ? 'forgot-password' :
      pathname.includes('/reset-password') ? 'reset-password' :
      ''
    );

    // For direct route access like /api/auth/login
    if (pathname === '/api/auth/login' || routeAction === 'login') {
      if (req.method === 'POST') return handleLogin(req, res);
    } else if (pathname === '/api/auth/logout' || routeAction === 'logout') {
      if (req.method === 'POST') return handleLogout(req, res);
    } else if (pathname === '/api/auth/profile' || routeAction === 'profile') {
      if (req.method === 'GET' || req.method === 'PUT') return handleProfile(req, res);
    } else if (pathname === '/api/auth/verify' || routeAction === 'verify') {
      if (req.method === 'POST') return handleVerify(req, res);
    } else if (pathname === '/api/auth/password' || routeAction === 'password') {
      if (req.method === 'PUT') return handlePassword(req, res);
    } else if (pathname === '/api/auth/refresh' || routeAction === 'refresh') {
      if (req.method === 'POST') return handleRefresh(req, res);
    } else if (pathname === '/api/auth/forgot-password' || routeAction === 'forgot-password') {
      if (req.method === 'POST') return handleForgotPassword(req, res);
    } else if (pathname === '/api/auth/reset-password' || routeAction === 'reset-password') {
      if (req.method === 'POST') return handleResetPassword(req, res);
    }

    return res.status(404).json({ success: false, error: 'Not found' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
