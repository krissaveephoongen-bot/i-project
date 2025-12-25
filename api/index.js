import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.VERCEL_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import and register all routes
try {
  // Import routes from server directory
  const authRoutes = require('../server/auth-routes.js').default || require('../server/auth-routes.js');
  const projectRoutes = require('../server/project-routes.js').default || require('../server/project-routes.js');
  const taskRoutes = require('../server/task-routes.js').default || require('../server/task-routes.js');
  const userRoutes = require('../server/user-routes.js').default || require('../server/user-routes.js');
  const teamRoutes = require('../server/team-routes.js').default || require('../server/team-routes.js');

  // Register routes with /api prefix
  if (authRoutes) app.use('/api/auth', authRoutes);
  if (projectRoutes) app.use('/api/projects', projectRoutes);
  if (taskRoutes) app.use('/api/tasks', taskRoutes);
  if (userRoutes) app.use('/api/users', userRoutes);
  if (teamRoutes) app.use('/api/teams', teamRoutes);
} catch (error) {
  console.error('Error loading routes:', error);
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
