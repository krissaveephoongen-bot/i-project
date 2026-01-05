import jwt from 'jsonwebtoken';
import postgres from 'postgres';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      const user = await sql`SELECT id, name, email, role FROM users WHERE id = ${decoded.id}`;
      await sql.end();

      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const newToken = jwt.sign(
        { id: user[0].id, email: user[0].email, role: user[0].role, name: user[0].name },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return res.status(200).json({ token: newToken });
    } finally {
      try {
        await sql.end();
      } catch (e) {
        // Ignore
      }
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ error: 'Token refresh failed' });
  }
};
