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

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      if (req.method === 'GET') {
        const reports = await sql`SELECT * FROM reports ORDER BY "createdAt" DESC`;
        await sql.end();
        return successResponse(res, reports);
      } else if (req.method === 'POST') {
        const { title, description, projectId } = req.body;
        if (!title) {
          await sql.end();
          return errorResponse(res, 'title required', 400);
        }
        const result = await sql`
          INSERT INTO reports (title, description, projectId, "createdBy", "createdAt")
          VALUES (${title}, ${description || null}, ${projectId || null}, ${user.id}, NOW())
          RETURNING *
        `;
        await sql.end();
        return successResponse(res, result[0], 201);
      }
      await sql.end();
      return errorResponse(res, 'Method not allowed', 405);
    } finally {
      try {
        await sql.end();
      } catch (e) {}
    }
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};
