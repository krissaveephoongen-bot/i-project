const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED, CANCELLED]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         dueDate:
 *           type: string
 *           format: date-time
 *         estimatedHours:
 *           type: number
 *           format: float
 *         actualHours:
 *           type: number
 *           format: float
 *         projectId:
 *           type: string
 *           format: uuid
 *         assigneeId:
 *           type: string
 *           format: uuid
 *         reporterId:
 *           type: string
 *           format: uuid
 *         parentTaskId:
 *           type: string
 *           format: uuid
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         startedAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 */

// Get all tasks with filters
router.get('/tasks', verifyToken, async (req, res) => {
  try {
    const { 
      projectId, 
      status, 
      priority, 
      assigneeId, 
      reporterId,
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      OR: [
        { isDeleted: false },
        { isDeleted: null }
      ]
    };
    
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (reporterId) where.reporterId = reporterId;
    
    // Search in title or description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // For regular users, only show tasks they're assigned to or reported by them
    if (req.user.role !== 'ADMIN' && req.user.role !== 'PROJECT_MANAGER') {
      where.OR = [
        { assigneeId: req.user.id },
        { reporterId: req.user.id },
        { project: { projectManagers: { some: { userId: req.user.id } } } }
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reporter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          parentTask: {
            select: {
              id: true,
              title: true
            }
          },
          subTasks: {
            select: {
              id: true,
              title: true,
              status: true
            }
          },
          _count: {
            select: { comments: true, timeLogs: true, timesheets: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      }),
      prisma.task.count({ where })
    ]);

    // Calculate progress for each task
    const tasksWithProgress = tasks.map(task => {
      const subTasks = task.subTasks || [];
      const completedSubTasks = subTasks.filter(t => t.status === 'DONE').length;
      const progress = subTasks.length > 0 
        ? Math.round((completedSubTasks / subTasks.length) * 100) 
        : 0;

      return {
        ...task,
        progress,
        commentsCount: task._count.comments,
        timeLogsCount: task._count.timeLogs,
        timesheetsCount: task._count.timesheets,
        _count: undefined // Remove the _count field
      };
    });

    res.json({
      success: true,
      data: tasksWithProgress,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
});

// Get a single task by ID
router.get('/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { 
        id,
        OR: [
          { isDeleted: false },
          { isDeleted: null }
        ]
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true
          }
        },
        parentTask: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        subTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: {
              select: {
                id: true,
                name: true
              }
            },
            dueDate: true,
            priority: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Limit to 10 most recent comments
        },
        _count: {
          select: { comments: true, timeLogs: true, timesheets: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user has permission to view this task
    if (
      req.user.role !== 'ADMIN' && 
      req.user.role !== 'PROJECT_MANAGER' && 
      task.assigneeId !== req.user.id && 
      task.reporterId !== req.user.id
    ) {
      // Check if user is a project manager for this task's project
      const isProjectManager = await prisma.projectManager.findFirst({
        where: {
          userId: req.user.id,
          projectId: task.projectId
        }
      });

      if (!isProjectManager) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this task'
        });
      }
    }

    // Calculate progress based on subtasks
    const subTasks = task.subTasks || [];
    const completedSubTasks = subTasks.filter(t => t.status === 'DONE').length;
    const progress = subTasks.length > 0 
      ? Math.round((completedSubTasks / subTasks.length) * 100) 
      : 0;

    // Calculate time spent
    const timeLogs = await prisma.timeLog.findMany({
      where: { taskId: id },
      select: { duration: true }
    });
    
    const timeSpent = timeLogs.reduce((total, log) => total + (log.duration || 0), 0);

    // Format the response
    const response = {
      ...task,
      progress,
      timeSpent,
      commentsCount: task._count.comments,
      timeLogsCount: task._count.timeLogs,
      timesheetsCount: task._count.timesheets,
      _count: undefined // Remove the _count field
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      message: error.message
    });
  }
});

