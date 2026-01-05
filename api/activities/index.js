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
        const activities = await sql`
          SELECT * FROM activities 
          ORDER BY "createdAt" DESC 
          LIMIT 100
        `;
        await sql.end();
        return successResponse(res, activities);
      } else if (req.method === 'POST') {
        const { projectId, description, type } = req.body;
        if (!projectId || !description) {
          await sql.end();
          return errorResponse(res, 'projectId and description required', 400);
        }
        const result = await sql`
          INSERT INTO activities (projectId, description, type, "userId", "createdAt")
          VALUES (${projectId}, ${description}, ${type || 'update'}, ${user.id}, NOW())
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
