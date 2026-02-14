/**
 * Client Routes - API endpoints for client management
 */

import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';
import { authMiddleware, requireRole } from '../../../shared/middleware/authMiddleware';
import { validateRequest } from '../../../shared/middleware/validateRequest';
import {
  createClientSchema,
  updateClientSchema,
} from '../schemas/clientSchemas';

const router = Router();
const clientController = new ClientController();

// All client routes require authentication
router.use(authMiddleware);

/**
 * GET /api/clients - List all clients with filtering and pagination
 * Query params: page, limit, sortBy, sortOrder, search, taxId
 */
router.get('/', clientController.getClients);

/**
 * GET /api/clients/count/total - Get total clients count
 */
router.get('/count/total', clientController.getClientsCount);

/**
 * GET /api/clients/search/:query - Search clients
 * Params: query, limit (optional)
 */
router.get('/search/:query', clientController.searchClients);

/**
 * GET /api/clients/:id - Get client by ID
 */
router.get('/:id', clientController.getClientById);

/**
 * POST /api/clients - Create new client
 * Body: name (required), email (optional), phone (optional), taxId (optional), address (optional), notes (optional)
 */
router.post(
  '/',
  requireRole(['admin', 'manager']),
  validateRequest(createClientSchema),
  clientController.createClient
);

/**
 * PUT /api/clients/:id - Update client
 * Body: name (optional), email (optional), phone (optional), taxId (optional), address (optional), notes (optional)
 */
router.put(
  '/:id',
  requireRole(['admin', 'manager']),
  validateRequest(updateClientSchema),
  clientController.updateClient
);

/**
 * DELETE /api/clients/:id - Delete client (admin only)
 */
router.delete(
  '/:id',
  requireRole(['admin']),
  clientController.deleteClient
);

export { router as clientRoutes };
