const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/timesheets - Fetch timesheets with filters
router.get('/timesheets', async (req, res) => {
  try {
    const {
      userId,
      projectId,
      status,
      startDate,
      endDate,
      managerId,
    } = req.query;

    const where = {};

    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (managerId) {
      // Get all projects managed by this manager
      const managedProjects = await prisma.project.findMany({
        where: { projectManagerId: managerId },
        select: { id: true },
      });
      where.projectId = {
        in: managedProjects.map((p) => p.id),
      };
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const timesheets = await prisma.timesheet.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    res.json({
      success: true,
      data: timesheets,
    });
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timesheets',
      error: error.message,
    });
  }
});

// POST /api/timesheets - Create new timesheet entry
router.post('/timesheets', async (req, res) => {
  try {
    const {
      userId,
      projectId,
      taskId,
      date,
      hoursWorked,
      description,
      status,
    } = req.body;

    if (!userId || !projectId || !date || !hoursWorked) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if entry already exists for this date/task
    const existingEntry = await prisma.timesheet.findUnique({
      where: {
        userId_projectId_taskId_date: {
          userId,
          projectId,
          taskId: taskId || null,
          date: new Date(date),
        },
      },
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Timesheet entry already exists for this date',
      });
    }

    const timesheet = await prisma.timesheet.create({
      data: {
        userId,
        projectId,
        taskId: taskId || null,
        date: new Date(date),
        hoursWorked: parseFloat(hoursWorked),
        description: description || '',
        status: status || 'DRAFT',
      },
      include: {
        user: true,
        project: true,
        task: true,
      },
    });

    res.json({
      success: true,
      data: timesheet,
      message: 'Timesheet entry created',
    });
  } catch (error) {
    console.error('Error creating timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create timesheet entry',
      error: error.message,
    });
  }
});

// PATCH /api/timesheets/:id - Update timesheet entry
router.patch('/timesheets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hoursWorked, description, status, actualProgress } = req.body;

    const updateData = {};
    if (hoursWorked !== undefined) updateData.hoursWorked = parseFloat(hoursWorked);
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const timesheet = await prisma.timesheet.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        project: true,
        task: true,
      },
    });

    // Update task actual hours if task is provided
    if (timesheet.taskId && actualProgress !== undefined) {
      await prisma.task.update({
        where: { id: timesheet.taskId },
        data: {
          actualProgress: Math.min(parseFloat(actualProgress), 100),
        },
      });
    }

    res.json({
      success: true,
      data: timesheet,
      message: 'Timesheet entry updated',
    });
  } catch (error) {
    console.error('Error updating timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update timesheet entry',
      error: error.message,
    });
  }
});

// DELETE /api/timesheets/:id - Delete timesheet entry
router.delete('/timesheets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
    });

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet entry not found',
      });
    }

    // Can only delete DRAFT entries
    if (timesheet.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete draft entries',
      });
    }

    await prisma.timesheet.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Timesheet entry deleted',
    });
  } catch (error) {
    console.error('Error deleting timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete timesheet entry',
      error: error.message,
    });
  }
});

// POST /api/timesheets/:id/approve - Approve timesheet
router.post('/timesheets/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedById } = req.body;

    if (!approvedById) {
      return res.status(400).json({
        success: false,
        message: 'Approver ID required',
      });
    }

    const timesheet = await prisma.timesheet.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById,
        approvedAt: new Date(),
      },
      include: {
        user: true,
        project: true,
        task: true,
        approvedBy: true,
      },
    });

    // Update task actual hours
    if (timesheet.taskId) {
      const taskTimesheets = await prisma.timesheet.findMany({
        where: {
          taskId: timesheet.taskId,
          status: 'APPROVED',
        },
      });

      const totalHours = taskTimesheets.reduce(
        (sum, ts) => sum + ts.hoursWorked,
        0
      );

      await prisma.task.update({
        where: { id: timesheet.taskId },
        data: { actualHours: totalHours },
      });
    }

    res.json({
      success: true,
      data: timesheet,
      message: 'Timesheet approved',
    });
  } catch (error) {
    console.error('Error approving timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve timesheet',
      error: error.message,
    });
  }
});

// POST /api/timesheets/:id/reject - Reject timesheet
router.post('/timesheets/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const timesheet = await prisma.timesheet.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason || '',
      },
      include: {
        user: true,
        project: true,
        task: true,
      },
    });

    res.json({
      success: true,
      data: timesheet,
      message: 'Timesheet rejected',
    });
  } catch (error) {
    console.error('Error rejecting timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject timesheet',
      error: error.message,
    });
  }
});

// GET /api/timesheets/weekly/:userId - Get weekly timesheet summary
router.get('/timesheets/weekly/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { weekStart, weekEnd } = req.query;

    const startDate = weekStart
      ? new Date(weekStart)
      : new Date(new Date().setDate(new Date().getDate() - new Date().getDay()));
    const endDate = weekEnd
      ? new Date(weekEnd)
      : new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

    const timesheets = await prisma.timesheet.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        project: true,
        task: true,
      },
      orderBy: { date: 'asc' },
    });

    const summary = {
      weekStart: startDate,
      weekEnd: endDate,
      totalHours: timesheets.reduce((sum, ts) => sum + ts.hoursWorked, 0),
      byDay: {},
      byProject: {},
      byStatus: {
        DRAFT: 0,
        SUBMITTED: 0,
        APPROVED: 0,
        REJECTED: 0,
      },
    };

    timesheets.forEach((ts) => {
      const day = ts.date.toISOString().split('T')[0];
      summary.byDay[day] = (summary.byDay[day] || 0) + ts.hoursWorked;

      const projectName = ts.project.name;
      summary.byProject[projectName] = (summary.byProject[projectName] || 0) + ts.hoursWorked;

      summary.byStatus[ts.status]++;
    });

    res.json({
      success: true,
      data: {
        summary,
        entries: timesheets,
      },
    });
  } catch (error) {
    console.error('Error fetching weekly timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly timesheet',
      error: error.message,
    });
  }
});

module.exports = router;
