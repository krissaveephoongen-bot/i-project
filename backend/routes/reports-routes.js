import express from 'express';
import { db } from '../lib/db.js';
import { projects, tasks, timeEntries, expenses, users, clients } from '../lib/schema.js';
import { eq, gte, lte, desc, sql, count, sum, and } from 'drizzle-orm';

const router = express.Router();

// GET /api/reports/projects - Project reports
router.get('/projects', async (req, res) => {
  try {
    const { startDate, endDate, status, managerId } = req.query;

    let whereConditions = [];

    if (startDate) whereConditions.push(gte(projects.createdAt, new Date(startDate)));
    if (endDate) whereConditions.push(lte(projects.createdAt, new Date(endDate)));
    if (status) whereConditions.push(eq(projects.status, status));
    if (managerId) whereConditions.push(eq(projects.managerId, managerId));

    const projectReports = await db
      .select({
        id: projects.id,
        name: projects.name,
        code: projects.code,
        status: projects.status,
        startDate: projects.startDate,
        endDate: projects.endDate,
        budget: projects.budget,
        spent: projects.spent,
        remaining: projects.remaining,
        managerName: users.name,
        clientName: clients.name,
        taskCount: sql<number>`(select count(*) from tasks where project_id = projects.id)`,
        completedTasks: sql<number>`(select count(*) from tasks where project_id = projects.id and status = 'done')`,
        totalHours: sql<number>`(select coalesce(sum(hours), 0) from time_entries where project_id = projects.id)`,
        totalExpenses: sql<number>`(select coalesce(sum(amount), 0) from expenses where project_id = projects.id)`
      })
      .from(projects)
      .leftJoin(users, eq(projects.managerId, users.id))
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(projects.createdAt));

    res.json(projectReports);
  } catch (error) {
    console.error('Error generating project reports:', error);
    res.status(500).json({ error: 'Failed to generate project reports' });
  }
});

// GET /api/reports/tasks - Task reports
router.get('/tasks', async (req, res) => {
  try {
    const { startDate, endDate, status, priority, assignedTo, projectId } = req.query;

    let whereConditions = [];

    if (startDate) whereConditions.push(gte(tasks.createdAt, new Date(startDate)));
    if (endDate) whereConditions.push(lte(tasks.createdAt, new Date(endDate)));
    if (status) whereConditions.push(eq(tasks.status, status));
    if (priority) whereConditions.push(eq(tasks.priority, priority));
    if (assignedTo) whereConditions.push(eq(tasks.assignedTo, assignedTo));
    if (projectId) whereConditions.push(eq(tasks.projectId, projectId));

    const taskReports = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        estimatedHours: tasks.estimatedHours,
        actualHours: tasks.actualHours,
        projectName: projects.name,
        assignedToName: users.name,
        createdByName: sql<string>`(select name from users where id = tasks.created_by)`,
        createdAt: tasks.createdAt,
        completedAt: tasks.completedAt
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(tasks.createdAt));

    res.json(taskReports);
  } catch (error) {
    console.error('Error generating task reports:', error);
    res.status(500).json({ error: 'Failed to generate task reports' });
  }
});

// GET /api/reports/timesheets - Timesheet reports
router.get('/timesheets', async (req, res) => {
  try {
    const { startDate, endDate, userId, projectId, status } = req.query;

    let whereConditions = [];

    if (startDate) whereConditions.push(gte(timeEntries.date, new Date(startDate)));
    if (endDate) whereConditions.push(lte(timeEntries.date, new Date(endDate)));
    if (userId) whereConditions.push(eq(timeEntries.userId, userId));
    if (projectId) whereConditions.push(eq(timeEntries.projectId, projectId));
    if (status) whereConditions.push(eq(timeEntries.status, status));

    const timesheetReports = await db
      .select({
        id: timeEntries.id,
        date: timeEntries.date,
        workType: timeEntries.workType,
        startTime: timeEntries.startTime,
        endTime: timeEntries.endTime,
        hours: timeEntries.hours,
        description: timeEntries.description,
        status: timeEntries.status,
        userName: users.name,
        projectName: projects.name,
        taskTitle: tasks.title,
        approvedByName: sql<string>`(select name from users where id = time_entries.approved_by)`,
        approvedAt: timeEntries.approvedAt
      })
      .from(timeEntries)
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(tasks, eq(timeEntries.taskId, tasks.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(timeEntries.date));

    res.json(timesheetReports);
  } catch (error) {
    console.error('Error generating timesheet reports:', error);
    res.status(500).json({ error: 'Failed to generate timesheet reports' });
  }
});

// GET /api/reports/expenses - Expense reports
router.get('/expenses', async (req, res) => {
  try {
    const { startDate, endDate, userId, projectId, category, status } = req.query;

    let whereConditions = [];

    if (startDate) whereConditions.push(gte(expenses.date, new Date(startDate)));
    if (endDate) whereConditions.push(lte(expenses.date, new Date(endDate)));
    if (userId) whereConditions.push(eq(expenses.userId, userId));
    if (projectId) whereConditions.push(eq(expenses.projectId, projectId));
    if (category) whereConditions.push(eq(expenses.category, category));
    if (status) whereConditions.push(eq(expenses.status, status));

    const expenseReports = await db
      .select({
        id: expenses.id,
        date: expenses.date,
        amount: expenses.amount,
        category: expenses.category,
        description: expenses.description,
        receiptUrl: expenses.receiptUrl,
        status: expenses.status,
        notes: expenses.notes,
        userName: users.name,
        projectName: projects.name,
        taskTitle: tasks.title,
        approvedByName: sql<string>`(select name from users where id = expenses.approved_by)`,
        approvedAt: expenses.approvedAt
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.userId, users.id))
      .leftJoin(projects, eq(expenses.projectId, projects.id))
      .leftJoin(tasks, eq(expenses.taskId, tasks.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(expenses.date));

    res.json(expenseReports);
  } catch (error) {
    console.error('Error generating expense reports:', error);
    res.status(500).json({ error: 'Failed to generate expense reports' });
  }
});

// GET /api/reports/financial-summary - Financial summary report
router.get('/financial-summary', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    // Monthly financial summary
    const monthlySummary = await db
      .select({
        month: sql<string>`to_char(date, 'YYYY-MM')`,
        totalHours: sql<number>`sum(hours)`,
        totalExpenses: sql<number>`sum(amount)`,
        expenseCount: count()
      })
      .from(timeEntries)
      .leftJoin(expenses, and(
        eq(timeEntries.userId, expenses.userId),
        sql`date_part('month', time_entries.date) = date_part('month', expenses.date)`,
        sql`date_part('year', time_entries.date) = date_part('year', expenses.date)`
      ))
      .where(sql`date_part('year', time_entries.date) = ${year}`)
      .groupBy(sql`to_char(date, 'YYYY-MM')`)
      .orderBy(sql`to_char(date, 'YYYY-MM')`);

    // Project financial summary
    const projectSummary = await db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        budget: projects.budget,
        spent: projects.spent,
        hoursLogged: sql<number>`(select coalesce(sum(hours), 0) from time_entries where project_id = projects.id)`,
        expensesTotal: sql<number>`(select coalesce(sum(amount), 0) from expenses where project_id = projects.id)`
      })
      .from(projects)
      .where(sql`date_part('year', projects.created_at) = ${year}`)
      .orderBy(desc(projects.createdAt));

    res.json({
      monthlySummary,
      projectSummary,
      year: year
    });
  } catch (error) {
    console.error('Error generating financial summary:', error);
    res.status(500).json({ error: 'Failed to generate financial summary' });
  }
});

export default router;