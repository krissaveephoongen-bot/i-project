import { Router } from 'express';
import { costController } from '@/controllers/costController';
import { authenticate } from '@/middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/costs - Get all costs (with optional projectId query param)
router.get('/', costController.getCosts);

// GET /api/costs/summary/:projectId - Get cost summary for a project
router.get('/summary/:projectId', costController.getCostSummary);

// GET /api/costs/approvals/pending - Get pending cost approvals
router.get('/approvals/pending', costController.getPendingApprovals);

// POST /api/costs - Create a new cost
router.post('/', costController.createCost);

// GET /api/costs/:id - Get a specific cost
router.get('/:id', costController.getCostById);

// PUT /api/costs/:id - Update a cost
router.put('/:id', costController.updateCost);

// DELETE /api/costs/:id - Delete a cost
router.delete('/:id', costController.deleteCost);

// POST /api/costs/:id/approve - Approve a cost
router.post('/:id/approve', costController.approveCost);

// POST /api/costs/:id/reject - Reject a cost
router.post('/:id/reject', costController.rejectCost);

export default router;
