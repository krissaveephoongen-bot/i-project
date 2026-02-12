import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware, requireRole } from '../../../shared/middleware/authMiddleware';
import { validateRequest } from '../../../shared/middleware/validateRequest';
import { updateUserSchema } from '../schemas/userSchemas';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authMiddleware);

// GET /api/users - Get all users (admin/manager only)
router.get(
  '/',
  requireRole(['admin', 'manager']),
  userController.getUsers
);

// GET /api/users/me - Get current user profile
router.get('/me', userController.getMe);

// PUT /api/users/me - Update current user profile
router.put(
  '/me',
  validateRequest(updateUserSchema),
  userController.updateMe
);

// GET /api/users/:id - Get user by ID (admin/manager only)
router.get(
  '/:id',
  requireRole(['admin', 'manager']),
  userController.getUserById
);

// PUT /api/users/:id - Update user (admin only)
router.put(
  '/:id',
  requireRole(['admin']),
  validateRequest(updateUserSchema),
  userController.updateUser
);

// DELETE /api/users/:id - Delete user (admin only)
router.delete(
  '/:id',
  requireRole(['admin']),
  userController.deleteUser
);

// GET /api/users/role/:role - Get users by role (admin/manager only)
router.get(
  '/role/:role',
  requireRole(['admin', 'manager']),
  userController.getUsersByRole
);

export { router as userRoutes };
