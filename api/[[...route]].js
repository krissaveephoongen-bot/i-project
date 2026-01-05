import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

// ===== UTILITIES =====
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-V, Authorization'
  );
};

const handleOptions = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
};

const successResponse = (res, data, statusCode = 200, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const paginatedResponse = (res, data, page, limit, total, statusCode = 200) => {
  const totalPages = Math.ceil(total / limit);
  return res.status(statusCode).json({
    success: true,
    message: 'Success',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
    timestamp: new Date().toISOString(),
  });
};

const errorResponse = (res, message, statusCode = 400, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  });
};

const validationErrorResponse = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: 'Validation error',
    errors: Array.isArray(errors) ? errors : [errors],
    timestamp: new Date().toISOString(),
  });
};

const verifyToken = (authHeader) => {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header');
  }
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePagination = (page, limit) => {
  const p = page ? parseInt(page) : 1;
  const l = limit ? parseInt(limit) : 10;
  if (p < 1) throw new Error('Page must be greater than 0');
  if (l < 1 || l > 100) throw new Error('Limit must be between 1 and 100');
  return { page: p, limit: l, offset: (p - 1) * l };
};

// ===== ROUTE HANDLERS =====

async function handleAuth(req, res, route) {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    if (route === 'auth/login' && req.method === 'POST') {
      const { email, password } = req.body;
      const errors = [];

      if (!email || !validateEmail(email)) errors.push('Valid email required');
      if (!password) errors.push('Password required');

      if (errors.length > 0) {
        await sql.end();
        return validationErrorResponse(res, errors);
      }

      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (result.length === 0) {
        await sql.end();
        return errorResponse(res, 'Invalid credentials', 401);
      }

      const user = result[0];
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        await sql.end();
        return errorResponse(res, 'Invalid credentials', 401);
      }

      await sql`UPDATE users SET "lastLogin" = NOW() WHERE id = ${user.id}`;

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      await sql.end();
      return successResponse(res, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          department: user.department,
          position: user.position,
        },
        token,
      }, 200, 'Login successful');
    } else if (route === 'auth/register' && req.method === 'POST') {
      const { email, password, name } = req.body;
      const errors = [];

      if (!name) errors.push('Name required');
      if (!email || !validateEmail(email)) errors.push('Valid email required');
      if (!password || password.length < 6) errors.push('Password must be at least 6 characters');

      if (errors.length > 0) {
        await sql.end();
        return validationErrorResponse(res, errors);
      }

      const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
      if (existing.length > 0) {
        await sql.end();
        return errorResponse(res, 'Email already registered', 409);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await sql`
        INSERT INTO users (name, email, password, role, "isActive", status, "createdAt")
        VALUES (${name}, ${email}, ${hashedPassword}, 'user', true, 'active', NOW())
        RETURNING id, name, email, role
      `;

      const token = jwt.sign(
        { id: result[0].id, email: result[0].email, role: result[0].role, name: result[0].name },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      await sql.end();
      return successResponse(res, { user: result[0], token }, 201, 'User registered successfully');
    } else if (route === 'auth/me' && req.method === 'GET') {
      const user = verifyToken(req.headers.authorization);
      const result = await sql`
        SELECT id, name, email, role, avatar, department, position, "lastLogin"
        FROM users WHERE id = ${user.id}
      `;

      await sql.end();
      if (result.length === 0) {
        return errorResponse(res, 'User not found', 404);
      }
      return successResponse(res, result[0]);
    } else {
      await sql.end();
      return errorResponse(res, 'Not found', 404);
    }
  } catch (error) {
    console.error('Auth error:', error);
    await sql.end();
    return errorResponse(res, error.message, 401);
  }
}

async function handleProjects(req, res, user) {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      const { page: p, limit: l, offset } = validatePagination(page, limit);

      let baseQuery = 'SELECT * FROM projects WHERE "userId" = $1';
      let countQuery = 'SELECT COUNT(*) as count FROM projects WHERE "userId" = $1';
      const params = [user.id];

      if (search) {
        baseQuery += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 2})`;
        countQuery += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 2})`;
        params.push(`%${search}%`, `%${search}%`);
      }

      if (status) {
        baseQuery += ` AND status = $${params.length + 1}`;
        countQuery += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      baseQuery += ` ORDER BY "createdAt" DESC LIMIT ${l} OFFSET ${offset}`;

      const projects = await sql.unsafe(baseQuery, params);
      const countResult = await sql.unsafe(countQuery, params.slice(0, params.length - (search ? 2 : 0) - (status ? 1 : 0)));
      const total = countResult[0]?.count || 0;

      await sql.end();
      return paginatedResponse(res, projects, p, l, total);
    } else if (req.method === 'POST') {
      const { name, description, budget } = req.body;
      if (!name || name.length < 3) {
        await sql.end();
        return validationErrorResponse(res, 'Project name required (min 3 characters)');
      }

      const result = await sql`
        INSERT INTO projects (name, description, budget, status, "userId", "createdBy", "createdAt")
        VALUES (${name}, ${description || null}, ${budget || 0}, 'planning', ${user.id}, ${user.id}, NOW())
        RETURNING *
      `;

      await sql.end();
      return successResponse(res, result[0], 201, 'Project created');
    } else {
      await sql.end();
      return errorResponse(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Projects error:', error);
    await sql.end();
    return errorResponse(res, error.message);
  }
}

