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

    const token = authHeader.substring(7);
    const user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    // Check admin role
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return errorResponse(res, 'Admin access required', 403);
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      const roles = await sql`SELECT * FROM roles ORDER BY "createdAt" DESC`;
      const permissions = await sql`SELECT * FROM permissions ORDER BY "createdAt" DESC`;
      const teams = await sql`SELECT * FROM teams ORDER BY "createdAt" DESC`;

      await sql.end();

      return successResponse(res, {
        roles,
        permissions,
        teams,
        user: { id: user.id, email: user.email, role: user.role },
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
