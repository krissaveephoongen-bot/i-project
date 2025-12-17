/**
 * Admin User Management Service
 * Complete admin user creation, management, and database operations
 */

const { Client } = require('pg');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

class AdminUserService {
  constructor() {
    this.dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  }

  /**
   * Get database client with SSL configuration
   */
  getClient() {
    return new Client({
      connectionString: this.dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  /**
   * Initialize admin user table if not exists
   */
  async initializeTable() {
    const client = this.getClient();
    try {
      await client.connect();
      console.log('📦 Initializing admin users table...');

      // Create enum type if not exists
      await client.query(`
        DO $$ BEGIN
          CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'user');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Create users table with admin-specific columns
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          password TEXT,
          role user_role_enum DEFAULT 'user',
          department TEXT,
          position TEXT,
          phone TEXT,
          avatar_url TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          is_deleted BOOLEAN DEFAULT FALSE,
          last_login_at TIMESTAMP WITH TIME ZONE,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);
      `);

      // Create updated_at trigger
      await client.query(`
        CREATE OR REPLACE FUNCTION update_users_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON users;
        CREATE TRIGGER update_users_updated_at_trigger
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_users_updated_at();
      `);

      console.log('✅ Users table initialized successfully');
      return { success: true, message: 'Table initialized' };
    } catch (error) {
      console.error('❌ Error initializing table:', error);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Hash password (in production, use bcrypt)
   */
  hashPassword(password) {
    // For demo purposes - use bcrypt in production
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Create admin user
   */
  async createAdminUser(userData) {
    const client = this.getClient();
    try {
      await client.connect();

      const { email, name, password, department = 'Admin', position = 'Administrator', phone = '', createdBy = null } = userData;

      // Validate required fields
      if (!email || !name || !password) {
        throw new Error('Missing required fields: email, name, password');
      }

      // Check if email already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1 AND is_deleted = FALSE',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error(`User with email ${email} already exists`);
      }

      // Hash password
      const hashedPassword = this.hashPassword(password);

      // Insert admin user
      const result = await client.query(
        `INSERT INTO users (email, name, password, role, department, position, phone, is_active, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8)
         RETURNING id, email, name, role, department, position, phone, is_active, created_at`,
        [email, name, hashedPassword, 'admin', department, position, phone, createdBy]
      );

      console.log('✅ Admin user created:', result.rows[0].email);
      return {
        success: true,
        message: 'Admin user created successfully',
        data: result.rows[0]
      };
    } catch (error) {
      console.error('❌ Error creating admin user:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Create multiple admin users (bulk)
   */
  async createBulkAdminUsers(usersData) {
    const client = this.getClient();
    try {
      await client.connect();
      const results = {
        successful: [],
        failed: []
      };

      for (const userData of usersData) {
        try {
          const { email, name, password, department = 'Admin', position = 'Administrator' } = userData;

          if (!email || !name || !password) {
            results.failed.push({ email, error: 'Missing required fields' });
            continue;
          }

          const hashedPassword = this.hashPassword(password);

          const result = await client.query(
            `INSERT INTO users (email, name, password, role, department, position, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, TRUE)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, email, name, role`,
            [email, name, hashedPassword, 'admin', department, position]
          );

          if (result.rows.length > 0) {
            results.successful.push(result.rows[0]);
          } else {
            results.failed.push({ email, error: 'User already exists' });
          }
        } catch (error) {
          results.failed.push({ email: userData.email, error: error.message });
        }
      }

      console.log(`✅ Bulk creation: ${results.successful.length} succeeded, ${results.failed.length} failed`);
      return results;
    } catch (error) {
      console.error('❌ Error in bulk user creation:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Get all admin users
   */
  async getAllAdminUsers(filters = {}) {
    const client = this.getClient();
    try {
      await client.connect();

      let query = `
        SELECT id, email, name, role, department, position, phone, is_active, created_at, updated_at
        FROM users
        WHERE is_deleted = FALSE
      `;
      const params = [];

      if (filters.role) {
        query += ` AND role = $${params.length + 1}`;
        params.push(filters.role);
      }

      if (filters.isActive !== undefined) {
        query += ` AND is_active = $${params.length + 1}`;
        params.push(filters.isActive);
      }

      if (filters.search) {
        query += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await client.query(query, params);
      return {
        success: true,
        count: result.rows.length,
        data: result.rows
      };
    } catch (error) {
      console.error('❌ Error fetching admin users:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Get admin user by ID
   */
  async getAdminUserById(userId) {
    const client = this.getClient();
    try {
      await client.connect();

      const result = await client.query(
        `SELECT id, email, name, role, department, position, phone, is_active, created_at, updated_at
         FROM users
         WHERE id = $1 AND is_deleted = FALSE`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('❌ Error fetching user:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Update admin user
   */
  async updateAdminUser(userId, updateData) {
    const client = this.getClient();
    try {
      await client.connect();

      const { name, email, department, position, phone, is_active } = updateData;
      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push(`name = $${params.length + 1}`);
        params.push(name);
      }
      if (email !== undefined) {
        updates.push(`email = $${params.length + 1}`);
        params.push(email);
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
      if (is_active !== undefined) {
        updates.push(`is_active = $${params.length + 1}`);
        params.push(is_active);
      }

      if (updates.length === 0) {
        return { success: false, message: 'No fields to update' };
      }

      params.push(userId);
      const query = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${params.length} AND is_deleted = FALSE
        RETURNING id, email, name, role, department, position, phone, is_active
      `;

      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      console.log('✅ User updated:', result.rows[0].email);
      return {
        success: true,
        message: 'User updated successfully',
        data: result.rows[0]
      };
    } catch (error) {
      console.error('❌ Error updating user:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId, newRole) {
    const client = this.getClient();
    try {
      await client.connect();

      const validRoles = ['admin', 'manager', 'user'];
      if (!validRoles.includes(newRole)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }

      const result = await client.query(
        `UPDATE users
         SET role = $1
         WHERE id = $2 AND is_deleted = FALSE
         RETURNING id, email, name, role`,
        [newRole, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      console.log(`✅ User role updated to ${newRole}:`, result.rows[0].email);
      return {
        success: true,
        message: 'User role updated',
        data: result.rows[0]
      };
    } catch (error) {
      console.error('❌ Error updating user role:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Delete admin user (soft delete)
   */
  async deleteAdminUser(userId) {
    const client = this.getClient();
    try {
      await client.connect();

      const result = await client.query(
        `UPDATE users
         SET is_deleted = TRUE
         WHERE id = $1
         RETURNING id, email, name`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      console.log('✅ User deleted:', result.rows[0].email);
      return {
        success: true,
        message: 'User deleted successfully',
        data: result.rows[0]
      };
    } catch (error) {
      console.error('❌ Error deleting user:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics() {
    const client = this.getClient();
    try {
      await client.connect();

      const result = await client.query(`
        SELECT
          COUNT(*) as total_users,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
          SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as manager_count,
          SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count,
          SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as new_users_this_month
        FROM users
        WHERE is_deleted = FALSE
      `);

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('❌ Error fetching statistics:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Get user activity log
   */
  async getUserActivityLog(userId, limit = 50) {
    const client = this.getClient();
    try {
      await client.connect();

      const result = await client.query(
        `SELECT id, email, name, last_login_at, created_at, updated_at
         FROM users
         WHERE id = $1 AND is_deleted = FALSE`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('❌ Error fetching activity:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }
}

module.exports = AdminUserService;
