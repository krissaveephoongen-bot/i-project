import express from 'express';
import { db } from '../lib/db.js';
import { users, projects, tasks } from '../lib/schema.js';
import { eq, and, sql } from 'drizzle-orm';

const router = express.Router();

// GET /api/teams - Get team members (users)
router.get('/', async (req, res) => {
  try {
    const { department, role, projectId } = req.query;

    let whereConditions = [eq(users.isActive, true)];

    if (department) whereConditions.push(eq(users.department, department));
    if (role) whereConditions.push(eq(users.role, role));

    const teamMembers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        position: users.position,
        avatar: users.avatar,
        employeeCode: users.employeeCode,
        hourlyRate: users.hourlyRate,
        phone: users.phone,
        lastLogin: users.lastLogin,
        activeProjects: sql`(SELECT COUNT(DISTINCT p.id) FROM projects p JOIN tasks t ON t.project_id = p.id WHERE t.assigned_to = users.id AND p.status IN ('todo', 'in_progress', 'in_review', 'active'))`.as('active_projects'),
        totalTasks: sql`(SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id)`.as('total_tasks'),
        completedTasks: sql`(SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id AND status = 'done')`.as('completed_tasks'),
        currentTasks: sql`(SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id AND status IN ('todo', 'in_progress', 'in_review', 'pending'))`.as('current_tasks')
      })
      .from(users)
      .where(and(...whereConditions))
      .orderBy(users.name);

    if (projectId) {
      const filteredMembers = teamMembers.filter(() => true);
      return res.json(filteredMembers);
    }

    res.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// GET /api/teams/:id - Get team member details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const member = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        position: users.position,
        avatar: users.avatar,
        employeeCode: users.employeeCode,
        hourlyRate: users.hourlyRate,
        phone: users.phone,
        status: users.status,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        totalProjects: sql`(SELECT COUNT(DISTINCT p.id) FROM projects p JOIN tasks t ON t.project_id = p.id WHERE t.assigned_to = users.id)`.as('total_projects'),
        activeProjects: sql`(SELECT COUNT(DISTINCT p.id) FROM projects p JOIN tasks t ON t.project_id = p.id WHERE t.assigned_to = users.id AND p.status IN ('todo', 'in_progress', 'in_review', 'active'))`.as('active_projects'),
        completedProjects: sql`(SELECT COUNT(DISTINCT p.id) FROM projects p JOIN tasks t ON t.project_id = p.id WHERE t.assigned_to = users.id AND p.status = 'done')`.as('completed_projects'),
        totalTasks: sql`(SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id)`.as('total_tasks'),
        completedTasks: sql`(SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id AND status = 'done')`.as('completed_tasks'),
        overdueTasks: sql`(SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id AND due_date < NOW() AND status != 'done')`.as('overdue_tasks'),
        totalHours: sql`(SELECT COALESCE(SUM(hours), 0) FROM time_entries WHERE user_id = users.id)`.as('total_hours')
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (member.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json(member[0]);
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
});

// GET /api/teams/:id/projects - Get projects for a team member
router.get('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;

    const memberProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        code: projects.code,
        status: projects.status,
        startDate: projects.startDate,
        endDate: projects.endDate,
        managerName: sql`(SELECT name FROM users WHERE id = projects.manager_id)`.as('manager_name'),
        taskCount: sql`(SELECT COUNT(*) FROM tasks WHERE project_id = projects.id AND assigned_to = ${id})`.as('task_count'),
        completedTasks: sql`(SELECT COUNT(*) FROM tasks WHERE project_id = projects.id AND assigned_to = ${id} AND status = 'done')`.as('completed_tasks'),
        pendingTasks: sql`(SELECT COUNT(*) FROM tasks WHERE project_id = projects.id AND assigned_to = ${id} AND status IN ('todo', 'in_progress', 'in_review', 'pending'))`.as('pending_tasks')
      })
      .from(projects)
      .where(sql`EXISTS (SELECT 1 FROM tasks WHERE project_id = projects.id AND assigned_to = ${id})`)
      .orderBy(projects.name);

    res.json(memberProjects);
  } catch (error) {
    console.error('Error fetching team member projects:', error);
    res.status(500).json({ error: 'Failed to fetch team member projects' });
  }
});

// GET /api/teams/:id/tasks - Get tasks for a team member
router.get('/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.query;

    let whereConditions = [eq(tasks.assignedTo, id)];

    if (status) whereConditions.push(eq(tasks.status, status));
    if (priority) whereConditions.push(eq(tasks.priority, priority));

    const memberTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        estimatedHours: tasks.estimatedHours,
        actualHours: tasks.actualHours,
        projectName: projects.name,
        projectCode: projects.code,
        createdByName: sql`(SELECT name FROM users WHERE id = tasks.created_by)`.as('created_by_name'),
        createdAt: tasks.createdAt
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(and(...whereConditions))
      .orderBy(tasks.dueDate);

    res.json(memberTasks);
  } catch (error) {
    console.error('Error fetching team member tasks:', error);
    res.status(500).json({ error: 'Failed to fetch team member tasks' });
  }
});

// GET /api/teams/departments - Get department statistics
router.get('/departments/stats', async (req, res) => {
  try {
    const departmentStats = await db
      .select({
        department: users.department,
        memberCount: sql`COUNT(*)`.as('member_count'),
        activeMembers: sql`COUNT(CASE WHEN is_active = true THEN 1 END)`.as('active_members'),
        totalTasks: sql`(SELECT COUNT(t.id) FROM tasks t WHERE t.assigned_to = users.id)`.as('total_tasks'),
        completedTasks: sql`(SELECT COUNT(t.id) FROM tasks t WHERE t.assigned_to = users.id AND t.status = 'done')`.as('completed_tasks'),
        averageProductivity: sql`ROUND(((SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id AND status = 'done')::float / NULLIF((SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id), 0) * 100), 2)`.as('average_productivity')
      })
      .from(users)
      .where(sql`department IS NOT NULL`)
      .groupBy(users.department)
      .orderBy(sql`COUNT(*) DESC`);

    res.json(departmentStats);
  } catch (error) {
    console.error('Error fetching department statistics:', error);
    res.status(500).json({ error: 'Failed to fetch department statistics' });
  }
});

// GET /api/teams/workload - Get team workload overview
router.get('/workload/overview', async (req, res) => {
  try {
    const workloadOverview = await db
      .select({
        userId: users.id,
        userName: users.name,
        department: users.department,
        currentTasks: sql`(SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id AND status IN ('todo', 'in_progress', 'in_review', 'pending'))`.as('current_tasks'),
        overdueTasks: sql`(SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id AND due_date < NOW() AND status != 'done')`.as('overdue_tasks'),
        highPriorityTasks: sql`(SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id AND priority = 'high' AND status != 'done')`.as('high_priority_tasks'),
        totalEstimatedHours: sql`(SELECT COALESCE(SUM(estimated_hours), 0) FROM tasks WHERE assigned_to = users.id AND status != 'done')`.as('total_estimated_hours'),
        capacity: sql`(SELECT CASE WHEN hourly_rate > 0 THEN 40 ELSE 0 END FROM users u WHERE u.id = users.id)`.as('capacity')
      })
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(sql`(SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id AND status IN ('todo', 'in_progress', 'in_review', 'pending')) DESC`);

    res.json(workloadOverview);
  } catch (error) {
    console.error('Error fetching team workload:', error);
    res.status(500).json({ error: 'Failed to fetch team workload' });
  }
});

export default router;
