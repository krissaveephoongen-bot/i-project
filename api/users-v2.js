import postgres from 'postgres';
import { setCORSHeaders, handleOptions, errorResponse, successResponse, paginatedResponse, validationErrorResponse } from './lib/response.js';
import { requireAuth, requireRole } from './lib/auth.js';
import { validatePagination, validateEmail } from './lib/validation.js';

export default async (req, res) => {
  setCORSHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const user = requireAuth(req, res);

    // Verify admin role for non-GET operations
    if (req.method !== 'GET') {
      requireRole(user, ['admin', 'superadmin']);
    }

    if (!process.env.DATABASE_URL) {
      return errorResponse(res, 'Database connection failed', 500);
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      if (req.method === 'GET') {
        // Get users with pagination and filtering
        const { page = 1, limit = 10, search = '', role = '', status = 'active' } = req.query;

        try {
          const { page: p, limit: l, offset } = validatePagination(page, limit);

          let query = sql`SELECT id, name, email, role, avatar, department, position, status, "isActive", "createdAt" FROM users`;
          let countQuery = sql`SELECT COUNT(*) as count FROM users`;

          const filters = [];

          if (search) {
            filters.push(sql`(name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`})`);
          }

          if (role) {
            filters.push(sql`role = ${role}`);
          }

          if (status) {
            filters.push(sql`status = ${status}`);
          }

          if (filters.length > 0) {
            const whereClause = filters.reduce((acc, f, i) => {
              if (i === 0) return f;
              return sql`${acc} AND ${f}`;
            });
            query = sql`SELECT id, name, email, role, avatar, department, position, status, "isActive", "createdAt" FROM users WHERE ${whereClause} ORDER BY "createdAt" DESC LIMIT ${l} OFFSET ${offset}`;
            countQuery = sql`SELECT COUNT(*) as count FROM users WHERE ${whereClause}`;
          } else {
            query = sql`SELECT id, name, email, role, avatar, department, position, status, "isActive", "createdAt" FROM users ORDER BY "createdAt" DESC LIMIT ${l} OFFSET ${offset}`;
          }

          const [users, countResult] = await Promise.all([query, countQuery]);
          const total = countResult[0]?.count || 0;

          await sql.end();
          return paginatedResponse(res, users || [], p, l, total);
        } catch (e) {
          await sql.end();
          return validationErrorResponse(res, e.message);
        }
      } else if (req.method === 'POST') {
        // Create new user (admin only)
        const { name, email, password, role } = req.body;

        const errors = [];
        if (!name) errors.push('Name is required');
        if (!email || !validateEmail(email)) errors.push('Valid email is required');
        if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
        if (!role) errors.push('Role is required');

        if (errors.length > 0) {
          await sql.end();
          return validationErrorResponse(res, errors);
        }

        const result = await sql`
          INSERT INTO users (name, email, password, role, "createdAt")
          VALUES (${name}, ${email}, ${password}, ${role}, NOW())
          RETURNING id, name, email, role
        `;

        await sql.end();
        return successResponse(res, result[0], 201, 'User created successfully');
      } else {
        await sql.end();
        return errorResponse(res, 'Method not allowed', 405);
      }
    } finally {
      try {
        await sql.end();
      } catch (e) {
        // Ignore
      }
    }
  } catch (error) {
    console.error('Users error:', error);
    return errorResponse(res, error.message || 'Request failed', 401);
  }
};
