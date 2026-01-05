import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { setCORSHeaders, handleOptions, errorResponse, successResponse, validationErrorResponse } from '../lib/response.js';
import { validateEmail, validateRequired } from '../lib/validation.js';

export default async (req, res) => {
  setCORSHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const { email, password } = req.body;

    // Validate inputs
    const errors = [];
    try {
      validateRequired(email, 'Email');
      validateEmail(email) || errors.push('Invalid email format');
    } catch (e) {
      errors.push(e.message);
    }

    try {
      validateRequired(password, 'Password');
    } catch (e) {
      errors.push(e.message);
    }

    if (errors.length > 0) {
      return validationErrorResponse(res, errors);
    }

    if (!process.env.DATABASE_URL) {
      return errorResponse(res, 'Database connection failed', 500);
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      const result = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;

      if (result.length === 0) {
        await sql.end();
        return errorResponse(res, 'Invalid credentials', 401);
      }

      const user = result[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        await sql.end();
        return errorResponse(res, 'Invalid credentials', 401);
      }

      // Update last login
      await sql`UPDATE users SET "lastLogin" = NOW() WHERE id = ${user.id}`;

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

      return successResponse(res, {
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
      }, 200, 'Login successful');
    } finally {
      try {
        await sql.end();
      } catch (e) {
        // Ignore
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500, error.message);
  }
};
