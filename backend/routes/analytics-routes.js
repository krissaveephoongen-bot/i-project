import express from 'express';
import { db } from '../lib/db.js';
import { projects, tasks, timeEntries, expenses, users } from '../lib/schema.js';
import { eq, gte, lte, desc, sql, count, sum } from 'drizzle-orm';

const router = express.Router();

// GET /api/analytics - Get analytics overview
router.get('/', async (req, res) => {
  try {
    res.json({
      message: 'Analytics API',
      version: '1.0.0',
      endpoints: {
        dashboard: '/api/analytics/dashboard',
        projects: '/api/analytics/projects',
        tasks: '/api/analytics/tasks',
        users: '/api/analytics/users',
        financial: '/api/analytics/financial',
        summary: '/api/analytics/summary',
        project: '/api/analytics/project/:id'
      }
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// GET /api/analytics/dashboard - Dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Project statistics
    const projectStats = await db
      .select({
        total: count(),
        active: sql`count(case when status = 'in_progress' then 1 end)`,
        completed: sql`count(case when status = 'done' then 1 end)`,
        overdue: sql`count(case when end_date < now() and status != 'done' then 1 end)`,
        archived: sql`count(case when is_archived = true then 1 end)`
      })
      .from(projects)
      .catch(err => {
        console.warn('Project stats query failed, returning defaults:', err.message);
        return [{ total: 0, active: 0, completed: 0, overdue: 0, archived: 0 }];
      });

    // Task statistics
    const taskStats = await db
      .select({
        total: count(),
        todo: sql`count(case when status = 'todo' then 1 end)`,
        inProgress: sql`count(case when status = 'in_progress' then 1 end)`,
        inReview: sql`count(case when status = 'in_review' then 1 end)`,
        completed: sql`count(case when status = 'done' then 1 end)`,
        overdue: sql`count(case when due_date < now() and status != 'done' then 1 end)`
      })
      .from(tasks)
      .catch(err => {
        console.warn('Task stats query failed, returning defaults:', err.message);
        return [{ total: 0, todo: 0, inProgress: 0, inReview: 0, completed: 0, overdue: 0 }];
      });

    // User statistics
    const userStats = await db
      .select({
        total: count(),
        active: sql`count(case when is_active = true then 1 end)`,
        inactive: sql`count(case when is_active = false then 1 end)`
      })
      .from(users)
      .catch(err => {
        console.warn('User stats query failed, returning defaults:', err.message);
        return [{ total: 0, active: 0, inactive: 0 }];
      });

    // Budget statistics - handle empty database gracefully
    const budgetStats = await db
      .select({
        totalBudget: sql`coalesce(sum(budget), 0)`,
        totalSpent: sql`coalesce(sum(spent), 0)`,
        totalRemaining: sql`coalesce(sum(remaining), 0)`,
        avgUtilization: sql`round(
          case
            when sum(budget) > 0
            then (sum(spent) / sum(budget) * 100)::numeric
            else 0
          end, 2
        )`
      })
      .from(projects)
      .where(sql`budget > 0`)
      .catch(err => {
        console.warn('Budget stats query failed, returning defaults:', err.message);
        return [{ totalBudget: 0, totalSpent: 0, totalRemaining: 0, avgUtilization: 0 }];
      });

    // Monthly hours and expenses (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyHours = await db
      .select({
        totalHours: sql`coalesce(sum(hours), 0)`
      })
      .from(timeEntries)
      .where(gte(timeEntries.date, currentMonth))
      .catch(err => {
        console.warn('Monthly hours query failed, returning defaults:', err.message);
        return [{ totalHours: 0 }];
      });

    const monthlyExpenses = await db
      .select({
        totalAmount: sql`coalesce(sum(amount), 0)`,
        pendingAmount: sql`coalesce(sum(case when status = 'pending' then amount else 0 end), 0)`,
        approvedAmount: sql`coalesce(sum(case when status = 'approved' then amount else 0 end), 0)`
      })
      .from(expenses)
      .where(gte(expenses.date, currentMonth))
      .catch(err => {
        console.warn('Monthly expenses query failed, returning defaults:', err.message);
        return [{ totalAmount: 0, pendingAmount: 0, approvedAmount: 0 }];
      });

    // Task completion rate
    const completionRate = taskStats[0]?.total > 0
      ? Math.round((taskStats[0].completed / taskStats[0].total) * 100)
      : 0;

    res.json({
      projects: {
        total: projectStats[0]?.total || 0,
        active: projectStats[0]?.active || 0,
        completed: projectStats[0]?.completed || 0,
        overdue: projectStats[0]?.overdue || 0,
        archived: projectStats[0]?.archived || 0
      },
      tasks: {
        total: taskStats[0]?.total || 0,
        todo: taskStats[0]?.todo || 0,
        inProgress: taskStats[0]?.inProgress || 0,
        inReview: taskStats[0]?.inReview || 0,
        completed: taskStats[0]?.completed || 0,
        overdue: taskStats[0]?.overdue || 0,
        completionRate
      },
      users: {
        total: userStats[0]?.total || 0,
        active: userStats[0]?.active || 0,
        inactive: userStats[0]?.inactive || 0
      },
      budget: {
        totalBudget: parseFloat(budgetStats[0]?.totalBudget) || 0,
        totalSpent: parseFloat(budgetStats[0]?.totalSpent) || 0,
        totalRemaining: parseFloat(budgetStats[0]?.totalRemaining) || 0,
        utilizationRate: parseFloat(budgetStats[0]?.avgUtilization) || 0
      },
      monthly: {
        hours: parseFloat(monthlyHours[0]?.totalHours) || 0,
        expenses: parseFloat(monthlyExpenses[0]?.totalAmount) || 0,
        pendingExpenses: parseFloat(monthlyExpenses[0]?.pendingAmount) || 0,
        approvedExpenses: parseFloat(monthlyExpenses[0]?.approvedAmount) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    // Return empty data structure instead of 500 error
    res.json({
      projects: { total: 0, active: 0, completed: 0, overdue: 0, archived: 0 },
      tasks: { total: 0, todo: 0, inProgress: 0, inReview: 0, completed: 0, overdue: 0, completionRate: 0 },
      users: { total: 0, active: 0, inactive: 0 },
      budget: { totalBudget: 0, totalSpent: 0, totalRemaining: 0, utilizationRate: 0 },
      monthly: { hours: 0, expenses: 0, pendingExpenses: 0, approvedExpenses: 0 }
    });
  }
});

// GET /api/analytics/dashboard-stats - Alias for dashboard (for DataManager compatibility)
router.get('/dashboard-stats', async (req, res, next) => {
  // Redirect to dashboard endpoint
  req.url = '/dashboard';
  router.handle(req, res, next);
});

// GET /api/analytics/project/:id - Individual project analytics
router.get('/project/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const projectAnalytics = await db
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
        progress: sql`round(
          coalesce((select count(*)::float / nullif((select count(*) from tasks where project_id = projects.id), 0) * 100
           from tasks where project_id = projects.id and status = 'done'), 0)::numeric, 2
        )`,
        plannedProgress: sql`round(
          case
            when start_date is not null and end_date is not null and start_date < end_date
            then least(100, greatest(0, (extract(epoch from (now() - start_date)) / extract(epoch from (end_date - start_date))) * 100))
            else 0
          end::numeric, 2
        )`,
        taskCount: sql`(select count(*) from tasks where project_id = projects.id)`,
        completedTasks: sql`(select count(*) from tasks where project_id = projects.id and status = 'done')`,
        totalHours: sql`coalesce((select sum(hours) from time_entries where project_id = projects.id), 0)`,
        totalExpenses: sql`coalesce((select sum(amount) from expenses where project_id = projects.id), 0)`
      })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1)
      .catch(err => {
        console.warn('Project analytics query failed:', err.message);
        return [];
      });

    if (!projectAnalytics || projectAnalytics.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Ensure all numeric fields have valid values
    const analytics = projectAnalytics[0];
    const safeAnalytics = {
      ...analytics,
      budget: analytics.budget || 0,
      spent: analytics.spent || 0,
      remaining: analytics.remaining || 0,
      progress: analytics.progress || 0,
      plannedProgress: analytics.plannedProgress || 0,
      taskCount: analytics.taskCount || 0,
      completedTasks: analytics.completedTasks || 0,
      totalHours: analytics.totalHours || 0,
      totalExpenses: analytics.totalExpenses || 0
    };

    res.json(safeAnalytics);
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    res.status(500).json({ error: 'Failed to fetch project analytics' });
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
        code: projects.code,
        status: projects.status,
        budget: projects.budget,
        spent: projects.spent,
        remaining: projects.remaining,
        progress: sql`round(
          coalesce((select count(*)::float / nullif((select count(*) from tasks where project_id = projects.id), 0) * 100
           from tasks where project_id = projects.id and status = 'done'), 0)::numeric, 2
        )`,
        plannedProgress: sql`round(
          case
            when start_date is not null and end_date is not null and start_date < end_date
            then least(100, greatest(0, (extract(epoch from (now() - start_date)) / extract(epoch from (end_date - start_date))) * 100))
            else 0
          end::numeric, 2
        )`,
        taskCount: sql`(select count(*) from tasks where project_id = projects.id)`,
        completedTasks: sql`(select count(*) from tasks where project_id = projects.id and status = 'done')`,
        overdueTasks: sql`(select count(*) from tasks where project_id = projects.id and due_date < now() and status != 'done')`,
        totalHours: sql`coalesce((select sum(hours) from time_entries where project_id = projects.id), 0)`,
        totalExpenses: sql`coalesce((select sum(amount) from expenses where project_id = projects.id), 0)`
      })
      .from(projects)
      .where(gte(projects.createdAt, startDate))
      .orderBy(desc(projects.createdAt))
      .catch(err => {
        console.warn('Project analytics query failed, returning empty array:', err.message);
        return [];
      });

    res.json(projectAnalytics || []);
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    // Return empty array instead of 500 error for empty database
    res.json([]);
  }
});

