import express from 'express';
import { db } from '../../lib/db.js';
import { tasks, projects } from '../../src/lib/schema.js';
import { eq, desc, and } from 'drizzle-orm';

const router = express.Router();

// GET /api/tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;

    let query = db.select().from(tasks).orderBy(desc(tasks.createdAt));

    if (projectId) {
      query = query.where(eq(tasks.projectId, parseInt(projectId)));
    }

    const allTasks = await query;
    res.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await db.select().from(tasks).where(eq(tasks.id, parseInt(id))).limit(1);

    if (task.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedHours,
      projectId,
      assignedTo,
      createdBy
    } = req.body;

    // Validate project exists
    const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (project.length === 0) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const newTask = {
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      estimatedHours,
      projectId,
      assignedTo,
      createdBy,
    };

    const result = await db.insert(tasks).values(newTask).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await db.update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.delete(tasks).where(eq(tasks.id, parseInt(id))).returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
