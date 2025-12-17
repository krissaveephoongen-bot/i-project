/**
 * Health Monitoring Service
 * Tracks system health and sends notifications
 */

const logger = require('../middleware/logger');

class HealthMonitor {
  constructor() {
    this.healthStatus = {
      database: 'unknown',
      api: 'healthy',
      memory: 'healthy',
      lastCheck: null,
      statusHistory: [],
      webhooks: [],
      alerts: []
    };
    this.thresholds = {
      memoryUsage: 0.85,
      responseTime: 5000,
      errorRate: 0.1
    };
    this.startMonitoring();
  }

  registerWebhook(url, events = ['status-change', 'alert']) {
    this.healthStatus.webhooks.push({ url, events, registered: new Date() });
    logger.info('Webhook registered', { url, events });
  }

  async checkHealth(healthCheckFn) {
    try {
      const startTime = Date.now();
      const result = await healthCheckFn();
      const duration = Date.now() - startTime;

      this.updateStatus('database', 'healthy', { duration, ...result });
      return {
        status: 'healthy',
        database: result,
        duration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.updateStatus('database', 'unhealthy', { error: error.message });
      logger.error('Health check failed', { error: error.message });
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = memUsage.heapUsed / memUsage.heapTotal;

    if (heapUsedPercent > this.thresholds.memoryUsage) {
      this.updateStatus('memory', 'warning', {
        usage: `${(heapUsedPercent * 100).toFixed(2)}%`,
        threshold: `${(this.thresholds.memoryUsage * 100).toFixed(2)}%`
      });
      this.createAlert('MEMORY_USAGE_HIGH', `Memory usage at ${(heapUsedPercent * 100).toFixed(2)}%`);
      return 'warning';
    }

    this.updateStatus('memory', 'healthy', { usage: `${(heapUsedPercent * 100).toFixed(2)}%` });
    return 'healthy';
  }

  updateStatus(component, status, details = {}) {
    const oldStatus = this.healthStatus[component];
    this.healthStatus[component] = status;
    this.healthStatus.lastCheck = new Date().toISOString();

    const statusChange = {
      component,
      oldStatus,
      newStatus: status,
      timestamp: new Date().toISOString(),
      details
    };

    this.healthStatus.statusHistory.push(statusChange);

    // Keep only last 100 status changes
    if (this.healthStatus.statusHistory.length > 100) {
      this.healthStatus.statusHistory.shift();
    }

    // Notify webhooks if status changed
    if (oldStatus !== status && oldStatus !== 'unknown') {
      this.notifyWebhooks('status-change', statusChange);
    }
  }

  createAlert(type, message, severity = 'warning') {
    const alert = {
      id: Date.now(),
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.healthStatus.alerts.push(alert);

    // Keep only last 50 alerts
    if (this.healthStatus.alerts.length > 50) {
      this.healthStatus.alerts.shift();
    }

    logger.warn(`Health alert: ${type}`, { message, severity });
    this.notifyWebhooks('alert', alert);

    return alert;
  }

  resolveAlert(alertId) {
    const alert = this.healthStatus.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
    }
  }

  async notifyWebhooks(event, data) {
    const webhooks = this.healthStatus.webhooks.filter(w => w.events.includes(event));

    for (const webhook of webhooks) {
      try {
        // This is a mock - in production use a real HTTP library
        logger.debug(`Webhook notification`, {
          url: webhook.url,
          event,
          data
        });
      } catch (error) {
        logger.error(`Webhook failed`, { url: webhook.url, error: error.message });
      }
    }
  }

  startMonitoring() {
    setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Every 30 seconds
  }

  getStatus() {
    return {
      overall: this.getOverallStatus(),
      ...this.healthStatus,
      alerts: this.healthStatus.alerts.filter(a => !a.resolved)
    };
  }

  getOverallStatus() {
    const statuses = Object.values(this.healthStatus)
      .filter(v => v === 'healthy' || v === 'warning' || v === 'unhealthy');
    
    if (statuses.includes('unhealthy')) return 'unhealthy';
    if (statuses.includes('warning')) return 'degraded';
    return 'healthy';
  }

  getStatusHistory(limit = 50) {
    return this.healthStatus.statusHistory.slice(-limit);
  }

  setThreshold(component, value) {
    this.thresholds[component] = value;
    logger.info(`Threshold updated: ${component}`, { value });
  }
}

module.exports = new HealthMonitor();
