import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, asc, between, sum, count, sql } from 'drizzle-orm';
import { db } from '@/lib/database';
import { 
  projects, 
  users, 
  cutoverPhases,
  readinessChecklists,
  cutoverRunbookTasks,
  acceptanceSignoffs,
  cutoverIncidents,
  vendorContracts,
  vendorPaymentMilestones
} from '@/lib/schema';
import { 
  withAuth,
  withPermission,
  withProjectContext,
  createErrorResponse,
  createSuccessResponse,
  addCorsHeaders
} from '@/lib/express-middleware';

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const createCutoverPhaseSchema = z.object({
  phaseName: z.string().min(3, 'Phase name must be at least 3 characters'),
  phaseDescription: z.string().optional(),
  phaseType: z.enum(['planning', 'preparation', 'execution', 'validation', 'post_cutover']),
  scheduledStartDate: z.string().min(1, 'Scheduled start date is required'),
  scheduledEndDate: z.string().min(1, 'Scheduled end date is required'),
  estimatedDuration: z.number().min(1, 'Estimated duration must be positive'),
  phaseLead: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  rollbackPlan: z.string().optional(),
  rollbackConditions: z.array(z.string()).optional(),
  prerequisitePhases: z.array(z.string()).optional(),
  dependentPhases: z.array(z.string()).optional(),
});

const updateCutoverPhaseSchema = createCutoverPhaseSchema.partial();

const createReadinessChecklistSchema = z.object({
  checklistName: z.string().min(3, 'Checklist name must be at least 3 characters'),
  checklistType: z.enum(['system', 'operation', 'user', 'security', 'performance']),
  checklistItems: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, 'Item title is required'),
    description: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'blocked']).default('pending'),
    notes: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().optional(),
    evidence: z.array(z.string()).optional()
  })).min(1, 'At least one checklist item is required'),
  phaseId: z.string().optional(),
});

const createRunbookTaskSchema = z.object({
  taskName: z.string().min(3, 'Task name must be at least 3 characters'),
  taskDescription: z.string().optional(),
  taskType: z.enum(['technical', 'business', 'communication', 'validation', 'rollback']),
  scheduledStartTime: z.string().min(1, 'Scheduled start time is required'),
  scheduledEndTime: z.string().min(1, 'Scheduled end time is required'),
  estimatedDuration: z.number().min(1, 'Estimated duration must be positive'),
  assignedTo: z.string().optional(),
  backupAssignee: z.string().optional(),
  prerequisiteTasks: z.array(z.string()).optional(),
  dependentTasks: z.array(z.string()).optional(),
  rollbackConditions: z.array(z.string()).optional(),
  rollbackAction: z.string().optional(),
  rollbackDeadline: z.string().optional(),
  validationCriteria: z.array(z.string()).optional(),
  notificationRecipients: z.array(z.string()).optional(),
  escalationContacts: z.array(z.string()).optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  riskMitigation: z.string().optional(),
  phaseId: z.string().optional(),
});

const createAcceptanceSignoffSchema = z.object({
  signoffTitle: z.string().min(3, 'Signoff title must be at least 3 characters'),
  signoffDescription: z.string().optional(),
  signoffType: z.enum(['milestone_acceptance', 'phase_completion', 'project_acceptance', 'user_acceptance']),
  acceptanceCriteria: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, 'Criterion title is required'),
    description: z.string().optional(),
    category: z.string().optional(),
    required: z.boolean().default(true),
    status: z.enum(['pending', 'passed', 'failed', 'na']).default('pending'),
    evidence: z.array(z.string()).optional(),
    notes: z.string().optional()
  })).min(1, 'At least one acceptance criterion is required'),
  vendorContractId: z.string().optional(),
  paymentMilestoneId: z.string().optional(),
  phaseId: z.string().optional(),
  approvalWorkflow: z.array(z.object({
    step: z.number(),
    title: z.string(),
    approver: z.string(),
    status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
    approvedAt: z.string().optional(),
    notes: z.string().optional()
  })).optional(),
  conditions: z.string().optional(),
  expiryDate: z.string().optional(),
});