// Create a new task
router.post('/tasks', verifyToken, async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'TODO',
      priority = 'medium',
      dueDate,
      estimatedHours,
      projectId,
      assigneeId,
      parentTaskId,
      labels = []
    } = req.body;

    const reporterId = req.user.id;

    // Validate required fields
    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        error: 'Title and project ID are required'
      });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(400).json({
        success: false,
        error: 'Project not found'
      });
    }

    // If assignee is provided, validate it
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId }
      });

      if (!assignee) {
        return res.status(400).json({
          success: false,
          error: 'Assignee not found'
        });
      }
    }

    // If parent task is provided, validate it
    if (parentTaskId) {
      const parentTask = await prisma.task.findUnique({
        where: { id: parentTaskId }
      });

      if (!parentTask) {
        return res.status(400).json({
          success: false,
          error: 'Parent task not found'
        });
      }

      // Check if parent task belongs to the same project
      if (parentTask.projectId !== projectId) {
        return res.status(400).json({
          success: false,
          error: 'Parent task does not belong to the specified project'
        });
      }
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        projectId,
        assigneeId: assigneeId || null,
        reporterId,
        parentTaskId: parentTaskId || null,
        labels: Array.isArray(labels) ? labels : []
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        parentTask: parentTaskId ? {
          select: {
            id: true,
            title: true
          }
        } : undefined
      }
    });

    // TODO: Notify assignee if assigned

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      message: error.message
    });
  }
});

