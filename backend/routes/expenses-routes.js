import express from 'express';
import { db } from '../lib/db.js';
import { expenses, projects, tasks, users } from '../lib/schema.js';
import { eq, gte, lte, desc, sql, and } from 'drizzle-orm';

const router = express.Router();

// GET /api/expenses - Get expenses
router.get('/', async (req, res) => {
  try {
    const { userId, projectId, startDate, endDate, category, status } = req.query;

    let whereConditions = [];

    if (userId) whereConditions.push(eq(expenses.userId, userId));
    if (projectId) whereConditions.push(eq(expenses.projectId, projectId));
    if (startDate) whereConditions.push(gte(expenses.date, new Date(startDate)));
    if (endDate) whereConditions.push(lte(expenses.date, new Date(endDate)));
    if (category) whereConditions.push(eq(expenses.category, category));
    if (status) whereConditions.push(eq(expenses.status, status));

    const expenseList = await db
      .select({
        id: expenses.id,
        date: expenses.date,
        amount: expenses.amount,
        category: expenses.category,
        description: expenses.description,
        receiptUrl: expenses.receiptUrl,
        status: expenses.status,
        notes: expenses.notes,
        approvedBy: expenses.approvedBy,
        approvedAt: expenses.approvedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email
        },
        project: {
          id: projects.id,
          name: projects.name,
          code: projects.code
        },
        task: {
          id: tasks.id,
          title: tasks.title
        }
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.userId, users.id))
      .leftJoin(projects, eq(expenses.projectId, projects.id))
      .leftJoin(tasks, eq(expenses.taskId, tasks.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(expenses.date));

    res.json(expenseList);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// GET /api/expenses/:id - Get expense by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await db
      .select({
        id: expenses.id,
        date: expenses.date,
        amount: expenses.amount,
        category: expenses.category,
        description: expenses.description,
        receiptUrl: expenses.receiptUrl,
        status: expenses.status,
        notes: expenses.notes,
        approvedBy: expenses.approvedBy,
        approvedAt: expenses.approvedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email
        },
        project: {
          id: projects.id,
          name: projects.name,
          code: projects.code
        },
        task: {
          id: tasks.id,
          title: tasks.title
        }
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.userId, users.id))
      .leftJoin(projects, eq(expenses.projectId, projects.id))
      .leftJoin(tasks, eq(expenses.taskId, tasks.id))
      .where(eq(expenses.id, id))
      .limit(1);

    if (expense.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense[0]);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// POST /api/expenses - Create expense
router.post('/', async (req, res) => {
  try {
    const { date, projectId, taskId, userId, amount, category, description, receiptUrl, notes } = req.body;

    // Validate required fields
    if (!date || !projectId || !userId || !amount || !category || !description) {
      return res.status(400).json({ error: 'Date, project ID, user ID, amount, category, and description are required' });
    }

    // Validate project exists
    const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (project.length === 0) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    // Validate task exists and belongs to project if provided
    if (taskId) {
      const task = await db.select().from(tasks).where(and(
        eq(tasks.id, taskId),
        eq(tasks.projectId, projectId)
      )).limit(1);
      if (task.length === 0) {
        return res.status(400).json({ error: 'Invalid task ID for the specified project' });
      }
    }

    const newExpense = {
      date: new Date(date),
      projectId,
      taskId: taskId || null,
      userId,
      amount,
      category,
      description,
      receiptUrl,
      notes,
      status: 'pending'
    };

    const result = await db.insert(expenses).values(newExpense).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PUT /api/expenses/:id - Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.createdAt;

    // Validate project/task relationship if updating
    if (updates.projectId || updates.taskId) {
      const currentExpense = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
      if (currentExpense.length === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      const projectId = updates.projectId || currentExpense[0].projectId;

      if (updates.taskId && projectId) {
        const task = await db.select().from(tasks).where(and(
          eq(tasks.id, updates.taskId),
          eq(tasks.projectId, projectId)
        )).limit(1);
        if (task.length === 0) {
          return res.status(400).json({ error: 'Invalid task ID for the project' });
        }
      }
    }

    const result = await db.update(expenses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.delete(expenses).where(eq(expenses.id, id)).returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// POST /api/expenses/:id/approve - Approve expense
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const result = await db.update(expenses)
      .set({
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(expenses.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error approving expense:', error);
    res.status(500).json({ error: 'Failed to approve expense' });
  }
});

// POST /api/expenses/:id/reject - Reject expense
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, reason } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const result = await db.update(expenses)
      .set({
        status: 'rejected',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(expenses.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error rejecting expense:', error);
    res.status(500).json({ error: 'Failed to reject expense' });
  }
});

// GET /api/expenses/categories - Get expense categories
router.get('/categories/list', async (req, res) => {
  try {
    // Return the enum values for expense categories
    const categories = ['travel', 'supplies', 'equipment', 'training', 'other'];
    res.json(categories);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({ error: 'Failed to fetch expense categories' });
  }
});

export default router;