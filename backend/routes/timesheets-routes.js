import express from 'express';
import { db } from '../lib/db.js';
import { timeEntries, projects, tasks, users } from '../lib/schema.js';
import { eq, gte, lte, desc, sql, and } from 'drizzle-orm';

const router = express.Router();

// GET /api/timesheets - Get timesheet entries
router.get('/', async (req, res) => {
  try {
    const { userId, projectId, startDate, endDate, status } = req.query;

    let whereConditions = [];

    if (userId) whereConditions.push(eq(timeEntries.userId, userId));
    if (projectId) whereConditions.push(eq(timeEntries.projectId, projectId));
    if (startDate) whereConditions.push(gte(timeEntries.date, new Date(startDate)));
    if (endDate) whereConditions.push(lte(timeEntries.date, new Date(endDate)));
    if (status) whereConditions.push(eq(timeEntries.status, status));

    const timesheets = await db
      .select({
        id: timeEntries.id,
        date: timeEntries.date,
        workType: timeEntries.workType,
        startTime: timeEntries.startTime,
        endTime: timeEntries.endTime,
        hours: timeEntries.hours,
        description: timeEntries.description,
        status: timeEntries.status,
        approvedBy: timeEntries.approvedBy,
        approvedAt: timeEntries.approvedAt,
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
      .from(timeEntries)
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(tasks, eq(timeEntries.taskId, tasks.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(timeEntries.date));

    res.json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
});

// GET /api/timesheets/:id - Get timesheet entry by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const timesheet = await db
      .select({
        id: timeEntries.id,
        date: timeEntries.date,
        workType: timeEntries.workType,
        startTime: timeEntries.startTime,
        endTime: timeEntries.endTime,
        hours: timeEntries.hours,
        description: timeEntries.description,
        status: timeEntries.status,
        approvedBy: timeEntries.approvedBy,
        approvedAt: timeEntries.approvedAt,
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
      .from(timeEntries)
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(tasks, eq(timeEntries.taskId, tasks.id))
      .where(eq(timeEntries.id, id))
      .limit(1);

    if (timesheet.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    res.json(timesheet[0]);
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    res.status(500).json({ error: 'Failed to fetch timesheet' });
  }
});

// POST /api/timesheets - Create timesheet entry
router.post('/', async (req, res) => {
  try {
    const { date, workType, projectId, taskId, userId, startTime, endTime, hours, description } = req.body;

    // Validate required fields
    if (!date || !workType || !userId || !hours) {
      return res.status(400).json({ error: 'Date, work type, user ID, and hours are required' });
    }

    // Validate project exists if provided
    if (projectId) {
      const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      if (project.length === 0) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
    }

    // Validate task exists and belongs to project if both are provided
    if (taskId && projectId) {
      const task = await db.select().from(tasks).where(and(
        eq(tasks.id, taskId),
        eq(tasks.projectId, projectId)
      )).limit(1);
      if (task.length === 0) {
        return res.status(400).json({ error: 'Invalid task ID for the specified project' });
      }
    }

    const newTimesheet = {
      date: new Date(date),
      workType,
      projectId: projectId || null,
      taskId: taskId || null,
      userId,
      startTime,
      endTime,
      hours,
      description,
      status: 'pending'
    };

    const result = await db.insert(timeEntries).values(newTimesheet).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating timesheet entry:', error);
    res.status(500).json({ error: 'Failed to create timesheet entry' });
  }
});

// PUT /api/timesheets/:id - Update timesheet entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.createdAt;

    // Validate project/task relationship if updating
    if (updates.projectId || updates.taskId) {
      const projectId = updates.projectId || (await db.select({ projectId: timeEntries.projectId })
        .from(timeEntries).where(eq(timeEntries.id, id)).limit(1))[0]?.projectId;

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

    const result = await db.update(timeEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(timeEntries.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating timesheet entry:', error);
    res.status(500).json({ error: 'Failed to update timesheet entry' });
  }
});

// DELETE /api/timesheets/:id - Delete timesheet entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.delete(timeEntries).where(eq(timeEntries.id, id)).returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    res.json({ message: 'Timesheet entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting timesheet entry:', error);
    res.status(500).json({ error: 'Failed to delete timesheet entry' });
  }
});

// POST /api/timesheets/:id/approve - Approve timesheet entry
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const result = await db.update(timeEntries)
      .set({
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(timeEntries.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error approving timesheet entry:', error);
    res.status(500).json({ error: 'Failed to approve timesheet entry' });
  }
});

// POST /api/timesheets/:id/reject - Reject timesheet entry
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, reason } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const result = await db.update(timeEntries)
      .set({
        status: 'rejected',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(timeEntries.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error rejecting timesheet entry:', error);
    res.status(500).json({ error: 'Failed to reject timesheet entry' });
  }
});

