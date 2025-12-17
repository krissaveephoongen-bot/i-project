/**
 * Database Connection Pool Monitor
 * Tracks connection pool health and manages connections
 */

const logger = require('../middleware/logger');

class ConnectionPoolMonitor {
  constructor(poolConfig = {}) {
    this.config = {
      maxConnections: poolConfig.max || 20,
      minConnections: poolConfig.min || 2,
      connectionTimeout: poolConfig.connectionTimeoutMillis || 30000,
      idleTimeout: poolConfig.idleTimeoutMillis || 30000
    };

    this.pool = {
      active: 0,
      idle: 0,
      waiting: 0,
      total: 0,
      created: 0,
      destroyed: 0,
      errors: 0,
      lastError: null,
      history: []
    };

    this.startMonitoring();
  }

  attachToPool(pgPool) {
    // Hook into pool events
    pgPool.on('connect', () => this.recordPoolEvent('connect'));
    pgPool.on('remove', () => this.recordPoolEvent('remove'));
    pgPool.on('error', (err) => this.recordPoolEvent('error', err));
  }

  recordPoolEvent(event, error = null) {
    const timestamp = new Date().toISOString();
    
    switch (event) {
      case 'connect':
        this.pool.created++;
        this.pool.total++;
        this.pool.idle++;
        logger.debug('Connection created', { total: this.pool.total });
        break;
      case 'remove':
        this.pool.destroyed++;
        this.pool.total--;
        if (this.pool.idle > 0) this.pool.idle--;
        logger.debug('Connection removed', { total: this.pool.total });
        break;
      case 'error':
        this.pool.errors++;
        this.pool.lastError = { error: error.message, timestamp };
        logger.error('Pool error', { error: error.message });
        break;
    }

    this.recordHistory({ event, timestamp, ...this.pool });
  }

  acquireConnection() {
    this.pool.active++;
    if (this.pool.idle > 0) this.pool.idle--;
    this.recordHistory({ event: 'acquire', ...this.pool });
  }

  releaseConnection() {
    if (this.pool.active > 0) this.pool.active--;
    this.pool.idle++;
    this.recordHistory({ event: 'release', ...this.pool });
  }

  recordHistory(event) {
    this.pool.history.push({
      ...event,
      timestamp: new Date().toISOString()
    });

    // Keep only last 1000 events
    if (this.pool.history.length > 1000) {
      this.pool.history.shift();
    }

    // Check for issues
    this.checkHealth();
  }

  checkHealth() {
    const healthStatus = this.getHealth();

    if (healthStatus.status === 'critical') {
      logger.error('Connection pool critical', healthStatus);
      this.createAlert('CONNECTION_POOL_EXHAUSTED', 'Connection pool near capacity');
    } else if (healthStatus.status === 'warning') {
      logger.warn('Connection pool warning', healthStatus);
    }
  }

  getHealth() {
    const usage = this.pool.active / this.config.maxConnections;
    const errorRate = this.pool.errors / Math.max(this.pool.created, 1);

    let status = 'healthy';
    if (usage > 0.8 || errorRate > 0.1) {
      status = 'warning';
    }
    if (usage > 0.95) {
      status = 'critical';
    }

    return {
      status,
      usage: `${(usage * 100).toFixed(2)}%`,
      errorRate: `${(errorRate * 100).toFixed(2)}%`,
      available: this.config.maxConnections - this.pool.active,
      activeConnections: this.pool.active,
      idleConnections: this.pool.idle
    };
  }

  getStats() {
    return {
      config: this.config,
      current: {
        active: this.pool.active,
        idle: this.pool.idle,
        total: this.pool.total
      },
      lifetime: {
        created: this.pool.created,
        destroyed: this.pool.destroyed,
        errors: this.pool.errors
      },
      health: this.getHealth(),
      lastError: this.pool.lastError,
      recentHistory: this.pool.history.slice(-50)
    };
  }

  createAlert(type, message) {
    logger.warn(`Alert: ${type}`, { message });
    // Can integrate with health-monitor webhook system
  }

  startMonitoring() {
    setInterval(() => {
      const health = this.getHealth();
      const stats = this.getStats();

      if (health.status !== 'healthy') {
        logger.warn('Pool health check', { health, stats });
      }
    }, 60000); // Every minute
  }

  getMemoryEstimate() {
    // Rough estimate: ~1MB per connection
    return {
      perConnection: 1, // MB
      estimated: this.pool.total, // MB
      unit: 'MB'
    };
  }

  reset() {
    this.pool = {
      active: 0,
      idle: 0,
      waiting: 0,
      total: 0,
      created: 0,
      destroyed: 0,
      errors: 0,
      lastError: null,
      history: []
    };
  }
}

module.exports = ConnectionPoolMonitor;
