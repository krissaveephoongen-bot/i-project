/**
 * Timesheet API Routes
 * Handles all time entry related HTTP endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import TimesheetService from '../features/timesheet/TimesheetService';
import TimesheetConcurrentController from '../features/timesheet/timesheet.concurrent.controller';
import { AppError } from '../shared/errors/AppError';

const router = Router();

// Middleware to require auth (you may need to adjust based on your auth setup)
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    throw new AppError(401, 'Authentication required');
  }
  next();
};

// ============================================================================
// TIME ENTRY ROUTES
// ============================================================================

/**
 * POST /api/timesheet/check-concurrent
 * Check for concurrent work and potential duplicates
 */
router.post('/check-concurrent', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add user to req for controller
    req.user = { ...req.user, id: req.user?.id };
    await TimesheetConcurrentController.checkConcurrentWork(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/timesheet/entries
 * Create a new time entry
 */
router.post('/entries', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, startTime, endTime, breakDuration, workType, projectId, taskId, description, isConcurrent, concurrentReason, chargeable, chargeAmount } = req.body;

    const entry = await TimesheetService.createTimeEntry({
      date,
      startTime,
      endTime,
      breakDuration,
      workType,
      projectId,
      taskId,
      userId: req.user.id,
      description,
      isConcurrent,
      concurrentReason,
      chargeable,
      chargeAmount,
    });

    res.status(201).json({
      success: true,
      data: entry,
      message: 'Time entry created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/timesheet/entries/:id
 * Get a single time entry by ID
 */
router.get('/entries/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const entry = await TimesheetService.getTimeEntry(id);

    // Check authorization
    if (entry.userId !== req.user.id && req.user.role !== 'admin') {
      throw new AppError(403, 'Not authorized to view this time entry');
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/timesheet/entries?month=MM&year=YYYY
 * Get time entries for a user in a specific month
 */
router.get('/entries', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year, userId } = req.query;

    // Check authorization
    const targetUserId = userId && req.user.role === 'admin' ? (userId as string) : req.user.id;
    if (userId && userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
      throw new AppError(403, 'Not authorized to view other users time entries');
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const entries = await TimesheetService.getUserTimeEntries(
      targetUserId,
      parseInt(month as string) || currentMonth,
      parseInt(year as string) || currentYear
    );

    res.json({
      success: true,
      data: entries,
      count: entries.length,
      month: parseInt(month as string) || currentMonth,
      year: parseInt(year as string) || currentYear,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/timesheet/entries/:id
 * Update a time entry
 */
router.put('/entries/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, breakDuration, workType, projectId, taskId, description } = req.body;

    // Get entry to check authorization
    const entry = await TimesheetService.getTimeEntry(id);
    if (entry.userId !== req.user.id && req.user.role !== 'admin') {
      throw new AppError(403, 'Not authorized to update this time entry');
    }

    const updated = await TimesheetService.updateTimeEntry(id, {
      date,
      startTime,
      endTime,
      breakDuration,
      workType,
      projectId,
      taskId,
      userId: req.user.id,
      description,
    });

    res.json({
      success: true,
      data: updated,
      message: 'Time entry updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/timesheet/entries/:id
 * Delete a time entry
 */
router.delete('/entries/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Get entry to check authorization
    const entry = await TimesheetService.getTimeEntry(id);
    if (entry.userId !== req.user.id && req.user.role !== 'admin') {
      throw new AppError(403, 'Not authorized to delete this time entry');
    }

    await TimesheetService.deleteTimeEntry(id);

    res.json({
      success: true,
      message: 'Time entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// APPROVAL ROUTES
// ============================================================================

/**
 * POST /api/timesheet/entries/:id/approve
 * Approve a time entry
 */
router.post('/entries/:id/approve', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Only managers and admins can approve
    if (!['manager', 'admin'].includes(req.user.role)) {
      throw new AppError(403, 'Only managers can approve time entries');
    }

    const approved = await TimesheetService.approveTimeEntry(id, req.user.id);

    res.json({
      success: true,
      data: approved,
      message: 'Time entry approved successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/timesheet/entries/:id/reject
 * Reject a time entry
 */
router.post('/entries/:id/reject', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new AppError(400, 'Rejection reason is required');
    }

    // Only managers and admins can reject
    if (!['manager', 'admin'].includes(req.user.role)) {
      throw new AppError(403, 'Only managers can reject time entries');
    }

    const rejected = await TimesheetService.rejectTimeEntry(id, reason);

    res.json({
      success: true,
      data: rejected,
      message: 'Time entry rejected successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// COMMENT ROUTES
// ============================================================================

/**
 * POST /api/timesheet/entries/:id/comments
 * Add a comment to a time entry
 */
router.post('/entries/:id/comments', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      throw new AppError(400, 'Comment text is required');
    }

    const comment = await TimesheetService.addComment(id, req.user.id, text);

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/timesheet/entries/:id/comments
 * Get all comments for a time entry
 */
router.get('/entries/:id/comments', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const comments = await TimesheetService.getComments(id);

    res.json({
      success: true,
      data: comments,
      count: comments.length,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// CALCULATION ROUTES
// ============================================================================

/**
 * GET /api/timesheet/hours/monthly?month=MM&year=YYYY
 * Get total hours for a month
 */
router.get('/hours/monthly', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year, userId } = req.query;

    // Check authorization
    const targetUserId = userId && req.user.role === 'admin' ? (userId as string) : req.user.id;
    if (userId && userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
      throw new AppError(403, 'Not authorized');
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const hours = await TimesheetService.getMonthlyHours(
      targetUserId,
      parseInt(month as string) || currentMonth,
      parseInt(year as string) || currentYear
    );

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        month: parseInt(month as string) || currentMonth,
        year: parseInt(year as string) || currentYear,
        totalHours: hours,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/timesheet/hours/project/:projectId
 * Get billable hours for a project
 */
router.get('/hours/project/:projectId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const { month, year } = req.query;

    const hours = await TimesheetService.getProjectHours(
      projectId,
      month ? parseInt(month as string) : undefined,
      year ? parseInt(year as string) : undefined
    );

    res.json({
      success: true,
      data: {
        projectId,
        month: month ? parseInt(month as string) : undefined,
        year: year ? parseInt(year as string) : undefined,
        billableHours: hours,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  if (error.code === 'P2025') {
    // Prisma not found error
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
    });
  }

  if (error.code === 'P2003') {
    // Prisma foreign key error
    return res.status(400).json({
      success: false,
      message: 'Invalid reference ID (project, task, or user not found)',
    });
  }

  console.error('Timesheet route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

export default router;