// GET /api/analytics/tasks - Task analytics
router.get('/tasks', async (req, res) => {
  try {
    const { period = '30', projectId } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let whereConditions = sql`${tasks.createdAt} >= ${startDate}`;
    
    if (projectId) {
      whereConditions = sql`${whereConditions} and ${tasks.projectId} = ${projectId}`;
    }

    // Task status distribution
    const statusDistribution = await db
      .select({
        status: tasks.status,
        count: count(),
        totalEstimatedHours: sql`coalesce(sum(estimated_hours), 0)`,
        totalActualHours: sql`coalesce(sum(actual_hours), 0)`
      })
      .from(tasks)
      .where(whereConditions)
      .groupBy(tasks.status);

    // Priority distribution
    const priorityDistribution = await db
      .select({
        priority: tasks.priority,
        count: count(),
        completed: sql`count(case when status = 'done' then 1 end)`,
        inProgress: sql`count(case when status = 'in_progress' then 1 end)`
      })
      .from(tasks)
      .where(whereConditions)
      .groupBy(tasks.priority);

    // Overdue tasks by assignee
    const overdueByAssignee = await db
      .select({
        userId: tasks.assignedTo,
        userName: users.name,
        overdueCount: count(),
        totalOverdueHours: sql`coalesce(sum(estimated_hours), 0)`
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .where(sql`${tasks.dueDate} < now() and ${tasks.status} != 'done'`)
      .groupBy(tasks.assignedTo, users.name)
      .orderBy(desc(count()));

    res.json({
      statusDistribution,
      priorityDistribution,
      overdueByAssignee
    });
  } catch (error) {
    console.error('Error fetching task analytics:', error);
    res.status(500).json({ error: 'Failed to fetch task analytics' });
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
        position: users.position,
        totalTasks: sql`(select count(*) from tasks where assigned_to = users.id and created_at >= ${startDate})`,
        completedTasks: sql`(select count(*) from tasks where assigned_to = users.id and status = 'done' and completed_at >= ${startDate})`,
        inProgressTasks: sql`(select count(*) from tasks where assigned_to = users.id and status = 'in_progress' and created_at >= ${startDate})`,
        overdueTasks: sql`(select count(*) from tasks where assigned_to = users.id and due_date < now() and status != 'done' and created_at >= ${startDate})`,
        totalHours: sql`coalesce((select sum(hours) from time_entries where user_id = users.id and date >= ${startDate}), 0)`,
        totalExpenses: sql`coalesce((select sum(amount) from expenses where user_id = users.id and date >= ${startDate}), 0)`,
        activeProjects: sql`(select count(distinct project_id) from tasks where assigned_to = users.id and status != 'done')`,
        completionRate: sql`round(
          case
            when (select count(*) from tasks where assigned_to = users.id and created_at >= ${startDate}) > 0
            then ((select count(*) from tasks where assigned_to = users.id and status = 'done' and completed_at >= ${startDate})::float /
                  (select count(*) from tasks where assigned_to = users.id and created_at >= ${startDate}) * 100)::numeric
            else 0
          end, 2
        )`
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
        projectCode: projects.code,
        budget: projects.budget,
        spent: projects.spent,
        remaining: projects.remaining,
        utilization: sql`round(
          case
            when budget > 0 then (spent / budget * 100)::numeric
            else 0
          end, 2
        )`,
        hoursLogged: sql`coalesce((select sum(hours) from time_entries where project_id = projects.id), 0)`,
        expensesTotal: sql`coalesce((select sum(amount) from expenses where project_id = projects.id), 0)`
      })
      .from(projects)
      .where(sql`budget > 0`)
      .orderBy(desc(sql`spent / nullif(budget, 0)`));

    // Monthly expense breakdown by category
    const expenseBreakdown = await db
      .select({
        category: expenses.category,
        total: sql`sum(amount)`,
        count: count(),
        approved: sql`sum(case when status = 'approved' then amount else 0 end)`,
        pending: sql`sum(case when status = 'pending' then amount else 0 end)`
      })
      .from(expenses)
      .where(gte(expenses.date, startDate))
      .groupBy(expenses.category)
      .orderBy(desc(sql`sum(amount)`));

    // Time tracking summary
    const timeTrackingSummary = await db
      .select({
        totalHours: sql`coalesce(sum(hours), 0)`,
        billableHours: sql`coalesce(sum(case when work_type = 'project' then hours else 0 end), 0)`,
        nonBillableHours: sql`coalesce(sum(case when work_type != 'project' then hours else 0 end), 0)`,
        approvedHours: sql`coalesce(sum(case when status = 'approved' then hours else 0 end), 0)`,
        pendingHours: sql`coalesce(sum(case when status = 'pending' then hours else 0 end), 0)`
      })
      .from(timeEntries)
      .where(gte(timeEntries.date, startDate));

    res.json({
      budgetAnalysis,
      expenseBreakdown,
      timeTrackingSummary: timeTrackingSummary[0]
    });
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    res.status(500).json({ error: 'Failed to fetch financial analytics' });
  }
});

