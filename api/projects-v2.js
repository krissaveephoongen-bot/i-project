import postgres from 'postgres';
import { setCORSHeaders, handleOptions, errorResponse, successResponse, paginatedResponse, validationErrorResponse } from './lib/response.js';
import { requireAuth } from './lib/auth.js';
import { validatePagination, validateRequired, validateMinLength } from './lib/validation.js';

export default async (req, res) => {
  setCORSHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const user = requireAuth(req, res);

    if (!process.env.DATABASE_URL) {
      return errorResponse(res, 'Database connection failed', 500);
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      if (req.method === 'GET') {
        // Get projects with pagination and filtering
        const { page = 1, limit = 10, search = '', status = '' } = req.query;

        try {
          const { page: p, limit: l, offset } = validatePagination(page, limit);

          let query = sql`SELECT * FROM projects WHERE "userId" = ${user.id}`;
          let countQuery = sql`SELECT COUNT(*) as count FROM projects WHERE "userId" = ${user.id}`;

          // Add search filter
          if (search) {
            query = sql`SELECT * FROM projects WHERE "userId" = ${user.id} AND (name ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})`;
            countQuery = sql`SELECT COUNT(*) as count FROM projects WHERE "userId" = ${user.id} AND (name ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})`;
          }

          // Add status filter
          if (status) {
            query = sql`SELECT * FROM projects WHERE "userId" = ${user.id} AND status = ${status}`;
            countQuery = sql`SELECT COUNT(*) as count FROM projects WHERE "userId" = ${user.id} AND status = ${status}`;
          }

          query = sql`${query} ORDER BY "createdAt" DESC LIMIT ${l} OFFSET ${offset}`;

          const [projects, countResult] = await Promise.all([query, countQuery]);
          const total = countResult[0]?.count || 0;

          await sql.end();
          return paginatedResponse(res, projects || [], p, l, total);
        } catch (e) {
          await sql.end();
          return validationErrorResponse(res, e.message);
        }
      } else if (req.method === 'POST') {
        // Create new project
        const { name, description, startDate, endDate, budget, status } = req.body;

        const errors = [];
        try {
          validateRequired(name, 'Name');
          validateMinLength(name, 3, 'Name');
        } catch (e) {
          errors.push(e.message);
        }

        if (errors.length > 0) {
          await sql.end();
          return validationErrorResponse(res, errors);
        }

        const result = await sql`
          INSERT INTO projects (name, description, "startDate", "endDate", budget, status, "userId", "createdBy", "createdAt")
          VALUES (${name}, ${description || null}, ${startDate || null}, ${endDate || null}, ${budget || 0}, ${status || 'planning'}, ${user.id}, ${user.id}, NOW())
          RETURNING *
        `;

        await sql.end();
        return successResponse(res, result[0], 201, 'Project created successfully');
      } else if (req.method === 'PUT') {
        // Update project
        const { id } = req.query;
        const { name, description, status, budget } = req.body;

        if (!id) {
          await sql.end();
          return errorResponse(res, 'Project ID is required', 400);
        }

        const result = await sql`
          UPDATE projects 
          SET name = ${name || undefined}, 
              description = ${description || undefined}, 
              status = ${status || undefined}, 
              budget = ${budget || undefined}
          WHERE id = ${id} AND "userId" = ${user.id}
          RETURNING *
        `;

        await sql.end();

        if (result.length === 0) {
          return errorResponse(res, 'Project not found', 404);
        }

        return successResponse(res, result[0], 200, 'Project updated successfully');
      } else if (req.method === 'DELETE') {
        // Delete project
        const { id } = req.query;

        if (!id) {
          await sql.end();
          return errorResponse(res, 'Project ID is required', 400);
        }

        const result = await sql`
          DELETE FROM projects 
          WHERE id = ${id} AND "userId" = ${user.id}
          RETURNING id
        `;

        await sql.end();

        if (result.length === 0) {
          return errorResponse(res, 'Project not found', 404);
        }

        return successResponse(res, { id: result[0].id }, 200, 'Project deleted successfully');
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
    console.error('Projects error:', error);
    return errorResponse(res, error.message || 'Request failed', 401);
  }
};
