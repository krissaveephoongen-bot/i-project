// backend/routes/staff-routes.js
import express from 'express';
import { db } from '../lib/db.js';
import { users, tasks, projects, timeEntries } from '../lib/schema.js';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment - MUST be set
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET not configured. Set it in .env file.');
  }
  if (secret.length < 32) {
    throw new Error('FATAL: JWT_SECRET must be at least 32 characters.');
  }
  return secret;
}

const router = express.Router();

// Staff login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email (only staff roles: admin, manager, employee)
    const user = await db.select()
      .from(users)
      .where(and(
        eq(users.email, email),
        // Only allow staff roles to login via staff portal
        // vendor role should use vendor portal
      ))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const staffUser = user[0];
    
    // Check if user is staff (not vendor)
    if (staffUser.role === 'vendor') {
      return res.status(401).json({ error: 'Please use vendor portal' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, staffUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: staffUser.id, 
        email: staffUser.email, 
        role: staffUser.role 
      },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = staffUser;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get staff tasks
router.get('/tasks', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    // Get tasks assigned to this staff member
    const staffTasks = await db.select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      progress: tasks.progress,
      projectId: tasks.projectId,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt
    })
    .from(tasks)
    .where(eq(tasks.assignedTo, userId))
    .orderBy(desc(tasks.createdAt));

    // Get project names for each task
    const tasksWithProjects = await Promise.all(
      staffTasks.map(async (task) => {
        const project = await db.select({
          id: projects.id,
          name: projects.name
        })
        .from(projects)
        .where(eq(projects.id, task.projectId))
        .limit(1);

        return {
          ...task,
          project: project[0]?.name || 'Unknown Project',
          projectId: task.projectId
        };
      })
    );

    res.json(tasksWithProjects);

  } catch (error) {
    console.error('Get staff tasks error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get staff projects
router.get('/projects', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    // Get projects where staff is assigned to tasks
    const staffProjects = await db.select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      progress: projects.progress,
      startDate: projects.startDate,
      endDate: projects.endDate,
      budget: projects.budget,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt
    })
    .from(projects)
    .where(
      // Get projects where user has assigned tasks
      // This is a simplified approach - in production you might want a project_members table
    );

    // For now, return all projects (in a real app, filter by user's assignments)
    res.json(staffProjects);

  } catch (error) {
    console.error('Get staff projects error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get staff timesheet
router.get('/timesheet', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    // Get timesheet entries for this staff member
    const staffTimeEntries = await db.select({
      id: timeEntries.id,
      date: timeEntries.date,
      hours: timeEntries.hours,
      description: timeEntries.description,
      status: timeEntries.status,
      projectId: timeEntries.projectId,
      taskId: timeEntries.taskId,
      createdAt: timeEntries.createdAt,
      updatedAt: timeEntries.updatedAt
    })
    .from(timeEntries)
    .where(eq(timeEntries.userId, userId))
    .orderBy(desc(timeEntries.date));

    // Get project and task names for each entry
    const entriesWithDetails = await Promise.all(
      staffTimeEntries.map(async (entry) => {
        const [project, task] = await Promise.all([
          db.select({ name: projects.name })
            .from(projects)
            .where(eq(projects.id, entry.projectId))
            .limit(1),
          db.select({ title: tasks.title })
            .from(tasks)
            .where(eq(tasks.id, entry.taskId))
            .limit(1)
        ]);

        return {
          ...entry,
          project: project[0]?.name || 'Unknown Project',
          task: task[0]?.title || 'Unknown Task'
        };
      })
    );

    res.json(entriesWithDetails);

  } catch (error) {
    console.error('Get staff timesheet error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add timesheet entry
router.post('/timesheet', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    const { date, project, task, hours, description } = req.body;

    if (!date || !project || !task || !hours) {
      return res.status(400).json({ error: 'Date, project, task, and hours are required' });
    }

    // Find project and task IDs from names (simplified approach)
    const [projectRecord, taskRecord] = await Promise.all([
      db.select({ id: projects.id })
        .from(projects)
        .where(eq(projects.name, project))
        .limit(1),
      db.select({ id: tasks.id })
        .from(tasks)
        .where(eq(tasks.title, task))
        .limit(1)
    ]);

    if (projectRecord.length === 0) {
      return res.status(400).json({ error: 'Project not found' });
    }

    if (taskRecord.length === 0) {
      return res.status(400).json({ error: 'Task not found' });
    }

    // Create timesheet entry
    const newEntry = await db.insert(timeEntries).values({
      userId,
      projectId: projectRecord[0].id,
      taskId: taskRecord[0].id,
      date: new Date(date),
      hours: parseFloat(hours),
      description,
      status: 'pending'
    }).returning();

    res.status(201).json(newEntry[0]);

  } catch (error) {
    console.error('Add timesheet entry error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
