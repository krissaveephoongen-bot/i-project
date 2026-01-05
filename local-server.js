import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware - CORS with credentials support
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
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
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user info and token
    res.json({
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
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing.length > 0) {
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

    res.status(201).json({
      message: 'User registered successfully',
      user: result[0],
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await sql`
      SELECT id, name, email, role, avatar, department, position, "lastLogin"
      FROM users
      WHERE id = ${decoded.id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result[0] });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API available at http://localhost:${PORT}/api`);
  console.log('\nTest endpoints:');
  console.log(`  POST ${PORT}/api/auth/login`);
  console.log(`  POST ${PORT}/api/auth/register`);
  console.log(`  GET ${PORT}/api/auth/me`);
});
