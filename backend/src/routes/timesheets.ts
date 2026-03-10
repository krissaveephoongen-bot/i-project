import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, asc, inArray, between } from 'drizzle-orm';
import { db } from '@/lib/database';
import { timesheets, actualLaborCosts, users, tasks, projects, laborRates } from '@/lib/schema';
import { 
  withAuth,
  withPermission,
  withProjectContext,
  createErrorResponse,
  createSuccessResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  addCorsHeaders
} from '@/lib/express-middleware';

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const createTimesheetSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  taskId: z.string().min(1, 'Task is required'),
  date: z.string().min(1, 'Date is required'),
  workType: z.enum(['project', 'office', 'training', 'leave', 'overtime', 'other', 'non_billable']).default('project'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  hours: z.number().min(0.1, 'Hours must be at least 0.1').max(24, 'Hours cannot exceed 24'),
  breakMinutes: z.number().min(0).max(480).default(0), // Max 8 hours break
  description: z.string().min(3, 'Description must be at least 3 characters'),
  notes: z.string().optional(),
  accomplishments: z.string().optional(),
  billable: z.boolean().default(true),
});

const updateTimesheetSchema = createTimesheetSchema.partial();

const approveTimesheetSchema = z.object({
  action: z.enum(['approved', 'rejected']),
  comments: z.string().optional(),
  rejectionReason: z.string().optional(),
});

const timesheetQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  userId: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  status: z.enum(['all', 'pending', 'approved', 'rejected']).default('all'),
  workType: z.enum(['all', 'project', 'office', 'training', 'leave', 'overtime', 'other']).default('all'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['date', 'hours', 'status', 'createdAt', 'laborCost']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeActualCost: z.boolean().default(false),
});

// ============================================================
// TIMESHEET ROUTES
// ============================================================

/**
 * GET /api/projects/:projectId/timesheets
 * Get all timesheets for a project with filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.read')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to read timesheets'));
    }

    const projectId = contextResult.projectId!;

    // Validate query parameters
    const validation = timesheetQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const { 
      page, 
      limit, 
      userId, 
      taskId, 
      status, 
      workType, 
      dateFrom, 
      dateTo, 
      sortBy, 
      sortOrder,
      includeActualCost
    } = validation.data;

    // Build query
    let query = db.select().from(timesheets).where(eq(timesheets.projectId, projectId));

    // Apply filters
    const conditions = [eq(timesheets.projectId, projectId)];
    
    if (userId) {
      conditions.push(eq(timesheets.userId, userId));
    }
    
    if (taskId) {
      conditions.push(eq(timesheets.taskId, taskId));
    }
    
    if (status !== 'all') {
      conditions.push(eq(timesheets.status, status));
    }
    
    if (workType !== 'all') {
      conditions.push(eq(timesheets.workType, workType));
    }

    if (dateFrom && dateTo) {
      conditions.push(between(timesheets.date, dateFrom, dateTo));
    } else if (dateFrom) {
      conditions.push(eq(timesheets.date, dateFrom));
    }

    if (conditions.length > 1) {
      query = db.select().from(timesheets).where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = {
      date: timesheets.date,
      hours: timesheets.hours,
      status: timesheets.status,
      createdAt: timesheets.createdAt,
      laborCost: timesheets.laborCost
    }[sortBy] || timesheets.date;

    query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

    // Get total count for pagination
    const totalCount = await db.select({ count: timesheets.id }).from(timesheets)
      .where(eq(timesheets.projectId, projectId));
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    // Execute query
    const timesheetList = await query;

    // Get relations for each timesheet
    const timesheetsWithRelations = await Promise.all(
      timesheetList.map(async (timesheet) => {
        const [user, task, actualCost] = await Promise.all([
          db.select().from(users).where(eq(users.id, timesheet.userId)).limit(1),
          db.select().from(tasks).where(eq(tasks.id, timesheet.taskId)).limit(1),
          includeActualCost 
            ? db.select().from(actualLaborCosts).where(eq(actualLaborCosts.timesheetId, timesheet.id)).limit(1)
            : []
        ]);

        return {
          ...timesheet,
          user: user[0] || null,
          task: task[0] || null,
          actualLaborCost: actualCost[0] || null
        };
      })
    );

    // Calculate pagination
    const totalPages = Math.ceil(totalCount.length / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return response
    res.status(200).json(createSuccessResponse({
      timesheets: timesheetsWithRelations,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        pages: totalPages,
        hasNext,
        hasPrevious
      }
    }, 'Timesheets retrieved successfully'));
  } catch (error: any) {
    console.error('Get timesheets error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/timesheets/:id
 * Get a specific timesheet by ID
 */