// Update a task
router.put('/tasks/:id', verifyToken, async (req, res) => {
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
      projectId,
      assigneeId,
      parentTaskId,
      labels,
      startedAt,
      completedAt
    } = req.body;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { 
        id,
        OR: [
          { isDeleted: false },
          { isDeleted: null }
        ]
      },
      include: {
        project: true,
        parentTask: true,
        subTasks: true
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user has permission to update this task
    if (
      req.user.role !== 'ADMIN' && 
      req.user.role !== 'PROJECT_MANAGER' && 
      existingTask.reporterId !== req.user.id &&
      existingTask.assigneeId !== req.user.id
    ) {
      // Check if user is a project manager for this task's project
      const isProjectManager = await prisma.projectManager.findFirst({
        where: {
          userId: req.user.id,
          projectId: existingTask.projectId
        }
      });

      if (!isProjectManager) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this task'
        });
      }
    }

    // If project is being updated, validate the new project
    if (projectId && projectId !== existingTask.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return res.status(400).json({
          success: false,
          error: 'Project not found'
        });
      }
    }

    // If assignee is being updated, validate the new assignee
    if (assigneeId && assigneeId !== existingTask.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId }
      });

      if (!assignee) {
        return res.status(400).json({
          success: false,
          error: 'Assignee not found'
        });
      }
    }

    // If parent task is being updated, validate the new parent task
    if (parentTaskId !== undefined) {
      // If parentTaskId is null, it means we're removing the parent
      if (parentTaskId !== null) {
        const parentTask = await prisma.task.findUnique({
          where: { id: parentTaskId }
        });

        if (!parentTask) {
          return res.status(400).json({
            success: false,
            error: 'Parent task not found'
          });
        }

        // Check if parent task belongs to the same project
        if (parentTask.projectId !== (projectId || existingTask.projectId)) {
          return res.status(400).json({
            success: false,
            error: 'Parent task does not belong to the specified project'
          });
        }

        // Check for circular reference (can't set a task as its own parent or a child as parent)
        if (parentTaskId === id) {
          return res.status(400).json({
            success: false,
            error: 'A task cannot be its own parent'
          });
        }

        // Check if the new parent is a descendant of this task (would create a cycle)
        let currentParentId = parentTask.parentTaskId;
        while (currentParentId) {
          if (currentParentId === id) {
            return res.status(400).json({
              success: false,
              error: 'Cannot set a descendant task as parent'
            });
          }
          const currentParent = await prisma.task.findUnique({
            where: { id: currentParentId },
            select: { parentTaskId: true }
          });
          currentParentId = currentParent?.parentTaskId;
        }
      }
    }

    // Handle status changes
    const statusChanged = status && status !== existingTask.status;
    const now = new Date();
    let updateData = {
      title: title !== undefined ? title : undefined,
      description: description !== undefined ? description : undefined,
      status: status || undefined,
      priority: priority || undefined,
      dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
      estimatedHours: estimatedHours !== undefined ? (estimatedHours ? parseFloat(estimatedHours) : null) : undefined,
      actualHours: actualHours !== undefined ? (actualHours ? parseFloat(actualHours) : null) : undefined,
      projectId: projectId || undefined,
      assigneeId: assigneeId !== undefined ? (assigneeId || null) : undefined,
      parentTaskId: parentTaskId !== undefined ? (parentTaskId || null) : undefined,
      labels: labels !== undefined ? (Array.isArray(labels) ? labels : []) : undefined,
      startedAt: startedAt !== undefined ? (startedAt ? new Date(startedAt) : null) : undefined,
      completedAt: completedAt !== undefined ? (completedAt ? new Date(completedAt) : null) : undefined
    };

    // If status is changing to IN_PROGRESS and startedAt is not set, set it to now
    if (status === 'IN_PROGRESS' && !existingTask.startedAt) {
      updateData.startedAt = now;
    }

    // If status is changing to DONE and completedAt is not set, set it to now
    if (status === 'DONE' && !existingTask.completedAt) {
      updateData.completedAt = now;
      
      // If there are subtasks, ensure they're all done
      if (existingTask.subTasks && existingTask.subTasks.length > 0) {
        const incompleteSubtasks = existingTask.subTasks.filter(t => t.status !== 'DONE');
        if (incompleteSubtasks.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Cannot mark task as DONE when it has incomplete subtasks',
            incompleteSubtasks: incompleteSubtasks.map(t => ({ id: t.id, title: t.title }))
          });
        }
      }
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        parentTask: {
          select: {
            id: true,
            title: true
          }
        },
        subTasks: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        _count: {
          select: { comments: true, timeLogs: true, timesheets: true }
        }
      }
    });

    // If this task has a parent, check if all siblings are done and update parent status
    if (existingTask.parentTaskId) {
      await checkAndUpdateParentTaskStatus(existingTask.parentTaskId);
    }

    // TODO: Notify assignee if changed
    // TODO: Notify reporter if status changed

    // Calculate progress based on subtasks
    const subTasks = updatedTask.subTasks || [];
    const completedSubTasks = subTasks.filter(t => t.status === 'DONE').length;
    const progress = subTasks.length > 0 
      ? Math.round((completedSubTasks / subTasks.length) * 100) 
      : 0;

    // Format the response
    const response = {
      ...updatedTask,
      progress,
      commentsCount: updatedTask._count.comments,
      timeLogsCount: updatedTask._count.timeLogs,
      timesheetsCount: updatedTask._count.timesheets,
      _count: undefined // Remove the _count field
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      message: error.message
    });
  }
});

// Delete a task (soft delete)
router.delete('/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { 
        id,
        OR: [
          { isDeleted: false },
          { isDeleted: null }
        ]
      },
      include: {
        project: true,
        subTasks: {
          where: {
            OR: [
              { isDeleted: false },
              { isDeleted: null }
            ]
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user has permission to delete this task
    if (
      req.user.role !== 'ADMIN' && 
      req.user.role !== 'PROJECT_MANAGER' && 
      task.reporterId !== req.user.id
    ) {
      // Check if user is a project manager for this task's project
      const isProjectManager = await prisma.projectManager.findFirst({
        where: {
          userId: req.user.id,
          projectId: task.projectId
        }
      });

      if (!isProjectManager) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this task'
        });
      }
    }

    // Check if task has subtasks
    if (task.subTasks && task.subTasks.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a task that has subtasks. Please delete or reassign the subtasks first.'
      });
    }

    // Soft delete the task
    await prisma.task.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      message: error.message
    });
  }
});

