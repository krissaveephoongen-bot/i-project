/**
 * Admin User Management Routes
 * RESTful API for creating and managing admin users
 */

const express = require('express');
const AdminUserService = require('./admin-user-service');

const router = express.Router();
const userService = new AdminUserService();

// ============================================
// USER MANAGEMENT ENDPOINTS
// ============================================

/**
 * POST /admin/users/init
 * Initialize database tables for admin users
 */
router.post('/users/init', async (req, res) => {
  try {
    const result = await userService.initializeTable();
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize admin user system',
      error: error.message
    });
  }
});

/**
 * POST /admin/users
 * Create a new admin user
 */
router.post('/users', async (req, res) => {
  try {
    const { email, name, password, department, position, phone, createdBy } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, name, password'
      });
    }

    const result = await userService.createAdminUser({
      email: email.toLowerCase(),
      name,
      password,
      department,
      position,
      phone,
      createdBy
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Create user error:', error);
    res.status(error.message.includes('already exists') ? 409 : 500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /admin/users/bulk
 * Create multiple admin users
 */
router.post('/users/bulk', async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Users array is required and must not be empty'
      });
    }

    const result = await userService.createBulkAdminUsers(users);
    res.status(200).json({
      success: true,
      message: `Created ${result.successful.length} users, ${result.failed.length} failed`,
      successful: result.successful,
      failed: result.failed
    });
  } catch (error) {
    console.error('❌ Bulk create error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk create users',
      error: error.message
    });
  }
});

/**
 * GET /admin/users
 * Get all admin users with filters
 */
router.get('/users', async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    const filters = {};

    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (search) filters.search = search;

    const result = await userService.getAllAdminUsers(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Fetch users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

/**
 * GET /admin/users/:id
 * Get specific admin user by ID
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await userService.getAdminUserById(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Fetch user error:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /admin/users/:id
 * Update admin user
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await userService.updateAdminUser(id, updateData);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PATCH /admin/users/:id/role
 * Update user role
 */
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    const result = await userService.updateUserRole(id, role);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Update role error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /admin/users/:id
 * Delete admin user (soft delete)
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await userService.deleteAdminUser(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /admin/users/stats
 * Get user statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await userService.getUserStatistics();
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

/**
 * GET /admin/users/:id/activity
 * Get user activity log
 */
router.get('/users/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const result = await userService.getUserActivityLog(id, parseInt(limit));
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Activity error:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