const createIncidentSchema = z.object({
  incidentTitle: z.string().min(3, 'Incident title must be at least 3 characters'),
  incidentDescription: z.string().min(10, 'Incident description must be at least 10 characters'),
  incidentType: z.enum(['technical', 'business', 'communication', 'security', 'performance']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  impact: z.enum(['low', 'medium', 'high', 'critical']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string().optional(),
  rootCause: z.string().optional(),
  affectedSystems: z.array(z.string()).optional(),
  businessImpact: z.string().optional(),
  userImpact: z.string().optional(),
  resolution: z.string().optional(),
  resolutionActions: z.array(z.string()).optional(),
  preventiveMeasures: z.string().optional(),
  escalationContacts: z.array(z.string()).optional(),
  notifiedUsers: z.array(z.string()).optional(),
  assignedTo: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  followUpActions: z.array(z.string()).optional(),
  phaseId: z.string().optional(),
  taskId: z.string().optional(),
});

const cutoverQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  status: z.enum(['all', 'planned', 'in_progress', 'completed', 'failed', 'rolled_back', 'cancelled']).default('all'),
  phaseType: z.enum(['all', 'planning', 'preparation', 'execution', 'validation', 'post_cutover']).default('all'),
  riskLevel: z.enum(['all', 'low', 'medium', 'high', 'critical']).default('all'),
  sortBy: z.enum(['phaseName', 'scheduledStartDate', 'scheduledEndDate', 'status', 'riskLevel']).default('scheduledStartDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================================
// CUTOVER PHASES ROUTES
// ============================================================

/**
 * GET /api/projects/:projectId/cutover/phases
 * Get all cutover phases for a project
 */
router.get('/cutover/phases', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read cutover phases', 403));
    }

    const projectId = contextResult.projectId!;

    // Validate query parameters
    const validation = cutoverQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', 400));
    }

    const { page, limit, status, phaseType, riskLevel, sortBy, sortOrder } = validation.data;

    // Build query
    let query = db.select().from(cutoverPhases).where(eq(cutoverPhases.projectId, projectId));

    // Apply filters
    const conditions = [eq(cutoverPhases.projectId, projectId)];
    
    if (status !== 'all') {
      conditions.push(eq(cutoverPhases.status, status));
    }
    
    if (phaseType !== 'all') {
      conditions.push(eq(cutoverPhases.phaseType, phaseType));
    }
    
    if (riskLevel !== 'all') {
      conditions.push(eq(cutoverPhases.riskLevel, riskLevel));
    }

    if (conditions.length > 1) {
      query = db.select().from(cutoverPhases).where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = {
      phaseName: cutoverPhases.phaseName,
      scheduledStartDate: cutoverPhases.scheduledStartDate,
      scheduledEndDate: cutoverPhases.scheduledEndDate,
      status: cutoverPhases.status,
      riskLevel: cutoverPhases.riskLevel
    }[sortBy] || cutoverPhases.scheduledStartDate;

    query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

    // Get total count for pagination
    const totalCount = await db.select({ count: cutoverPhases.id }).from(cutoverPhases)
      .where(eq(cutoverPhases.projectId, projectId));
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    // Execute query
    const phases = await query;

    // Get relations for each phase
    const phasesWithRelations = await Promise.all(
      phases.map(async (phase) => {
        const [phaseLead, approvedByUser, readinessChecklists, runbookTasks, acceptanceSignoffs, incidents] = await Promise.all([
          phase.phaseLead ? db.select().from(users).where(eq(users.id, phase.phaseLead)).limit(1) : [],
          phase.approvedBy ? db.select().from(users).where(eq(users.id, phase.approvedBy)).limit(1) : [],
          db.select().from(readinessChecklists).where(eq(readinessChecklists.phaseId, phase.id)),
          db.select().from(cutoverRunbookTasks).where(eq(cutoverRunbookTasks.phaseId, phase.id)),
          db.select().from(acceptanceSignoffs).where(eq(acceptanceSignoffs.phaseId, phase.id)),
          db.select().from(cutoverIncidents).where(eq(cutoverIncidents.phaseId, phase.id))
        ]);

        // Get task relations
        const tasksWithRelations = await Promise.all(
          runbookTasks.map(async (task) => {
            const [assignedToUser, backupAssigneeUser, taskIncidents] = await Promise.all([
              task.assignedTo ? db.select().from(users).where(eq(users.id, task.assignedTo)).limit(1) : [],
              task.backupAssignee ? db.select().from(users).where(eq(users.id, task.backupAssignee)).limit(1) : [],
              db.select().from(cutoverIncidents).where(eq(cutoverIncidents.taskId, task.id))
            ]);

            return {
              ...task,
              assignedToUser: assignedToUser[0] || null,
              backupAssigneeUser: backupAssigneeUser[0] || null,
              incidents: taskIncidents
            };
          })
        );

        // Calculate progress metrics
        const phaseProgress = calculatePhaseProgress({
          ...phase,
          runbookTasks: tasksWithRelations,
          readinessChecklists,
          incidents
        });

        const readinessProgress = calculateOverallReadiness(readinessChecklists);
        const runbookProgress = calculateRunbookProgress(runbookTasks);
        const incidentImpact = calculateIncidentImpact(incidents);
        const rollbackRisk = assessRollbackRisk({
          ...phase,
          runbookTasks: tasksWithRelations,
          incidents
        });

        return {
          ...phase,
          phaseLead: phaseLead[0] || null,
          approvedByUser: approvedByUser[0] || null,
          readinessChecklists,
          runbookTasks: tasksWithRelations,
          acceptanceSignoffs,
          incidents,
          progress: {
            phaseProgress,
            readinessProgress,
            runbookProgress,
            totalChecklists: readinessChecklists.length,
            completedChecklists: readinessChecklists.filter(c => calculateChecklistProgress(c) === 100).length,
            totalTasks: runbookTasks.length,
            completedTasks: runbookTasks.filter(t => t.status === 'completed').length,
            failedTasks: runbookTasks.filter(t => t.status === 'failed').length
          },
          risk: {
            rollbackRisk: rollbackRisk.rollbackRisk,
            rollbackTriggers: rollbackRisk.rollbackTriggers,
            estimatedRollbackTime: rollbackRisk.estimatedRollbackTime,
            incidentImpact
          }
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
      phases: phasesWithRelations,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        pages: totalPages,
        hasNext,
        hasPrevious
      }
    }, 'Cutover phases retrieved successfully'));
  } catch (error: any) {
    console.error('Get cutover phases error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/cutover/phases/:id
 * Get a specific cutover phase by ID
 */
router.get('/cutover/phases/:id', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read cutover phases', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Get phase
    const phase = await db.select().from(cutoverPhases)
      .where(and(eq(cutoverPhases.id, id), eq(cutoverPhases.projectId, projectId)))
      .limit(1);
    
    if (!phase[0]) {
      return res.status(404).json(createErrorResponse('Cutover phase not found', 404));
    }

    // Get relations
    const [phaseLead, approvedByUser, readinessChecklists, runbookTasks, acceptanceSignoffs, incidents] = await Promise.all([
      phase[0].phaseLead ? db.select().from(users).where(eq(users.id, phase[0].phaseLead)).limit(1) : [],
      phase[0].approvedBy ? db.select().from(users).where(eq(users.id, phase[0].approvedBy)).limit(1) : [],
      db.select().from(readinessChecklists).where(eq(readinessChecklists.phaseId, phase[0].id)),
      db.select().from(cutoverRunbookTasks).where(eq(cutoverRunbookTasks.phaseId, phase[0].id)),
      db.select().from(acceptanceSignoffs).where(eq(acceptanceSignoffs.phaseId, phase[0].id)),
      db.select().from(cutoverIncidents).where(eq(cutoverIncidents.phaseId, phase[0].id))
    ]);

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse({
      ...phase[0],
      phaseLead: phaseLead[0] || null,
      approvedByUser: approvedByUser[0] || null,
      readinessChecklists,
      runbookTasks,
      acceptanceSignoffs,
      incidents
    }, 'Cutover phase retrieved successfully'));
  } catch (error: any) {
    console.error('Get cutover phase error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/cutover/phases
 * Create a new cutover phase
 */
router.post('/cutover/phases', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to create cutover phases', 403));
    }

    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = createCutoverPhaseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', 400));
    }

    const phaseData = validation.data;

    // Validate date logic
    const startDate = new Date(phaseData.scheduledStartDate);
    const endDate = new Date(phaseData.scheduledEndDate);
    
    if (endDate <= startDate) {
      return res.status(400).json(createErrorResponse('End date must be after start date', 400));
    }

    // Create phase
    const newPhase = await db.insert(cutoverPhases).values({
      ...phaseData,
      projectId,
      createdBy: contextResult.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Get relations for the new phase
    const [phaseLead, approvedByUser] = await Promise.all([
      phaseData.phaseLead ? db.select().from(users).where(eq(users.id, phaseData.phaseLead)).limit(1) : [],
      null
    ]);

    const phaseWithRelations = {
      ...newPhase[0],
      phaseLead: phaseLead[0] || null,
      approvedByUser: approvedByUser || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(phaseWithRelations, 'Cutover phase created successfully'));
  } catch (error: any) {
    console.error('Create cutover phase error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * PUT /api/projects/:projectId/cutover/phases/:id
 * Update a cutover phase
 */
router.put('/cutover/phases/:id', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to update cutover phases', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = updateCutoverPhaseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', 400));
    }

    const updateData = validation.data;

    // Check if phase exists
    const existingPhase = await db.select().from(cutoverPhases)
      .where(and(eq(cutoverPhases.id, id), eq(cutoverPhases.projectId, projectId)))
      .limit(1);
    
    if (!existingPhase[0]) {
      return res.status(404).json(createErrorResponse('Cutover phase not found', 404));
    }

    // Validate date logic if dates are being updated
    if (updateData.scheduledStartDate && updateData.scheduledEndDate) {
      const startDate = new Date(updateData.scheduledStartDate);
      const endDate = new Date(updateData.scheduledEndDate);
      
      if (endDate <= startDate) {
        return res.status(400).json(createErrorResponse('End date must be after start date', 400));
      }
    }

    // Update phase
    const updatedPhase = await db.update(cutoverPhases)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(eq(cutoverPhases.id, id), eq(cutoverPhases.projectId, projectId)))
      .returning();

    // Get relations for the updated phase
    const [phaseLead, approvedByUser] = await Promise.all([
      updateData.phaseLead ? db.select().from(users).where(eq(users.id, updateData.phaseLead)).limit(1) : [],
      null
    ]);

    const phaseWithRelations = {
      ...updatedPhase[0],
      phaseLead: phaseLead[0] || null,
      approvedByUser: approvedByUser || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(phaseWithRelations, 'Cutover phase updated successfully'));
  } catch (error: any) {
    console.error('Update cutover phase error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * DELETE /api/projects/:projectId/cutover/phases/:id
 * Delete a cutover phase
 */
router.delete('/cutover/phases/:id', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to delete cutover phases', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Check if phase exists
    const existingPhase = await db.select().from(cutoverPhases)
      .where(and(eq(cutoverPhases.id, id), eq(cutoverPhases.projectId, projectId)))
      .limit(1);
    
    if (!existingPhase[0]) {
      return res.status(404).json(createErrorResponse('Cutover phase not found', 404));
    }

    // Delete phase (cascade delete should handle related records)
    await db.delete(cutoverPhases).where(and(eq(cutoverPhases.id, id), eq(cutoverPhases.projectId, projectId)));

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(null, 'Cutover phase deleted successfully'));
  } catch (error: any) {
    console.error('Delete cutover phase error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

// ============================================================
// READINESS CHECKLISTS ROUTES
// ============================================================

/**
 * GET /api/projects/:projectId/cutover/readiness-checklists
 * Get all readiness checklists for a project
 */
router.get('/cutover/readiness-checklists', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read readiness checklists', 403));
    }

    const projectId = contextResult.projectId!;

    // Get all readiness checklists for the project
    const checklists = await db.select().from(readinessChecklists)
      .where(eq(readinessChecklists.projectId, projectId))
      .orderBy(desc(readinessChecklists.createdAt));

    // Get relations for each checklist
    const checklistsWithRelations = await Promise.all(
      checklists.map(async (checklist) => {
        const [phase, approvedByUser] = await Promise.all([
          checklist.phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, checklist.phaseId)).limit(1) : [],
          checklist.approvedBy ? db.select().from(users).where(eq(users.id, checklist.approvedBy)).limit(1) : []
        ]);

        return {
          ...checklist,
          phase: phase[0] || null,
          approvedByUser: approvedByUser[0] || null,
          progress: calculateChecklistProgress(checklist)
        };
      })
    );

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(checklistsWithRelations, 'Readiness checklists retrieved successfully'));
  } catch (error: any) {
    console.error('Get readiness checklists error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/cutover/readiness-checklists
 * Create a new readiness checklist
 */
router.post('/cutover/readiness-checklists', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to create readiness checklists', 403));
    }

    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = createReadinessChecklistSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', 400));
    }

    const checklistData = validation.data;

    // Calculate total items and completed items
    const totalItems = checklistData.checklistItems.length;
    const completedItems = checklistData.checklistItems.filter(item => item.status === 'completed').length;
    const failedItems = checklistData.checklistItems.filter(item => item.status === 'failed').length;
    const blockedItems = checklistData.checklistItems.filter(item => item.status === 'blocked').length;
    const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Create checklist
    const newChecklist = await db.insert(readinessChecklists).values({
      ...checklistData,
      projectId,
      totalItems,
      completedItems,
      failedItems,
      blockedItems,
      completionPercentage,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Get relations for the new checklist
    const [phase, approvedByUser] = await Promise.all([
      checklistData.phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, checklistData.phaseId)).limit(1) : [],
      null
    ]);

    const checklistWithRelations = {
      ...newChecklist[0],
      phase: phase[0] || null,
      approvedByUser: approvedByUser || null,
      progress: calculateChecklistProgress(newChecklist[0])
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(checklistWithRelations, 'Readiness checklist created successfully'));
  } catch (error: any) {
    console.error('Create readiness checklist error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * PUT /api/projects/:projectId/cutover/readiness-checklists/:id
 * Update a readiness checklist
 */
router.put('/cutover/readiness-checklists/:id', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to update readiness checklists', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = createReadinessChecklistSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', 400));
    }

    const updateData = validation.data;

    // Check if checklist exists
    const existingChecklist = await db.select().from(readinessChecklists)
      .where(and(eq(readinessChecklists.id, id), eq(readinessChecklists.projectId, projectId)))
      .limit(1);
    
    if (!existingChecklist[0]) {
      return res.status(404).json(createErrorResponse('Readiness checklist not found', 404));
    }

    // Recalculate progress if checklist items are updated
    let calculatedProgress = {};
    if (updateData.checklistItems) {
      const totalItems = updateData.checklistItems.length;
      const completedItems = updateData.checklistItems.filter(item => item.status === 'completed').length;
      const failedItems = updateData.checklistItems.filter(item => item.status === 'failed').length;
      const blockedItems = updateData.checklistItems.filter(item => item.status === 'blocked').length;
      const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

      calculatedProgress = {
        totalItems,
        completedItems,
        failedItems,
        blockedItems,
        completionPercentage
      };
    }

    // Update checklist
    const updatedChecklist = await db.update(readinessChecklists)
      .set({
        ...updateData,
        ...calculatedProgress,
        updatedAt: new Date()
      })
      .where(and(eq(readinessChecklists.id, id), eq(readinessChecklists.projectId, projectId)))
      .returning();

    // Get relations for the updated checklist
    const [phase, approvedByUser] = await Promise.all([
      updatedChecklist[0].phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, updatedChecklist[0].phaseId)).limit(1) : [],
      updatedChecklist[0].approvedBy ? db.select().from(users).where(eq(users.id, updatedChecklist[0].approvedBy)).limit(1) : []
    ]);

    const checklistWithRelations = {
      ...updatedChecklist[0],
      phase: phase[0] || null,
      approvedByUser: approvedByUser[0] || null,
      progress: calculateChecklistProgress(updatedChecklist[0])
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(checklistWithRelations, 'Readiness checklist updated successfully'));
  } catch (error: any) {
    console.error('Update readiness checklist error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

// ============================================================
// RUNBOOK TASKS ROUTES
// ============================================================

/**
 * GET /api/projects/:projectId/cutover/runbook-tasks
 * Get all runbook tasks for a project
 */
router.get('/cutover/runbook-tasks', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read runbook tasks', 403));
    }

    const projectId = contextResult.projectId!;

    // Get all runbook tasks for the project
    const tasks = await db.select().from(cutoverRunbookTasks)
      .where(eq(cutoverRunbookTasks.projectId, projectId))
      .orderBy(cutoverRunbookTasks.scheduledStartTime);

    // Get relations for each task
    const tasksWithRelations = await Promise.all(
      tasks.map(async (task) => {
        const [phase, assignedToUser, backupAssigneeUser, approvedByUser, incidents] = await Promise.all([
          task.phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, task.phaseId)).limit(1) : [],
          task.assignedTo ? db.select().from(users).where(eq(users.id, task.assignedTo)).limit(1) : [],
          task.backupAssignee ? db.select().from(users).where(eq(users.id, task.backupAssignee)).limit(1) : [],
          task.approvedBy ? db.select().from(users).where(eq(users.id, task.approvedBy)).limit(1) : [],
          db.select().from(cutoverIncidents).where(eq(cutoverIncidents.taskId, task.id))
        ]);

        return {
          ...task,
          phase: phase[0] || null,
          assignedToUser: assignedToUser[0] || null,
          backupAssigneeUser: backupAssigneeUser[0] || null,
          approvedByUser: approvedByUser[0] || null,
          incidents
        };
      })
    );

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(tasksWithRelations, 'Runbook tasks retrieved successfully'));
  } catch (error: any) {
    console.error('Get runbook tasks error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/cutover/runbook-tasks
 * Create new runbook tasks
 */
router.post('/cutover/runbook-tasks', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to create runbook tasks', 403));
    }

    const projectId = contextResult.projectId!;

    // Validate request body - can be single task or array
    const taskData = Array.isArray(req.body) ? req.body : [req.body];
    
    const validation = z.array(createRunbookTaskSchema).safeParse(taskData);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', 400));
    }

    const validatedTasks = validation.data;

    // Validate time logic for each task
    for (const task of validatedTasks) {
      const startTime = new Date(task.scheduledStartTime);
      const endTime = new Date(task.scheduledEndTime);
      
      if (endTime <= startTime) {
        return res.status(400).json(createErrorResponse('End time must be after start time', 400));
      }
    }

    // Create tasks
    const taskInserts = validatedTasks.map(task => ({
      ...task,
      projectId,
      createdBy: contextResult.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const newTasks = await db.insert(cutoverRunbookTasks).values(taskInserts).returning();

    // Get relations for the new tasks
    const tasksWithRelations = await Promise.all(
      newTasks.map(async (task) => {
        const [phase, assignedToUser, backupAssigneeUser] = await Promise.all([
          task.phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, task.phaseId)).limit(1) : [],
          task.assignedTo ? db.select().from(users).where(eq(users.id, task.assignedTo)).limit(1) : [],
          task.backupAssignee ? db.select().from(users).where(eq(users.id, task.backupAssignee)).limit(1) : []
        ]);

        return {
          ...task,
          phase: phase[0] || null,
          assignedToUser: assignedToUser[0] || null,
          backupAssigneeUser: backupAssigneeUser[0] || null
        };
      })
    );

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(tasksWithRelations, 'Runbook tasks created successfully'));
  } catch (error: any) {
    console.error('Create runbook tasks error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * PUT /api/projects/:projectId/cutover/runbook-tasks/:id/status
 * Update runbook task status
 */
router.put('/cutover/runbook-tasks/:id/status', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to update runbook tasks', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;
    const { status, actualStartTime, actualEndTime, notes } = req.body;

    // Validate status
    const validStatuses = ['planned', 'in_progress', 'completed', 'failed', 'rolled_back', 'cancelled', 'on_hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(createErrorResponse('Invalid status', 400));
    }

    // Check if task exists
    const existingTask = await db.select().from(cutoverRunbookTasks)
      .where(and(eq(cutoverRunbookTasks.id, id), eq(cutoverRunbookTasks.projectId, projectId)))
      .limit(1);
    
    if (!existingTask[0]) {
      return res.status(404).json(createErrorResponse('Runbook task not found', 404));
    }

    // Calculate actual duration if both times are provided
    let actualDuration = null;
    if (actualStartTime && actualEndTime) {
      const start = new Date(actualStartTime);
      const end = new Date(actualEndTime);
      actualDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // Convert to minutes
    }

    // Update task status
    const updatedTask = await db.update(cutoverRunbookTasks)
      .set({
        status,
        actualStartTime: actualStartTime ? new Date(actualStartTime) : undefined,
        actualEndTime: actualEndTime ? new Date(actualEndTime) : undefined,
        actualDuration,
        updatedAt: new Date()
      })
      .where(and(eq(cutoverRunbookTasks.id, id), eq(cutoverRunbookTasks.projectId, projectId)))
      .returning();

    // Get relations for the updated task
    const [phase, assignedToUser, backupAssigneeUser] = await Promise.all([
      updatedTask[0].phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, updatedTask[0].phaseId)).limit(1) : [],
      updatedTask[0].assignedTo ? db.select().from(users).where(eq(users.id, updatedTask[0].assignedTo)).limit(1) : [],
      updatedTask[0].backupAssignee ? db.select().from(users).where(eq(users.id, updatedTask[0].backupAssignee)).limit(1) : []
    ]);

    const taskWithRelations = {
      ...updatedTask[0],
      phase: phase[0] || null,
      assignedToUser: assignedToUser[0] || null,
      backupAssigneeUser: backupAssigneeUser[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(taskWithRelations, 'Runbook task status updated successfully'));
  } catch (error: any) {
    console.error('Update runbook task status error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

// ============================================================
// ACCEPTANCE SIGN-OFFS ROUTES
// ============================================================

/**
 * GET /api/projects/:projectId/cutover/acceptance-signoffs
 * Get all acceptance sign-offs for a project
 */
router.get('/cutover/acceptance-signoffs', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read acceptance sign-offs', 403));
    }

    const projectId = contextResult.projectId!;

    // Get all acceptance sign-offs for the project
    const signoffs = await db.select().from(acceptanceSignoffs)
      .where(eq(acceptanceSignoffs.projectId, projectId))
      .orderBy(desc(acceptanceSignoffs.createdAt));

    // Get relations for each sign-off
    const signoffsWithRelations = await Promise.all(
      signoffs.map(async (signoff) => {
        const [vendorContract, paymentMilestone, phase, submittedByUser, reviewedByUser, approvedByUser] = await Promise.all([
          signoff.vendorContractId ? db.select().from(vendorContracts).where(eq(vendorContracts.id, signoff.vendorContractId)).limit(1) : [],
          signoff.paymentMilestoneId ? db.select().from(vendorPaymentMilestones).where(eq(vendorPaymentMilestones.id, signoff.paymentMilestoneId)).limit(1) : [],
          signoff.phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, signoff.phaseId)).limit(1) : [],
          signoff.submittedBy ? db.select().from(users).where(eq(users.id, signoff.submittedBy)).limit(1) : [],
          signoff.reviewedBy ? db.select().from(users).where(eq(users.id, signoff.reviewedBy)).limit(1) : [],
          signoff.approvedBy ? db.select().from(users).where(eq(users.id, signoff.approvedBy)).limit(1) : []
        ]);

        return {
          ...signoff,
          vendorContract: vendorContract[0] || null,
          paymentMilestone: paymentMilestone[0] || null,
          phase: phase[0] || null,
          submittedByUser: submittedByUser[0] || null,
          reviewedByUser: reviewedByUser[0] || null,
          approvedByUser: approvedByUser[0] || null
        };
      })
    );

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(signoffsWithRelations, 'Acceptance sign-offs retrieved successfully'));
  } catch (error: any) {
    console.error('Get acceptance sign-offs error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/cutover/acceptance-signoffs
 * Create a new acceptance sign-off
 */
router.post('/cutover/acceptance-signoffs', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to create acceptance sign-offs', 403));
    }

    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = createAcceptanceSignoffSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', 400));
    }

    const signoffData = validation.data;

    // Validate expiry date if provided
    if (signoffData.expiryDate) {
      const expiryDate = new Date(signoffData.expiryDate);
      if (expiryDate <= new Date()) {
        return res.status(400).json(createErrorResponse('Expiry date must be in the future', 400));
      }
    }

    // Create sign-off
    const newSignoff = await db.insert(acceptanceSignoffs).values({
      ...signoffData,
      projectId,
      submittedBy: contextResult.user.id,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Get relations for the new sign-off
    const [vendorContract, paymentMilestone, phase, submittedByUser] = await Promise.all([
      signoffData.vendorContractId ? db.select().from(vendorContracts).where(eq(vendorContracts.id, signoffData.vendorContractId)).limit(1) : [],
      signoffData.paymentMilestoneId ? db.select().from(vendorPaymentMilestones).where(eq(vendorPaymentMilestones.id, signoffData.paymentMilestoneId)).limit(1) : [],
      signoffData.phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, signoffData.phaseId)).limit(1) : [],
      db.select().from(users).where(eq(users.id, contextResult.user.id)).limit(1)
    ]);

    const signoffWithRelations = {
      ...newSignoff[0],
      vendorContract: vendorContract[0] || null,
      paymentMilestone: paymentMilestone[0] || null,
      phase: phase[0] || null,
      submittedByUser: submittedByUser[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(signoffWithRelations, 'Acceptance sign-off created successfully'));
  } catch (error: any) {
    console.error('Create acceptance sign-off error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/cutover/acceptance-signoffs/:id/approve
 * Approve an acceptance sign-off
 */
router.post('/cutover/acceptance-signoffs/:id/approve', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.approve')) {
      return res.status(403).json(createErrorResponse('Insufficient permissions to approve acceptance sign-offs', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;
    const { action, notes, validationResults } = req.body;

    // Validate action
    const validActions = ['approved', 'rejected', 'requires_changes'];
    if (!validActions.includes(action)) {
      return res.status(400).json(createErrorResponse('Invalid action', 400));
    }

    // Check if sign-off exists
    const existingSignoff = await db.select().from(acceptanceSignoffs)
      .where(and(eq(acceptanceSignoffs.id, id), eq(acceptanceSignoffs.projectId, projectId)))
      .limit(1);
    
    if (!existingSignoff[0]) {
      return res.status(404).json(createErrorResponse('Acceptance sign-off not found', 404));
    }

    // Update sign-off status
    const updateData: any = {
      status: action,
      reviewedBy: contextResult.user.id,
      reviewedAt: new Date(),
      feedback: notes,
      updatedAt: new Date()
    };

    if (action === 'approved') {
      updateData.approvedBy = contextResult.user.id;
      updateData.approvedAt = new Date();
    }

    if (validationResults) {
      updateData.validationResults = validationResults;
    }

    const updatedSignoff = await db.update(acceptanceSignoffs)
      .set(updateData)
      .where(and(eq(acceptanceSignoffs.id, id), eq(acceptanceSignoffs.projectId, projectId)))
      .returning();

    // Get relations for the updated sign-off
    const [vendorContract, paymentMilestone, phase, submittedByUser, reviewedByUser, approvedByUser] = await Promise.all([
      updatedSignoff[0].vendorContractId ? db.select().from(vendorContracts).where(eq(vendorContracts.id, updatedSignoff[0].vendorContractId)).limit(1) : [],
      updatedSignoff[0].paymentMilestoneId ? db.select().from(vendorPaymentMilestones).where(eq(vendorPaymentMilestones.id, updatedSignoff[0].paymentMilestoneId)).limit(1) : [],
      updatedSignoff[0].phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, updatedSignoff[0].phaseId)).limit(1) : [],
      updatedSignoff[0].submittedBy ? db.select().from(users).where(eq(users.id, updatedSignoff[0].submittedBy)).limit(1) : [],
      db.select().from(users).where(eq(users.id, contextResult.user.id)).limit(1),
      action === 'approved' ? db.select().from(users).where(eq(users.id, contextResult.user.id)).limit(1) : []
    ]);

    const signoffWithRelations = {
      ...updatedSignoff[0],
      vendorContract: vendorContract[0] || null,
      paymentMilestone: paymentMilestone[0] || null,
      phase: phase[0] || null,
      submittedByUser: submittedByUser[0] || null,
      reviewedByUser: reviewedByUser[0] || null,
      approvedByUser: approvedByUser[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(signoffWithRelations, `Acceptance sign-off ${action} successfully`));
  } catch (error: any) {
    console.error('Approve acceptance sign-off error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/cutover/acceptance-signoffs/:id/documents
 * Upload documents to acceptance sign-off
 */
router.post('/cutover/acceptance-signoffs/:id/documents', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to upload documents', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;
    const { documents, evidence } = req.body;

    // Validate request body
    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json(createErrorResponse('Documents array is required', 400));
    }

    // Check if sign-off exists
    const existingSignoff = await db.select().from(acceptanceSignoffs)
      .where(and(eq(acceptanceSignoffs.id, id), eq(acceptanceSignoffs.projectId, projectId)))
      .limit(1);
    
    if (!existingSignoff[0]) {
      return res.status(404).json(createErrorResponse('Acceptance sign-off not found', 404));
    }

    // Update sign-off with documents
    const updateData: any = {
      acceptanceDocuments: documents,
      updatedAt: new Date()
    };

    if (evidence) {
      updateData.supportingEvidence = evidence;
    }

    const updatedSignoff = await db.update(acceptanceSignoffs)
      .set(updateData)
      .where(and(eq(acceptanceSignoffs.id, id), eq(acceptanceSignoffs.projectId, projectId)))
      .returning();

    // Get relations for the updated sign-off
    const [vendorContract, paymentMilestone, phase, submittedByUser] = await Promise.all([
      updatedSignoff[0].vendorContractId ? db.select().from(vendorContracts).where(eq(vendorContracts.id, updatedSignoff[0].vendorContractId)).limit(1) : [],
      updatedSignoff[0].paymentMilestoneId ? db.select().from(vendorPaymentMilestones).where(eq(vendorPaymentMilestones.id, updatedSignoff[0].paymentMilestoneId)).limit(1) : [],
      updatedSignoff[0].phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, updatedSignoff[0].phaseId)).limit(1) : [],
      updatedSignoff[0].submittedBy ? db.select().from(users).where(eq(users.id, updatedSignoff[0].submittedBy)).limit(1) : []
    ]);

    const signoffWithRelations = {
      ...updatedSignoff[0],
      vendorContract: vendorContract[0] || null,
      paymentMilestone: paymentMilestone[0] || null,
      phase: phase[0] || null,
      submittedByUser: submittedByUser[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(signoffWithRelations, 'Documents uploaded successfully'));
  } catch (error: any) {
    console.error('Upload documents error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

// ============================================================
// INCIDENTS ROUTES
// ============================================================

/**
 * GET /api/projects/:projectId/cutover/incidents
 * Get all cutover incidents for a project
 */
router.get('/cutover/incidents', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read incidents', 403));
    }

    const projectId = contextResult.projectId!;

    // Get all incidents for the project
    const incidents = await db.select().from(cutoverIncidents)
      .where(eq(cutoverIncidents.projectId, projectId))
      .orderBy(desc(cutoverIncidents.detectedAt));

    // Get relations for each incident
    const incidentsWithRelations = await Promise.all(
      incidents.map(async (incident) => {
        const [phase, task, assignedToUser, resolvedByUser, createdByUser] = await Promise.all([
          incident.phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, incident.phaseId)).limit(1) : [],
          incident.taskId ? db.select().from(cutoverRunbookTasks).where(eq(cutoverRunbookTasks.id, incident.taskId)).limit(1) : [],
          incident.assignedTo ? db.select().from(users).where(eq(users.id, incident.assignedTo)).limit(1) : [],
          incident.resolvedBy ? db.select().from(users).where(eq(users.id, incident.resolvedBy)).limit(1) : [],
          incident.createdBy ? db.select().from(users).where(eq(users.id, incident.createdBy)).limit(1) : []
        ]);

        return {
          ...incident,
          phase: phase[0] || null,
          task: task[0] || null,
          assignedToUser: assignedToUser[0] || null,
          resolvedByUser: resolvedByUser[0] || null,
          createdByUser: createdByUser[0] || null
        };
      })
    );

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(incidentsWithRelations, 'Incidents retrieved successfully'));
  } catch (error: any) {
    console.error('Get incidents error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/cutover/incidents
 * Create a new cutover incident
 */
router.post('/cutover/incidents', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to create incidents', 403));
    }

    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = createIncidentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', 400));
    }

    const incidentData = validation.data;

    // Create incident
    const newIncident = await db.insert(cutoverIncidents).values({
      ...incidentData,
      projectId,
      detectedAt: new Date(),
      createdBy: contextResult.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Get relations for the new incident
    const [phase, task, assignedToUser, createdByUser] = await Promise.all([
      incidentData.phaseId ? db.select().from(cutoverPhases).where(eq(cutoverPhases.id, incidentData.phaseId)).limit(1) : [],
      incidentData.taskId ? db.select().from(cutoverRunbookTasks).where(eq(cutoverRunbookTasks.id, incidentData.taskId)).limit(1) : [],
      incidentData.assignedTo ? db.select().from(users).where(eq(users.id, incidentData.assignedTo)).limit(1) : [],
      db.select().from(users).where(eq(users.id, contextResult.user.id)).limit(1)
    ]);

    const incidentWithRelations = {
      ...newIncident[0],
      phase: phase[0] || null,
      task: task[0] || null,
      assignedToUser: assignedToUser[0] || null,
      createdByUser: createdByUser[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(incidentWithRelations, 'Incident created successfully'));
  } catch (error: any) {
    console.error('Create incident error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/cutover/summary
 * Get comprehensive cutover summary for a project
 */
router.get('/cutover/summary', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read cutover summary', 403));
    }

    const projectId = contextResult.projectId!;

    // Get all cutover data for the project
    const [phases, checklists, tasks, signoffs, incidents] = await Promise.all([
      db.select().from(cutoverPhases).where(eq(cutoverPhases.projectId, projectId)),
      db.select().from(readinessChecklists).where(eq(readinessChecklists.projectId, projectId)),
      db.select().from(cutoverRunbookTasks).where(eq(cutoverRunbookTasks.projectId, projectId)),
      db.select().from(acceptanceSignoffs).where(eq(acceptanceSignoffs.projectId, projectId)),
      db.select().from(cutoverIncidents).where(eq(cutoverIncidents.projectId, projectId))
    ]);

    // Calculate summary metrics
    const phaseSummary = {
      totalPhases: phases.length,
      plannedPhases: phases.filter(p => p.status === 'planned').length,
      inProgressPhases: phases.filter(p => p.status === 'in_progress').length,
      completedPhases: phases.filter(p => p.status === 'completed').length,
      failedPhases: phases.filter(p => p.status === 'failed').length,
      rolledBackPhases: phases.filter(p => p.status === 'rolled_back').length,
      highRiskPhases: phases.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
      overallProgress: phases.length > 0 ? 
        phases.reduce((sum, p) => sum + Number(p.completionPercentage || 0), 0) / phases.length : 0
    };

    const readinessSummary = {
      totalChecklists: checklists.length,
      completedChecklists: checklists.filter(c => calculateChecklistProgress(c) === 100).length,
      overallReadiness: calculateOverallReadiness(checklists),
      systemReadiness: calculateOverallReadiness(checklists.filter(c => c.checklistType === 'system')),
      operationReadiness: calculateOverallReadiness(checklists.filter(c => c.checklistType === 'operation')),
      userReadiness: calculateOverallReadiness(checklists.filter(c => c.checklistType === 'user')),
      securityReadiness: calculateOverallReadiness(checklists.filter(c => c.checklistType === 'security'))
    };

    const runbookSummary = {
      totalTasks: tasks.length,
      plannedTasks: tasks.filter(t => t.status === 'planned').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      overallProgress: calculateRunbookProgress(tasks),
      highRiskTasks: tasks.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical').length
    };

    const signoffSummary = {
      totalSignoffs: signoffs.length,
      pendingSignoffs: signoffs.filter(s => s.status === 'pending').length,
      inReviewSignoffs: signoffs.filter(s => s.status === 'in_review').length,
      approvedSignoffs: signoffs.filter(s => s.status === 'approved').length,
      rejectedSignoffs: signoffs.filter(s => s.status === 'rejected').length,
      milestoneSignoffs: signoffs.filter(s => s.signoffType === 'milestone_acceptance').length,
      phaseSignoffs: signoffs.filter(s => s.signoffType === 'phase_completion').length
    };

    const incidentSummary = calculateIncidentImpact(incidents);

    const overallRisk = {
      overallRiskLevel: calculateOverallRisk(phaseSummary, readinessSummary, runbookSummary, incidentSummary),
      rollbackRisk: phases.filter(p => assessRollbackRisk(p).rollbackRisk !== 'low').length,
      criticalIssues: incidentSummary.criticalIncidents + phaseSummary.failedPhases + runbookSummary.failedTasks
    };

    const summary = {
      phases: phaseSummary,
      readiness: readinessSummary,
      runbook: runbookSummary,
      signoffs: signoffSummary,
      incidents: incidentSummary,
      risk: overallRisk,
      goLiveReadiness: calculateGoLiveReadiness(phaseSummary, readinessSummary, runbookSummary, signoffSummary)
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(summary, 'Cutover summary retrieved successfully'));
  } catch (error: any) {
    console.error('Get cutover summary error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculatePhaseProgress(phase: any): number {
  if (!phase.runbookTasks || phase.runbookTasks.length === 0) return 0;
  const completedTasks = phase.runbookTasks.filter((task: any) => task.status === 'completed').length;
  return (completedTasks / phase.runbookTasks.length) * 100;
}

function calculateChecklistProgress(checklist: any): number {
  if (checklist.totalItems === 0) return 0;
  return (checklist.completedItems / checklist.totalItems) * 100;
}

function calculateOverallReadiness(checklists: any[]): number {
  if (checklists.length === 0) return 0;
  const totalProgress = checklists.reduce((sum, checklist) => sum + calculateChecklistProgress(checklist), 0);
  return totalProgress / checklists.length;
}

function calculateRunbookProgress(tasks: any[]): number {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  return (completedTasks / tasks.length) * 100;
}

function calculateIncidentImpact(incidents: any[]): {
  totalIncidents: number;
  criticalIncidents: number;
  highIncidents: number;
  mediumIncidents: number;
  lowIncidents: number;
  averageResolutionTime: number;
  openIncidents: number;
} {
  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter((i: any) => i.severity === 'critical').length;
  const highIncidents = incidents.filter((i: any) => i.severity === 'high').length;
  const mediumIncidents = incidents.filter((i: any) => i.severity === 'medium').length;
  const lowIncidents = incidents.filter((i: any) => i.severity === 'low').length;
  const openIncidents = incidents.filter((i: any) => i.status === 'open' || i.status === 'investigating').length;
  
  const resolvedIncidents = incidents.filter((i: any) => i.resolutionTime);
  const averageResolutionTime = resolvedIncidents.length > 0 
    ? resolvedIncidents.reduce((sum, i) => sum + (i.resolutionTime || 0), 0) / resolvedIncidents.length 
    : 0;

  return {
    totalIncidents,
    criticalIncidents,
    highIncidents,
    mediumIncidents,
    lowIncidents,
    averageResolutionTime,
    openIncidents
  };
}

function assessRollbackRisk(phase: any): {
  rollbackRisk: 'low' | 'medium' | 'high' | 'critical';
  rollbackTriggers: string[];
  estimatedRollbackTime: number;
} {
  const failedTasks = phase.runbookTasks?.filter((task: any) => task.status === 'failed') || [];
  const criticalTasks = phase.runbookTasks?.filter((task: any) => task.riskLevel === 'critical') || [];
  const incidents = phase.incidents?.filter((i: any) => i.severity === 'critical' || i.severity === 'high') || [];
  
  const rollbackTriggers = [
    ...failedTasks.map((task: any) => `Failed task: ${task.taskName}`),
    ...incidents.map((incident: any) => `Critical incident: ${incident.incidentTitle}`),
    ...(phase.rollbackConditions || [])
  ];

  let rollbackRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (failedTasks.length > 0 || incidents.length > 0) rollbackRisk = 'medium';
  if (criticalTasks.some((task: any) => task.status === 'failed') || incidents.length > 2) rollbackRisk = 'high';
  if (criticalTasks.filter((task: any) => task.status === 'failed').length > 1 || incidents.length > 5) rollbackRisk = 'critical';

  const estimatedRollbackTime = phase.estimatedDuration * 1.5; // 150% of original duration

  return {
    rollbackRisk,
    rollbackTriggers,
    estimatedRollbackTime
  };
}

function calculateOverallRisk(phaseSummary: any, readinessSummary: any, runbookSummary: any, incidentSummary: any): string {
  const riskFactors = [
    phaseSummary.failedPhases > 0 ? 1 : 0,
    phaseSummary.highRiskPhases > 0 ? 1 : 0,
    readinessSummary.overallReadiness < 80 ? 1 : 0,
    runbookSummary.failedTasks > 0 ? 1 : 0,
    runbookSummary.highRiskTasks > 0 ? 1 : 0,
    incidentSummary.criticalIncidents > 0 ? 2 : 0,
    incidentSummary.highIncidents > 2 ? 1 : 0,
    incidentSummary.openIncidents > 5 ? 1 : 0
  ];

  const totalRisk = riskFactors.reduce((sum, factor) => sum + factor, 0);
  
  if (totalRisk >= 4) return 'critical';
  if (totalRisk >= 3) return 'high';
  if (totalRisk >= 2) return 'medium';
  return 'low';
}

function calculateGoLiveReadiness(phaseSummary: any, readinessSummary: any, runbookSummary: any, signoffSummary: any): {
  ready: boolean;
  readinessScore: number;
  blockers: string[];
  recommendations: string[];
} {
  const blockers = [];
  const recommendations = [];

  // Check phase completion
  if (phaseSummary.completedPhases < phaseSummary.totalPhases) {
    blockers.push('Not all phases are completed');
    recommendations.push('Complete all cutover phases before go-live');
  }

  // Check readiness
  if (readinessSummary.overallReadiness < 95) {
    blockers.push('Readiness checklists not fully completed');
    recommendations.push('Complete all readiness checklists');
  }

  // Check sign-offs
  if (signoffSummary.approvedSignoffs < signoffSummary.totalSignoffs) {
    blockers.push('Not all acceptance sign-offs approved');
    recommendations.push('Obtain all required acceptance sign-offs');
  }

  // Check incidents
  if (incidentSummary.openIncidents > 0) {
    blockers.push('Open incidents must be resolved');
    recommendations.push('Resolve all open incidents');
  }

  const readinessScore = Math.max(0, 100 - (blockers.length * 20));
  const ready = blockers.length === 0;

  return {
    ready,
    readinessScore,
    blockers,
    recommendations
  };
}

export default router;
