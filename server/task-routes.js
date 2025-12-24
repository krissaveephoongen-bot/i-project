const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tasks - Get tasks with filters
router.get('/tasks', async (req, res) => {
  try {
    const { projectId, assigneeId, status, priority, search } = req.query;

    const where = {};

    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) {
      where.status = {
        in: Array.isArray(status) ? status : [status],
      };
    }
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true } },
        timesheets: true,
        timeLogs: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message,
    });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
        reporter: true,
        subTasks: true,
        parentTask: true,
        timesheets: {
          include: { user: true },
        },
        timeLogs: {
          include: { user: true },
        },
        comments: {
          include: { user: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message,
    });
  }
});

// POST /api/tasks - Create new task
router.post('/tasks', async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedHours,
      assigneeId,
      plannedStartDate,
      plannedEndDate,
      plannedProgressWeight,
      reporterId,
    } = req.body;

    if (!projectId || !title || !reporterId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: projectId, title, reporterId',
      });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description: description || '',
        status: status || 'TODO',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours || 0,
        assigneeId: assigneeId || null,
        plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : null,
        plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : null,
        plannedProgressWeight: plannedProgressWeight || 0,
        actualProgress: 0,
        reporterId,
      },
      include: {
        project: true,
        assignee: true,
        reporter: true,
      },
    });

    res.json({
      success: true,
      data: task,
      message: 'Task created',
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message,
    });
  }
});

// PATCH /api/tasks/:id - Update task
router.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedHours,
      actualHours,
      actualProgress,
      assigneeId,
      plannedStartDate,
      plannedEndDate,
      plannedProgressWeight,
    } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (estimatedHours !== undefined)
      updateData.estimatedHours = parseFloat(estimatedHours);
    if (actualHours !== undefined) updateData.actualHours = parseFloat(actualHours);
    if (actualProgress !== undefined)
      updateData.actualProgress = Math.min(parseFloat(actualProgress), 100);
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
    if (plannedStartDate !== undefined)
      updateData.plannedStartDate = plannedStartDate
        ? new Date(plannedStartDate)
        : null;
    if (plannedEndDate !== undefined)
      updateData.plannedEndDate = plannedEndDate
        ? new Date(plannedEndDate)
        : null;
    if (plannedProgressWeight !== undefined)
      updateData.plannedProgressWeight = parseFloat(plannedProgressWeight);

    // Auto-update status if progress reaches 100%
    if (actualProgress === 100 && status !== 'DONE') {
      updateData.status = 'DONE';
      updateData.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        assignee: true,
        reporter: true,
      },
    });

    res.json({
      success: true,
      data: task,
      message: 'Task updated',
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message,
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await prisma.task.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message,
    });
  }
});

// GET /api/projects/:projectId/tasks - Get tasks for a project
router.get('/projects/:projectId/tasks', async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true } },
        timesheets: true,
        timeLogs: true,
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project tasks',
      error: error.message,
    });
  }
});

// POST /api/tasks/:id/update-progress - Update task progress
router.post('/tasks/:id/update-progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, status } = req.body;

    if (progress === undefined && status === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Must provide progress or status',
      });
    }

    const updateData = {};
    if (progress !== undefined) {
      updateData.actualProgress = Math.min(parseFloat(progress), 100);
      // Auto-mark as done if progress is 100%
      if (parseFloat(progress) === 100) {
        updateData.status = 'DONE';
        updateData.completedAt = new Date();
      }
    }
    if (status !== undefined) updateData.status = status;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        assignee: true,
      },
    });

    res.json({
      success: true,
      data: task,
      message: 'Task progress updated',
    });
  } catch (error) {
    console.error('Error updating task progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task progress',
      error: error.message,
    });
  }
});

module.exports = router;
