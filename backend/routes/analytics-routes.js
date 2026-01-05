import express from 'express';
import { db } from '../lib/db.js';
import { projects, tasks, timeEntries, expenses, users } from '../lib/schema.js';
import { eq, gte, lte, desc, sql, count, sum } from 'drizzle-orm';

const router = express.Router();

// GET /api/analytics/dashboard - Dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Project statistics
    const projectStats = await db
      .select({
        total: count(),
        active: sql<number>`count(case when status = 'in_progress' then 1 end)`,
        completed: sql<number>`count(case when status = 'done' then 1 end)`,
        overdue: sql<number>`count(case when end_date < now() and status != 'done' then 1 end)`
      })
      .from(projects);

    // Task statistics
    const taskStats = await db
      .select({
        total: count(),
        todo: sql<number>`count(case when status = 'todo' then 1 end)`,
        inProgress: sql<number>`count(case when status = 'in_progress' then 1 end)`,
        completed: sql<number>`count(case when status = 'done' then 1 end)`,
        overdue: sql<number>`count(case when due_date < now() and status != 'done' then 1 end)`
      })
      .from(tasks);

    // User statistics
    const userStats = await db
      .select({
        total: count(),
        active: sql<number>`count(case when is_active = true then 1 end)`
      })
      .from(users);

    // Monthly hours and expenses
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyStats = await db
      .select({
        hours: sql<number>`coalesce(sum(hours), 0)`,
        expenses: sql<number>`coalesce(sum(amount), 0)`
      })
      .from(timeEntries)
      .leftJoin(expenses, eq(timeEntries.userId, expenses.userId))
      .where(gte(timeEntries.date, currentMonth));

    res.json({
      projects: projectStats[0],
      tasks: taskStats[0],
      users: userStats[0],
      monthly: {
        hours: monthlyStats[0]?.hours || 0,
        expenses: monthlyStats[0]?.expenses || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// GET /api/analytics/projects - Project analytics
router.get('/projects', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const projectAnalytics = await db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        budget: projects.budget,
        spent: projects.spent,
        progress: sql<number>`round(
          (select count(*)::float / nullif((select count(*) from tasks where project_id = projects.id), 0) * 100
           from tasks where project_id = projects.id and status = 'done')::numeric, 2
        )`,
        taskCount: sql<number>`(select count(*) from tasks where project_id = projects.id)`,
        completedTasks: sql<number>`(select count(*) from tasks where project_id = projects.id and status = 'done')`,
        overdueTasks: sql<number>`(select count(*) from tasks where project_id = projects.id and due_date < now() and status != 'done')`
      })
      .from(projects)
      .where(gte(projects.createdAt, startDate))
      .orderBy(desc(projects.createdAt));

    res.json(projectAnalytics);
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    res.status(500).json({ error: 'Failed to fetch project analytics' });
  }
});

// GET /api/analytics/users - User productivity analytics
router.get('/users', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userAnalytics = await db
      .select({
        id: users.id,
        name: users.name,
        department: users.department,
        totalTasks: sql<number>`(select count(*) from tasks where assigned_to = users.id)`,
        completedTasks: sql<number>`(select count(*) from tasks where assigned_to = users.id and status = 'done')`,
        totalHours: sql<number>`coalesce((select sum(hours) from time_entries where user_id = users.id and date >= ${startDate}), 0)`,
        activeProjects: sql<number>`(select count(distinct project_id) from tasks where assigned_to = users.id and status != 'done')`
      })
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(desc(sql`(select count(*) from tasks where assigned_to = users.id and status = 'done')`));

    res.json(userAnalytics);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// GET /api/analytics/financial - Financial analytics
router.get('/financial', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Budget vs spending by project
    const budgetAnalysis = await db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        budget: projects.budget,
        spent: projects.spent,
        remaining: projects.remaining,
        utilization: sql<number>`round(
          case
            when budget > 0 then (spent / budget * 100)::numeric
            else 0
          end, 2
        )`
      })
      .from(projects)
      .where(sql`budget > 0`)
      .orderBy(desc(sql`spent / nullif(budget, 0)`));

    // Monthly expense breakdown
    const expenseBreakdown = await db
      .select({
        category: expenses.category,
        total: sql<number>`sum(amount)`,
        count: count()
      })
      .from(expenses)
      .where(gte(expenses.createdAt, startDate))
      .groupBy(expenses.category)
      .orderBy(desc(sql`sum(amount)`));

    res.json({
      budgetAnalysis,
      expenseBreakdown
    });
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    res.status(500).json({ error: 'Failed to fetch financial analytics' });
  }
});

export default router;