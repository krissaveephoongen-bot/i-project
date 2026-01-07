import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { checkDatabaseConnection } = await import('./lib/db.js');
    const dbResult = await checkDatabaseConnection();
    res.json({
      status: dbResult.success ? 'ok' : 'error',
      message: dbResult.success ? 'Server and database are running' : 'Database connection failed',
      database: dbResult.success ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Import routes synchronously
let routesLoaded = false;
let routeLoadError = null;

import('./routes/auth-routes.js').then(authRoutes => {
  app.use('/api/auth', authRoutes.default);
  console.log('Loaded auth routes');
}).catch(err => {
  routeLoadError = err;
  console.error('Failed to load auth routes:', err.message);
});

import('./routes/user-routes.js').then(userRoutes => {
  app.use('/api/users', userRoutes.default);
  console.log('Loaded user routes');
}).catch(err => {
  routeLoadError = err;
  console.error('Failed to load user routes:', err.message);
});

import('./routes/project-routes.js').then(projectRoutes => {
  app.use('/api/projects', projectRoutes.default);
  console.log('Loaded project routes');
}).catch(err => {
  routeLoadError = err;
  console.error('Failed to load project routes:', err.message);
});

import('./routes/task-routes.js').then(taskRoutes => {
  app.use('/api/tasks', taskRoutes.default);
  console.log('Loaded task routes');
}).catch(err => {
  routeLoadError = err;
  console.error('Failed to load task routes:', err.message);
});

import('./routes/customer-routes.js').then(customerRoutes => {
  app.use('/api/customers', customerRoutes.default);
  console.log('Loaded customer routes');
}).catch(err => {
  routeLoadError = err;
  console.error('Failed to load customer routes:', err.message);
});

import('./routes/analytics-routes.js').then(analyticsRoutes => {
  app.use('/api/analytics', analyticsRoutes.default);
  console.log('Loaded analytics routes');
}).catch(err => {
  routeLoadError = err;
  console.error('Failed to load analytics routes:', err.message);
});

// Wait for routes to load, then set flag
setTimeout(() => {
  routesLoaded = true;
  console.log('Route loading complete');
}, 1000);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

export default app;
