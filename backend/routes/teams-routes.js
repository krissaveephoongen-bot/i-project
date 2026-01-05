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
        activeProjects: sql<number>`(
          select count(distinct p.id)
          from projects p
          join tasks t on t.project_id = p.id
          where t.assigned_to = users.id and p.status in ('todo', 'in_progress')
        )`,
        totalTasks: sql<number>`(
          select count(*)
          from tasks
          where assigned_to = users.id
        )`,
        completedTasks: sql<number>`(
          select count(*)
          from tasks
          where assigned_to = users.id and status = 'done'
        )`,
        currentTasks: sql<number>`(
          select count(*)
          from tasks
          where assigned_to = users.id and status in ('todo', 'in_progress')
        )`
      })
      .from(users)
      .where(and(...whereConditions))
      .orderBy(users.name);

    // If projectId is specified, filter to only users assigned to that project
    if (projectId) {
      const filteredMembers = teamMembers.filter(member => {
        // This would need to be implemented with a separate query
        // For now, return all members
        return true;
      });
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
        // Statistics
        totalProjects: sql<number>`(
          select count(distinct p.id)
          from projects p
          join tasks t on t.project_id = p.id
          where t.assigned_to = users.id
        )`,
        activeProjects: sql<number>`(
          select count(distinct p.id)
          from projects p
          join tasks t on t.project_id = p.id
          where t.assigned_to = users.id and p.status in ('todo', 'in_progress')
        )`,
        completedProjects: sql<number>`(
          select count(distinct p.id)
          from projects p
          join tasks t on t.project_id = p.id
          where t.assigned_to = users.id and p.status = 'done'
        )`,
        totalTasks: sql<number>`(
          select count(*)
          from tasks
          where assigned_to = users.id
        )`,
        completedTasks: sql<number>`(
          select count(*)
          from tasks
          where assigned_to = users.id and status = 'done'
        )`,
        overdueTasks: sql<number>`(
          select count(*)
          from tasks
          where assigned_to = users.id and due_date < now() and status != 'done'
        )`,
        totalHours: sql<number>`(
          select coalesce(sum(hours), 0)
          from time_entries
          where user_id = users.id
        )`
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
        managerName: sql<string>`(select name from users where id = projects.manager_id)`,
        taskCount: sql<number>`(
          select count(*)
          from tasks
          where project_id = projects.id and assigned_to = ${id}
        )`,
        completedTasks: sql<number>`(
          select count(*)
          from tasks
          where project_id = projects.id and assigned_to = ${id} and status = 'done'
        )`,
        pendingTasks: sql<number>`(
          select count(*)
          from tasks
          where project_id = projects.id and assigned_to = ${id} and status in ('todo', 'in_progress')
        )`
      })
      .from(projects)
      .where(sql`
        exists (
          select 1 from tasks
          where project_id = projects.id and assigned_to = ${id}
        )
      `)
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
        createdByName: sql<string>`(select name from users where id = tasks.created_by)`,
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
        memberCount: sql<number>`count(*)`,
        activeMembers: sql<number>`count(case when is_active = true then 1 end)`,
        totalTasks: sql<number>`(
          select count(t.id)
          from tasks t
          where t.assigned_to = users.id
        )`,
        completedTasks: sql<number>`(
          select count(t.id)
          from tasks t
          where t.assigned_to = users.id and t.status = 'done'
        )`,
        averageProductivity: sql<number>`round(
          (
            select avg(
              case
                when (select count(*) from tasks where assigned_to = users.id) > 0
                then (select count(*) from tasks where assigned_to = users.id and status = 'done')::float /
                     (select count(*) from tasks where assigned_to = users.id)
                else 0
              end
            )
          ) * 100, 2
        )`
      })
      .from(users)
      .where(sql`department is not null`)
      .groupBy(users.department)
      .orderBy(sql`count(*) desc`);

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
        currentTasks: sql<number>`(
          select count(*)
          from tasks
          where assigned_to = users.id and status in ('todo', 'in_progress')
        )`,
        overdueTasks: sql<number>`(
          select count(*)
          from tasks
          where assigned_to = users.id and due_date < now() and status != 'done'
        )`,
        highPriorityTasks: sql<number>`(
          select count(*)
          from tasks
          where assigned_to = users.id and priority = 'high' and status != 'done'
        )`,
        totalEstimatedHours: sql<number>`(
          select coalesce(sum(estimated_hours), 0)
          from tasks
          where assigned_to = users.id and status != 'done'
        )`,
        capacity: sql<number>`(
          select case
            when hourly_rate > 0 then 40 -- assuming 40 hours/week capacity
            else 0
          end
          from users u where u.id = users.id
        )`
      })
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(sql`(
        select count(*)
        from tasks
        where assigned_to = users.id and status in ('todo', 'in_progress')
      ) desc`);

    res.json(workloadOverview);
  } catch (error) {
    console.error('Error fetching team workload:', error);
    res.status(500).json({ error: 'Failed to fetch team workload' });
  }
});

export default router;