// Update task status
router.patch('/tasks/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { 
        id,
        OR: [
          { isDeleted: false },
          { isDeleted: null }
        ]
      },
      include: {
        project: true,
        subTasks: {
          where: {
            OR: [
              { isDeleted: false },
              { isDeleted: null }
            ]
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user has permission to update this task
    if (
      req.user.role !== 'ADMIN' && 
      req.user.role !== 'PROJECT_MANAGER' && 
      task.assigneeId !== req.user.id && 
      task.reporterId !== req.user.id
    ) {
      // Check if user is a project manager for this task's project
      const isProjectManager = await prisma.projectManager.findFirst({
        where: {
          userId: req.user.id,
          projectId: task.projectId
        }
      });

      if (!isProjectManager) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this task'
        });
      }
    }

    const now = new Date();
    let updateData = { status };

    // If status is changing to IN_PROGRESS and startedAt is not set, set it to now
    if (status === 'IN_PROGRESS' && !task.startedAt) {
      updateData.startedAt = now;
    }

    // If status is changing to DONE and completedAt is not set, set it to now
    if (status === 'DONE') {
      // If there are subtasks, ensure they're all done
      if (task.subTasks && task.subTasks.length > 0) {
        const incompleteSubtasks = task.subTasks.filter(t => t.status !== 'DONE');
        if (incompleteSubtasks.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Cannot mark task as DONE when it has incomplete subtasks',
            incompleteSubtasks: incompleteSubtasks.map(t => ({ id: t.id, title: t.title }))
          });
        }
      }
      
      if (!task.completedAt) {
        updateData.completedAt = now;
      }
    }

    // Update the task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        parentTask: {
          select: {
            id: true,
            title: true
          }
        },
        subTasks: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        _count: {
          select: { comments: true, timeLogs: true, timesheets: true }
        }
      }
    });

    // If this task has a parent, check if all siblings are done and update parent status
    if (task.parentTaskId) {
      await checkAndUpdateParentTaskStatus(task.parentTaskId);
    }

    // Calculate progress based on subtasks
    const subTasks = updatedTask.subTasks || [];
    const completedSubTasks = subTasks.filter(t => t.status === 'DONE').length;
    const progress = subTasks.length > 0 
      ? Math.round((completedSubTasks / subTasks.length) * 100) 
      : 0;

    // Format the response
    const response = {
      ...updatedTask,
      progress,
      commentsCount: updatedTask._count.comments,
      timeLogsCount: updatedTask._count.timeLogs,
      timesheetsCount: updatedTask._count.timesheets,
      _count: undefined // Remove the _count field
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task status',
      message: error.message
    });
  }
});

// Helper function to check and update parent task status
async function checkAndUpdateParentTaskStatus(parentTaskId) {
  // Get all non-deleted subtasks of the parent
  const parentTask = await prisma.task.findUnique({
    where: { id: parentTaskId },
    include: {
      subTasks: {
        where: {
          OR: [
            { isDeleted: false },
            { isDeleted: null }
          ]
        },
        select: { id: true, status: true }
      }
    }
  });

  if (!parentTask) return;

  const subTasks = parentTask.subTasks || [];
  
  // If no subtasks, don't change parent status
  if (subTasks.length === 0) return;

  // Check if all subtasks are done
  const allDone = subTasks.every(t => t.status === 'DONE');
  
  // If all subtasks are done, mark parent as done
  if (allDone) {
    await prisma.task.update({
      where: { id: parentTaskId },
      data: { 
        status: 'DONE',
        completedAt: new Date()
      }
    });
  }
  // If parent was DONE but not all subtasks are done anymore, set to IN_PROGRESS
  else if (parentTask.status === 'DONE') {
    await prisma.task.update({
      where: { id: parentTaskId },
      data: { 
        status: 'IN_PROGRESS',
        completedAt: null
      }
    });
  }
}

module.exports = router;
