/**
 * Route Security Configuration
 * Centralized permission mapping for all API routes
 * Usage: Apply to all routes in app.js
 */

const {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireManager,
  checkProjectAccess,
  checkTeamAccess
} = require('./middleware/auth-middleware');

const {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions
} = require('./middleware/permissions-middleware');

/**
 * Route security middleware array
 * Each route specifies required middleware
 */
const routeSecurityRules = {
  // USER ROUTES
  'POST /api/users': [authenticateToken, checkPermission('users:create')],
  'GET /api/users': [authenticateToken, checkPermission('users:read')],
  'GET /api/users/:id': [authenticateToken, checkPermission('users:read')],
  'PUT /api/users/:id': [authenticateToken, checkPermission('users:update')],
  'DELETE /api/users/:id': [authenticateToken, checkPermission('users:delete')],
  'POST /api/users/:id/role': [authenticateToken, checkPermission('users:assign-role')],
  'PATCH /api/users/:id/status': [authenticateToken, checkPermission('users:change-status')],

  // PROJECT ROUTES
  'POST /api/projects': [authenticateToken, checkPermission('projects:create')],
  'GET /api/projects': [authenticateToken, checkPermission('projects:read')],
  'GET /api/projects/:id': [authenticateToken, checkProjectAccess, checkPermission('projects:read')],
  'PUT /api/projects/:id': [authenticateToken, checkProjectAccess, checkPermission('projects:update')],
  'DELETE /api/projects/:id': [authenticateToken, checkProjectAccess, checkPermission('projects:delete')],
  'POST /api/projects/:id/members': [authenticateToken, checkProjectAccess, checkPermission('projects:manage-team')],
  'DELETE /api/projects/:id/members/:memberId': [authenticateToken, checkProjectAccess, checkPermission('projects:manage-team')],
  'PATCH /api/projects/:id/budget': [authenticateToken, checkProjectAccess, checkPermission('projects:manage-budget')],

  // TASK ROUTES
  'POST /api/projects/:projectId/tasks': [authenticateToken, checkProjectAccess, checkPermission('tasks:create')],
  'GET /api/projects/:projectId/tasks': [authenticateToken, checkProjectAccess, checkPermission('tasks:read')],
  'GET /api/projects/:projectId/tasks/:taskId': [authenticateToken, checkProjectAccess, checkPermission('tasks:read')],
  'PUT /api/projects/:projectId/tasks/:taskId': [authenticateToken, checkProjectAccess, checkPermission('tasks:update')],
  'DELETE /api/projects/:projectId/tasks/:taskId': [authenticateToken, checkProjectAccess, checkPermission('tasks:delete')],

  // COST ROUTES
  'POST /api/costs': [authenticateToken, checkPermission('costs:create')],
  'GET /api/costs': [authenticateToken, checkPermission('costs:read')],
  'GET /api/costs/:id': [authenticateToken, checkPermission('costs:read')],
  'PUT /api/costs/:id': [authenticateToken, checkPermission('costs:update')],
  'DELETE /api/costs/:id': [authenticateToken, checkPermission('costs:delete')],
  'PATCH /api/costs/:id/approve': [authenticateToken, checkPermission('costs:approve')],
  'GET /api/costs/export': [authenticateToken, checkPermission('costs:export')],

  // TEAM ROUTES
  'POST /api/teams': [authenticateToken, checkPermission('teams:create')],
  'GET /api/teams': [authenticateToken, checkPermission('teams:read')],
  'GET /api/teams/:id': [authenticateToken, checkTeamAccess, checkPermission('teams:read')],
  'PUT /api/teams/:id': [authenticateToken, checkTeamAccess, checkPermission('teams:update')],
  'DELETE /api/teams/:id': [authenticateToken, checkPermission('teams:delete')],
  'POST /api/teams/:id/members': [authenticateToken, checkTeamAccess, checkPermission('teams:manage-members')],
  'DELETE /api/teams/:id/members/:memberId': [authenticateToken, checkTeamAccess, checkPermission('teams:manage-members')],

  // REPORT ROUTES
  'GET /api/reports': [authenticateToken, checkPermission('reports:read')],
  'GET /api/reports/export': [authenticateToken, checkPermission('reports:export')],
  'POST /api/reports/share': [authenticateToken, checkPermission('reports:share')],

  // ADMIN ROUTES
  'GET /api/admin': [authenticateToken, requireAdmin],
  'POST /api/admin/settings': [authenticateToken, checkPermission('admin:settings')],
  'GET /api/admin/audit': [authenticateToken, checkPermission('admin:audit')],
  'GET /api/admin/users': [authenticateToken, checkPermission('admin:users')],

  // ANALYTICS ROUTES
  'GET /api/analytics': [authenticateToken, checkPermission('analytics:view')],
  'GET /api/analytics/export': [authenticateToken, checkPermission('analytics:export')],
};

/**
 * Apply security middleware to Express app
 * Usage: applyRouteSecurity(app, routes)
 */
function applyRouteSecurity(app, routes) {
  return (req, res, next) => {
    const routeKey = `${req.method} ${req.path.split('/').slice(0, 3).join('/')}`;
    const middleware = routeSecurityRules[routeKey];

    if (middleware) {
      // Apply all middleware in sequence
      const executeMiddleware = (index) => {
        if (index >= middleware.length) {
          return next();
        }
        middleware[index](req, res, () => executeMiddleware(index + 1));
      };
      executeMiddleware(0);
    } else {
      // No rule found, require authentication
      authenticateToken(req, res, next);
    }
  };
}

module.exports = {
  routeSecurityRules,
  applyRouteSecurity
};
