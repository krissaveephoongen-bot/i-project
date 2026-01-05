import express from 'express';
import { db } from '../lib/db.js';
import { users } from '../lib/schema.js';
import { eq, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// GET /api/project-managers - Get all users (not filtered by role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status || 'active',
      department: users.department,
      phone: users.phone,
      avatar: users.avatar,
      position: users.position,
      joinDate: users.createdAt,
      lastLogin: users.lastLogin,
    }).from(users)
      .orderBy(desc(users.createdAt));

    // Add computed fields
    const enrichedUsers = allUsers.map(user => ({
      ...user,
      projectsManaged: 0, // This would come from a projects table join in production
      isAvailable: user.status === 'active',
      maxProjects: 5,
      userId: user.id,
      lastActive: user.lastLogin || user.joinDate,
    }));

    res.json(enrichedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/project-managers/:id - Get project manager by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const manager = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status || 'active',
      department: users.department,
      phone: users.phone,
      avatar: users.avatar,
      position: users.position,
      joinDate: users.createdAt,
      lastLogin: users.lastLogin,
    }).from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (manager.length === 0) {
      return res.status(404).json({ error: 'Project manager not found' });
    }

    const pm = manager[0];
    const enriched = {
      ...pm,
      projectsManaged: 0,
      isAvailable: pm.status === 'active',
      maxProjects: 5,
      userId: pm.id,
      lastActive: pm.lastLogin || pm.joinDate,
    };

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching project manager:', error);
    res.status(500).json({ error: 'Failed to fetch project manager' });
  }
});

// POST /api/project-managers - Create new project manager
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, email, password, department, position } = req.body;

    // Validate required fields
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

    const newManager = {
      name,
      email,
      password: hashedPassword,
      role: 'project_manager',
      department,
      position,
      status: 'active',
    };

    const result = await db.insert(users).values(newManager).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      department: users.department,
      position: users.position,
      createdAt: users.createdAt,
    });

    const pm = result[0];
    const enriched = {
      ...pm,
      projectsManaged: 0,
      isAvailable: pm.status === 'active',
      maxProjects: 5,
      userId: pm.id,
      joinDate: pm.createdAt,
      lastActive: pm.createdAt,
    };

    res.status(201).json(enriched);
  } catch (error) {
    console.error('Error creating project manager:', error);
    res.status(500).json({ error: 'Failed to create project manager' });
  }
});

// PUT /api/project-managers/:id - Update project manager
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

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
        status: users.status,
        department: users.department,
        position: users.position,
        updatedAt: users.updatedAt,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Project manager not found' });
    }

    const pm = result[0];
    const enriched = {
      ...pm,
      projectsManaged: 0,
      isAvailable: pm.status === 'active',
      maxProjects: 5,
      userId: pm.id,
      joinDate: pm.createdAt,
      lastActive: pm.lastLogin || pm.createdAt,
    };

    res.json(enriched);
  } catch (error) {
    console.error('Error updating project manager:', error);
    res.status(500).json({ error: 'Failed to update project manager' });
  }
});

// DELETE /api/project-managers/:id - Delete project manager
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const result = await db.delete(users).where(eq(users.id, id)).returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Project manager not found' });
    }

    res.json({ message: 'Project manager deleted successfully' });
  } catch (error) {
    console.error('Error deleting project manager:', error);
    res.status(500).json({ error: 'Failed to delete project manager' });
  }
});

export default router;
