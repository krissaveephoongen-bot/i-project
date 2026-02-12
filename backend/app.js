import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkDatabaseConnection } from './lib/db.js';

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
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'cache-control',
    'expires',
    'pragma',
    'x-requested-with',
    'accept',
    'origin'
  ]
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
      users: '/api/users',
      projects: '/api/projects',
      insights: '/api/projects/insights',
      executiveReport: '/api/projects/executive-report',
      weeklySummary: '/api/projects/weekly-summary',
      tasks: '/api/tasks',
      customers: '/api/customers',
      analytics: '/api/analytics',
      dashboard: '/api/dashboard',
      expenses: '/api/expenses',
      timesheets: '/api/timesheets',
      reports: '/api/reports',
      search: '/api/search',
      teams: '/api/teams',
      performance: '/api/performance',
      projectManager: '/api/project-manager',
      resources: '/api/resources',
      resourceUtilization: '/api/resource-utilization',
      teamCapacity: '/api/team-capacity',
      progress: '/api/progress',
      vendor: '/api/vendor',
      stakeholder: '/api/stakeholder',
      staff: '/api/staff',
      approval: '/api/approval'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
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

// Import routes at build time
import authRoutes from './routes/auth-routes.js';
import userRoutes from './routes/user-routes.js';
import projectRoutes from './routes/project-routes.js';
import taskRoutes from './routes/task-routes.js';
import customerRoutes from './routes/customer-routes.js';
// import dashboardRoutes from './routes/dashboard-routes.js';
import analyticsRoutes from './routes/analytics-routes.js';
import expensesRoutes from './routes/expenses-routes.js';
import timesheetsRoutes from './routes/timesheets-routes.js';
import reportsRoutes from './routes/reports-routes.js';
import searchRoutes from './routes/search-routes.js';
import teamsRoutes from './routes/teams-routes.js';
import performanceRoutes from './routes/performance-routes.js';
import projectManagerRoutes from './routes/project-manager-routes.js';
import resourceRoutes from './routes/resource-routes.js';
import resourceUtilizationRoutes from './routes/resource-utilization-routes.js';
// import teamCapacityRoutes from './routes/team-capacity-routes.js';
// import progressRoutes from './routes/progress-routes.js';
import vendorRoutes from './routes/vendor-routes.js';
import stakeholderRoutes from './routes/stakeholder-routes.js';
import staffRoutes from './routes/staff-routes.js';
import approvalRoutes from './routes/approval-routes.js';
// import projectInsightsRoutes from './routes/project-insights-routes.js';
// import executiveReportRoutes from './routes/executive-report-routes.js';
// import weeklySummaryRoutes from './routes/weekly-summary-routes.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/customers', customerRoutes);
// app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/timesheets', timesheetsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/project-manager', projectManagerRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/resource-utilization', resourceUtilizationRoutes);
// app.use('/api/team-capacity', teamCapacityRoutes);
// app.use('/api/progress', progressRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/stakeholder', stakeholderRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/approval', approvalRoutes);
// app.use('/api/projects/insights', projectInsightsRoutes);
// app.use('/api/projects/executive-report', executiveReportRoutes);
// app.use('/api/projects/weekly-summary', weeklySummaryRoutes);

console.log('Routes registered');

app.get('/api/dashboard/kpi', (req, res) => {
  res.json({
    totalValue: 0,
    activeIssues: 0,
    billingForecast: 0,
    avgSpi: 1
  });
});

app.get('/api/dashboard/projects', (req, res) => {
  res.json([]);
});

app.get('/api/dashboard/financial', (req, res) => {
  res.json([]);
});

app.get('/api/dashboard/teamload', (req, res) => {
  res.json([]);
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

// Start server
const PORT = process.env.PORT || 3001;

// Only listen if run directly (not imported as a module by Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
