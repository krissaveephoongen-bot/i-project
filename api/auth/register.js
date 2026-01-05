import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      // Check if user already exists
      const existing = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;

      if (existing.length > 0) {
        await sql.end();
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const result = await sql`
        INSERT INTO users (name, email, password, role, "isActive", status)
        VALUES (${name}, ${email}, ${hashedPassword}, 'employee', true, 'active')
        RETURNING id, name, email, role
      `;

      await sql.end();

      return res.status(201).json({
        message: 'User registered successfully',
        user: result[0],
      });
    } finally {
      try {
        await sql.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};
