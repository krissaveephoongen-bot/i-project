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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not configured');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // Connect to database
    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      // Find user by email
      const result = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;

      if (result.length === 0) {
        await sql.end();
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        await sql.end();
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      await sql.end();

      // Return user info and token
      return res.status(200).json({
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
      });
    } finally {
      try {
        await sql.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed', details: error.message });
  }
};
