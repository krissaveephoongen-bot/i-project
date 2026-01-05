import jwt from 'jsonwebtoken';
import postgres from 'postgres';

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export default async (req, res) => {
  // Enable CORS
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
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      if (req.method === 'GET') {
        // Get all tasks
        const tasks = await sql`
          SELECT * FROM tasks
          ORDER BY "createdAt" DESC
        `;
        await sql.end();
        return res.status(200).json(tasks || []);
      } else if (req.method === 'POST') {
        // Create new task
        const { title, description, projectId, assignedTo, dueDate, priority, status } = req.body;
        
        if (!title || !projectId) {
          await sql.end();
          return res.status(400).json({ error: 'Title and project ID are required' });
        }

        const result = await sql`
          INSERT INTO tasks (title, description, "projectId", "assignedTo", "dueDate", priority, status, "createdBy", "createdAt")
          VALUES (${title}, ${description || null}, ${projectId}, ${assignedTo || null}, ${dueDate || null}, ${priority || 'medium'}, ${status || 'todo'}, ${decoded.id}, NOW())
          RETURNING *
        `;
        
        await sql.end();
        return res.status(201).json(result[0]);
      } else {
        await sql.end();
        return res.status(405).json({ error: 'Method not allowed' });
      }
    } finally {
      try {
        await sql.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    console.error('Tasks error:', error);
    return res.status(401).json({ error: error.message });
  }
};
