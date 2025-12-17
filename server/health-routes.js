/**
 * Health Check API Routes
 * Provides database connectivity verification endpoints
 */

const express = require('express');
const router = express.Router();
const { healthCheck } = require('../database/neon-connection');

// Database health check endpoint
router.get('/health/db', async (req, res) => {
  try {
    console.log('🔍 Health check requested for database connection');

    const healthStatus = await healthCheck();

    if (healthStatus.status === 'healthy') {
      console.log('✅ Database health check passed');
      res.status(200).json({
        success: true,
        message: 'Database connection is healthy',
        data: healthStatus
      });
    } else {
      console.warn('⚠️  Database health check failed');
      res.status(503).json({
        success: false,
        message: 'Database connection is unhealthy',
        error: healthStatus.error,
        data: healthStatus
      });
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Simple connection test endpoint
router.get('/health/db/simple', async (req, res) => {
  try {
    const { testConnection } = require('../database/neon-connection');

    console.log('🔍 Simple database connection test requested');
    const success = await testConnection(0, 2); // 2 retries for simple test

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Connection test failed',
      error: error.message
    });
  }
});

// Database status endpoint
router.get('/health/db/status', (req, res) => {
  try {
    const { getConnectionStatus } = require('../database/neon-connection');
    const status = getConnectionStatus();

    res.status(200).json({
      success: true,
      status: status.connected ? 'connected' : 'disconnected',
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get connection status',
      error: error.message
    });
  }
});

module.exports = router;