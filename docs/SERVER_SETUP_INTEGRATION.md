# 🔧 Server Integration Setup

This file shows exactly how to integrate all 10 enhancements into your existing `server/app.js`.

## Quick Integration Checklist

- [ ] Add middleware imports
- [ ] Add rate limiter
- [ ] Add request logger
- [ ] Add health checks
- [ ] Add error handler (MUST be last)
- [ ] Test endpoints
- [ ] Configure webhooks
- [ ] Monitor logs

---

## Step 1: Required Imports

Add these at the top of `server/app.js`:

```javascript
// ENHANCEMENTS IMPORTS
const RateLimiter = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/request-logger');
const ErrorHandler = require('./middleware/error-handler');
const logger = require('./middleware/logger');
const healthMonitor = require('./services/health-monitor');
const performanceMonitor = require('./services/performance-monitor');
const analyticsService = require('./services/analytics-service');
const Cache = require('./middleware/cache');
```

---

## Step 2: Initialize Enhancements (After `app = express()`)

```javascript
const app = express();

// ========================================
// ENHANCEMENTS SETUP
// ========================================

// 1. Rate Limiting (100 requests per 15 minutes)
const limiter = new RateLimiter({ 
  maxRequests: 100, 
  windowMs: 15 * 60 * 1000 
});
app.use('/api/', limiter.middleware());

// 2. Request Logging (logs all requests)
app.use(requestLogger());

// 3. CORS (existing)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

---

## Step 3: Health Check Setup (Before Routes)

```javascript
// ========================================
// HEALTH MONITORING SETUP
// ========================================

// Initialize health monitor
const { healthCheck } = require('../database/neon-connection');

// Register webhook for alerts (optional)
healthMonitor.registerWebhook('status-notifier', {
  url: process.env.WEBHOOK_URL || 'http://localhost:3000/alerts',
  events: ['status-change', 'alert']
});

// Start periodic health checks
let healthCheckInterval = setInterval(async () => {
  try {
    const health = await healthMonitor.checkHealth(healthCheck);
    
    if (health.status === 'unhealthy') {
      healthMonitor.createAlert(
        'DB_CONNECTION_FAILED',
        'Database is unreachable',
        'critical'
      );
    }
    
    // Trigger webhook if registered
    const webhooks = require('./services/webhook-service');
    if (health.status === 'unhealthy') {
      webhooks.trigger('status-change', health);
    }
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
  }
}, 30000); // Every 30 seconds
```

---

## Step 4: Add Status Routes

```javascript
// ========================================
// ROUTES
// ========================================

// Status and monitoring routes (with all enhancements)
const statusRoutes = require('./routes/status-routes');
app.use(statusRoutes);

// Your existing routes...
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
// ... rest of your routes ...
```

---

## Step 5: Error Handler (MUST BE LAST)

```javascript
// ========================================
// ERROR HANDLING (MUST BE LAST MIDDLEWARE)
// ========================================

app.use(ErrorHandler.middleware());

