const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Timesheet:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         projectId:
 *           type: string
 *           format: uuid
 *         taskId:
 *           type: string
 *           format: uuid
 *         date:
 *           type: string
 *           format: date
 *         hoursWorked:
 *           type: number
 *           format: float
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, SUBMITTED, APPROVED, REJECTED]
 *         approvedById:
 *           type: string
 *           format: uuid
 *         approvedAt:
 *           type: string
 *           format: date-time
 *         rejectionReason:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Get all timesheets with filters
router.get('/timesheets', verifyToken, async (req, res) => {
  try {
    const { 
      userId, 
      projectId, 
      taskId, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    
    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;
    if (taskId) where.taskId = taskId;
    if (status) where.status = status;
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); // Include the entire end date
        where.date.lt = end;
      }
    }

    // For regular users, only show their own timesheets
    if (req.user.role !== 'ADMIN' && req.user.role !== 'PROJECT_MANAGER') {
      where.userId = req.user.id;
    }

    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
        where,
        include: {
          user: {
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
          task: {
            select: {
              id: true,
              title: true
            }
          },
          approvedBy: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take
      }),
      prisma.timesheet.count({ where })
    ]);

    res.json({
      success: true,
      data: timesheets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timesheets',
      message: error.message
    });
  }
});

// Get single timesheet
router.get('/timesheets/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
      include: {
        user: {
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
        task: {
          select: {
            id: true,
            title: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found'
      });
    }

    // Check if user has permission to view this timesheet
    if (
      req.user.role !== 'ADMIN' && 
      req.user.role !== 'PROJECT_MANAGER' && 
      timesheet.userId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this timesheet'
      });
    }

    res.json({
      success: true,
      data: timesheet
    });
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timesheet',
      message: error.message
    });
  }
});

// Create a new timesheet
router.post('/timesheets', verifyToken, async (req, res) => {
  try {
    const { projectId, taskId, date, hoursWorked, description } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!projectId || !date || hoursWorked === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Project ID, date, and hours worked are required'
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

    // If taskId is provided, validate it
    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!task) {
        return res.status(400).json({
          success: false,
          error: 'Task not found'
        });
      }

      // Check if task belongs to the specified project
      if (task.projectId !== projectId) {
        return res.status(400).json({
          success: false,
          error: 'Task does not belong to the specified project'
        });
      }
    }

    // Check for duplicate timesheet entry
    const existingTimesheet = await prisma.timesheet.findFirst({
      where: {
        userId,
        projectId,
        taskId: taskId || null,
        date: new Date(date)
      }
    });

    if (existingTimesheet) {
      return res.status(400).json({
        success: false,
        error: 'A timesheet entry already exists for this user, project, task, and date'
      });
    }

    // Create the timesheet
    const timesheet = await prisma.timesheet.create({
      data: {
        userId,
        projectId,
        taskId: taskId || null,
        date: new Date(date),
        hoursWorked: parseFloat(hoursWorked),
        description: description || null,
        status: 'DRAFT'
      },
      include: {
        user: {
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
        task: taskId ? {
          select: {
            id: true,
            title: true
          }
        } : undefined
      }
    });

    res.status(201).json({
      success: true,
      data: timesheet
    });
  } catch (error) {
    console.error('Error creating timesheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create timesheet',
      message: error.message
    });
  }
});

// Update a timesheet
router.put('/timesheets/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId, taskId, date, hoursWorked, description, status } = req.body;
    const userId = req.user.id;

    // Check if timesheet exists
    const existingTimesheet = await prisma.timesheet.findUnique({
      where: { id },
      include: {
        user: true,
        project: true,
        task: true
      }
    });

    if (!existingTimesheet) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found'
      });
    }

    // Check if user has permission to update this timesheet
    if (
      req.user.role !== 'ADMIN' && 
      req.user.role !== 'PROJECT_MANAGER' && 
      existingTimesheet.userId !== userId
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this timesheet'
      });
    }

    // Only allow status updates for managers/admins
    if (status && status !== existingTimesheet.status) {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'PROJECT_MANAGER') {
        return res.status(403).json({
          success: false,
          error: 'Only managers and admins can update timesheet status'
        });
      }

      // If approving/rejecting, set approvedBy and approvedAt
      if (status === 'APPROVED' || status === 'REJECTED') {
        req.body.approvedById = userId;
        req.body.approvedAt = new Date();
      }
    }

    // If projectId is being updated, validate the new project
    if (projectId && projectId !== existingTimesheet.projectId) {
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

    // If taskId is being updated, validate the new task
    if (taskId && taskId !== existingTimesheet.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!task) {
        return res.status(400).json({
          success: false,
          error: 'Task not found'
        });
      }

      // Check if task belongs to the project
      if (task.projectId !== (projectId || existingTimesheet.projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Task does not belong to the specified project'
        });
      }
    }

    // Check for duplicate timesheet entry if date or task is being updated
    if ((date && new Date(date).toISOString() !== existingTimesheet.date.toISOString()) || 
        (taskId && taskId !== existingTimesheet.taskId)) {
      const duplicate = await prisma.timesheet.findFirst({
        where: {
          id: { not: id },
          userId: existingTimesheet.userId,
          projectId: projectId || existingTimesheet.projectId,
          taskId: taskId || existingTimesheet.taskId || null,
          date: date ? new Date(date) : existingTimesheet.date
        }
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          error: 'A timesheet entry already exists for this user, project, task, and date'
        });
      }
    }

    // Update the timesheet
    const updatedTimesheet = await prisma.timesheet.update({
      where: { id },
      data: {
        projectId: projectId || undefined,
        taskId: taskId !== undefined ? (taskId || null) : undefined,
        date: date ? new Date(date) : undefined,
        hoursWorked: hoursWorked !== undefined ? parseFloat(hoursWorked) : undefined,
        description: description !== undefined ? description : undefined,
        status: status || undefined,
        approvedById: req.body.approvedById || undefined,
        approvedAt: req.body.approvedAt || undefined,
        rejectionReason: status === 'REJECTED' ? req.body.rejectionReason || 'Rejected' : 
                         status !== 'REJECTED' ? null : undefined
      },
      include: {
        user: {
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
        task: taskId !== undefined ? {
          select: {
            id: true,
            title: true
          }
        } : undefined,
        approvedBy: status === 'APPROVED' || status === 'REJECTED' ? {
          select: {
            id: true,
            name: true
          }
        } : undefined
      }
    });

    res.json({
      success: true,
      data: updatedTimesheet
    });
  } catch (error) {
    console.error('Error updating timesheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update timesheet',
      message: error.message
    });
  }
});

