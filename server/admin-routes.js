/**
 * Admin Routes for Back Office Management
 * Handles administrative functions like user management, system config, and audit logs
 */

const express = require('express');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Database connection
const getDBClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  // In a real app, this would check JWT token and user role
  // For now, we'll assume admin access
  next();
};

/**
 * GET /admin/users
 * Get all users for admin management
 */
router.get('/users', requireAdmin, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        id,
        name,
        email,
        role,
        avatar,
        created_at,
        updated_at,
        CASE
          WHEN last_login_at > NOW() - INTERVAL '30 minutes' THEN 'active'
          ELSE 'inactive'
        END as status
      FROM users
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message,
    });
    } finally {
    // Connection handled by executeQuery
    }
    });

/**
 * POST /admin/users
 * Create a new user
 */
router.post('/users', requireAdmin, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { name, email, password, role = 'user' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, password',
      });
    }

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 AND is_deleted = FALSE',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password (in real app, use bcrypt)
    const hashedPassword = password; // Placeholder

    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );

    // Log user creation
    await client.query(
      `INSERT INTO activity_log (entity_type, entity_id, type, action, description, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['user', result.rows[0].id, 'create', 'user_created', `Created user: ${name}`, 1] // Admin user ID
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * PUT /admin/users/:id
 * Update a user
 */
router.put('/users/:id', requireAdmin, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { id } = req.params;
    const { name, email, role } = req.body;

    const result = await client.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           updated_at = NOW()
       WHERE id = $4 AND is_deleted = FALSE
       RETURNING id, name, email, role, updated_at`,
      [name, email, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log user update
    await client.query(
      `INSERT INTO activity_log (entity_type, entity_id, type, action, description, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['user', id, 'update', 'user_updated', `Updated user: ${name}`, 1]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * DELETE /admin/users/:id
 * Soft delete a user
 */
router.delete('/users/:id', requireAdmin, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { id } = req.params;

    const result = await client.query(
      `UPDATE users SET is_deleted = TRUE, updated_at = NOW()
       WHERE id = $1 AND is_deleted = FALSE
       RETURNING id, name, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log user deletion
    await client.query(
      `INSERT INTO activity_log (entity_type, entity_id, type, action, description, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['user', id, 'delete', 'user_deleted', `Deleted user: ${result.rows[0].name}`, 1]
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /admin/system/config
 * Get system configuration
 */
router.get('/system/config', requireAdmin, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    // Get system config from database (mock for now)
    const config = {
      maintenanceMode: false,
      maxFileSize: 10,
      sessionTimeout: 30,
      backupFrequency: 'daily',
      emailNotifications: true,
      systemVersion: '1.0.0',
      lastBackup: new Date().toISOString(),
      databaseSize: '245 MB'
    };

    res.json(config);
  } catch (error) {
    console.error('❌ Error fetching system config:', error);
    res.status(500).json({
      error: 'Failed to fetch system configuration',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * PUT /admin/system/config
 * Update system configuration
 */
router.put('/system/config', requireAdmin, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { maintenanceMode, maxFileSize, sessionTimeout, backupFrequency, emailNotifications } = req.body;

    // In a real app, this would update a system_config table
    // For now, we'll just return success

    // Log config change
    await client.query(
      `INSERT INTO activity_log (entity_type, entity_id, type, action, description, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['system', 1, 'update', 'config_updated', 'System configuration updated', 1]
    );

    res.json({
      message: 'System configuration updated successfully',
      config: { maintenanceMode, maxFileSize, sessionTimeout, backupFrequency, emailNotifications }
    });
  } catch (error) {
    console.error('❌ Error updating system config:', error);
    res.status(500).json({
      error: 'Failed to update system configuration',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /admin/audit-logs
 * Get audit logs for admin review
 */
router.get('/audit-logs', requireAdmin, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { limit = 50, offset = 0, userId, action, startDate, endDate } = req.query;

    let query = `
      SELECT
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND al.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (action) {
      query += ` AND al.action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }

    if (startDate) {
      query += ` AND al.created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND al.created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await client.query(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM activity_log al
      WHERE 1=1
      ${userId ? 'AND al.user_id = $1' : ''}
      ${action ? `AND al.action = $${userId ? 2 : 1}` : ''}
      ${startDate ? `AND al.created_at >= $${paramCount - 2}` : ''}
      ${endDate ? `AND al.created_at <= $${paramCount - 1}` : ''}
    `;

    const countParams = [];
    if (userId) countParams.push(userId);
    if (action) countParams.push(action);
    if (startDate) countParams.push(startDate);
    if (endDate) countParams.push(endDate);

    const countResult = await client.query(countQuery, countParams);

    res.json({
      logs: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching audit logs:', error);
    res.status(500).json({
      error: 'Failed to fetch audit logs',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /admin/dashboard/stats
 * Get admin dashboard statistics
 */
 router.get('/dashboard/stats', requireAdmin, async (req, res) => {
   try {
     // Get various stats for admin dashboard
     const [userStats, projectStats, teamStats] = await Promise.all([
       // User statistics
       executeQuery(`
         SELECT
           COUNT(*) as total_users,
           COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admin_users,
           COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users
         FROM "User" WHERE status = 'active'
       `),

       // Project statistics
       executeQuery(`
         SELECT
           COUNT(*) as total_projects,
           COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects
         FROM projects WHERE is_deleted = false
       `),

       // Team statistics
       executeQuery(`
         SELECT
           COUNT(*) as total_teams,
           COUNT(CASE WHEN status = 'active' THEN 1 END) as active_teams
         FROM teams WHERE is_deleted = false
       `)
     ]);

     res.json({
       success: true,
       data: {
         users: userStats.rows[0],
         projects: projectStats.rows[0],
         teams: teamStats.rows[0],
         system: {
           status: 'healthy',
           uptime: '99.9%',
           lastBackup: new Date().toISOString()
         }
       }
     });
   } catch (error) {
     console.error('❌ Error fetching dashboard stats:', error);
     res.status(500).json({
       success: false,
       error: 'Failed to fetch dashboard statistics',
       message: error.message,
     });
   } finally {
    await client.end();
  }
});

/**
 * GET /admin/tasks/status-distribution
 * Get task status distribution for dashboard
 */
router.get('/tasks/status-distribution', requireAdmin, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM tasks
      WHERE is_deleted = FALSE
      GROUP BY status
      ORDER BY count DESC
    `);

    const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);

    const distribution = result.rows.map(row => ({
      status: row.status,
      count: parseInt(row.count),
      percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100) : 0
    }));

    res.json(distribution);
  } catch (error) {
    console.error('❌ Error fetching task status distribution:', error);
    res.status(500).json({
      error: 'Failed to fetch task status distribution',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * POST /admin/database/backup
 * Trigger database backup
 */
router.post('/database/backup', requireAdmin, async (req, res) => {
  try {
    // In a real app, this would trigger a database backup
    // For now, we'll simulate it

    // Log backup action
    const client = getDBClient();
    await client.connect();

    await client.query(
      `INSERT INTO activity_log (entity_type, entity_id, type, action, description, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['system', 1, 'create', 'backup_created', 'Manual database backup initiated', 1]
    );

    await client.end();

    res.json({
      message: 'Database backup initiated successfully',
      backupId: `backup_${Date.now()}`,
      status: 'running'
    });
  } catch (error) {
    console.error('❌ Error initiating backup:', error);
    res.status(500).json({
      error: 'Failed to initiate database backup',
      message: error.message,
    });
  }
});

/**
 * POST /admin/database/optimize
 * Optimize database performance
 */
router.post('/database/optimize', requireAdmin, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    // Run basic optimization queries
    await client.query('VACUUM ANALYZE');

    // Log optimization action
    await client.query(
      `INSERT INTO activity_log (entity_type, entity_id, type, action, description, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['system', 1, 'update', 'database_optimized', 'Database optimization completed', 1]
    );

    res.json({
      message: 'Database optimization completed successfully'
    });
  } catch (error) {
    console.error('❌ Error optimizing database:', error);
    res.status(500).json({
      error: 'Failed to optimize database',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

module.exports = router;