import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, asc } from 'drizzle-orm';
import { db } from '@/lib/database';
import { milestones, projects } from '@/lib/schema';
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

const createMilestoneSchema = z.object({
  title: z.string().min(3, 'Milestone title must be at least 3 characters'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().default('THB'),
  paymentTerms: z.string().optional(),
  status: z.enum(['pending', 'invoiced', 'paid', 'overdue']).default('pending'),
  wbsCode: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});

const updateMilestoneSchema = createMilestoneSchema.partial();

const milestoneQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  status: z.enum(['all', 'pending', 'invoiced', 'paid', 'overdue']).default('all'),
  sortBy: z.enum(['title', 'dueDate', 'amount', 'status', 'createdAt']).default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================================
// MILESTONE ROUTES
// ============================================================

/**
 * GET /api/projects/:projectId/milestones
 * Get all milestones for a project
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
      return res.status(403).json(forbiddenResponse('Insufficient permissions to read milestones'));
    }

    const projectId = contextResult.projectId!;

    // Validate query parameters
    const validation = milestoneQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const { page, limit, status, sortBy, sortOrder } = validation.data;

    // Build query
    let query = db.select().from(milestones).where(eq(milestones.projectId, projectId));

    // Apply status filter
    if (status !== 'all') {
      query = query.where(and(eq(milestones.projectId, projectId), eq(milestones.status, status)));
    }

    // Apply sorting
    const sortColumn = {
      title: milestones.title,
      dueDate: milestones.dueDate,
      amount: milestones.amount,
      status: milestones.status,
      createdAt: milestones.createdAt
    }[sortBy] || milestones.dueDate;

    query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

    // Get total count for pagination
    const totalCount = await db.select({ count: milestones.id }).from(milestones)
      .where(eq(milestones.projectId, projectId));
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    // Execute query
    const milestoneList = await query;

    // Calculate pagination
    const totalPages = Math.ceil(totalCount.length / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return response
    res.status(200).json(createSuccessResponse({
      milestones: milestoneList,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        pages: totalPages,
        hasNext,
        hasPrevious
      }
    }, 'Milestones retrieved successfully'));
  } catch (error: any) {
    console.error('Get milestones error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/milestones/:id
 * Get a specific milestone by ID
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
      return res.status(403).json(forbiddenResponse('Insufficient permissions to read milestones'));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Get milestone
    const milestone = await db.select().from(milestones)
      .where(and(eq(milestones.id, id), eq(milestones.projectId, projectId)))
      .limit(1);
    
    if (!milestone[0]) {
      return res.status(404).json(createErrorResponse('Milestone not found', 404));
    }

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(milestone[0], 'Milestone retrieved successfully'));
  } catch (error: any) {
    console.error('Get milestone error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/milestones
 * Create new milestones (bulk)
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
      return res.status(403).json(forbiddenResponse('Insufficient permissions to create milestones'));
    }

    const projectId = contextResult.projectId!;

    // Validate request body - can be single milestone or array
    const milestoneData = Array.isArray(req.body) ? req.body : [req.body];
    
    const validation = z.array(createMilestoneSchema).safeParse(milestoneData);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const validatedMilestones = validation.data;

    // Check if project exists
    const existingProject = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    
    if (!existingProject[0]) {
      return res.status(404).json(createErrorResponse('Project not found', 404));
    }

    // Create milestones
    const milestoneInserts = validatedMilestones.map(milestone => ({
      ...milestone,
      projectId,
      createdBy: contextResult.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const newMilestones = await db.insert(milestones).values(milestoneInserts).returning();

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(newMilestones, 'Milestones created successfully'));
  } catch (error: any) {
    console.error('Create milestones error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * PUT /api/projects/:projectId/milestones/:id
 * Update a milestone
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

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.update')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to update milestones'));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = updateMilestoneSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const updateData = validation.data;

    // Check if milestone exists
    const existingMilestone = await db.select().from(milestones)
      .where(and(eq(milestones.id, id), eq(milestones.projectId, projectId)))
      .limit(1);
    
    if (!existingMilestone[0]) {
      return res.status(404).json(createErrorResponse('Milestone not found', 404));
    }

    // Update milestone
    const updatedMilestone = await db.update(milestones)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(eq(milestones.id, id), eq(milestones.projectId, projectId)))
      .returning();

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(updatedMilestone[0], 'Milestone updated successfully'));
  } catch (error: any) {
    console.error('Update milestone error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * DELETE /api/projects/:projectId/milestones/:id
 * Delete a milestone
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
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.delete')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to delete milestones'));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Check if milestone exists
    const existingMilestone = await db.select().from(milestones)
      .where(and(eq(milestones.id, id), eq(milestones.projectId, projectId)))
      .limit(1);
    
    if (!existingMilestone[0]) {
      return res.status(404).json(createErrorResponse('Milestone not found', 404));
    }

    // Delete milestone
    await db.delete(milestones).where(and(eq(milestones.id, id), eq(milestones.projectId, projectId)));

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(null, 'Milestone deleted successfully'));
  } catch (error: any) {
    console.error('Delete milestone error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/milestones/summary
 * Get milestone summary for a project
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
      return res.status(403).json(forbiddenResponse('Insufficient permissions to read milestones'));
    }

    const projectId = contextResult.projectId!;

    // Get all milestones for the project
    const allMilestones = await db.select().from(milestones).where(eq(milestones.projectId, projectId));

    // Calculate summary
    const totalMilestones = allMilestones.length;
    const completedMilestones = allMilestones.filter(m => m.status === 'paid').length;
    const pendingMilestones = allMilestones.filter(m => m.status === 'pending').length;
    const invoicedMilestones = allMilestones.filter(m => m.status === 'invoiced').length;
    const overdueMilestones = allMilestones.filter(m => m.status === 'overdue').length;

    const totalAmount = allMilestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);
    const paidAmount = allMilestones.filter(m => m.status === 'paid').reduce((sum, m) => sum + Number(m.amount || 0), 0);
    const pendingAmount = allMilestones.filter(m => m.status === 'pending').reduce((sum, m) => sum + Number(m.amount || 0), 0);

    const completionPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    const paymentCompletionPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    const summary = {
      counts: {
        total: totalMilestones,
        completed: completedMilestones,
        pending: pendingMilestones,
        invoiced: invoicedMilestones,
        overdue: overdueMilestones
      },
      amounts: {
        total: totalAmount,
        paid: paidAmount,
        pending: pendingAmount,
        remaining: totalAmount - paidAmount
      },
      percentages: {
        completion: completionPercentage,
        paymentCompletion: paymentCompletionPercentage
      }
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(summary, 'Milestone summary retrieved successfully'));
  } catch (error: any) {
    console.error('Get milestone summary error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

export default router;
