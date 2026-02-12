// backend/routes/vendor-routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db.js';
import { users, tasks, projects } from '../lib/schema.js';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

// Vendor login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find vendor user
    const vendor = await db.select()
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.role, 'vendor')
      ))
      .limit(1);

    if (vendor.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const vendorUser = vendor[0];

    // Check if account is locked
    if (vendorUser.lockedUntil && vendorUser.lockedUntil > new Date()) {
      return res.status(423).json({ error: 'Account is locked. Please try again later.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, vendorUser.password);
    
    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = (vendorUser.failedLoginAttempts || 0) + 1;
      const updateData = { failedLoginAttempts: failedAttempts };
      
      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, vendorUser.id));
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed login attempts on successful login
    await db.update(users)
      .set({ 
        failedLoginAttempts: 0, 
        lockedUntil: null,
        lastLogin: new Date()
      })
      .where(eq(users.id, vendorUser.id));

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: vendorUser.id, 
        email: vendorUser.email, 
        role: vendorUser.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: vendorUser.id,
        name: vendorUser.name,
        email: vendorUser.email,
        role: vendorUser.role,
        position: vendorUser.position
      }
    });

  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor tasks
router.get('/tasks', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.role !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get tasks assigned to this vendor with project details
    const vendorTasks = await db.select({
      taskId: tasks.id,
      taskTitle: tasks.title,
      taskDescription: tasks.description,
      taskStatus: tasks.status,
      taskPriority: tasks.priority,
      taskDueDate: tasks.dueDate,
      taskEstimatedHours: tasks.estimatedHours,
      taskActualHours: tasks.actualHours,
      taskWeight: tasks.weight,
      projectId: projects.id,
      projectName: projects.name,
      projectCode: projects.code,
      projectStatus: projects.status,
      projectBudget: projects.budget,
      projectStartDate: projects.startDate,
      projectEndDate: projects.endDate
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(tasks.assignedTo, decoded.id))
    .orderBy(tasks.dueDate);

    // Format the response
    const formattedTasks = vendorTasks.map(task => ({
      id: task.taskId,
      taskName: task.taskTitle,
      description: task.taskDescription,
      status: task.taskStatus === 'todo' ? 'Assigned' :
              task.taskStatus === 'in_progress' ? 'Work in Progress' :
              task.taskStatus === 'in_review' ? 'Submitted' :
              task.taskStatus === 'done' ? 'Approved' : 'Assigned',
      priority: task.taskPriority,
      dueDate: task.taskDueDate ? new Date(task.taskDueDate).toLocaleDateString('th-TH') : 'Not set',
      estimatedHours: task.taskEstimatedHours,
      actualHours: task.taskActualHours,
      weight: task.taskWeight,
      progress: task.taskStatus === 'done' ? 100 :
               task.taskStatus === 'in_review' ? 90 :
               task.taskStatus === 'in_progress' ? 50 : 0,
      project: task.projectName,
      projectId: task.projectId,
      projectCode: task.projectCode,
      projectStatus: task.projectStatus,
      projectBudget: task.projectBudget,
      projectStartDate: task.projectStartDate,
      projectEndDate: task.projectEndDate
    }));

    res.json(formattedTasks);

  } catch (error) {
    console.error('Get vendor tasks error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task progress
router.put('/tasks/:taskId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.role !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { taskId } = req.params;
    const { progress, evidence } = req.body;

    // Validate that this task belongs to the vendor
    const taskCheck = await db.select()
      .from(tasks)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.assignedTo, decoded.id)
      ))
      .limit(1);

    if (taskCheck.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    // Update task status based on progress
    let status = 'in_progress';
    if (progress >= 100) {
      status = 'in_review'; // Submitted for approval
    }

    await db.update(tasks)
      .set({ 
        status,
        actualHours: progress === 100 ? taskCheck[0].estimatedHours : taskCheck[0].actualHours
      })
      .where(eq(tasks.id, taskId));

    res.json({ 
      message: 'Task updated successfully',
      status,
      progress 
    });

  } catch (error) {
    console.error('Update task error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
