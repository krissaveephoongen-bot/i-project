import jwt from 'jsonwebtoken';
import postgres from 'postgres';

const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-V, Authorization'
  );
};

const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message, timestamp: new Date().toISOString() });
};

const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data, timestamp: new Date().toISOString() });
};

export default async (req, res) => {
  setCORSHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse(res, 'Authorization required', 401);
    }

    jwt.verify(authHeader.substring(7), process.env.JWT_SECRET || 'fallback-secret');

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      const projects = await sql`SELECT COUNT(*) as count FROM projects`;
      const tasks = await sql`SELECT COUNT(*) as count FROM tasks`;
      const users = await sql`SELECT COUNT(*) as count FROM users`;
      const costs = await sql`SELECT SUM(amount) as total FROM costs`;

      await sql.end();

      return successResponse(res, {
        totalProjects: projects[0]?.count || 0,
        totalTasks: tasks[0]?.count || 0,
        totalUsers: users[0]?.count || 0,
        totalCosts: costs[0]?.total || 0,
        timestamp: new Date().toISOString(),
      });
    } finally {
      try {
        await sql.end();
      } catch (e) {}
    }
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};
