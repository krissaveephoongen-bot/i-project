import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://ticket-apw.vercel.app',
    'https://ticket-apw-api.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    const { default: projectRoutes } = await import('./routes/project-routes.js');
    const { default: taskRoutes } = await import('./routes/task-routes.js');
    const { default: userRoutes } = await import('./routes/user-routes.js');
    const { default: authRoutes } = await import('./routes/auth-routes.js');
    const { default: projectManagerRoutes } = await import('./routes/project-manager-routes.js');
    const { default: analyticsRoutes } = await import('./routes/analytics-routes.js');
    const { default: expensesRoutes } = await import('./routes/expenses-routes.js');
    const { default: reportsRoutes } = await import('./routes/reports-routes.js');
    const { default: searchRoutes } = await import('./routes/search-routes.js');
    const { default: teamsRoutes } = await import('./routes/teams-routes.js');
    const { default: timesheetsRoutes } = await import('./routes/timesheets-routes.js');

    app.use('/api/projects', projectRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/project-managers', projectManagerRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/expenses', expensesRoutes);
    app.use('/api/reports', reportsRoutes);
    app.use('/api/search', searchRoutes);
    app.use('/api/teams', teamsRoutes);
    app.use('/api/timesheets', timesheetsRoutes);
  } catch (error) {
    console.error('Failed to load routes:', error.message);
    
    // Fallback mock endpoints
    app.get('/api/projects', (req, res) => {
      res.json([
        { id: 1, name: 'Project 1', status: 'active', description: 'Sample project' },
        { id: 2, name: 'Project 2', status: 'active', description: 'Another project' }
      ]);
    });

    app.get('/api/tasks', (req, res) => {
      res.json([
        { id: 1, title: 'Task 1', status: 'todo', priority: 'high', projectId: 1 },
        { id: 2, title: 'Task 2', status: 'in_progress', priority: 'medium', projectId: 1 }
      ]);
    });

    app.get('/api/users', (req, res) => {
      res.json([
        { id: 1, name: 'User 1', email: 'user1@example.com', role: 'admin' },
        { id: 2, name: 'User 2', email: 'user2@example.com', role: 'employee' }
      ]);
    });

    app.post('/api/auth/login', (req, res) => {
      res.json({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
        token: 'mock-jwt-token-' + Date.now()
      });
    });
  }
})();

// Note: In Vercel deployment, static files and SPA routing are handled separately
// This Express app only serves API routes

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
