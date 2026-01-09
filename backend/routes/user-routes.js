import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db.js';
import { users } from '../lib/schema.js';
import { eq, desc } from 'drizzle-orm';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Access token is required',
      code: 'TOKEN_MISSING'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    req.user = user;
    next();
  });
};

// GET /api/users/me - Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatar: users.avatar,
      department: users.department,
      position: users.position,
      status: users.status,
      phone: users.phone,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user[0] });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users - Get all users (protected)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatar: users.avatar,
      department: users.department,
      position: users.position,
      status: users.status,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));

    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get user by ID (protected)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatar: users.avatar,
      department: users.department,
      position: users.position,
      status: users.status,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, id)).limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, department, position } = req.body;

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
      role: role || 'employee',
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

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update user (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;

    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        phone: users.phone,
        department: users.department,
        position: users.position,
        updatedAt: users.updatedAt,
      });

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user (protected, admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const result = await db.delete(users).where(eq(users.id, id)).returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// PUT /api/users/:id/notification-preferences - Update notification preferences (protected)
router.put('/:id/notification-preferences', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const preferences = req.body;

    // Check if user is updating their own preferences or is admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update notification preferences in users table (we'll add these fields to schema later)
    const result = await db.update(users)
      .set({ 
        updatedAt: new Date(),
        // Store preferences as JSON string for now
        notificationPreferences: JSON.stringify(preferences)
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        notificationPreferences: users.notificationPreferences,
        updatedAt: users.updatedAt,
      });

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// POST /api/users/:id/change-password - Change password (protected)
router.post('/:id/change-password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Check if user is changing their own password or is admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get current user data
    const currentUser = await db.select({
      id: users.id,
      password: users.password,
    }).from(users).where(eq(users.id, id)).limit(1);

    if (currentUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Update password
    const result = await db.update(users)
      .set({ 
        password: hashedNewPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        updatedAt: users.updatedAt,
      });

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// POST /api/users/:id/admin-reset-password - Admin reset password (protected, admin only)
router.post('/:id/admin-reset-password', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Update password
    const result = await db.update(users)
      .set({ 
        password: hashedNewPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        updatedAt: users.updatedAt,
      });

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
