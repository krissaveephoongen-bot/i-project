import postgres from 'postgres';
import { setCORSHeaders, handleOptions, errorResponse, successResponse, paginatedResponse, validationErrorResponse } from './lib/response.js';
import { requireAuth } from './lib/auth.js';
import { validatePagination, validateRequired, validateInArray } from './lib/validation.js';

const VALID_STATUSES = ['todo', 'in-progress', 'done', 'cancelled'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

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
        // Get tasks with pagination and filtering
        const { page = 1, limit = 10, projectId = '', status = '', priority = '', search = '' } = req.query;

        try {
          const { page: p, limit: l, offset } = validatePagination(page, limit);

          let query = sql`SELECT * FROM tasks`;
          let countQuery = sql`SELECT COUNT(*) as count FROM tasks`;

          const filters = [];

          if (projectId) {
            filters.push(sql`"projectId" = ${projectId}`);
          }

          if (status && VALID_STATUSES.includes(status)) {
            filters.push(sql`status = ${status}`);
          }

          if (priority && VALID_PRIORITIES.includes(priority)) {
            filters.push(sql`priority = ${priority}`);
          }

          if (search) {
            filters.push(sql`(title ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})`);
          }

          if (filters.length > 0) {
            const whereClause = filters.reduce((acc, f, i) => {
              if (i === 0) return f;
              return sql`${acc} AND ${f}`;
            });
            query = sql`SELECT * FROM tasks WHERE ${whereClause} ORDER BY "createdAt" DESC LIMIT ${l} OFFSET ${offset}`;
            countQuery = sql`SELECT COUNT(*) as count FROM tasks WHERE ${whereClause}`;
          } else {
            query = sql`SELECT * FROM tasks ORDER BY "createdAt" DESC LIMIT ${l} OFFSET ${offset}`;
          }

          const [tasks, countResult] = await Promise.all([query, countQuery]);
          const total = countResult[0]?.count || 0;

          await sql.end();
          return paginatedResponse(res, tasks || [], p, l, total);
        } catch (e) {
          await sql.end();
          return validationErrorResponse(res, e.message);
        }
      } else if (req.method === 'POST') {
        // Create new task
        const { title, description, projectId, assignedTo, dueDate, priority, status } = req.body;

        const errors = [];
        try {
          validateRequired(title, 'Title');
          validateRequired(projectId, 'Project ID');
        } catch (e) {
          errors.push(e.message);
        }

        if (priority && !VALID_PRIORITIES.includes(priority)) {
          errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
        }

        if (status && !VALID_STATUSES.includes(status)) {
          errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
        }

        if (errors.length > 0) {
          await sql.end();
          return validationErrorResponse(res, errors);
        }

        const result = await sql`
          INSERT INTO tasks (title, description, "projectId", "assignedTo", "dueDate", priority, status, "createdBy", "createdAt")
          VALUES (${title}, ${description || null}, ${projectId}, ${assignedTo || null}, ${dueDate || null}, ${priority || 'medium'}, ${status || 'todo'}, ${user.id}, NOW())
          RETURNING *
        `;

        await sql.end();
        return successResponse(res, result[0], 201, 'Task created successfully');
      } else if (req.method === 'PUT') {
        // Update task
        const { id } = req.query;
        const { title, description, status, priority, assignedTo } = req.body;

        if (!id) {
          await sql.end();
          return errorResponse(res, 'Task ID is required', 400);
        }

        const updates = [];
        if (title) updates.push(sql`title = ${title}`);
        if (description !== undefined) updates.push(sql`description = ${description}`);
        if (status) updates.push(sql`status = ${status}`);
        if (priority) updates.push(sql`priority = ${priority}`);
        if (assignedTo) updates.push(sql`"assignedTo" = ${assignedTo}`);

        if (updates.length === 0) {
          await sql.end();
          return errorResponse(res, 'No fields to update', 400);
        }

        const updateClause = updates.reduce((acc, u, i) => {
          if (i === 0) return u;
          return sql`${acc}, ${u}`;
        });

        const result = await sql`
          UPDATE tasks 
          SET ${updateClause}
          WHERE id = ${id}
          RETURNING *
        `;

        await sql.end();

        if (result.length === 0) {
          return errorResponse(res, 'Task not found', 404);
        }

        return successResponse(res, result[0], 200, 'Task updated successfully');
      } else if (req.method === 'DELETE') {
        // Delete task
        const { id } = req.query;

        if (!id) {
          await sql.end();
          return errorResponse(res, 'Task ID is required', 400);
        }

        const result = await sql`
          DELETE FROM tasks 
          WHERE id = ${id}
          RETURNING id
        `;

        await sql.end();

        if (result.length === 0) {
          return errorResponse(res, 'Task not found', 404);
        }

        return successResponse(res, { id: result[0].id }, 200, 'Task deleted successfully');
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
    console.error('Tasks error:', error);
    return errorResponse(res, error.message || 'Request failed', 401);
  }
};
