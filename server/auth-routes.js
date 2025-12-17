/**
 * Authentication Routes
 * Login, logout, token refresh, and user profile management
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/neon-connection');
const {
  authenticateToken,
  generateToken,
  verifyPassword,
  hashPassword
} = require('./middleware/auth-middleware');

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const result = await executeQuery(
      `SELECT id, name, email, password, role, status FROM users WHERE email = $1 AND is_deleted = false`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // Log login activity
    try {
      await executeQuery(
        `INSERT INTO activity_logs (user_id, action, description, ip_address)
         VALUES ($1, 'login', 'User logged in', $2)`,
        [user.id, req.ip]
      );
    } catch (e) {
      // Activity log table might not exist, continue
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

/**
 * POST /auth/logout
 * Logout user (token invalidation would require storing tokens in blacklist)
 */
router.post('/auth/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Log logout activity
    try {
      await executeQuery(
        `INSERT INTO activity_logs (user_id, action, description, ip_address)
         VALUES ($1, 'logout', 'User logged out', $2)`,
        [userId, req.ip]
      );
    } catch (e) {
      // Activity log table might not exist
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
});

/**
 * GET /auth/profile
 * Get current user profile
 */
router.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await executeQuery(
      `SELECT id, name, email, role, department, position, phone, status, created_at
       FROM users WHERE id = $1 AND is_deleted = false`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /auth/profile
 * Update user profile
 */
router.put('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, department, position, phone } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push(`name = $${params.length + 1}`);
      params.push(name);
    }
    if (department !== undefined) {
      updates.push(`department = $${params.length + 1}`);
      params.push(department);
    }
    if (position !== undefined) {
      updates.push(`position = $${params.length + 1}`);
      params.push(position);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${params.length + 1}`);
      params.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = NOW()');
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length + 1} RETURNING id, name, email, role, department, position, phone`;
    params.push(userId);

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /auth/password
 * Change user password
 */
router.put('/auth/password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get current password hash
    const result = await executeQuery(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const passwordValid = await verifyPassword(currentPassword, result.rows[0].password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await executeQuery(
      `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
      [hashedPassword, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Password change error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /auth/verify
 * Verify JWT token validity
 */
router.post('/auth/verify', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name
    }
  });
});

/**
 * POST /auth/pin-verify
 * Verify admin PIN and return JWT token for admin access
 * Bypasses email/password login - PIN only authentication
 */
router.post('/auth/pin-verify', async (req, res) => {
  try {
    const { pin } = req.body;

    // Validate input
    if (!pin) {
      return res.status(400).json({
        success: false,
        message: 'PIN is required'
      });
    }

    // Verify PIN (default: 123456)
    // TODO: Change this PIN and consider storing in database/environment
    const ADMIN_PIN = process.env.ADMIN_PIN || '123456';
    
    if (pin !== ADMIN_PIN) {
      return res.status(401).json({
        success: false,
        message: 'Invalid PIN'
      });
    }

    // Create admin session token
    // This creates a special admin token without a specific user ID
    const token = generateToken({
      id: 'admin-session',
      email: 'admin@system',
      role: 'admin',
      name: 'Admin',
      isPINVerified: true
    });

    res.status(200).json({
      success: true,
      message: 'PIN verification successful',
      token,
      user: {
        id: 'admin-session',
        name: 'Admin',
        email: 'admin@system',
        role: 'admin',
        isPINVerified: true
      }
    });
  } catch (error) {
    console.error('❌ PIN verification error:', error);
    res.status(500).json({
      success: false,
      message: 'PIN verification failed',
      error: error.message
    });
  }
});

module.exports = router;