async function handleTasks(req, res, user) {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, projectId = '', status = '' } = req.query;
      const { page: p, limit: l, offset } = validatePagination(page, limit);

      let query = 'SELECT * FROM tasks WHERE 1=1';
      const params = [];

      if (projectId) {
        query += ` AND "projectId" = $${params.length + 1}`;
        params.push(projectId);
      }

      if (status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      query += ` ORDER BY "createdAt" DESC LIMIT ${l} OFFSET ${offset}`;

      const tasks = await sql.unsafe(query, params);
      const countQuery = query.replace(/LIMIT.*OFFSET.*/, 'ORDER BY 1 DESC').replace('SELECT *', 'SELECT COUNT(*) as count');
      const countResult = await sql.unsafe(countQuery, params);
      const total = countResult[0]?.count || 0;

      await sql.end();
      return paginatedResponse(res, tasks, p, l, total);
    } else if (req.method === 'POST') {
      const { title, projectId } = req.body;
      if (!title || !projectId) {
        await sql.end();
        return validationErrorResponse(res, 'Title and project ID required');
      }

      const result = await sql`
        INSERT INTO tasks (title, "projectId", status, priority, "createdBy", "createdAt")
        VALUES (${title}, ${projectId}, 'todo', 'medium', ${user.id}, NOW())
        RETURNING *
      `;

      await sql.end();
      return successResponse(res, result[0], 201, 'Task created');
    } else {
      await sql.end();
      return errorResponse(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Tasks error:', error);
    await sql.end();
    return errorResponse(res, error.message);
  }
}

async function handleUsers(req, res, user) {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10 } = req.query;
      const { page: p, limit: l, offset } = validatePagination(page, limit);

      const users = await sql`
        SELECT id, name, email, role, department, position, "createdAt"
        FROM users
        ORDER BY "createdAt" DESC
        LIMIT ${l} OFFSET ${offset}
      `;

      const countResult = await sql`SELECT COUNT(*) as count FROM users`;
      const total = countResult[0]?.count || 0;

      await sql.end();
      return paginatedResponse(res, users, p, l, total);
    } else {
      await sql.end();
      return errorResponse(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Users error:', error);
    await sql.end();
    return errorResponse(res, error.message);
  }
}

async function handleHealth(req, res) {
  try {
    if (req.query.db) {
      const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });
      await sql`SELECT NOW()`;
      await sql.end();
      return successResponse(res, { status: 'ok', database: 'connected' });
    }
    return successResponse(res, { status: 'ok', message: 'API Gateway running' });
  } catch (error) {
    return errorResponse(res, 'Database connection failed', 503);
  }
}

// ===== MAIN ROUTER =====
export default async (req, res) => {
  setCORSHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const path = req.query.route?.join('/') || '';
    const routes = path.split('/').filter(Boolean);

    // Health check (no auth)
    if (routes[0] === 'health') {
      return handleHealth(req, res);
    }

    // Auth routes (no auth required)
    if (routes[0] === 'auth') {
      return handleAuth(req, res, path);
    }

    // All other routes require authentication
    if (!req.headers.authorization) {
      return errorResponse(res, 'Authorization required', 401);
    }

    const user = verifyToken(req.headers.authorization);

    // Route to handlers
    if (routes[0] === 'projects') {
      return handleProjects(req, res, user);
    } else if (routes[0] === 'tasks') {
      return handleTasks(req, res, user);
    } else if (routes[0] === 'users') {
      return handleUsers(req, res, user);
    } else {
      return errorResponse(res, 'Not found', 404);
    }
  } catch (error) {
    console.error('Router error:', error);
    return errorResponse(res, error.message || 'Internal server error', 500);
  }
};