// Delete a timesheet
router.delete('/timesheets/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if timesheet exists
    const timesheet = await prisma.timesheet.findUnique({
      where: { id }
    });

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found'
      });
    }

    // Check if user has permission to delete this timesheet
    if (
      req.user.role !== 'ADMIN' && 
      req.user.role !== 'PROJECT_MANAGER' && 
      timesheet.userId !== userId
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this timesheet'
      });
    }

    // Prevent deletion of approved timesheets unless admin
    if (timesheet.status === 'APPROVED' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Approved timesheets can only be deleted by administrators'
      });
    }

    // Delete the timesheet
    await prisma.timesheet.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Timesheet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting timesheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete timesheet',
      message: error.message
    });
  }
});

// Submit a timesheet for approval
router.post('/timesheets/:id/submit', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if timesheet exists
    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
      include: {
        user: true,
        project: true
      }
    });

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found'
      });
    }

    // Check if user owns the timesheet
    if (timesheet.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only submit your own timesheets'
      });
    }

    // Check if timesheet is in draft status
    if (timesheet.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: 'Only draft timesheets can be submitted'
      });
    }

    // Update the timesheet status to SUBMITTED
    const updatedTimesheet = await prisma.timesheet.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      include: {
        user: {
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
        task: timesheet.taskId ? {
          select: {
            id: true,
            title: true
          }
        } : undefined
      }
    });

    // TODO: Notify project manager/approver about the submission

    res.json({
      success: true,
      data: updatedTimesheet
    });
  } catch (error) {
    console.error('Error submitting timesheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit timesheet',
      message: error.message
    });
  }
});

// Approve a timesheet
router.post('/timesheets/:id/approve', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const approverId = req.user.id;

    // Check if user is authorized to approve timesheets
    if (req.user.role !== 'ADMIN' && req.user.role !== 'PROJECT_MANAGER') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators and project managers can approve timesheets'
      });
    }

    // Check if timesheet exists
    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
      include: {
        user: true,
        project: true,
        task: true
      }
    });

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found'
      });
    }

    // Check if timesheet is in SUBMITTED status
    if (timesheet.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        error: 'Only submitted timesheets can be approved'
      });
    }

    // Check if the approver is a project manager for this timesheet's project
    if (req.user.role === 'PROJECT_MANAGER') {
      const isManager = await prisma.projectManager.findFirst({
        where: {
          userId: approverId,
          projectId: timesheet.projectId
        }
      });

      if (!isManager) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to approve timesheets for this project'
        });
      }
    }

    // Update the timesheet status to APPROVED
    const updatedTimesheet = await prisma.timesheet.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: approverId,
        approvedAt: new Date(),
        approvalNotes: notes || null
      },
      include: {
        user: {
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
        task: timesheet.taskId ? {
          select: {
            id: true,
            title: true
          }
        } : undefined,
        approvedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // TODO: Notify the user that their timesheet has been approved

    res.json({
      success: true,
      data: updatedTimesheet
    });
  } catch (error) {
    console.error('Error approving timesheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve timesheet',
      message: error.message
    });
  }
});

// Reject a timesheet
router.post('/timesheets/:id/reject', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const approverId = req.user.id;

    // Check if rejection reason is provided
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }

    // Check if user is authorized to reject timesheets
    if (req.user.role !== 'ADMIN' && req.user.role !== 'PROJECT_MANAGER') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators and project managers can reject timesheets'
      });
    }

    // Check if timesheet exists
    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
      include: {
        user: true,
        project: true,
        task: true
      }
    });

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found'
      });
    }

    // Check if timesheet is in SUBMITTED status
    if (timesheet.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        error: 'Only submitted timesheets can be rejected'
      });
    }

    // Check if the approver is a project manager for this timesheet's project
    if (req.user.role === 'PROJECT_MANAGER') {
      const isManager = await prisma.projectManager.findFirst({
        where: {
          userId: approverId,
          projectId: timesheet.projectId
        }
      });

      if (!isManager) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to reject timesheets for this project'
        });
      }
    }

    // Update the timesheet status to REJECTED
    const updatedTimesheet = await prisma.timesheet.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedById: approverId,
        approvedAt: new Date(),
        rejectionReason: reason.trim()
      },
      include: {
        user: {
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
        task: timesheet.taskId ? {
          select: {
            id: true,
            title: true
          }
        } : undefined,
        approvedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // TODO: Notify the user that their timesheet has been rejected

    res.json({
      success: true,
      data: updatedTimesheet
    });
  } catch (error) {
    console.error('Error rejecting timesheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject timesheet',
      message: error.message
    });
  }
});

module.exports = router;
