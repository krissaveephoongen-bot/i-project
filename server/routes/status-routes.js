const express = require('express');
const router = express.Router();
const { getConnectionStatus, healthCheck } = require('../../database/neon-connection');
const logger = require('../middleware/logger');
const Cache = require('../middleware/cache');
const performanceMonitor = require('../services/performance-monitor');
const healthMonitor = require('../services/health-monitor');
const webhookService = require('../services/webhook-service');
const analyticsService = require('../services/analytics-service');

// ============================================================================
// ENHANCED STATUS ROUTES WITH MONITORING, CACHING, AND REAL-TIME FEATURES
// ============================================================================

// 1. API endpoint for JSON status with caching
router.get('/api/status', async (req, res) => {
  try {
    const startTime = Date.now();
    const cacheKey = 'api:status';
    
    // Check cache first
    const cached = Cache.instance.get(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      res.set('X-Response-Time', '1ms');
      return res.json(cached);
    }

    const status = await healthCheck();
    const duration = Date.now() - startTime;

    performanceMonitor.trackDatabase('healthCheck', duration, true);
    performanceMonitor.trackEndpoint('GET', '/api/status', duration, 200);

    const response = {
      status: 'success',
      database: status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${duration}ms`
    };

    // Cache for 30 seconds
    Cache.instance.set(cacheKey, response, 30000);

    res.set('X-Cache', 'MISS');
    res.set('X-Response-Time', `${duration}ms`);
    res.json(response);

  } catch (error) {
    const duration = Date.now() - startTime;
    performanceMonitor.trackDatabase('healthCheck', duration, false);
    performanceMonitor.trackEndpoint('GET', '/api/status', duration, 500);
    logger.error('Status check failed', { error: error.message });
    healthMonitor.createAlert('STATUS_CHECK_FAILED', error.message, 'error');

    res.status(500).json({ 
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 2. Simple health check (no details, super fast)
router.get('/api/health', async (req, res) => {
  try {
    const status = await healthCheck();
    res.json({ 
      healthy: true,
      database: status.status === 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      healthy: false,
      error: error.message 
    });
  }
});

// 3. Detailed health monitoring endpoint
router.get('/api/health/detailed', async (req, res) => {
  try {
    const healthStatus = healthMonitor.getStatus();
    const perfMetrics = performanceMonitor.getDashboard();
    const analyticsData = analyticsService.getAnalytics();

    res.json({
      health: healthStatus,
      performance: perfMetrics,
      analytics: analyticsData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// 4. Performance metrics endpoint
router.get('/api/metrics/performance', (req, res) => {
  try {
    const dashboard = performanceMonitor.getDashboard();
    const slowQueries = performanceMonitor.getSlowQueries(5);

    res.json({
      dashboard,
      slowQueries,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Performance metrics failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// 5. Analytics endpoint
router.get('/api/metrics/analytics', (req, res) => {
  try {
    const analytics = analyticsService.getAnalytics();
    const healthScore = analyticsService.getHealthScore();

    res.json({
      analytics,
      healthScore,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Analytics failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// 6. Webhook management endpoints
router.post('/api/webhooks', (req, res) => {
  try {
    const { url, events } = req.body;
    const id = `webhook_${Date.now()}`;
    
    const webhook = webhookService.registerWebhook(id, { url, events });
    res.status(201).json(webhook);
  } catch (error) {
    logger.error('Webhook registration failed', { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

router.get('/api/webhooks', (req, res) => {
  try {
    const stats = webhookService.getWebhookStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/webhooks/:id/test', (req, res) => {
  try {
    const result = webhookService.testWebhook(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/api/webhooks/:id', (req, res) => {
  try {
    const success = webhookService.removeWebhook(req.params.id);
    res.json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 7. HTML status page with enhanced UI and auto-refresh
router.get('/status', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>System Status & Monitoring Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="refresh" content="30">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: white; margin-bottom: 30px; text-align: center; }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card { 
      background: white; 
      border-radius: 12px; 
      padding: 20px; 
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
    
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 12px;
      margin-right: 10px;
    }
    .badge-healthy { background: #4CAF50; color: white; }
    .badge-warning { background: #ff9800; color: white; }
    .badge-error { background: #f44336; color: white; }
    
    .metric { margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 8px; }
    .metric-label { font-weight: bold; color: #333; }
    .metric-value { color: #666; margin-top: 5px; font-size: 14px; }
    
    .chart { margin-top: 15px; height: 200px; background: #fafafa; border-radius: 8px; }
    
    .button-group { display: flex; gap: 10px; margin-top: 20px; }
    .btn { 
      flex: 1;
      padding: 10px 15px; 
      border: none; 
      border-radius: 6px; 
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }
    .btn-primary { background: #667eea; color: white; }
    .btn-primary:hover { background: #5568d3; }
    .btn-secondary { background: #e0e0e0; color: #333; }
    .btn-secondary:hover { background: #d0d0d0; }
    
    .error-list { background: #ffebee; padding: 10px; border-radius: 8px; margin-top: 10px; }
    .error-item { padding: 8px; border-left: 4px solid #f44336; margin: 5px 0; }
    
    .endpoint-item { 
      padding: 10px; 
      background: #f5f5f5; 
      border-left: 4px solid #667eea;
      margin: 5px 0;
      border-radius: 4px;
    }
    
    .timestamp { color: #999; font-size: 12px; margin-top: 10px; }
    
    @media (max-width: 768px) {
      .grid { grid-template-columns: 1fr; }
      body { padding: 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚙️ System Status & Monitoring</h1>
    
    <div id="status-container" class="grid"></div>
    
    <div class="button-group">
      <button class="btn btn-primary" onclick="refreshStatus()">🔄 Refresh Now</button>
      <button class="btn btn-secondary" onclick="toggleAutoRefresh()">⏱️ Toggle Auto-Refresh (30s)</button>
    </div>
  </div>

  <script>
    let autoRefreshEnabled = true;
    let autoRefreshInterval = null;

    async function loadStatus() {
      const container = document.getElementById('status-container');
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: white;">⏳ Loading...</div>';
      
      try {
        // Fetch all endpoints
        const [status, health, detailed, perf, analytics] = await Promise.all([
          fetch('/api/status').then(r => r.json()),
          fetch('/api/health').then(r => r.json()).catch(() => ({ healthy: false })),
          fetch('/api/health/detailed').then(r => r.json()).catch(() => ({})),
          fetch('/api/metrics/performance').then(r => r.json()).catch(() => ({})),
          fetch('/api/metrics/analytics').then(r => r.json()).catch(() => ({}))
        ]);

        container.innerHTML = '';

        // 1. Overall Status Card
        const overallCard = document.createElement('div');
        overallCard.className = 'card';
        overallCard.innerHTML = \`
          <h2>Overall Status</h2>
          <span class="status-badge \${health.healthy ? 'badge-healthy' : 'badge-error'}">
            \${health.healthy ? '✓ HEALTHY' : '✗ UNHEALTHY'}
          </span>
          <div class="metric">
            <div class="metric-label">System Uptime</div>
            <div class="metric-value">\${Math.floor(status.uptime || 0)} seconds</div>
          </div>
          <div class="metric">
            <div class="metric-label">Last Check</div>
            <div class="metric-value">\${new Date(status.timestamp).toLocaleString()}</div>
          </div>
        \`;
        container.appendChild(overallCard);

        // 2. Database Card
        if (status.database) {
          const dbCard = document.createElement('div');
          dbCard.className = 'card';
          dbCard.innerHTML = \`
            <h2>📊 Database</h2>
            <div class="metric">
              <div class="metric-label">Status</div>
              <div class="metric-value">\${status.database.status || 'N/A'}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Provider</div>
              <div class="metric-value">\${status.database.provider || 'N/A'}</div>
            </div>
            <div class="metric">
              <div class="metric-label">PostgreSQL</div>
              <div class="metric-value">\${status.database.postgresVersion || 'N/A'}</div>
            </div>
          \`;
          container.appendChild(dbCard);
        }

        // 3. Performance Card
        if (perf.dashboard) {
          const perfCard = document.createElement('div');
          perfCard.className = 'card';
          perfCard.innerHTML = \`
            <h2>⚡ Performance</h2>
            <div class="metric">
              <div class="metric-label">Avg Response Time</div>
              <div class="metric-value">\${perf.dashboard.system.avgMemoryUsed}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Memory Usage</div>
              <div class="metric-value">\${perf.dashboard.system.avgMemoryUsed} / \${perf.dashboard.system.memoryLimit}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Endpoints Tracked</div>
              <div class="metric-value">\${perf.dashboard.endpoints.total}</div>
            </div>
          \`;
          container.appendChild(perfCard);
        }

        // 4. Analytics Card
        if (analytics.analytics) {
          const analyticsCard = document.createElement('div');
          analyticsCard.className = 'card';
          analyticsCard.innerHTML = \`
            <h2>📈 Analytics</h2>
            <div class="metric">
              <div class="metric-label">Active Users</div>
              <div class="metric-value">\${analytics.analytics.summary.activeUsers}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Requests (5m)</div>
              <div class="metric-value">\${analytics.analytics.summary.requestsLast5Min}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Error Rate</div>
              <div class="metric-value">\${analytics.analytics.summary.errorRate}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Health Score</div>
              <div class="metric-value">\${analytics.healthScore}/100</div>
            </div>
          \`;
          container.appendChild(analyticsCard);
        }

        // 5. Top Endpoints Card
        if (perf.dashboard && perf.dashboard.endpoints.topSlow.length > 0) {
          const endpointsCard = document.createElement('div');
          endpointsCard.className = 'card';
          endpointsCard.innerHTML = '<h2>🐢 Slowest Endpoints</h2>';
          
          perf.dashboard.endpoints.topSlow.slice(0, 5).forEach(ep => {
            const item = document.createElement('div');
            item.className = 'endpoint-item';
            item.innerHTML = \`
              <strong>\${ep.method} \${ep.path}</strong><br>
              Avg: \${ep.avgTime}ms | Calls: \${ep.calls}
            \`;
            endpointsCard.appendChild(item);
          });
          
          container.appendChild(endpointsCard);
        }

        // 6. Recent Errors Card
        if (analytics.analytics && analytics.analytics.recentErrors.length > 0) {
          const errorsCard = document.createElement('div');
          errorsCard.className = 'card';
          errorsCard.innerHTML = '<h2>⚠️ Recent Errors</h2>';
          
          const errorList = document.createElement('div');
          errorList.className = 'error-list';
          
          analytics.analytics.recentErrors.slice(0, 5).forEach(err => {
            const item = document.createElement('div');
            item.className = 'error-item';
            item.innerHTML = \`
              <strong>\${err.category}</strong>: \${err.error}
            \`;
            errorList.appendChild(item);
          });
          
          errorsCard.appendChild(errorList);
          container.appendChild(errorsCard);
        }

        // Add footer
        const footer = document.createElement('div');
        footer.className = 'card';
        footer.style.marginTop = '20px';
        footer.innerHTML = \`
          <p class="timestamp">
            Last updated: \${new Date().toLocaleTimeString()}<br>
            Auto-refresh: \${autoRefreshEnabled ? 'ENABLED (30s)' : 'DISABLED'}
          </p>
        \`;
        container.appendChild(footer);

      } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'card';
        errorDiv.style.background = '#ffebee';
        errorDiv.innerHTML = \`
          <h2>❌ Error Loading Status</h2>
          <p>\${error.message}</p>
          <p class="timestamp">Make sure the API server is running</p>
        \`;
        container.innerHTML = '';
        container.appendChild(errorDiv);
      }
    }

    function refreshStatus() {
      loadStatus();
    }

    function toggleAutoRefresh() {
      autoRefreshEnabled = !autoRefreshEnabled;
      if (autoRefreshEnabled) {
        startAutoRefresh();
        alert('Auto-refresh enabled (every 30 seconds)');
      } else {
        if (autoRefreshInterval) clearInterval(autoRefreshInterval);
        alert('Auto-refresh disabled');
      }
    }

    function startAutoRefresh() {
      if (autoRefreshInterval) clearInterval(autoRefreshInterval);
      autoRefreshInterval = setInterval(loadStatus, 30000);
    }

    // Load on page load
    window.addEventListener('DOMContentLoaded', () => {
      loadStatus();
      startAutoRefresh();
    });

    // Refresh when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) loadStatus();
    });
  </script>
</body>
</html>
  `;
  
  res.send(html);
});

// 8. Logs endpoint
router.get('/api/logs/:level', (req, res) => {
  try {
    const level = req.params.level.toUpperCase();
    const metrics = logger.getMetrics();
    
    const response = {
      level,
      totalRequests: metrics.totalRequests,
      totalErrors: metrics.totalErrors,
      avgResponseTime: metrics.avgResponseTime,
      recentErrors: metrics.recentErrors,
      statusHistory: metrics.statusHistory
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
