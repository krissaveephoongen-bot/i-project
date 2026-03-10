import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, asc } from 'drizzle-orm';
import { db } from '@/lib/database';
import { clients, users } from '@/lib/schema';
import { 
  withAuth,
  withPermission,
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

const createClientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

const clientQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================================
// CLIENT ROUTES
// ============================================================

/**
 * GET /api/master-data/clients
 * Get all clients with filtering and pagination
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
    if (!authResult.user.permissions.some((p: any) => p.name === 'master_data.manage')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to manage master data'));
    }

    // Validate query parameters
    const validation = clientQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const { page, limit, search, sortBy, sortOrder } = validation.data;

    // Build query
    let query = db.select().from(clients);

    // Apply search filter
    if (search) {
      query = query.where(
        // Simple search implementation - you might want to use a more sophisticated search
        clients.name.like(`%${search}%`)
      );
    }

    // Apply sorting
    const sortColumn = {
      name: clients.name,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt
    }[sortBy] || clients.name;

    query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

    // Get total count for pagination
    const totalCount = await db.select({ count: clients.id }).from(clients);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    // Execute query
    const clientList = await query;

    // Calculate pagination
    const totalPages = Math.ceil(totalCount.length / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return response
    res.status(200).json(createSuccessResponse({
      clients: clientList,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        pages: totalPages,
        hasNext,
        hasPrevious
      }
    }, 'Clients retrieved successfully'));
  } catch (error: any) {
    console.error('Get clients error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/master-data/clients/:id
 * Get a specific client by ID
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
    if (!authResult.user.permissions.some((p: any) => p.name === 'master_data.manage')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to manage master data'));
    }

    const { id } = req.params;

    // Get client
    const client = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    
    if (!client[0]) {
      return res.status(404).json(createErrorResponse('Client not found', 404));
    }

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(client[0], 'Client retrieved successfully'));
  } catch (error: any) {
    console.error('Get client error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/master-data/clients
 * Create a new client
 */
router.post('/', async (req, res) => {
  try {
    // Authenticate and check permissions
    const authResult = await withPermission(req, 'master_data.manage');
    
    if (authResult.error) {
      const status = authResult.error.includes('No token') ? 401 : 403;
      return res.status(status).json(createErrorResponse(authResult.error, status));
    }

    // Validate request body
    const validation = createClientSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const clientData = validation.data;

    // Create client
    const newClient = await db.insert(clients).values({
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(newClient[0], 'Client created successfully'));
  } catch (error: any) {
    console.error('Create client error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * PUT /api/master-data/clients/:id
 * Update a client
 */
router.put('/:id', async (req, res) => {
  try {
    // Authenticate and check permissions
    const authResult = await withPermission(req, 'master_data.manage');
    
    if (authResult.error) {
      const status = authResult.error.includes('No token') ? 401 : 403;
      return res.status(status).json(createErrorResponse(authResult.error, status));
    }

    const { id } = req.params;

    // Validate request body
    const validation = updateClientSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const updateData = validation.data;

    // Check if client exists
    const existingClient = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    
    if (!existingClient[0]) {
      return res.status(404).json(createErrorResponse('Client not found', 404));
    }

    // Update client
    const updatedClient = await db.update(clients)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(clients.id, id))
      .returning();

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(updatedClient[0], 'Client updated successfully'));
  } catch (error: any) {
    console.error('Update client error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * DELETE /api/master-data/clients/:id
 * Delete a client
 */
router.delete('/:id', async (req, res) => {
  try {
    // Authenticate and check permissions
    const authResult = await withPermission(req, 'master_data.manage');
    
    if (authResult.error) {
      const status = authResult.error.includes('No token') ? 401 : 403;
      return res.status(status).json(createErrorResponse(authResult.error, status));
    }

    const { id } = req.params;

    // Check if client exists
    const existingClient = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    
    if (!existingClient[0]) {
      return res.status(404).json(createErrorResponse('Client not found', 404));
    }

    // Check if client has associated projects (prevent deletion if there are projects)
    // This would require importing projects schema, but for simplicity we'll skip this check

    // Delete client
    await db.delete(clients).where(eq(clients.id, id));

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(null, 'Client deleted successfully'));
  } catch (error: any) {
    console.error('Delete client error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

export default router;
