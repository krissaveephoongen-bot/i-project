/**
 * Authentication & Authorization Middleware
 * Handles JWT token verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const { executeQuery } = require('../../database/neon-connection');

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  throw new Error('JWT_SECRET environment variable is required. Set it in your .env or .env.local file.');
})();

/**
 * Verify JWT token and attach user to request
 */
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please login first.'
    });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Check if user has required role(s)
 * @param {string|string[]} allowedRoles - Role or array of roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required role(s): ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

/**
 * Check if user is manager or admin
 */
const requireManager = (req, res, next) => {
  if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Manager access required'
    });
  }
  next();
};

/**
 * Check if user has access to a project
 * User must be: project owner, team member, or admin
 */
const checkProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Admin has access to everything
    if (userRole === 'admin') {
      return next();
    }

    // Check if user is project owner
    const ownerResult = await executeQuery(
      'SELECT id FROM projects WHERE id = $1 AND project_manager = $2',
      [projectId, userId]
    );

    if (ownerResult.rows.length > 0) {
      return next();
    }

    // Check if user is team member
    const memberResult = await executeQuery(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberResult.rows.length > 0) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have access to this project'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Access check failed',
      error: error.message
    });
  }
};

/**
 * Check if user has access to a team
 */
const checkTeamAccess = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Admin has access to everything
    if (userRole === 'admin') {
      return next();
    }

    // Check if user is team member or leader
    const result = await executeQuery(
      `SELECT id FROM team_members 
       WHERE team_id = $1 AND user_id = $2`,
      [teamId, userId]
    );

    if (result.rows.length > 0) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have access to this team'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Access check failed',
      error: error.message
    });
  }
};

/**
 * Generate JWT token
 * @param {Object} user - User object with id, email, role
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Verify password (for login)
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password from database
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (password, hash) => {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, hash);
};

/**
 * Hash password (for user creation/update)
 * @param {string} password - Plain text password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  const bcrypt = require('bcryptjs');
  return bcrypt.hash(password, 10);
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireManager,
  checkProjectAccess,
  checkTeamAccess,
  generateToken,
  verifyPassword,
  hashPassword
};
