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
      `SELECT id, name, email, password, role, status FROM "User" WHERE email = $1`,
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
 * POST /auth/refresh
 * Refresh JWT token (for remember me functionality)
 */
router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token (in production, store refresh tokens in database)
    // For now, we'll create a new token if the refresh token format is valid
    try {
      // Generate new access token
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      const newToken = generateToken({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        token: newToken
      });
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message
    });
  }
});

/**
 * POST /auth/forgot-password
 * Send password reset email
 */
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const result = await executeQuery(
      `SELECT id, name, email FROM users WHERE email = $1 AND is_deleted = false`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in database
    await executeQuery(
      `UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour'
       WHERE id = $2`,
      [resetToken, user.id]
    );

    // In production, send email here
    console.log(`🔄 Password reset requested for ${email}`);
    console.log(`Reset token: ${resetToken}`);
    console.log(`Reset link: http://localhost:3000/auth/reset-password?token=${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
});

/**
 * POST /auth/reset-password
 * Reset password using token
 */
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }
    } catch (tokenError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token exists in database and hasn't expired
    const result = await executeQuery(
      `SELECT id FROM users
       WHERE id = $1 AND reset_token = $2 AND reset_token_expires > NOW() AND is_deleted = false`,
      [decoded.id, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await executeQuery(
      `UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, decoded.id]
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
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
