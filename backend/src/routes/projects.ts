import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/lib/database';
import { projects, users, clients } from '@/lib/schema';
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

const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  code: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
  progress: z.number().min(0).max(100).default(0),
  progressPlan: z.number().min(0).max(100).default(0),
  spi: z.number().min(0).max(2).default(1.00),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().min(0).optional(),
  spent: z.number().min(0).default(0),
  remaining: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).default(0),
  managerId: z.string().optional(),
  clientId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.string().optional(),
  isArchived: z.boolean().default(false),
  warrantyStartDate: z.string().optional(),
  warrantyEndDate: z.string().optional(),
  closureChecklist: z.any().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

const projectQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  status: z.enum(['all', 'planning', 'active', 'on_hold', 'completed', 'cancelled']).default('all'),
  riskLevel: z.enum(['all', 'low', 'medium', 'high', 'critical']).default('all'),
  priority: z.enum(['all', 'low', 'medium', 'high', 'urgent']).default('all'),
  category: z.string().optional(),
  managerId: z.string().optional(),
  clientId: z.string().optional(),
  sortBy: z.enum(['name', 'progress', 'budget', 'spi', 'risk', 'priority', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================================
// PROJECT ROUTES
// ============================================================

/**
 * GET /api/projects
 * Get all projects with filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    // Authenticate user
    const authResult = await withAuth(req);
    
    if (authResult.error) {
      const status = authResult.error.includes('No token') ? 401 : 403;
      return res.status(status).json(createErrorResponse(authResult.error, status));
    }

    // Check permissions
    if (!authResult.user.permissions.some((p: any) => p.name === 'projects.read')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to read projects'));
    }

    // Validate query parameters
    const validation = projectQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const {
      page,
      limit,
      search,
      status,
      riskLevel,
      priority,
      category,
      managerId,
      clientId,
      sortBy,
      sortOrder
    } = validation.data;

    // Build query
    let query = db.select().from(projects);

    // Apply filters
    const conditions = [];
    
    if (status !== 'all') {
      conditions.push(eq(projects.status, status));
    }
    
    if (riskLevel !== 'all') {
      conditions.push(eq(projects.riskLevel, riskLevel));
    }
    
    if (priority !== 'all') {
      conditions.push(eq(projects.priority, priority));
    }
    
    if (category) {
      conditions.push(eq(projects.category, category));
    }
    
    if (managerId) {
      conditions.push(eq(projects.managerId, managerId));
    }
    
    if (clientId) {
      conditions.push(eq(projects.clientId, clientId));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    // Apply search
    if (search) {
      conditions.push(sql`${projects.name} ILIKE ${`%${search}%`}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = {
      name: projects.name,
      progress: projects.progress,
      budget: projects.budget,
      spi: projects.spi,
      risk: projects.riskLevel,
      priority: projects.priority,
      createdAt: projects.createdAt
    }[sortBy] || projects.name;

    // @ts-ignore
    query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

    // Get total count for pagination
    const totalCount = await db.select({ count: projects.id }).from(projects);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    // @ts-ignore
    query = query.limit(limit).offset(offset);

    // Execute query
    const projectList = await query;

    // Add relations
    const projectsWithRelations = await Promise.all(
      projectList.map(async (project) => {
        const [manager, client] = await Promise.all([
          project.managerId ? db.select().from(users).where(eq(users.id, project.managerId)).limit(1) : [],
          project.clientId ? db.select().from(clients).where(eq(clients.id, project.clientId)).limit(1) : []
        ]);

        return {
          ...project,
          manager: manager[0] || null,
          client: client[0] || null
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
      projects: projectsWithRelations,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        pages: totalPages,
        hasNext,
        hasPrevious
      }
    }, 'Projects retrieved successfully'));
  } catch (error: any) {
    console.error('Get projects error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:id
 * Get a specific project by ID
 */
router.get('/:id', async (req, res) => {
  try {
    // Authenticate user
    const authResult = await withAuth(req);
    
    if (authResult.error) {
      const status = authResult.error.includes('No token') ? 401 : 403;
      return res.status(status).json(createErrorResponse(authResult.error, status));
    }

    // Check permissions
    if (!authResult.user.permissions.some((p: any) => p.name === 'projects.read')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to read projects'));
    }

    const { id } = req.params;

    // Get project with relations
    const project = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    
    if (!project[0]) {
      return res.status(404).json(createErrorResponse('Project not found', 404));
    }

    // Get related data
    const [manager, client] = await Promise.all([
      project[0].managerId ? db.select().from(users).where(eq(users.id, project[0].managerId)).limit(1) : [],
      project[0].clientId ? db.select().from(clients).where(eq(clients.id, project[0].clientId)).limit(1) : []
    ]);

    const projectWithRelations = {
      ...project[0],
      manager: manager[0] || null,
      client: client[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(projectWithRelations, 'Project retrieved successfully'));
  } catch (error: any) {
    console.error('Get project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', async (req, res) => {
  try {
    // Authenticate and check permissions
    const authResult = await withPermission(req, 'projects.create');
    
    if (authResult.error) {
      const status = authResult.error.includes('No token') ? 401 : 403;
      return res.status(status).json(createErrorResponse(authResult.error, status));
    }

    // Validate request body
    const validation = createProjectSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const projectData = validation.data;

    // Create project
    const newProject = await db.insert(projects).values({
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Get project with relations
    const [manager, client] = await Promise.all([
      newProject[0].managerId ? db.select().from(users).where(eq(users.id, newProject[0].managerId)).limit(1) : [],
      newProject[0].clientId ? db.select().from(clients).where(eq(clients.id, newProject[0].clientId)).limit(1) : []
    ]);

    const projectWithRelations = {
      ...newProject[0],
      manager: manager[0] || null,
      client: client[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(projectWithRelations, 'Project created successfully'));
  } catch (error: any) {
    console.error('Create project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * PUT /api/projects/:id
 * Update a project
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
      return res.status(403).json(forbiddenResponse('Insufficient permissions to update projects'));
    }

    const { id } = req.params;

    // Validate request body
    const validation = updateProjectSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const updateData = validation.data;

    // Check if project exists
    const existingProject = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    
    if (!existingProject[0]) {
      return res.status(404).json(createErrorResponse('Project not found', 404));
    }

    // Update project
    const updatedProject = await db.update(projects)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning();

    // Get updated project with relations
    const [manager, client] = await Promise.all([
      updatedProject[0].managerId ? db.select().from(users).where(eq(users.id, updatedProject[0].managerId)).limit(1) : [],
      updatedProject[0].clientId ? db.select().from(clients).where(eq(clients.id, updatedProject[0].clientId)).limit(1) : []
    ]);

    const projectWithRelations = {
      ...updatedProject[0],
      manager: manager[0] || null,
      client: client[0] || null
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(projectWithRelations, 'Project updated successfully'));
  } catch (error: any) {
    console.error('Update project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
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
      return res.status(403).json(forbiddenResponse('Insufficient permissions to delete projects'));
    }

    const { id } = req.params;

    // Check if project exists
    const existingProject = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    
    if (!existingProject[0]) {
      return res.status(404).json(createErrorResponse('Project not found', 404));
    }

    // Delete project (cascade delete should handle related records)
    await db.delete(projects).where(eq(projects.id, id));

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(null, 'Project deleted successfully'));
  } catch (error: any) {
    console.error('Delete project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * GET /api/projects/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.select().from(projects).limit(1);

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'projects-service'
    }, 'Projects service is healthy'));
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json(createErrorResponse('Health check failed', 500));
  }
});

export default router;