// POST /api/timesheets/:id/pm-approve - Project Manager approve timesheet entry
router.post('/:id/pm-approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, reason } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    // Verify user is a project manager
    const approver = await db.select().from(users).where(eq(users.id, approvedBy)).limit(1);
    if (approver.length === 0 || !approver[0].isProjectManager) {
      return res.status(403).json({ error: 'Only project managers can approve timesheets' });
    }

    const result = await db.update(timeEntries)
      .set({
        projectManagerApprovalStatus: 'approved',
        projectManagerId: approvedBy,
        projectManagerApprovalDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(timeEntries.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    // Log approval action
    await db.insert(timesheetApprovalActions).values({
      timesheetId: id,
      actionType: 'project_manager_approval',
      previousStatus: 'pending',
      newStatus: 'approved',
      changedBy: approvedBy,
      reason: reason || null
    });

    res.json(result[0]);
  } catch (error) {
    console.error('Error approving timesheet entry:', error);
    res.status(500).json({ error: 'Failed to approve timesheet entry' });
  }
});

// POST /api/timesheets/:id/pm-reject - Project Manager reject timesheet entry
router.post('/:id/pm-reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, reason } = req.body;

    if (!approvedBy || !reason) {
      return res.status(400).json({ error: 'approvedBy and reason are required' });
    }

    // Verify user is a project manager
    const approver = await db.select().from(users).where(eq(users.id, approvedBy)).limit(1);
    if (approver.length === 0 || !approver[0].isProjectManager) {
      return res.status(403).json({ error: 'Only project managers can reject timesheets' });
    }

    const result = await db.update(timeEntries)
      .set({
        projectManagerApprovalStatus: 'rejected',
        projectManagerId: approvedBy,
        projectManagerApprovalDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(timeEntries.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    // Log rejection action
    await db.insert(timesheetApprovalActions).values({
      timesheetId: id,
      actionType: 'project_manager_approval',
      previousStatus: 'pending',
      newStatus: 'rejected',
      changedBy: approvedBy,
      reason
    });

    res.json(result[0]);
  } catch (error) {
    console.error('Error rejecting timesheet entry:', error);
    res.status(500).json({ error: 'Failed to reject timesheet entry' });
  }
});

// POST /api/timesheets/:id/supervisor-approve - Supervisor approve timesheet entry
router.post('/:id/supervisor-approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, reason } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    // Verify user is a supervisor
    const approver = await db.select().from(users).where(eq(users.id, approvedBy)).limit(1);
    if (approver.length === 0 || !approver[0].isSupervisor) {
      return res.status(403).json({ error: 'Only supervisors can approve timesheets' });
    }

    // Check if timesheet has been approved by project manager first
    const timesheet = await db.select().from(timeEntries).where(eq(timeEntries.id, id)).limit(1);
    if (timesheet.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    if (timesheet[0].projectManagerApprovalStatus !== 'approved') {
      return res.status(400).json({ error: 'Timesheet must be approved by project manager first' });
    }

    const result = await db.update(timeEntries)
      .set({
        supervisorApprovalStatus: 'approved',
        supervisorId: approvedBy,
        supervisorApprovalDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(timeEntries.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    // Log approval action
    await db.insert(timesheetApprovalActions).values({
      timesheetId: id,
      actionType: 'supervisor_approval',
      previousStatus: 'pending',
      newStatus: 'approved',
      changedBy: approvedBy,
      reason: reason || null
    });

    res.json(result[0]);
  } catch (error) {
    console.error('Error approving timesheet entry:', error);
    res.status(500).json({ error: 'Failed to approve timesheet entry' });
  }
});

// POST /api/timesheets/:id/supervisor-reject - Supervisor reject timesheet entry
router.post('/:id/supervisor-reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, reason } = req.body;

    if (!approvedBy || !reason) {
      return res.status(400).json({ error: 'approvedBy and reason are required' });
    }

    // Verify user is a supervisor
    const approver = await db.select().from(users).where(eq(users.id, approvedBy)).limit(1);
    if (approver.length === 0 || !approver[0].isSupervisor) {
      return res.status(403).json({ error: 'Only supervisors can reject timesheets' });
    }

    // Check if timesheet has been approved by project manager first
    const timesheet = await db.select().from(timeEntries).where(eq(timeEntries.id, id)).limit(1);
    if (timesheet.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    if (timesheet[0].projectManagerApprovalStatus !== 'approved') {
      return res.status(400).json({ error: 'Timesheet must be approved by project manager first' });
    }

    const result = await db.update(timeEntries)
      .set({
        supervisorApprovalStatus: 'rejected',
        supervisorId: approvedBy,
        supervisorApprovalDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(timeEntries.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    // Log rejection action
    await db.insert(timesheetApprovalActions).values({
      timesheetId: id,
      actionType: 'supervisor_approval',
      previousStatus: 'pending',
      newStatus: 'rejected',
      changedBy: approvedBy,
      reason
    });

    res.json(result[0]);
  } catch (error) {
    console.error('Error rejecting timesheet entry:', error);
    res.status(500).json({ error: 'Failed to reject timesheet entry' });
  }
});

// GET /api/timesheets/pending-pm-approval - Get timesheets pending project manager approval
router.get('/pending-pm-approval', async (req, res) => {
  try {
    const { managerId } = req.query;

    let whereConditions = [
      eq(timeEntries.projectManagerApprovalStatus, 'pending')
    ];

    if (managerId) {
      whereConditions.push(eq(users.id, managerId));
    }

    const timesheets = await db
      .select({
        id: timeEntries.id,
        date: timeEntries.date,
        workType: timeEntries.workType,
        startTime: timeEntries.startTime,
        endTime: timeEntries.endTime,
        hours: timeEntries.hours,
        description: timeEntries.description,
        projectManagerApprovalStatus: timeEntries.projectManagerApprovalStatus,
        supervisorApprovalStatus: timeEntries.supervisorApprovalStatus,
        projectManagerApprovalDate: timeEntries.projectManagerApprovalDate,
        supervisorApprovalDate: timeEntries.supervisorApprovalDate,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          position: users.position,
          employeeCode: users.employeeCode
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
      .from(timeEntries)
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(tasks, eq(timeEntries.taskId, tasks.id))
      .where(and(...whereConditions))
      .orderBy(desc(timeEntries.date));

    res.json(timesheets);
  } catch (error) {
    console.error('Error fetching pending PM approvals:', error);
    res.status(500).json({ error: 'Failed to fetch pending PM approvals' });
  }
});

// GET /api/timesheets/pending-supervisor-approval - Get timesheets pending supervisor approval
router.get('/pending-supervisor-approval', async (req, res) => {
  try {
    const { supervisorId } = req.query;

    let whereConditions = [
      eq(timeEntries.projectManagerApprovalStatus, 'approved'),
      eq(timeEntries.supervisorApprovalStatus, 'pending')
    ];

    if (supervisorId) {
      whereConditions.push(eq(users.id, supervisorId));
    }

    const timesheets = await db
      .select({
        id: timeEntries.id,
        date: timeEntries.date,
        workType: timeEntries.workType,
        startTime: timeEntries.startTime,
        endTime: timeEntries.endTime,
        hours: timeEntries.hours,
        description: timeEntries.description,
        projectManagerApprovalStatus: timeEntries.projectManagerApprovalStatus,
        supervisorApprovalStatus: timeEntries.supervisorApprovalStatus,
        projectManagerApprovalDate: timeEntries.projectManagerApprovalDate,
        supervisorApprovalDate: timeEntries.supervisorApprovalDate,
        projectManagerId: timeEntries.projectManagerId,
        supervisorId: timeEntries.supervisorId,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          position: users.position,
          employeeCode: users.employeeCode
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
      .from(timeEntries)
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(tasks, eq(timeEntries.taskId, tasks.id))
      .where(and(...whereConditions))
      .orderBy(desc(timeEntries.date));

    res.json(timesheets);
  } catch (error) {
    console.error('Error fetching pending supervisor approvals:', error);
    res.status(500).json({ error: 'Failed to fetch pending supervisor approvals' });
  }
});

// GET /api/timesheets/pm-approved - Get timesheets approved by project manager
router.get('/pm-approved', async (req, res) => {
  try {
    const { managerId } = req.query;

    let whereConditions = [
      eq(timeEntries.projectManagerApprovalStatus, 'approved')
    ];

    if (managerId) {
      whereConditions.push(eq(users.id, managerId));
    }

    const timesheets = await db
      .select({
        id: timeEntries.id,
        date: timeEntries.date,
        workType: timeEntries.workType,
        startTime: timeEntries.startTime,
        endTime: timeEntries.endTime,
        hours: timeEntries.hours,
        description: timeEntries.description,
        projectManagerApprovalStatus: timeEntries.projectManagerApprovalStatus,
        supervisorApprovalStatus: timeEntries.supervisorApprovalStatus,
        projectManagerApprovalDate: timeEntries.projectManagerApprovalDate,
        supervisorApprovalDate: timeEntries.supervisorApprovalDate,
        projectManagerId: timeEntries.projectManagerId,
        supervisorId: timeEntries.supervisorId,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          position: users.position,
          employeeCode: users.employeeCode
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
      .from(timeEntries)
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(tasks, eq(timeEntries.taskId, tasks.id))
      .where(and(...whereConditions))
      .orderBy(desc(timeEntries.date));

    res.json(timesheets);
  } catch (error) {
    console.error('Error fetching PM approved timesheets:', error);
    res.status(500).json({ error: 'Failed to fetch PM approved timesheets' });
  }
});

export default router;