router.get('/:id', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.read')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to read timesheets'));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Get timesheet
    const timesheet = await db.select().from(timesheets)
      .where(and(eq(timesheets.id, id), eq(timesheets.projectId, projectId)))
      .limit(1);
    
    if (!timesheet[0]) {
      return res.status(404).json(createErrorResponse('Timesheet not found', 404));
    }

    // Get relations
    const [user, task, actualCost] = await Promise.all([
      db.select().from(users).where(eq(users.id, timesheet[0].userId)).limit(1),
      db.select().from(tasks).where(eq(tasks.id, timesheet[0].taskId)).limit(1),
      db.select().from(actualLaborCosts).where(eq(actualLaborCosts.timesheetId, timesheet[0].id)).limit(1)
    ]);

    const timesheetWithRelations = {
      ...timesheet[0],
      user: user[0] || null,
      task: task[0] || null,
      actualLaborCost: actualCost[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(timesheetWithRelations, 'Timesheet retrieved successfully'));
  } catch (error: any) {
    console.error('Get timesheet error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/timesheets
 * Create a new timesheet entry
 */
router.post('/', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.create')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to create timesheets'));
    }

    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = createTimesheetSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const timesheetData = validation.data;

    // Validate that task belongs to the project
    const task = await db.select().from(tasks)
      .where(and(eq(tasks.id, timesheetData.taskId), eq(tasks.projectId, projectId)))
      .limit(1);
    
    if (!task[0]) {
      return res.status(400).json(createErrorResponse('Task does not belong to this project', 400));
    }

    // Get user's current labor rate
    const userLaborRate = await db.select().from(laborRates)
      .where(and(
        eq(laborRates.role, contextResult.user.role || 'employee'),
        eq(laborRates.isActive, true)
      ))
      .orderBy(desc(laborRates.effectiveDate))
      .limit(1);

    const hourlyRate = userLaborRate[0]?.hourlyRate || contextResult.user.hourlyRate || '0';
    const numericHourlyRate = parseFloat(hourlyRate.toString());

    // Auto-set billable to false for non_billable work type
    const isBillable = timesheetData.workType === 'non_billable' ? false : timesheetData.billable;

    // Calculate labor cost (still calculate for tracking, but will be 0 for non_billable)
    const laborCost = isBillable ? timesheetData.hours * numericHourlyRate : 0;
    const billableHours = isBillable ? 
      Math.max(0, timesheetData.hours - (timesheetData.breakMinutes / 60)) : 0;
    const chargeAmount = billableHours * numericHourlyRate;

    // Create timesheet
    const newTimesheet = await db.insert(timesheets).values({
      ...timesheetData,
      userId: contextResult.user.id,
      hourlyRate: numericHourlyRate.toString(),
      laborCost: laborCost.toString(),
      currency: 'THB',
      billable: isBillable,
      billableHours: billableHours.toString(),
      chargeAmount: chargeAmount.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Get relations for the new timesheet
    const [user, taskRelation] = await Promise.all([
      db.select().from(users).where(eq(users.id, contextResult.user.id)).limit(1),
      db.select().from(tasks).where(eq(tasks.id, timesheetData.taskId)).limit(1)
    ]);

    const timesheetWithRelations = {
      ...newTimesheet[0],
      user: user[0] || null,
      task: taskRelation[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(timesheetWithRelations, 'Timesheet created successfully'));
  } catch (error: any) {
    console.error('Create timesheet error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * PUT /api/projects/:projectId/timesheets/:id
 * Update a timesheet entry
 */
router.put('/:id', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions (users can update their own timesheets, PMs can update any)
    const canUpdateAny = contextResult.user.permissions.some((p: any) => p.name === 'projects.update');
    
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const updateData = validation.data;

    // Check if timesheet exists and user has permission
    const existingTimesheet = await db.select().from(timesheets)
      .where(and(eq(timesheets.id, id), eq(timesheets.projectId, projectId)))
      .limit(1);
    
    if (!existingTimesheet[0]) {
      return res.status(404).json(createErrorResponse('Timesheet not found', 404));
    }

    // Check permission: users can only update their own timesheets unless they have update permission
    if (!canUpdateAny && existingTimesheet[0].userId !== contextResult.user.id) {
      return res.status(403).json(forbiddenResponse('You can only update your own timesheets'));
    }

    // Check if timesheet is already approved
    if (existingTimesheet[0].status === 'approved') {
      return res.status(400).json(createErrorResponse('Cannot update approved timesheet', 400));
    }

    // Validate task belongs to project if being updated
    if (updateData.taskId) {
      const task = await db.select().from(tasks)
        .where(and(eq(tasks.id, updateData.taskId), eq(tasks.projectId, projectId)))
        .limit(1);
      
      if (!task[0]) {
        return res.status(400).json(createErrorResponse('Task does not belong to this project', 400));
      }
    }

    // Recalculate costs if hours or billable status changed
    let newHourlyRate = existingTimesheet[0].hourlyRate;
    let newLaborCost = existingTimesheet[0].laborCost;
    let newBillableHours = existingTimesheet[0].billableHours;
    let newChargeAmount = existingTimesheet[0].chargeAmount;

    if (updateData.hours !== undefined || updateData.billable !== undefined || updateData.breakMinutes !== undefined) {
      const hours = updateData.hours ?? parseFloat(existingTimesheet[0].hours.toString());
      const billable = updateData.billable ?? existingTimesheet[0].billable;
      const breakMinutes = updateData.breakMinutes ?? existingTimesheet[0].breakMinutes;
      
      newBillableHours = billable ? Math.max(0, hours - (breakMinutes / 60)) : 0;
      newLaborCost = hours * parseFloat(newHourlyRate.toString());
      newChargeAmount = newBillableHours * parseFloat(newHourlyRate.toString());

      updateData.laborCost = newLaborCost.toString();
      updateData.billableHours = newBillableHours.toString();
      updateData.chargeAmount = newChargeAmount.toString();
    }

    // Update timesheet
    const updatedTimesheet = await db.update(timesheets)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(eq(timesheets.id, id), eq(timesheets.projectId, projectId)))
      .returning();

    // Get relations for the updated timesheet
    const [user, taskRelation] = await Promise.all([
      db.select().from(users).where(eq(users.id, updatedTimesheet[0].userId)).limit(1),
      db.select().from(tasks).where(eq(tasks.id, updatedTimesheet[0].taskId)).limit(1)
    ]);

    const timesheetWithRelations = {
      ...updatedTimesheet[0],
      user: user[0] || null,
      task: taskRelation[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(timesheetWithRelations, 'Timesheet updated successfully'));
  } catch (error: any) {
    console.error('Update timesheet error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * DELETE /api/projects/:projectId/timesheets/:id
 * Delete a timesheet entry
 */
router.delete('/:id', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    const canDeleteAny = contextResult.user.permissions.some((p: any) => p.name === 'projects.delete');
    
    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Check if timesheet exists
    const existingTimesheet = await db.select().from(timesheets)
      .where(and(eq(timesheets.id, id), eq(timesheets.projectId, projectId)))
      .limit(1);
    
    if (!existingTimesheet[0]) {
      return res.status(404).json(createErrorResponse('Timesheet not found', 404));
    }

    // Check permission: users can only delete their own timesheets unless they have delete permission
    if (!canDeleteAny && existingTimesheet[0].userId !== contextResult.user.id) {
      return res.status(403).json(forbiddenResponse('You can only delete your own timesheets'));
    }

    // Check if timesheet is already approved
    if (existingTimesheet[0].status === 'approved') {
      return res.status(400).json(createErrorResponse('Cannot delete approved timesheet', 400));
    }

    // Delete timesheet (cascade delete should handle actual labor cost)
    await db.delete(timesheets).where(and(eq(timesheets.id, id), eq(timesheets.projectId, projectId)));

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(null, 'Timesheet deleted successfully'));
  } catch (error: any) {
    console.error('Delete timesheet error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/timesheets/:id/approve
 * Approve or reject a timesheet
 */
router.post('/:id/approve', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions (only PMs can approve timesheets)
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.approve')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to approve timesheets'));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = approveTimesheetSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const { action, comments, rejectionReason } = validation.data;

    // Check if timesheet exists
    const existingTimesheet = await db.select().from(timesheets)
      .where(and(eq(timesheets.id, id), eq(timesheets.projectId, projectId)))
      .limit(1);
    
    if (!existingTimesheet[0]) {
      return res.status(404).json(createErrorResponse('Timesheet not found', 404));
    }

    // Check if timesheet is already processed
    if (existingTimesheet[0].status !== 'pending') {
      return res.status(400).json(createErrorResponse('Timesheet has already been processed', 400));
    }

    // Update timesheet status
    const updateData: any = {
      status: action,
      updatedAt: new Date()
    };

    if (action === 'approved') {
      updateData.approvedBy = contextResult.user.id;
      updateData.approvedAt = new Date();
    } else if (action === 'rejected') {
      updateData.rejectedBy = contextResult.user.id;
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = rejectionReason;
    }

    const updatedTimesheet = await db.update(timesheets)
      .set(updateData)
      .where(and(eq(timesheets.id, id), eq(timesheets.projectId, projectId)))
      .returning();

    // If approved, create actual labor cost record
    if (action === 'approved') {
      const timesheet = updatedTimesheet[0];
      const date = new Date(timesheet.date);
      
      // Calculate period start dates
      const weekStartDate = getWeekStartDate(date);
      const monthStartDate = getMonthStartDate(date);
      const quarterStartDate = getQuarterStartDate(date);
      const yearStartDate = getYearStartDate(date);

      await db.insert(actualLaborCosts).values({
        timesheetId: timesheet.id,
        projectId: timesheet.projectId,
        userId: timesheet.userId,
        taskId: timesheet.taskId,
        date: timesheet.date,
        hours: timesheet.hours,
        hourlyRate: timesheet.hourlyRate,
        laborCost: timesheet.laborCost,
        currency: timesheet.currency || 'THB',
        billable: timesheet.billable,
        billableHours: timesheet.billableHours,
        chargeAmount: timesheet.chargeAmount,
        weekStartDate,
        monthStartDate,
        quarterStartDate,
        yearStartDate,
        approvedBy: contextResult.user.id,
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`Created actual labor cost record for timesheet ${timesheet.id}: ${timesheet.laborCost} ${timesheet.currency}`);
    }

    // Get relations for the updated timesheet
    const [user, taskRelation] = await Promise.all([
      db.select().from(users).where(eq(users.id, updatedTimesheet[0].userId)).limit(1),
      db.select().from(tasks).where(eq(tasks.id, updatedTimesheet[0].taskId)).limit(1)
    ]);

    const timesheetWithRelations = {
      ...updatedTimesheet[0],
      user: user[0] || null,
      task: taskRelation[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(
      timesheetWithRelations, 
      `Timesheet ${action} successfully`
    ));
  } catch (error: any) {
    console.error('Approve timesheet error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/timesheets/summary
 * Get timesheet summary for a project
 */
router.get('/summary', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.read')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to read timesheets'));
    }

    const projectId = contextResult.projectId!;

    // Get all timesheets for the project
    const allTimesheets = await db.select().from(timesheets).where(eq(timesheets.projectId, projectId));

    // Calculate summary
    const totalTimesheets = allTimesheets.length;
    const pendingTimesheets = allTimesheets.filter(t => t.status === 'pending').length;
    const approvedTimesheets = allTimesheets.filter(t => t.status === 'approved').length;
    const rejectedTimesheets = allTimesheets.filter(t => t.status === 'rejected').length;

    const totalHours = allTimesheets.reduce((sum, t) => sum + Number(t.hours || 0), 0);
    const totalLaborCost = allTimesheets.reduce((sum, t) => sum + Number(t.laborCost || 0), 0);
    const totalBillableHours = allTimesheets.reduce((sum, t) => sum + Number(t.billableHours || 0), 0);
    const totalChargeAmount = allTimesheets.reduce((sum, t) => sum + Number(t.chargeAmount || 0), 0);

    const approvedHours = allTimesheets.filter(t => t.status === 'approved').reduce((sum, t) => sum + Number(t.hours || 0), 0);
    const approvedLaborCost = allTimesheets.filter(t => t.status === 'approved').reduce((sum, t) => sum + Number(t.laborCost || 0), 0);

    // Group by user
    const userStats = allTimesheets.reduce((acc, timesheet) => {
      const userId = timesheet.userId;
      if (!acc[userId]) {
        acc[userId] = {
          totalHours: 0,
          totalCost: 0,
          approvedHours: 0,
          approvedCost: 0,
          pendingCount: 0,
          approvedCount: 0
        };
      }
      acc[userId].totalHours += Number(timesheet.hours || 0);
      acc[userId].totalCost += Number(timesheet.laborCost || 0);
      if (timesheet.status === 'approved') {
        acc[userId].approvedHours += Number(timesheet.hours || 0);
        acc[userId].approvedCost += Number(timesheet.laborCost || 0);
        acc[userId].approvedCount++;
      } else if (timesheet.status === 'pending') {
        acc[userId].pendingCount++;
      }
      return acc;
    }, {} as Record<string, any>);

    // Group by task
    const taskStats = allTimesheets.reduce((acc, timesheet) => {
      const taskId = timesheet.taskId;
      if (!acc[taskId]) {
        acc[taskId] = {
          totalHours: 0,
          totalCost: 0,
          approvedHours: 0,
          approvedCost: 0,
          timesheetCount: 0
        };
      }
      acc[taskId].totalHours += Number(timesheet.hours || 0);
      acc[taskId].totalCost += Number(timesheet.laborCost || 0);
      acc[taskId].timesheetCount++;
      if (timesheet.status === 'approved') {
        acc[taskId].approvedHours += Number(timesheet.hours || 0);
        acc[taskId].approvedCost += Number(timesheet.laborCost || 0);
      }
      return acc;
    }, {} as Record<string, any>);

    const summary = {
      counts: {
        total: totalTimesheets,
        pending: pendingTimesheets,
        approved: approvedTimesheets,
        rejected: rejectedTimesheets
      },
      hours: {
        total: totalHours,
        approved: approvedHours,
        pending: totalHours - approvedHours
      },
      costs: {
        totalLaborCost: totalLaborCost,
        approvedLaborCost: approvedLaborCost,
        pendingLaborCost: totalLaborCost - approvedLaborCost,
        totalChargeAmount: totalChargeAmount,
        approvedChargeAmount: allTimesheets.filter(t => t.status === 'approved').reduce((sum, t) => sum + Number(t.chargeAmount || 0), 0)
      },
      userStats,
      taskStats
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(summary, 'Timesheet summary retrieved successfully'));
  } catch (error: any) {
    console.error('Get timesheet summary error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getMonthStartDate(date: Date): string {
  const d = new Date(date);
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

function getQuarterStartDate(date: Date): string {
  const d = new Date(date);
  const month = d.getMonth();
  const quarter = Math.floor(month / 3);
  d.setMonth(quarter * 3, 1);
  return d.toISOString().split('T')[0];
}

function getYearStartDate(date: Date): string {
  const d = new Date(date);
  d.setMonth(0, 1);
  return d.toISOString().split('T')[0];
}

export default router;
