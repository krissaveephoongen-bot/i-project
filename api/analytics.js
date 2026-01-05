import jwt from 'jsonwebtoken';
import postgres from 'postgres';

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-V, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      if (req.method === 'GET') {
        // Return basic analytics summary
        const projects = await sql`SELECT COUNT(*) as count FROM projects`;
        const tasks = await sql`SELECT COUNT(*) as count FROM tasks`;
        const users = await sql`SELECT COUNT(*) as count FROM users`;

        await sql.end();

        return res.status(200).json({
          totalProjects: projects[0]?.count || 0,
          totalTasks: tasks[0]?.count || 0,
          totalUsers: users[0]?.count || 0,
          timestamp: new Date().toISOString()
        });
      } else {
        await sql.end();
        return res.status(405).json({ error: 'Method not allowed' });
      }
    } finally {
      try {
        await sql.end();
      } catch (e) {
        // Ignore
      }
    }
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(401).json({ error: error.message });
  }
};
