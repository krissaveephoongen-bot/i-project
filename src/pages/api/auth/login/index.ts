import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    department?: string;
    position?: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user by email
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (userResult.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = userResult[0];

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ success: false, error: 'Account is deactivated' });
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return res.status(401).json({ success: false, error: 'Account is temporarily locked' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updates: any = { failedLoginAttempts: failedAttempts };

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await db.update(users).set(updates).where(eq(users.id, user.id));

      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Reset failed login attempts and update last login
    await db.update(users).set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date(),
    }).where(eq(users.id, user.id));

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    // Return user info and token
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
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
}