// GET /api/analytics/summary - Overall summary statistics
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

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

    if ((startDateObj && !endDateObj) || (!startDateObj && endDateObj)) {
      return res.status(400).json({ error: 'Both startDate and endDate must be provided together.' });
    }

    // Build date filters for each table
    const projectDateFilter = startDateObj && endDateObj
      ? sql`${projects.createdAt} >= ${new Date(startDate)} and ${projects.createdAt} <= ${new Date(endDate)}`
      : sql`1=1`;

    const taskDateFilter = startDateObj && endDateObj
      ? sql`${tasks.createdAt} >= ${new Date(startDate)} and ${tasks.createdAt} <= ${new Date(endDate)}`
      : sql`1=1`;

    const timeEntryDateFilter = startDateObj && endDateObj
      ? sql`${timeEntries.date} >= ${new Date(startDate)} and ${timeEntries.date} <= ${new Date(endDate)}`
      : sql`1=1`;

    const expenseDateFilter = startDateObj && endDateObj
      ? sql`${expenses.date} >= ${new Date(startDate)} and ${expenses.date} <= ${new Date(endDate)}`
      : sql`1=1`;

    // Get comprehensive summary with error handling
    const summary = {
      projects: await db.select({ count: count() }).from(projects).where(projectDateFilter).catch(() => [{ count: 0 }]),
      tasks: await db.select({ count: count() }).from(tasks).where(taskDateFilter).catch(() => [{ count: 0 }]),
      users: await db.select({ count: count() }).from(users).where(eq(users.isActive, true)).catch(() => [{ count: 0 }]),
      totalBudget: await db.select({ total: sql`coalesce(sum(budget), 0)` }).from(projects).where(projectDateFilter).catch(() => [{ total: 0 }]),
      totalSpent: await db.select({ total: sql`coalesce(sum(spent), 0)` }).from(projects).where(projectDateFilter).catch(() => [{ total: 0 }]),
      totalHours: await db.select({ total: sql`coalesce(sum(hours), 0)` }).from(timeEntries).where(timeEntryDateFilter).catch(() => [{ total: 0 }]),
      totalExpenses: await db.select({ total: sql`coalesce(sum(amount), 0)` }).from(expenses).where(expenseDateFilter).catch(() => [{ total: 0 }])
    };

    res.json({
      projectCount: summary.projects[0]?.count || 0,
      taskCount: summary.tasks[0]?.count || 0,
      activeUserCount: summary.users[0]?.count || 0,
      totalBudget: parseFloat(summary.totalBudget[0]?.total) || 0,
      totalSpent: parseFloat(summary.totalSpent[0]?.total) || 0,
      totalHours: parseFloat(summary.totalHours[0]?.total) || 0,
      totalExpenses: parseFloat(summary.totalExpenses[0]?.total) || 0
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    // Return default values instead of 500 error
    res.json({
      projectCount: 0,
      taskCount: 0,
      activeUserCount: 0,
      totalBudget: 0,
      totalSpent: 0,
      totalHours: 0,
      totalExpenses: 0
    });
  }
});

export default router;
