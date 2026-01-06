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
    const { year } = req.query;

    // Validate and parse year parameter
    let validatedYear;
    if (year === undefined || year === null || year === '') {
      validatedYear = new Date().getFullYear();
    } else {
      const parsedYear = parseInt(year, 10);
      if (isNaN(parsedYear) || !isFinite(parsedYear) || parsedYear < 1970 || parsedYear > 9999) {
        return res.status(400).json({ error: 'Invalid year parameter. Must be a valid year between 1970 and 9999.' });
      }
      validatedYear = parsedYear;
    }

    // Generate complete month series for the year and aggregate data
    const monthsInYear = Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, '0');
      return `${validatedYear}-${month}`;
    });

    // Get time entries aggregated by month
    const timeEntriesByMonth = await db
      .select({
        month: sql<string>`to_char(date, 'YYYY-MM')`,
        totalHours: sql<number>`coalesce(sum(hours), 0)`
      })
      .from(timeEntries)
      .where(sql`date_part('year', date) = ${validatedYear}`)
      .groupBy(sql`to_char(date, 'YYYY-MM')`);

    // Get expenses aggregated by month
    const expensesByMonth = await db
      .select({
        month: sql<string>`to_char(date, 'YYYY-MM')`,
        totalExpenses: sql<number>`coalesce(sum(amount), 0)`,
        expenseCount: sql<number>`count(*)`
      })
      .from(expenses)
      .where(sql`date_part('year', date) = ${validatedYear}`)
      .groupBy(sql`to_char(date, 'YYYY-MM')`);

    // Create monthly summary by joining month series with aggregated data
    const monthlySummary = monthsInYear.map(monthKey => {
      const timeEntry = timeEntriesByMonth.find(te => te.month === monthKey);
      const expense = expensesByMonth.find(exp => exp.month === monthKey);

      return {
        month: monthKey,
        totalHours: timeEntry?.totalHours || 0,
        totalExpenses: expense?.totalExpenses || 0,
        expenseCount: expense?.expenseCount || 0
      };
    });

    // Project financial summary
    const projectSummary = await db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        projectCode: projects.code,
        budget: projects.budget,
        spent: projects.spent,
        remaining: projects.remaining,
        hoursLogged: sql<number>`(select coalesce(sum(hours), 0) from time_entries where project_id = projects.id)`,
        expensesTotal: sql<number>`(select coalesce(sum(amount), 0) from expenses where project_id = projects.id)`,
        taskCount: sql<number>`(select count(*) from tasks where project_id = projects.id)`,
        completedTasks: sql<number>`(select count(*) from tasks where project_id = projects.id and status = 'done')`
      })
      .from(projects)
      .where(sql`date_part('year', created_at) = ${validatedYear}`)
      .orderBy(desc(projects.createdAt));

    res.json({
      monthlySummary,
      projectSummary,
      year: validatedYear
    });
  } catch (error) {
    console.error('Error generating financial summary:', error);
    res.status(500).json({ error: 'Failed to generate financial summary' });
  }
});

// GET /api/reports/team-performance - Team performance report
router.get('/team-performance', async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    // Validate and parse dates
    let startDateObj = null;
    let endDateObj = null;

    if (startDate) {
      const parsed = new Date(startDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ error: 'Invalid startDate format. Use ISO date string.' });
      }
      startDateObj = parsed;
    }

    if (endDate) {
      const parsed = new Date(endDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ error: 'Invalid endDate format. Use ISO date string.' });
      }
      endDateObj = parsed;
    }

    let whereConditions = [eq(users.isActive, true)];

    if (department) {
      whereConditions.push(eq(users.department, department));
    }

    // Build time entries conditions
    let timeEntryConditions = [sql`user_id = users.id`];
    if (startDateObj) {
      timeEntryConditions.push(sql`date >= ${startDateObj}`);
    }
    if (endDateObj) {
      timeEntryConditions.push(sql`date <= ${endDateObj}`);
    }

    const teamPerformance = await db
      .select({
        userId: users.id,
        userName: users.name,
        department: users.department,
        position: users.position,
        totalTasks: sql<number>`(select count(*) from tasks where assigned_to = users.id)`,
        completedTasks: sql<number>`(select count(*) from tasks where assigned_to = users.id and status = 'done')`,
        inProgressTasks: sql<number>`(select count(*) from tasks where assigned_to = users.id and status = 'in_progress')`,
        totalHours: sql<number>`(
          select coalesce(sum(hours), 0)
          from time_entries
          where ${and(...timeEntryConditions)}
        )`,
        completionRate: sql<number>`
          round(
            case
              when (select count(*) from tasks where assigned_to = users.id) > 0
              then ((select count(*) from tasks where assigned_to = users.id and status = 'done')::float /
                    (select count(*) from tasks where assigned_to = users.id) * 100)::numeric
              else 0
            end, 2
          )
        `
      })
      .from(users)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(sql`(select count(*) from tasks where assigned_to = users.id and status = 'done')`));

    res.json(teamPerformance);
  } catch (error) {
    console.error('Error generating team performance report:', error);
    res.status(500).json({ error: 'Failed to generate team performance report' });
  }
});

// GET /api/reports/budget-utilization - Budget utilization report
router.get('/budget-utilization', async (req, res) => {
  try {
    const budgetUtilization = await db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        projectCode: projects.code,
        budget: projects.budget,
        spent: projects.spent,
        remaining: projects.remaining,
        utilizationRate: sql<number>`
          round(
            case 
              when budget > 0 
              then (spent / budget * 100)::numeric 
              else 0 
            end, 2
          )
        `,
        status: projects.status,
        laborCost: sql<number>`(
          select coalesce(sum(time_entries.hours * coalesce(users.hourly_rate, 0)), 0)
          from time_entries
          left join users on time_entries.user_id = users.id
          where time_entries.project_id = projects.id
        )`,
        materialCost: sql<number>`(
          select coalesce(sum(amount), 0)
          from expenses
          where project_id = projects.id
        )`
      })
      .from(projects)
      .where(sql`budget > 0`)
      .orderBy(desc(sql`(spent / nullif(budget, 0))`));

    res.json(budgetUtilization);
  } catch (error) {
    console.error('Error generating budget utilization report:', error);
    res.status(500).json({ error: 'Failed to generate budget utilization report' });
  }
});

export default router;