// Cleanup on shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, cleaning up...');
  clearInterval(healthCheckInterval);
  logger.info('Server shutting down gracefully');
  process.exit(0);
});
```

---

## Complete Example app.js

Here's a minimal working example:

```javascript
/**
 * Express Server with ALL 10 ENHANCEMENTS
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');

// Load env vars
dotenv.config();

// ========================================
// ENHANCEMENTS IMPORTS
// ========================================
const RateLimiter = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/request-logger');
const ErrorHandler = require('./middleware/error-handler');
const logger = require('./middleware/logger');
const healthMonitor = require('./services/health-monitor');
const analyticsService = require('./services/analytics-service');

// Routes imports
const statusRoutes = require('./routes/status-routes');
const healthRoutes = require('./health-routes');
const authRoutes = require('./auth-routes');
const projectRoutes = require('./project-routes');
// ... other routes ...

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// MIDDLEWARE SETUP
// ========================================

// 1. Rate limiting
const limiter = new RateLimiter({ 
  maxRequests: 100, 
  windowMs: 15 * 60 * 1000 
});
app.use('/api/', limiter.middleware());

// 2. Request logging (tracks all requests)
app.use(requestLogger());

// 3. Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// HEALTH MONITORING SETUP
// ========================================

const { healthCheck } = require('../database/neon-connection');
const WebSocketHandler = require('./websocket-handler');

// Register webhook (optional - for external alerts)
if (process.env.WEBHOOK_URL) {
  healthMonitor.registerWebhook('main-webhook', {
    url: process.env.WEBHOOK_URL,
    events: ['status-change', 'alert']
  });
}

// Start health checks every 30 seconds
let healthCheckInterval = setInterval(async () => {
  try {
    const health = await healthMonitor.checkHealth(healthCheck);
    
    if (health.status === 'unhealthy') {
      healthMonitor.createAlert(
        'DB_CONNECTION_FAILED',
        'Cannot connect to database',
        'critical'
      );
      
      // Also notify via webhooks
      const webhookService = require('./services/webhook-service');
      webhookService.trigger('database-offline', health);
    }
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
  }
}, 30000); // Every 30 seconds

// ========================================
// ROUTES
// ========================================

// Status and monitoring routes (includes /status dashboard)
app.use(statusRoutes);

// Core API routes
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', projectRoutes);
// ... add all your other routes ...

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Project Management System',
    version: '2.0.0',
    status: 'running',
    monitoring: {
      dashboard: 'GET /status',
      health: 'GET /api/health',
      metrics: {
        performance: 'GET /api/metrics/performance',
        analytics: 'GET /api/metrics/analytics'
      }
    }
  });
});

// ========================================
// ERROR HANDLING (MUST BE LAST)
// ========================================

app.use(ErrorHandler.middleware());

// ========================================
// HTTP & WEBSOCKET SERVER
// ========================================

const server = http.createServer(app);

// WebSocket setup (existing)
const wsHandler = new WebSocketHandler();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  wsHandler.handleConnection(ws, req);
});

// ========================================
// SERVER STARTUP
// ========================================

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`, { port: PORT });
  logger.info('📊 Monitoring enabled', {
    dashboard: `http://localhost:${PORT}/status`,
    healthCheck: `http://localhost:${PORT}/api/health`,
    metrics: `http://localhost:${PORT}/api/metrics/performance`
  });

  // Test database on startup
  const testConnection = async () => {
    try {
      const result = await healthCheck();
      logger.info('✅ Database connected on startup', { result });
    } catch (error) {
      logger.error('❌ Database connection failed on startup', { 
        error: error.message 
      });
    }
  };
  testConnection();
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  clearInterval(healthCheckInterval);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
});

module.exports = app;
```

---

## Environment Variables

Add these to your `.env`:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database (existing)
DATABASE_URL=postgres://...

# Enhancements
WEBHOOK_URL=https://your-monitoring.com/webhook
LOG_LEVEL=debug
```

---

## Testing the Integration

### 1. Test Status Dashboard
```bash
# Visit in browser
http://localhost:5000/status
```

### 2. Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```

### 3. Test Metrics
```bash
curl http://localhost:5000/api/metrics/performance | jq
curl http://localhost:5000/api/metrics/analytics | jq
```

### 4. Test Rate Limiting
```bash
# This should work
curl http://localhost:5000/api/status

# After 100 requests in 15 minutes, you get:
# 429 Too many requests
```

### 5. Test Detailed Health
```bash
curl http://localhost:5000/api/health/detailed | jq
```

---

## Troubleshooting

### Logs not appearing?
Check `logs/` directory is created:
```bash
mkdir -p logs
```

### Status page not loading?
Make sure routes are registered before error handler:
```javascript
app.use(statusRoutes);  // BEFORE error handler
app.use(ErrorHandler.middleware());  // LAST
```

### Rate limiting too strict?
Adjust in app.js:
```javascript
const limiter = new RateLimiter({ 
  maxRequests: 1000,  // Increase this
  windowMs: 15 * 60 * 1000 
});
```

### Health checks logging too much?
Reduce frequency:
```javascript
}, 60000); // Change to 60 seconds instead of 30
```

---

## Security Notes

1. **Rate Limiting:** Enabled by default - adjust for your needs
2. **Logging:** All requests logged - disable DEBUG in production
3. **Error Details:** Minimized in production mode
4. **Webhooks:** Ensure HTTPS URLs for webhook endpoints
5. **Secrets:** Use environment variables for sensitive configs

---

## Performance Tips

1. Use caching for static endpoints:
```javascript
router.get('/api/config', Cache.instance.middleware('config', 60000));
```

2. Monitor slow operations:
```javascript
const slowQueries = performanceMonitor.getSlowQueries(10);
```

3. Track custom metrics:
```javascript
performanceMonitor.trackDatabase('myOperation', duration);
```

4. Check health regularly:
```javascript
const health = healthMonitor.getStatus();
```

---

## What's Monitored?

✅ Response times per endpoint
✅ Database query performance
✅ Active user sessions
✅ Request volume
✅ Error rates by category
✅ Memory usage
✅ Connection pool status
✅ System health
✅ Health alerts

---

**Status:** ✅ Ready to integrate!

Copy the setup code above into your `server/app.js` and restart the server.

Visit `/status` to see the monitoring dashboard.
