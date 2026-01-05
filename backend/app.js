import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Ticket APW API Backend',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      users: '/api/users'
    },
    docs: 'API endpoints are available under /api/*'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
(async () => {
  try {
    const projectRoutes = await import('./routes/project-routes.js').then(m => m.default).catch(() => null);
    const taskRoutes = await import('./routes/task-routes.js').then(m => m.default).catch(() => null);
    const userRoutes = await import('./routes/user-routes.js').then(m => m.default).catch(() => null);
    const authRoutes = await import('./routes/auth-routes.js').then(m => m.default).catch(() => null);

    if (projectRoutes) app.use('/api/projects', projectRoutes);
    if (taskRoutes) app.use('/api/tasks', taskRoutes);
    if (userRoutes) app.use('/api/users', userRoutes);
    if (authRoutes) app.use('/api/auth', authRoutes);
  } catch (error) {
    console.log('Routes not available in production:', error.message);
  }
})();

// Note: In Vercel deployment, static files and SPA routing are handled separately
// This Express app only serves API routes

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
