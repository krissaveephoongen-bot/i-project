/**
 * Express Server for Database Health Checks
 * Simple server to expose database connectivity endpoints
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const WebSocketHandler = require('./websocket-handler');
const healthRoutes = require('./health-routes'); // temporarily disabled
const projectRoutes = require('./project-routes');
const worklogRoutes = require('./worklog-routes');
const timeentriesRoutes = require('./timeentries-routes');
// const timesheetRoutes = require('./timesheet-routes');
// const taskRoutes = require('./task-routes');
const adminRoutes = require('./admin-routes');
// const adminUserRoutes = require('./admin-user-routes');
// const expenseRoutes = require('./expense-routes');
const reportsRoutes = require('./reports-routes');
const activityRoutes = require('./activity-routes');
// const userRoutes = require('./user-routes');
// const prismaAuthRoutes = require('./routes/prisma-auth-routes');
const authRoutes = require('./auth-routes');
const teamRoutes = require('./team-routes');
// const fileRoutes = require('./file-routes');
const exportRoutes = require('./export-routes');
// const templateRoutes = require('./template-routes');
// const customizationRoutes = require('./customization-routes');
// const analyticsAdvancedRoutes = require('./analytics-advanced-routes');
// const analyticsRoutes = require('./analytics-routes');
// const searchRoutes = require('./search-routes');
// const projectTeamRoutes = require('./project-team-routes');
const teamMemberRoutes = require('./team-member-routes');
// const customerRoutes = require('./customer-routes');
// const statusRoutes = require('./routes/status-routes');
// const prismaCostRoutes = require('./routes/prisma-cost-routes');
// const prismaProjectRoutes = require('./routes/prisma-project-routes');
// const prismaUserRoutes = require('./routes/prisma-user-routes'); // temporarily disabled
// const prismaAttachmentRoutes = require('./routes/prisma-attachment-routes');
// const prismaApprovalRoutes = require('./routes/prisma-approval-routes');
// const prismaDashboardRoutes = require('./routes/prisma-dashboard-routes'); // temporarily disabled
// const menuRoutes = require('./menu-routes'); // temporarily disabled
// const projectManagerRoutes = require('./project-manager-routes'); // temporarily disabled

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      // Add any other origins you need
    ];

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn('CORS blocked request from origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Enable CORS with options
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve admin console static files
app.use('/admin', express.static(path.join(__dirname, '../admin-console')));

// Health check routes - temporarily disabled
// app.use('/api', healthRoutes);

// Authentication routes (login, profile, password)
app.use('/api', authRoutes);

// User management routes - temporarily disabled for testing
// app.use('/api', userRoutes);

// Project management routes
app.use('/api', projectRoutes);

// Worklog/Timesheet routes
app.use('/api', worklogRoutes);

// Time entries routes (production-ready)
app.use('/api', timeentriesRoutes);

// Timesheet routes (new) - temporarily disabled due to Prisma issues
// app.use('/api', timesheetRoutes);

// Task routes (new) - temporarily disabled due to Prisma issues
// app.use('/api', taskRoutes);

// Admin routes (back office)
app.use('/api/admin', adminRoutes);

// Admin user management routes - temporarily disabled
// app.use('/api/admin/users', adminUserRoutes);

// Expense routes - temporarily disabled
// app.use('/api/expenses', expenseRoutes);

// Reports routes - temporarily disabled due to missing table schemas
// app.use('/api/reports', reportsRoutes);

// Activity log routes
app.use('/api/activities', activityRoutes);

// Teams management routes
app.use('/api/teams', teamRoutes);

// File management routes - temporarily disabled
// app.use('/api/files', fileRoutes);

// Export/Report download routes - temporarily disabled
// app.use('/api/export', exportRoutes);

// Template management routes - temporarily disabled
// app.use('/api/templates', templateRoutes);

// Customization routes - temporarily disabled
// app.use('/api/customization', customizationRoutes);

// Advanced analytics routes - temporarily disabled
// app.use('/api/analytics', analyticsAdvancedRoutes);

// Analytics summary routes - temporarily disabled
// app.use('/api', analyticsRoutes);

// Search routes - temporarily disabled
// app.use('/api', searchRoutes);

// Project team management routes - temporarily disabled
// app.use('/api', projectTeamRoutes);

// Team member management routes
app.use('/api', teamMemberRoutes);

// Customer management routes - temporarily disabled
// app.use('/api', customerRoutes);

// Status Page - temporarily disabled
// app.use(statusRoutes);

// Prisma API routes - temporarily disabled
// const prismaTaskRoutes = require('./routes/prisma-task-routes');
// const prismaTimesheetRoutes = require('./routes/prisma-timesheet-routes');

// Register Prisma API routes - temporarily disabled
// app.use('/api', prismaTaskRoutes);
// app.use('/api', prismaTimesheetRoutes);

// Other Prisma routes - temporarily disabled for testing
// app.use('/api/prisma', prismaCostRoutes);
// app.use('/api/prisma', prismaProjectRoutes);
// app.use('/api/prisma', prismaUserRoutes);
// app.use('/api/prisma', prismaAttachmentRoutes);
// app.use('/api/prisma', prismaApprovalRoutes);
// app.use('/api/prisma', prismaDashboardRoutes);

// Menu enhancement routes (dashboard stats, recent items, quick access) - temporarily disabled
// app.use('/api/menu', menuRoutes);

// Project Manager routes - temporarily disabled
// app.use('/api/project-managers', projectManagerRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Neon Database Project Management Service',
    version: '2.0.0',
    endpoints: {
      healthCheck: '/api/health/db',
      simpleCheck: '/api/health/db/simple',
      status: '/api/health/db/status',
      prisma: {
        users: {
          list: 'GET /api/prisma/users',
          create: 'POST /api/prisma/users',
          detail: 'GET /api/prisma/users/:id',
          update: 'PUT /api/prisma/users/:id',
          delete: 'DELETE /api/prisma/users/:id',
          changePassword: 'PUT /api/prisma/users/:id/change-password',
          activity: 'GET /api/prisma/users/:id/activity'
        },
        projects: {
          list: 'GET /api/prisma/projects',
          create: 'POST /api/prisma/projects',
          detail: 'GET /api/prisma/projects/:id',
          update: 'PUT /api/prisma/projects/:id',
          delete: 'DELETE /api/prisma/projects/:id',
          budgetAnalysis: 'GET /api/prisma/projects/:id/budget-analysis'
        },
        costs: {
          list: 'GET /api/prisma/costs',
          create: 'POST /api/prisma/costs',
          detail: 'GET /api/prisma/costs/:id',
          update: 'PUT /api/prisma/costs/:id',
          delete: 'DELETE /api/prisma/costs/:id',
          approve: 'POST /api/prisma/costs/:id/approve',
          summary: 'GET /api/prisma/costs/project/:projectId/summary'
        },
        attachments: {
          list: 'GET /api/prisma/attachments',
          detail: 'GET /api/prisma/attachments/:id',
          upload: 'POST /api/prisma/attachments',
          delete: 'DELETE /api/prisma/attachments/:id',
          costAttachments: 'GET /api/prisma/costs/:costId/attachments',
          uploadToCost: 'POST /api/prisma/costs/:costId/attachments'
        },
        approvals: {
          list: 'GET /api/prisma/approvals',
          create: 'POST /api/prisma/approvals',
          detail: 'GET /api/prisma/approvals/:id',
          update: 'PUT /api/prisma/approvals/:id',
          delete: 'DELETE /api/prisma/approvals/:id',
          costApprovals: 'GET /api/prisma/costs/:costId/approvals',
          pending: 'GET /api/prisma/pending-approvals',
          approveCost: 'POST /api/prisma/costs/:costId/approve',
          rejectCost: 'POST /api/prisma/costs/:costId/reject',
          statistics: 'GET /api/prisma/approval-statistics'
        }
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Create HTTP server and attach WebSocket
const server = http.createServer(app);
const wsHandler = new WebSocketHandler();
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  wsHandler.handleConnection(ws, req);
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Available endpoints:`);
  console.log(`   - GET /api/health/db - Full health check`);
  console.log(`   - GET /api/files - File management`);
  console.log(`   - GET /api/reports/data - Report data`);
  console.log(`   - GET /api/templates - Template management`);
  console.log(`   - GET /api/teams/:id/customization - Team customization`);
  console.log(`   - GET /api/analytics/* - Advanced analytics`);
  console.log(`   - WebSocket: wss://your-domain/api/ws - Real-time collaboration`);

  // Test database connection on startup - temporarily disabled
  // const { testConnection } = require('../database/neon-connection');
  // testConnection().catch(err => {
  //   console.error('❌ Startup connection test failed:', err.message);
  // });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;