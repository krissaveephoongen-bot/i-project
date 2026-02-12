import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDbClient } from '../lib/db.js';
import { users } from '../lib/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let db;
    try {
      const dbClient = getDbClient();
      db = dbClient.db;
      if (!db) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      // Find user by email
      const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (userResult.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = userResult[0];

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      // Check if account is locked
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        return res.status(401).json({ error: 'Account is temporarily locked' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        // Increment failed login attempts
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        const updates = { failedLoginAttempts: failedAttempts };

        // Lock account after 5 failed attempts
        if (failedAttempts >= 5) {
          updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }

        await db.update(users).set(updates).where(eq(users.id, user.id));

        return res.status(401).json({ error: 'Invalid credentials' });
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
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      // Return user info and token
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          department: user.department,
          position: user.position,
        },
        token,
      });
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return res.status(500).json({ error: 'Login failed' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    let db;
    try {
      const dbClient = getDbClient();
      db = dbClient.db;
      if (!db) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const { name, email, password, department, position } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

      const newUser = {
        name,
        email,
        password: hashedPassword,
        role: 'employee', // Default role
        department,
        position,
      };

      const result = await db.insert(users).values(newUser).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        position: users.position,
        createdAt: users.createdAt,
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: result[0],
      });
    } catch (dbError) {
      console.error('Database error during registration:', dbError);
      return res.status(500).json({ error: 'Registration failed' });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me - Get current user info (requires authentication)
router.get('/me', async (req, res) => {
  try {
    let db;
    try {
      const dbClient = getDbClient();
      db = dbClient.db;
      if (!db) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Access token is required',
          code: 'TOKEN_MISSING'
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Token has expired. Please login again.',
            code: 'TOKEN_EXPIRED'
          });
        }
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      }

      const userResult = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        department: users.department,
        position: users.position,
        lastLogin: users.lastLogin,
      }).from(users).where(eq(users.id, decoded.id)).limit(1);

      if (userResult.length === 0) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      res.json({ user: userResult[0] });
    } catch (dbError) {
      console.error('Database error getting current user:', dbError);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to get current user'
      });
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to get current user'
    });
  }
});

// GET /api/auth/verify - Verify JWT token
router.get('/verify', async (req, res) => {
  try {
    let db;
    try {
      const dbClient = getDbClient();
      db = dbClient.db;
      if (!db) {
        return res.status(500).json({ error: 'Database not configured' });
      }
    
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Access token is required',
          code: 'TOKEN_MISSING'
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Token has expired. Please login again.',
            code: 'TOKEN_EXPIRED'
          });
        }
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      }
    
      const userResult = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        department: users.department,
        position: users.position,
        lastLogin: users.lastLogin,
      }).from(users).where(eq(users.id, decoded.id)).limit(1);

      if (userResult.length === 0) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      res.json({ 
        valid: true, 
        user: userResult[0] 
      });
    } catch (dbError) {
      console.error('Database error verifying token:', dbError);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to verify token'
      });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to verify token'
    });
  }
});

export default router;
