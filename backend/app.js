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

// Import routes using dynamic import with await
async function loadRoutes() {
  try {
    const authRoutes = (await import('./routes/auth-routes.js')).default;
    const userRoutes = (await import('./routes/user-routes.js')).default;
    const projectRoutes = (await import('./routes/project-routes.js')).default;
    const taskRoutes = (await import('./routes/task-routes.js')).default;
    const customerRoutes = (await import('./routes/customer-routes.js')).default;
    const analyticsRoutes = (await import('./routes/analytics-routes.js')).default;

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use('/api/customers', customerRoutes);
    app.use('/api/analytics', analyticsRoutes);

    console.log('All routes loaded successfully');
  } catch (error) {
    console.error('Failed to load routes:', error);
  }
}

// Load routes and then export for Vercel
loadRoutes().then(() => {
  // Routes are now loaded, export the app
}).catch(err => {
  console.error('Route loading failed:', err);
});

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
