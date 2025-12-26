/**
 * Express Server for Database Health Checks
 * Simple server to expose database connectivity endpoints
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Conditionally import WebSocket dependencies only for local development
let WebSocket, http, WebSocketHandler;
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  WebSocket = require('ws');
  http = require('http');
  WebSocketHandler = require('./websocket-handler');
}
const healthRoutes = require('./health-routes');
const projectRoutes = require('./project-routes');
const worklogRoutes = require('./worklog-routes');
const timeentriesRoutes = require('./timeentries-routes');
const timesheetRoutes = require('./timesheet-routes');
const taskRoutes = require('./task-routes');
const adminRoutes = require('./admin-routes');
const adminUserRoutes = require('./admin-user-routes');
const expenseRoutes = require('./expense-routes');
const reportsRoutes = require('./reports-routes');
const activityRoutes = require('./activity-routes');
const userRoutes = require('./user-routes');
// const prismaAuthRoutes = require('./routes/prisma-auth-routes');
const authRoutes = require('./auth-routes');
const teamRoutes = require('./team-routes');
const fileRoutes = require('./file-routes');
const exportRoutes = require('./export-routes');
const templateRoutes = require('./template-routes');
const customizationRoutes = require('./customization-routes');
const analyticsAdvancedRoutes = require('./analytics-advanced-routes');
const analyticsRoutes = require('./analytics-routes');
const searchRoutes = require('./search-routes');
const projectTeamRoutes = require('./project-team-routes');
const teamMemberRoutes = require('./team-member-routes');
const customerRoutes = require('./customer-routes');
// const statusRoutes = require('./routes/status-routes');
const prismaCostRoutes = require('./routes/prisma-cost-routes');
const prismaProjectRoutes = require('./routes/prisma-project-routes');
const prismaUserRoutes = require('./routes/prisma-user-routes');
const resourceManagementRoutes = require('./routes/resource-management-routes');
const projectManagerRoutes = require('./project-manager-routes');
// const prismaAttachmentRoutes = require('./routes/prisma-attachment-routes');
// const prismaApprovalRoutes = require('./routes/prisma-approval-routes');
// const prismaDashboardRoutes = require('./routes/prisma-dashboard-routes');
// const menuRoutes = require('./menu-routes');

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
      // Vercel deployment domains
      /\.vercel\.app$/,
      /^https?:\/\/.*\.vercel\.app$/,
      // Add any other origins you need
    ];

    // Check if the origin is in the allowed list or matches Vercel pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed || process.env.NODE_ENV === 'development' || process.env.VERCEL) {
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

// Health check routes
app.use('/api', healthRoutes);

// Authentication routes (login, profile, password)
app.use('/api', authRoutes);

// User management routes
app.use('/api', userRoutes);

// Project management routes
app.use('/api', projectRoutes);

// Worklog/Timesheet routes
app.use('/api', worklogRoutes);

// Time entries routes (production-ready)
app.use('/api', timeentriesRoutes);

// Timesheet routes (new)
app.use('/api', timesheetRoutes);

// Task routes (new)
app.use('/api', taskRoutes);

// Admin routes (back office)
app.use('/api/admin', adminRoutes);

// Admin user management routes
app.use('/api/admin/users', adminUserRoutes);

// Expense routes
app.use('/api/expenses', expenseRoutes);

// Reports routes
app.use('/api/reports', reportsRoutes);

// Activity log routes
app.use('/api/activities', activityRoutes);

// Teams management routes
app.use('/api/teams', teamRoutes);

// File management routes
app.use('/api/files', fileRoutes);

// Export/Report download routes
app.use('/api/export', exportRoutes);

// Template management routes
app.use('/api/templates', templateRoutes);

// Customization routes
app.use('/api/customization', customizationRoutes);

// Advanced analytics routes
app.use('/api/analytics', analyticsAdvancedRoutes);

// Analytics summary routes
app.use('/api', analyticsRoutes);

// Search routes
app.use('/api', searchRoutes);

// Project team management routes
app.use('/api', projectTeamRoutes);

// Team member management routes
app.use('/api', teamMemberRoutes);

// Customer management routes
app.use('/api', customerRoutes);

// Status Page - temporarily disabled
// app.use(statusRoutes);

// Prisma API routes
// const prismaTaskRoutes = require('./routes/prisma-task-routes');
// const prismaTimesheetRoutes = require('./routes/prisma-timesheet-routes');

// Register Prisma API routes
// app.use('/api', prismaTaskRoutes);
// app.use('/api', prismaTimesheetRoutes);

// Other Prisma routes
app.use('/api/prisma', prismaCostRoutes);
app.use('/api/prisma', prismaProjectRoutes);
app.use('/api/prisma', prismaUserRoutes);
// app.use('/api/prisma', prismaAttachmentRoutes);
// app.use('/api/prisma', prismaApprovalRoutes);
// app.use('/api/prisma', prismaDashboardRoutes);

// Menu enhancement routes (dashboard stats, recent items, quick access)
// app.use('/api/menu', menuRoutes);

// Project Manager routes
app.use('/api/project-managers', projectManagerRoutes);

// Resource Management routes
app.use('/api', resourceManagementRoutes);

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'debug',
    node_env: process.env.NODE_ENV,
    database_url: process.env.DATABASE_URL ? 'configured' : 'NOT SET',
    jwt_secret: process.env.JWT_SECRET ? 'configured' : 'NOT SET'
  });
});

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

// Server startup moved to end of file (only runs locally)

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Export for Vercel serverless + local development
module.exports = app;

// Only start HTTP server if running locally (not on Vercel)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  try {
    if (http && WebSocket && WebSocketHandler) {
      const server = http.createServer(app);
      const wsHandler = new WebSocketHandler();
      const wss = new WebSocket.Server({ server });

      wss.on('connection', (ws, req) => {
        wsHandler.handleConnection(ws, req);
      });

      server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    } else {
      console.log('WebSocket dependencies not available, starting server without WebSocket support');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} (without WebSocket)`);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err.message);
  }
}