import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  return authHeader.substring(7);
};

export const requireAuth = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

export const requireRole = (user, allowedRoles) => {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
};
