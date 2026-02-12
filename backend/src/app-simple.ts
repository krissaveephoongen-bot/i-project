import express from 'express';
import cors from 'cors';
import { AppError } from './shared/errors/AppError.js';

// Import refactored feature routes
import { authRoutes } from './features/auth/routes/authRoutes.js';
import { userRoutes } from './features/users/routes/userRoutes.js';
import { projectRoutes } from './features/projects/routes/projectRoutes.js';
import { taskRoutes } from './features/tasks/routes/taskRoutes.js';
import { dashboardRoutes } from './features/dashboard/routes/dashboardRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'i-Project Backend API is running',
    version: '2.0.0',
    architecture: 'Feature-based organization',
    timestamp: new Date().toISOString(),
  });
});

// Feature-based routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

export default app;
