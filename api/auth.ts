import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  name: string;
}

const getToken = (req: VercelRequest): string | null => {
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

async function handleLogin(req: VercelRequest, res: VercelResponse) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract action from URL path
    const url = req.url || '';
    const parts = url.split('/').filter(Boolean);
    const action = parts[parts.length - 1];

    // Route to appropriate handler
    if (action === 'login' && req.method === 'POST') {
      return handleLogin(req, res);
    }

    return res.status(404).json({ success: false, error: 'Not found' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
