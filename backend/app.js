import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkDatabaseConnection } from './lib/db.js';
import { initRedis } from './lib/redis.js';

// Load environment variables
dotenv.config();

// Initialize Redis
initRedis();

const app = express();

const allowedOrigins = [
  'https://ticket-apw.vercel.app',
  'https://ticket-apw-api.vercel.app',
  'https://i-projects.skin',
  'https://www.i-projects.skin',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001'
];

if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
  allowedOrigins.push(...envOrigins);
}

// Middleware
app.use(cors({
  origin: allowedOrigins,
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
      cache: '/api/cache',
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

// Temporary filter options endpoint for testing
app.get('/api/filters/options', async (req, res) => {
  try {
    // Return static sample data for now
    const filterOptions = {
      projectStatuses: [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'active', label: 'Active' },
        { value: 'planning', label: 'Planning' },
      ],
      projectCategories: [
        { value: 'Development', label: 'Development' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Design', label: 'Design' },
      ],
      taskStatuses: [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
      taskPriorities: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ],
      taskCategories: [
        { value: 'Development', label: 'Development' },
        { value: 'Testing', label: 'Testing' },
        { value: 'Documentation', label: 'Documentation' },
      ],
      expenseCategories: [
        { value: 'travel', label: 'Travel' },
        { value: 'supplies', label: 'Supplies' },
        { value: 'equipment', label: 'Equipment' },
        { value: 'training', label: 'Training' },
        { value: 'other', label: 'Other' },
      ],
      expenseStatuses: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'reimbursed', label: 'Reimbursed' },
      ],
      userRoles: [
        { value: 'admin', label: 'Administrator' },
        { value: 'manager', label: 'Manager' },
        { value: 'employee', label: 'Employee' },
      ],
      clients: [
        { value: '1', label: 'Client A' },
        { value: '2', label: 'Client B' },
        { value: '3', label: 'Client C' },
      ],
      users: [
        { value: '1', label: 'John Doe' },
        { value: '2', label: 'Jane Smith' },
        { value: '3', label: 'Bob Johnson' },
      ],
    };

    res.json(filterOptions);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
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
import redisRoutes from './routes/redis-routes.js';
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
app.use('/api/cache', redisRoutes);
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
