import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, asc, between, sum, count, sql } from 'drizzle-orm';
import { db } from '@/lib/database';
import { 
  projects, 
  users, 
  tasks, 
  vendorContracts,
  vendorPaymentMilestones,
  vendorDeliverables,
  vendorRiskAssessments,
  vendorCommunicationLog
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

const createVendorContractSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  contractNumber: z.string().min(1, 'Contract number is required'),
  contractName: z.string().min(3, 'Contract name must be at least 3 characters'),
  description: z.string().optional(),
  contractType: z.enum(['software', 'hardware', 'consulting', 'materials', 'services']),
  totalValue: z.number().min(0, 'Total value must be positive'),
  currency: z.string().default('THB'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  contractFile: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

const updateVendorContractSchema = createVendorContractSchema.partial();

const createPaymentMilestoneSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  milestoneType: z.enum(['percentage', 'fixed_amount', 'deliverable_based']),
  paymentAmount: z.number().min(0, 'Payment amount must be positive'),
  paymentPercentage: z.number().min(0).max(100).default(0),
  currency: z.string().default('THB'),
  dueDate: z.string().min(1, 'Due date is required'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  gracePeriod: z.number().min(0).default(0),
  linkedProjectMilestones: z.array(z.string()).optional(),
  linkedProjectTasks: z.array(z.string()).optional(),
});

const createDeliverableSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  deliverableType: z.enum(['software', 'hardware', 'documentation', 'training', 'inspection', 'prototype']),
  softwareType: z.enum(['api', 'frontend', 'backend', 'database', 'integration', 'testing', 'uat']).optional(),
  hardwareType: z.enum(['equipment', 'prototype', 'materials', 'components']).optional(),
  completionPercentage: z.number().min(0).max(100).default(0),
  codeRepository: z.string().optional(),
  testResults: z.array(z.string()).optional(),
  deploymentStatus: z.enum(['not_deployed', 'deployed', 'tested', 'accepted']).default('not_deployed'),
  procurementStatus: z.enum(['not_ordered', 'ordered', 'received', 'assembled', 'inspected', 'accepted']).default('not_ordered'),
  trackingNumber: z.string().optional(),
  inspectionStatus: z.enum(['pending', 'passed', 'failed', 'requires_rework']).default('pending'),
  qualityStatus: z.enum(['pending', 'in_review', 'approved', 'rejected', 'requires_rework']).default('pending'),
  expectedDate: z.string().min(1, 'Expected date is required'),
  delayReason: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'delayed', 'cancelled', 'accepted', 'rejected']).default('pending'),
  blocked: z.boolean().default(false),
  blockedReason: z.string().optional(),
  linkedProjectTasks: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  riskFactors: z.array(z.string()).optional(),
});

const vendorQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  status: z.enum(['all', 'draft', 'active', 'completed', 'terminated', 'suspended']).default('all'),
  contractType: z.enum(['all', 'software', 'hardware', 'consulting', 'materials', 'services']).default('all'),
  riskLevel: z.enum(['all', 'low', 'medium', 'high', 'critical']).default('all'),
  sortBy: z.enum(['contractName', 'totalValue', 'startDate', 'endDate', 'status', 'riskLevel']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================
// VENDOR CONTRACT ROUTES
// ============================================================

/**
 * GET /api/projects/:projectId/vendor-contracts
 * Get all vendor contracts for a project
 */
router.get('/vendor-contracts', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read vendor contracts', 403));
    }

    const projectId = contextResult.projectId!;

    // Validate query parameters
    const validation = vendorQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', 400));
    }

    const { page, limit, status, contractType, riskLevel, sortBy, sortOrder } = validation.data;

    // Build query
    let query = db.select().from(vendorContracts).where(eq(vendorContracts.projectId, projectId));

    // Apply filters
    const conditions = [eq(vendorContracts.projectId, projectId)];
    
    if (status !== 'all') {
      conditions.push(eq(vendorContracts.status, status));
    }
    
    if (contractType !== 'all') {
      conditions.push(eq(vendorContracts.contractType, contractType));
    }
    
    if (riskLevel !== 'all') {
      conditions.push(eq(vendorContracts.riskLevel, riskLevel));
    }

    if (conditions.length > 1) {
      query = db.select().from(vendorContracts).where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = {
      contractName: vendorContracts.contractName,
      totalValue: vendorContracts.totalValue,
      startDate: vendorContracts.startDate,
      endDate: vendorContracts.endDate,
      status: vendorContracts.status,
      riskLevel: vendorContracts.riskLevel,
      createdAt: vendorContracts.createdAt
    }[sortBy] || vendorContracts.createdAt;

    query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

    // Get total count for pagination
    const totalCount = await db.select({ count: vendorContracts.id }).from(vendorContracts)
      .where(eq(vendorContracts.projectId, projectId));
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    // Execute query
    const contracts = await query;

    // Get relations for each contract
    const contractsWithRelations = await Promise.all(
      contracts.map(async (contract) => {
        const [vendor, project, paymentMilestones, deliverables, riskAssessments] = await Promise.all([
          contract.vendorId ? db.select().from(users).where(eq(users.id, contract.vendorId)).limit(1) : [],
          db.select().from(projects).where(eq(projects.id, contract.projectId)).limit(1),
          db.select().from(vendorPaymentMilestones).where(eq(vendorPaymentMilestones.contractId, contract.id)),
          db.select().from(vendorDeliverables).where(eq(vendorDeliverables.contractId, contract.id)),
          db.select().from(vendorRiskAssessments).where(eq(vendorRiskAssessments.contractId, contract.id))
        ]);

        // Calculate progress and payment status
        const totalMilestones = paymentMilestones.length;
        const completedMilestones = paymentMilestones.filter(m => m.status === 'paid').length;
        const paymentProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
        
        const totalDeliverables = deliverables.length;
        const completedDeliverables = deliverables.filter(d => d.status === 'completed' || d.status === 'accepted').length;
        const deliverableProgress = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;
        
        const highRiskDeliverables = deliverables.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical').length;
        const delayedDeliverables = deliverables.filter(d => d.status === 'delayed').length;
        const blockedDeliverables = deliverables.filter(d => d.blocked).length;

        const contractRisk = highRiskDeliverables > 0 ? 'high' : delayedDeliverables > 0 ? 'medium' : 'low';

        return {
          ...contract,
          vendor: vendor[0] || null,
          project: project[0] || null,
          paymentMilestones,
          deliverables,
          riskAssessments,
          progress: {
            paymentProgress,
            deliverableProgress,
            totalMilestones,
            completedMilestones,
            totalDeliverables,
            completedDeliverables,
            highRiskDeliverables,
            delayedDeliverables,
            blockedDeliverables
          },
          risk: {
            level: contractRisk,
            highRiskDeliverables,
            delayedDeliverables,
            blockedDeliverables
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
      contracts: contractsWithRelations,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        pages: totalPages,
        hasNext,
        hasPrevious
      }
    }, 'Vendor contracts retrieved successfully'));
  } catch (error: any) {
    console.error('Get vendor contracts error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/vendor-contracts/:id
 * Get a specific vendor contract by ID
 */
router.get('/vendor-contracts/:id', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read vendor contracts', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Get contract
    const contract = await db.select().from(vendorContracts)
      .where(and(eq(vendorContracts.id, id), eq(vendorContracts.projectId, projectId)))
      .limit(1);
    
    if (!contract[0]) {
      return res.status(404).json(createErrorResponse('Vendor contract not found', 404));
    }

    // Get relations
    const [vendor, project, paymentMilestones, deliverables, riskAssessments, communications] = await Promise.all([
      contract[0].vendorId ? db.select().from(users).where(eq(users.id, contract[0].vendorId)).limit(1) : [],
      db.select().from(projects).where(eq(projects.id, contract[0].projectId)).limit(1),
      db.select().from(vendorPaymentMilestones).where(eq(vendorPaymentMilestones.contractId, contract[0].id)),
      db.select().from(vendorDeliverables).where(eq(vendorDeliverables.contractId, contract[0].id)),
      db.select().from(vendorRiskAssessments).where(eq(vendorRiskAssessments.contractId, contract[0].id)),
      db.select().from(vendorCommunicationLog).where(eq(vendorCommunicationLog.contractId, contract[0].id)).orderBy(desc(vendorCommunicationLog.communicationDate))
    ]);

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse({
      ...contract[0],
      vendor: vendor[0] || null,
      project: project[0] || null,
      paymentMilestones,
      deliverables,
      riskAssessments,
      communications
    }, 'Vendor contract retrieved successfully'));
  } catch (error: any) {
    console.error('Get vendor contract error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/vendor-contracts
 * Create a new vendor contract
 */
router.post('/vendor-contracts', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to create vendor contracts', 403));
    }

    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = createVendorContractSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', 400));
    }

    const contractData = validation.data;

    // Create contract
    const newContract = await db.insert(vendorContracts).values({
      ...contractData,
      projectId,
      createdBy: contextResult.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Get relations for the new contract
    const [vendor, project] = await Promise.all([
      contractData.vendorId ? db.select().from(users).where(eq(users.id, contractData.vendorId)).limit(1) : [],
      db.select().from(projects).where(eq(projects.id, projectId)).limit(1)
    ]);

    const contractWithRelations = {
      ...newContract[0],
      vendor: vendor[0] || null,
      project: project[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(contractWithRelations, 'Vendor contract created successfully'));
  } catch (error: any) {
    console.error('Create vendor contract error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * PUT /api/projects/:projectId/vendor-contracts/:id
 * Update a vendor contract
 */
router.put('/vendor-contracts/:id', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to update vendor contracts', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = updateVendorContractSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', 400));
    }

    const updateData = validation.data;

    // Check if contract exists
    const existingContract = await db.select().from(vendorContracts)
      .where(and(eq(vendorContracts.id, id), eq(vendorContracts.projectId, projectId)))
      .limit(1);
    
    if (!existingContract[0]) {
      return res.status(404).json(createErrorResponse('Vendor contract not found', 404));
    }

    // Update contract
    const updatedContract = await db.update(vendorContracts)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(eq(vendorContracts.id, id), eq(vendorContracts.projectId, projectId)))
      .returning();

    // Get relations for the updated contract
    const [vendor, project] = await Promise.all([
      updateData.vendorId ? db.select().from(users).where(eq(users.id, updateData.vendorId)).limit(1) : [],
      db.select().from(projects).where(eq(projects.id, projectId)).limit(1)
    ]);

    const contractWithRelations = {
      ...updatedContract[0],
      vendor: vendor[0] || null,
      project: project[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(contractWithRelations, 'Vendor contract updated successfully'));
  } catch (error: any) {
    console.error('Update vendor contract error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * DELETE /api/projects/:projectId/vendor-contracts/:id
 * Delete a vendor contract
 */
router.delete('/vendor-contracts/:id', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to delete vendor contracts', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Check if contract exists
    const existingContract = await db.select().from(vendorContracts)
      .where(and(eq(vendorContracts.id, id), eq(vendorContracts.projectId, projectId)))
      .limit(1);
    
    if (!existingContract[0]) {
      return res.status(404).json(createErrorResponse('Vendor contract not found', 404));
    }

    // Delete contract (cascade delete should handle related records)
    await db.delete(vendorContracts).where(and(eq(vendorContracts.id, id), eq(vendorContracts.projectId, projectId)));

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(null, 'Vendor contract deleted successfully'));
  } catch (error: any) {
    console.error('Delete vendor contract error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/vendor-contracts/:id/payment-milestones
 * Get payment milestones for a vendor contract
 */
router.get('/vendor-contracts/:id/payment-milestones', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read vendor contracts', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Check if contract exists
    const existingContract = await db.select().from(vendorContracts)
      .where(and(eq(vendorContracts.id, id), eq(vendorContracts.projectId, projectId)))
      .limit(1);
    
    if (!existingContract[0]) {
      return res.status(404).json(createErrorResponse('Vendor contract not found', 404));
    }

    // Get payment milestones
    const milestones = await db.select().from(vendorPaymentMilestones)
      .where(eq(vendorPaymentMilestones.contractId, id))
      .orderBy(vendorPaymentMilestones.dueDate);

    // Get relations for each milestone
    const milestonesWithRelations = await Promise.all(
      milestones.map(async (milestone) => {
        const [deliverables] = milestone.paymentMilestoneId 
          ? await db.select().from(vendorDeliverables).where(eq(vendorDeliverables.paymentMilestoneId, milestone.id))
          : [];

        return {
          ...milestone,
          deliverables
        };
      })
    );

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(milestonesWithRelations, 'Payment milestones retrieved successfully'));
  } catch (error: any) {
    console.error('Get payment milestones error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/vendor-contracts/:id/payment-milestones
 * Create payment milestones for a vendor contract
 */
router.post('/vendor-contracts/:id/payment-milestones', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to create payment milestones', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Check if contract exists
    const existingContract = await db.select().from(vendorContracts)
      .where(and(eq(vendorContracts.id, id), eq(vendorContracts.projectId, projectId)))
      .limit(1);
    
    if (!existingContract[0]) {
      return res.status(404).json(createErrorResponse('Vendor contract not found', 404));
    }

    // Validate request body - can be single milestone or array
    const milestoneData = Array.isArray(req.body) ? req.body : [req.body];
    
    const validation = z.array(createPaymentMilestoneSchema).safeParse(milestoneData);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', 400));
    }

    const validatedMilestones = validation.data;

    // Validate that payment percentages sum to 100 if using percentage type
    const percentageMilestones = validatedMilestones.filter(m => m.milestoneType === 'percentage');
    const totalPercentage = percentageMilestones.reduce((sum, m) => sum + Number(m.paymentPercentage), 0);
    
    if (percentageMilestones.length > 0 && (totalPercentage < 99 || totalPercentage > 101)) {
      return res.status(400).json(createErrorResponse('Payment percentages must sum to 100%', 400));
    }

    // Validate that fixed amounts don't exceed total contract value
    const fixedMilestones = validatedMilestones.filter(m => m.milestoneType === 'fixed_amount');
    const totalFixedAmount = fixedMilestones.reduce((sum, m) => sum + Number(m.paymentAmount), 0);
    
    if (fixedMilestones.length > 0 && totalFixedAmount > Number(existingContract[0].totalValue)) {
      return res.status(400).json(createErrorResponse('Fixed payment amounts cannot exceed total contract value', 400));
    }

    // Create milestones
    const milestoneInserts = validatedMilestones.map(milestone => ({
      ...milestone,
      contractId: id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const newMilestones = await db.insert(vendorPaymentMilestones).values(milestoneInserts).returning();

    // Get relations for the new milestones
    const milestonesWithRelations = await Promise.all(
      newMilestones.map(async (milestone) => {
        const [deliverables] = milestone.paymentMilestoneId 
          ? await db.select().from(vendorDeliverables).where(eq(vendorDeliverables.paymentMilestoneId, milestone.id))
          : [];

        return {
          ...milestone,
          deliverables
        };
      })
    );

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(milestonesWithRelations, 'Payment milestones created successfully'));
  } catch (error: any) {
    console.error('Create payment milestones error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/vendor-contracts/:id/deliverables
 * Get deliverables for a vendor contract
 */
router.get('/vendor-contracts/:id/deliverables', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read vendor contracts', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Check if contract exists
    const existingContract = await db.select().from(vendorContracts)
      .where(and(eq(vendorContracts.id, id), eq(vendorContracts.projectId, projectId)))
      .limit(1);
    
    if (!existingContract[0]) {
      return res.status(404).json(createErrorResponse('Vendor contract not found', 404));
    }

    // Get deliverables
    const deliverables = await db.select().from(vendorDeliverables)
      .where(eq(vendorDeliverables.contractId, id))
      .orderBy(vendorDeliverables.expectedDate);

    // Get relations for each deliverable
    const deliverablesWithRelations = await Promise.all(
      deliverables.map(async (deliverable) => {
        const [paymentMilestone] = deliverable.paymentMilestoneId 
          ? db.select().from(vendorPaymentMilestones).where(eq(vendorPaymentMilestones.id, deliverable.paymentMilestoneId)).limit(1)
          : [];
        
        const [riskAssessments] = await db.select().from(vendorRiskAssessments)
          .where(eq(vendorRiskAssessments.deliverableId, deliverable.id))
          .orderBy(desc(vendorRiskAssessments.createdAt));

        return {
          ...deliverable,
          paymentMilestone: paymentMilestone[0] || null,
          riskAssessments
        };
      })
    );

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(deliverablesWithRelations, 'Deliverables retrieved successfully'));
  } catch (error: any) {
    console.error('Get deliverables error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/vendor-contracts/:id/deliverables
 * Create deliverables for a vendor contract
 */
router.post('/vendor-contracts/:id/deliverables', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to create deliverables', 403));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Check if contract exists
    const existingContract = await db.select().from(vendorContracts)
      .where(and(eq(vendorContracts.id, id), eq(vendorContracts.projectId, projectId)))
      .limit(1);
    
    if (!existingContract[0]) {
      return res.status(404).json(createErrorResponse('Vendor contract not found', 404));
    }

    // Validate request body - can be single deliverable or array
    const deliverableData = Array.isArray(req.body) ? req.body : [req.body];
    
    const validation = z.array(createDeliverableSchema).safeParse(deliverableData);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid request body', 400));
    }

    const validatedDeliverables = validation.data;

    // Create deliverables
    const deliverableInserts = validatedDeliverables.map(deliverable => ({
      ...deliverable,
      contractId: id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const newDeliverables = await db.insert(vendorDeliverables).values(deliverableInserts).returning();

    // Get relations for the new deliverables
    const deliverablesWithRelations = await Promise.all(
      newDeliverables.map(async (deliverable) => {
        const [paymentMilestone] = deliverable.paymentMilestoneId 
          ? db.select().from(vendorPaymentMilestones).where(eq(vendorPaymentMilestones.id, deliverable.paymentMilestoneId)).limit(1)
          : [];
        
        const [riskAssessments] = await db.select().from(vendorRiskAssessments)
          .where(eq(vendorRiskAssessments.deliverableId, deliverable.id))
          .orderBy(desc(vendorRiskAssessments.createdAt));

        return {
          ...deliverable,
          paymentMilestone: paymentMilestone[0] || null,
          riskAssessments
        };
      })
    );

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(deliverablesWithRelations, 'Deliverables created successfully'));
  } catch (error: any) {
    console.error('Create deliverables error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/vendor-contracts/summary
 * Get vendor contracts summary for project financial calculations
 */
router.get('/vendor-contracts/summary', async (req, res) => {
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
      return res.status(403).json(createErrorResponse('Insufficient permissions to read vendor contracts', 403));
    }

    const projectId = contextResult.projectId!;

    // Get all vendor contracts for the project
    const contracts = await db.select().from(vendorContracts)
      .where(eq(vendorContracts.projectId, projectId));

    // Get all related payment milestones and deliverables
    const contractIds = contracts.map(c => c.id);
    
    const [paymentMilestones, deliverables] = await Promise.all([
      contractIds.length > 0 ? db.select().from(vendorPaymentMilestones).where(eq(vendorPaymentMilestones.contractId, contractIds)) : [],
      contractIds.length > 0 ? db.select().from(vendorDeliverables).where(eq(vendorDeliverables.contractId, contractIds)) : []
    ]);

    // Calculate total vendor contract value
    const totalContractValue = contracts.reduce((sum, contract) => sum + Number(contract.totalValue || 0), 0);
    const totalPaidAmount = paymentMilestones.reduce((sum, milestone) => sum + Number(milestone.paidAmount || 0), 0);

    // Calculate risk metrics
    const highRiskDeliverables = deliverables.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical');
    const delayedDeliverables = deliverables.filter(d => d.status === 'delayed');
    const blockedDeliverables = deliverables.filter(d => d.blocked);

    const summary = {
      totalContracts: contracts.length,
      totalContractValue,
      totalPaidAmount,
      remainingAmount: totalContractValue - totalPaidAmount,
      paymentProgress: totalContractValue > 0 ? (totalPaidAmount / totalContractValue) * 100 : 0,
      riskMetrics: {
        highRiskDeliverables: highRiskDeliverables.length,
        delayedDeliverables: delayedDeliverables.length,
        blockedDeliverables: blockedDeliverables.length,
        totalDeliverables: deliverables.length
      },
      contracts: contracts.map(contract => ({
        id: contract.id,
        contractName: contract.contractName,
        contractType: contract.contractType,
        totalValue: Number(contract.totalValue),
        status: contract.status,
        riskLevel: contract.riskLevel,
        vendorId: contract.vendorId,
        startDate: contract.startDate,
        endDate: contract.endDate,
        paymentProgress: calculatePaymentProgress(paymentMilestones.filter(m => m.contractId === contract.id)),
        deliverableProgress: calculateDeliverableProgress(deliverables.filter(d => d.contractId === contract.id))
      }))
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(summary, 'Vendor contracts summary retrieved successfully'));
  } catch (error: any) {
    console.error('Get vendor contracts summary error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculatePaymentProgress(milestones: any[]): number {
  const totalAmount = milestones.reduce((sum, m) => sum + Number(m.paymentAmount || 0), 0);
  const paidAmount = milestones.reduce((sum, m) => sum + Number(m.paidAmount || 0), 0);
  return totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
}

function calculateDeliverableProgress(deliverables: any[]): number {
  if (!deliverables || deliverables.length === 0) return 0;
  const completedDeliverables = deliverables.filter(d => d.status === 'completed' || d.status === 'accepted');
  return (completedDeliverables.length / deliverables.length) * 100;
}

export default router;
