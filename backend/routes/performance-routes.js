import express from 'express';
import { db } from '../lib/db.js';
import { projects, users, tasks, timeEntries } from '../lib/schema.js';
import { eq, desc, sql, count, sum, avg, and, gte, lte } from 'drizzle-orm';

const router = express.Router();

// GET /api/performance - Get performance overview
router.get('/', async (req, res) => {
  try {
    res.json({
      message: 'Performance API',
      version: '1.0.0',
      endpoints: {
        projectSummaries: '/api/performance/project-summaries',
        userWorkloads: '/api/performance/user-workloads',
        taskProgress: '/api/performance/task-progress',
        dashboardMetrics: '/api/performance/dashboard-metrics'
      }
    });
  } catch (error) {
    console.error('Error fetching performance overview:', error);
    res.status(500).json({ error: 'Failed to fetch performance overview' });
  }
});

// GET /api/performance/project-summaries - Get project performance summaries
router.get('/project-summaries', async (req, res) => {
  try {
    const { status, category, priority, isArchived, search } = req.query;

    let whereConditions = [];

    if (status) whereConditions.push(eq(projects.status, status));
    if (category) whereConditions.push(eq(projects.category, category));
    if (priority) whereConditions.push(eq(projects.priority, priority));
    if (isArchived !== undefined) whereConditions.push(eq(projects.isArchived, isArchived === 'true'));
    if (search) {
      whereConditions.push(sql`${projects.name} ILIKE ${`%${search}%`} OR ${projects.code} ILIKE ${`%${search}%`}`);
    }

    const projectSummaries = await db
      .select({
        id: projects.id,
        name: projects.name,
        code: projects.code,
        status: projects.status,
        progress: sql<number>`COALESCE(${projects.spent}::float / NULLIF(${projects.budget}::float, 0) * 100, 0)`.as('progress'),
        budget: projects.budget,
        actual_cost: projects.spent,
        start_date: projects.startDate,
        end_date: projects.endDate,
        client_name: sql<string>`'N/A'`.as('client_name'), // Placeholder
        project_manager_name: sql<string>`COALESCE(${users.name}, 'Unassigned')`.as('project_manager_name'),
        total_tasks: sql<number>`COUNT(DISTINCT ${tasks.id})`.as('total_tasks'),
        completed_tasks: sql<number>`COUNT(DISTINCT CASE WHEN ${tasks.status} = 'done' THEN ${tasks.id} END)`.as('completed_tasks'),
        in_progress_tasks: sql<number>`COUNT(DISTINCT CASE WHEN ${tasks.status} = 'in_progress' THEN ${tasks.id} END)`.as('in_progress_tasks'),
        overdue_tasks: sql<number>`COUNT(DISTINCT CASE WHEN ${tasks.dueDate} < CURRENT_DATE AND ${tasks.status} != 'done' THEN ${tasks.id} END)`.as('overdue_tasks'),
        total_hours: sql<number>`COALESCE(SUM(${timeEntries.hours}), 0)`.as('total_hours'),
        created_at: projects.createdAt,
      })
      .from(projects)
      .leftJoin(users, eq(projects.managerId, users.id))
      .leftJoin(tasks, eq(tasks.projectId, projects.id))
      .leftJoin(timeEntries, eq(timeEntries.projectId, projects.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(projects.id, users.name)
      .orderBy(desc(projects.createdAt));

    res.json(projectSummaries);
  } catch (error) {
    console.error('Error fetching project summaries:', error);
    res.status(500).json({ error: 'Failed to fetch project summaries' });
  }
});

// GET /api/performance/user-workloads - Get user workload summaries
router.get('/user-workloads', async (req, res) => {
  try {
    const { department, role } = req.query;

    let whereConditions = [eq(users.isActive, true)];

    if (department) whereConditions.push(eq(users.department, department));
    if (role) whereConditions.push(eq(users.role, role));

    const userWorkloads = await db
      .select({
        user_id: users.id,
        user_name: users.name,
        user_email: users.email,
        role: users.role,
        department: users.department,
        active_tasks: sql<number>`COUNT(DISTINCT CASE WHEN ${tasks.status} IN ('todo', 'in_progress', 'in_review') THEN ${tasks.id} END)`.as('active_tasks'),
        overdue_tasks: sql<number>`COUNT(DISTINCT CASE WHEN ${tasks.dueDate} < CURRENT_DATE AND ${tasks.status} != 'done' THEN ${tasks.id} END)`.as('overdue_tasks'),
        total_hours_this_week: sql<number>`COALESCE(SUM(CASE WHEN ${timeEntries.date} >= CURRENT_DATE - INTERVAL '7 days' THEN ${timeEntries.hours} END), 0)`.as('total_hours_this_week'),
        total_hours_this_month: sql<number>`COALESCE(SUM(CASE WHEN ${timeEntries.date} >= CURRENT_DATE - INTERVAL '30 days' THEN ${timeEntries.hours} END), 0)`.as('total_hours_this_month'),
        projects_count: sql<number>`COUNT(DISTINCT ${projects.id})`.as('projects_count'),
        last_activity: sql<string>`MAX(${timeEntries.date})`.as('last_activity'),
      })
      .from(users)
      .leftJoin(tasks, eq(tasks.assignedTo, users.id))
      .leftJoin(timeEntries, eq(timeEntries.userId, users.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(users.id, users.name, users.email, users.role, users.department)
      .orderBy(desc(sql`COUNT(DISTINCT ${tasks.id})`));

    res.json(userWorkloads);
  } catch (error) {
    console.error('Error fetching user workloads:', error);
    res.status(500).json({ error: 'Failed to fetch user workloads' });
  }
});

// GET /api/performance/task-progress - Get task progress summaries
router.get('/task-progress', async (req, res) => {
  try {
    const { projectId, assigneeId } = req.query;

    let whereConditions = [];

    if (projectId) whereConditions.push(eq(tasks.projectId, projectId));
    if (assigneeId) whereConditions.push(eq(tasks.assignedTo, assigneeId));

    const taskProgress = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        project_id: tasks.projectId,
        project_name: projects.name,
        assignee_id: tasks.assignedTo,
        assignee_name: users.name,
        status: tasks.status,
        priority: tasks.priority,
        planned_start_date: sql<string>`NULL`.as('planned_start_date'), // Placeholder
        planned_end_date: sql<string>`NULL`.as('planned_end_date'), // Placeholder
        actual_progress: sql<number>`CASE
          WHEN ${tasks.status} = 'done' THEN 100
          WHEN ${tasks.status} = 'in_progress' THEN 50
          WHEN ${tasks.status} = 'in_review' THEN 75
          ELSE 0
        END`.as('actual_progress'),
        planned_progress_weight: sql<number>`1.0`.as('planned_progress_weight'), // Placeholder
        estimated_hours: tasks.estimatedHours,
        actual_hours: sql<number>`COALESCE(SUM(${timeEntries.hours}), 0)`.as('actual_hours'),
        due_date: tasks.dueDate,
        is_overdue: sql<boolean>`${tasks.dueDate} < CURRENT_DATE AND ${tasks.status} != 'done'`.as('is_overdue'),
        days_overdue: sql<number>`CASE
          WHEN ${tasks.dueDate} < CURRENT_DATE AND ${tasks.status} != 'done'
          THEN EXTRACT(DAY FROM CURRENT_DATE - ${tasks.dueDate})
          ELSE 0
        END`.as('days_overdue'),
        created_at: tasks.createdAt,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .leftJoin(timeEntries, eq(timeEntries.taskId, tasks.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(tasks.id, projects.name, users.name)
      .orderBy(desc(tasks.createdAt));

    res.json(taskProgress);
  } catch (error) {
    console.error('Error fetching task progress:', error);
    res.status(500).json({ error: 'Failed to fetch task progress' });
  }
});

// GET /api/performance/dashboard-metrics - Get dashboard metrics
router.get('/dashboard-metrics', async (req, res) => {
  try {
    // Get project metrics
    const projectMetrics = await db
      .select({
        total_projects: count(projects.id),
        active_projects: sql<number>`COUNT(CASE WHEN ${projects.status} IN ('todo', 'in_progress', 'in_review') THEN 1 END)`,
        completed_projects: sql<number>`COUNT(CASE WHEN ${projects.status} = 'done' THEN 1 END)`,
      })
      .from(projects);

    // Get user metrics
    const userMetrics = await db
      .select({
        total_users: count(users.id),
        active_users: sql<number>`COUNT(CASE WHEN ${users.isActive} = true THEN 1 END)`,
      })
      .from(users);

    // Get task metrics
    const taskMetrics = await db
      .select({
        total_tasks: count(tasks.id),
        completed_tasks: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'done' THEN 1 END)`,
        overdue_tasks: sql<number>`COUNT(CASE WHEN ${tasks.dueDate} < CURRENT_DATE AND ${tasks.status} != 'done' THEN 1 END)`,
      })
      .from(tasks);

    // Get time metrics
    const timeMetrics = await db
      .select({
        total_hours_this_month: sql<number>`COALESCE(SUM(CASE WHEN ${timeEntries.date} >= CURRENT_DATE - INTERVAL '30 days' THEN ${timeEntries.hours} END), 0)`,
      })
      .from(timeEntries);

    // Get expense metrics (placeholder - expenses table exists but we'll use a simple sum)
    const expenseMetrics = await db
      .select({
        total_expenses_this_month: sql<number>`0`, // Placeholder - would need expenses table logic
      })
      .from(users)
      .limit(1);

    // Get pending approvals (placeholder)
    const approvalMetrics = await db
      .select({
        pending_approvals: sql<number>`COUNT(CASE WHEN ${timeEntries.status} = 'pending' THEN 1 END)`,
      })
      .from(timeEntries);

    const metrics = {
      total_projects: projectMetrics[0]?.total_projects || 0,
      active_projects: projectMetrics[0]?.active_projects || 0,
      completed_projects: projectMetrics[0]?.completed_projects || 0,
      total_users: userMetrics[0]?.total_users || 0,
      active_users: userMetrics[0]?.active_users || 0,
      total_tasks: taskMetrics[0]?.total_tasks || 0,
      completed_tasks: taskMetrics[0]?.completed_tasks || 0,
      overdue_tasks: taskMetrics[0]?.overdue_tasks || 0,
      total_hours_this_month: timeMetrics[0]?.total_hours_this_month || 0,
      total_expenses_this_month: expenseMetrics[0]?.total_expenses_this_month || 0,
      pending_approvals: approvalMetrics[0]?.pending_approvals || 0,
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

export default router;