/**
 * Advanced Permissions & Authorization Middleware
 * Implements granular permission checks beyond just roles
 * Includes resource-level access control
 */

const { executeQuery } = require('../../database/neon-connection');

/**
 * Permission definitions
 * Format: feature:action
 */
const PERMISSIONS = {
  // User Management
  'users:create': ['admin'],
  'users:read': ['admin', 'manager', 'self'],
  'users:update': ['admin', 'self'],
  'users:delete': ['admin'],
  'users:assign-role': ['admin'],
  'users:change-status': ['admin'],

  // Project Management
  'projects:create': ['admin', 'manager'],
  'projects:read': ['admin', 'manager', 'member', 'viewer'],
  'projects:update': ['admin', 'manager', 'owner'],
  'projects:delete': ['admin', 'manager'],
  'projects:manage-team': ['admin', 'manager', 'owner'],
  'projects:manage-budget': ['admin', 'manager'],

  // Cost Management
  'costs:create': ['admin', 'manager', 'member'],
  'costs:read': ['admin', 'manager', 'member', 'viewer'],
  'costs:update': ['admin', 'manager', 'creator'],
  'costs:delete': ['admin', 'manager'],
  'costs:approve': ['admin', 'manager'],
  'costs:export': ['admin', 'manager'],

  // Report Access
  'reports:read': ['admin', 'manager', 'member', 'viewer'],
  'reports:export': ['admin', 'manager'],
  'reports:share': ['admin', 'manager'],

  // Team Management
  'teams:create': ['admin', 'manager'],
  'teams:read': ['admin', 'manager', 'member'],
  'teams:update': ['admin', 'manager', 'owner'],
  'teams:delete': ['admin'],
  'teams:manage-members': ['admin', 'manager', 'owner'],

  // Project Manager Features
  'project-managers:create': ['admin'],
  'project-managers:read': ['admin', 'manager'],
  'project-managers:update': ['admin'],
  'project-managers:delete': ['admin'],
  'project-managers:assign': ['admin', 'manager'],

  // Admin Console
  'admin:access': ['admin'],
  'admin:settings': ['admin'],
  'admin:audit': ['admin'],
  'admin:users': ['admin'],

  // Analytics
  'analytics:view': ['admin', 'manager', 'member'],
  'analytics:export': ['admin', 'manager'],
};

/**
 * Check if user has a specific permission
 * @param {string} permission - Permission in format 'feature:action'
 * @param {string} role - User role
 * @param {Object} context - Additional context (userId, resourceOwnerId, etc.)
 * @returns {boolean}
 */
const hasPermission = (permission, role, context = {}) => {
  const allowedRoles = PERMISSIONS[permission];

  if (!allowedRoles) {
    console.warn(`Unknown permission: ${permission}`);
    return false;
  }

  // Check if role is in allowed roles
  if (allowedRoles.includes(role)) {
    return true;
  }

  // Check for context-based permissions (self, owner, creator)
  if (allowedRoles.includes('self') && context.userId === context.resourceUserId) {
    return true;
  }

  if (allowedRoles.includes('owner') && context.userId === context.resourceOwnerId) {
    return true;
  }

  if (allowedRoles.includes('creator') && context.userId === context.resourceCreatorId) {
    return true;
  }

  return false;
};

/**
 * Middleware to check permission
 * Usage: app.post('/api/projects/:id', checkPermission('projects:update'), handler)
 * @param {string} permission - Permission to check
 * @returns {Function} Express middleware
 */
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const context = {
        userId: req.user.id,
        resourceUserId: req.body?.userId || req.params?.userId,
        resourceOwnerId: req.body?.ownerId || req.params?.ownerId,
        resourceCreatorId: req.body?.createdBy || req.params?.createdBy
      };

      if (hasPermission(permission, req.user.role, context)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: `Permission denied: ${permission}`,
          requiredPermission: permission,
          userRole: req.user.role
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};

/**
 * Check multiple permissions (OR logic)
 * User needs at least one of the permissions
 */
const checkAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const context = {
        userId: req.user.id,
        resourceUserId: req.body?.userId || req.params?.userId,
        resourceOwnerId: req.body?.ownerId || req.params?.ownerId,
        resourceCreatorId: req.body?.createdBy || req.params?.createdBy
      };

      const hasAny = permissions.some(permission =>
        hasPermission(permission, req.user.role, context)
      );

      if (hasAny) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: `Permission denied: requires one of [${permissions.join(', ')}]`,
          requiredPermissions: permissions,
          userRole: req.user.role
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};

/**
 * Check all permissions (AND logic)
 * User needs all permissions
 */
const checkAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const context = {
        userId: req.user.id,
        resourceUserId: req.body?.userId || req.params?.userId,
        resourceOwnerId: req.body?.ownerId || req.params?.ownerId,
        resourceCreatorId: req.body?.createdBy || req.params?.createdBy
      };

      const hasAll = permissions.every(permission =>
        hasPermission(permission, req.user.role, context)
      );

      if (hasAll) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: `Permission denied: requires all of [${permissions.join(', ')}]`,
          requiredPermissions: permissions,
          userRole: req.user.role
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};

/**
 * Check project access for current user
 * Verifies user is: owner, team member, or admin
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
      req.projectOwner = true;
      return next();
    }

    // Check if user is team member
    const memberResult = await executeQuery(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberResult.rows.length > 0) {
      req.teamMember = true;
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
 * Check team access for current user
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
      `SELECT id, role FROM team_members 
       WHERE team_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [teamId, userId]
    );

    if (result.rows.length > 0) {
      req.teamMemberRole = result.rows[0].role;
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
 * Get all permissions for a user
 * @param {string} role - User role
 * @returns {string[]} Array of permission strings
 */
const getUserPermissions = (role) => {
  const userPermissions = [];

  for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
    if (allowedRoles.includes(role)) {
      userPermissions.push(permission);
    }
  }

  return userPermissions;
};

/**
 * Get permission definition
 */
const getPermissionDefinition = (permission) => {
  return PERMISSIONS[permission] || null;
};

/**
 * Get all available permissions
 */
const getAllPermissions = () => {
  return Object.keys(PERMISSIONS);
};

/**
 * Get all permissions grouped by feature
 */
const getPermissionsByFeature = () => {
  const grouped = {};

  for (const [permission, roles] of Object.entries(PERMISSIONS)) {
    const [feature, action] = permission.split(':');

    if (!grouped[feature]) {
      grouped[feature] = [];
    }

    grouped[feature].push({
      permission,
      action,
      allowedRoles: roles
    });
  }

  return grouped;
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  checkProjectAccess,
  checkTeamAccess,
  getUserPermissions,
  getPermissionDefinition,
  getAllPermissions,
  getPermissionsByFeature
};
