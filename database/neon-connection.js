/**
 * Neon PostgreSQL Database Connection Module
 * Singleton pattern for efficient connection management
 * With robust error handling and graceful shutdown
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database configuration
const DATABASE_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false // For Neon Tech compatibility
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
};

// Singleton database pool instance
let dbPool = null;
let isShuttingDown = false;

// Connection status tracking
let connectionStatus = {
  connected: false,
  lastConnectionAttempt: null,
  lastError: null,
  retryCount: 0
};

/**
 * Create singleton database pool
 * @returns {Pool} Database connection pool
 */
function createDatabasePool() {
  if (dbPool) {
    return dbPool;
  }

  if (!DATABASE_CONFIG.connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  dbPool = new Pool(DATABASE_CONFIG);

  // Handle connection errors
  dbPool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    connectionStatus.connected = false;
    connectionStatus.lastError = err.message;
    connectionStatus.retryCount++;
  });

  return dbPool;
}

/**
 * Test database connection with exponential backoff retry
 * @param {number} retryCount Current retry attempt
 * @param {number} maxRetries Maximum number of retries
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection(retryCount = 0, maxRetries = 5) {
  if (isShuttingDown) {
    console.log('Skipping connection test during shutdown');
    return false;
  }

  try {
    const pool = createDatabasePool();
    const startTime = Date.now();

    // Attempt to get a client and run a simple query
    const client = await pool.connect();
    const queryStart = Date.now();

    try {
      const result = await client.query('SELECT NOW() as current_time');
      const queryDuration = Date.now() - queryStart;

      console.log(`✅ Database connection successful! Current server time: ${result.rows[0].current_time}`);
      console.log(`📊 Query executed in ${queryDuration}ms`);

      // Update connection status
      connectionStatus = {
        connected: true,
        lastConnectionAttempt: new Date(),
        lastError: null,
        retryCount: 0,
        lastSuccessfulConnection: new Date(),
        connectionDuration: Date.now() - startTime
      };

      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    const errorTime = Date.now();
    connectionStatus.connected = false;
    connectionStatus.lastConnectionAttempt = new Date();
    connectionStatus.lastError = error.message;
    connectionStatus.retryCount = retryCount + 1;

    console.error(`❌ Database connection failed (attempt ${retryCount + 1}/${maxRetries}):`, error.message);

    // Exponential backoff: 2^retryCount seconds, capped at 30 seconds
    if (retryCount < maxRetries) {
      const delaySeconds = Math.min(Math.pow(2, retryCount), 30);
      console.log(`🔄 Retrying in ${delaySeconds} seconds...`);

      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      return testConnection(retryCount + 1, maxRetries);
    } else {
      console.error('💥 Maximum retry attempts reached. Giving up.');
      return false;
    }
  }
}

/**
 * Get database connection status
 * @returns {Object} Connection status information
 */
function getConnectionStatus() {
  return {
    connected: connectionStatus.connected,
    lastConnectionAttempt: connectionStatus.lastConnectionAttempt,
    lastError: connectionStatus.lastError,
    retryCount: connectionStatus.retryCount,
    lastSuccessfulConnection: connectionStatus.lastSuccessfulConnection,
    connectionDuration: connectionStatus.connectionDuration,
    provider: 'neon-postgresql'
  };
}

/**
 * Execute SQL query with connection validation
 * @param {string} query SQL query to execute
 * @param {Array} params Query parameters
 * @returns {Promise<Object>} Query result
 */
async function executeQuery(query, params = []) {
  if (isShuttingDown) {
    throw new Error('Cannot execute queries during shutdown');
  }

  try {
    const pool = createDatabasePool();

    // Check connection status first
    if (!connectionStatus.connected) {
      console.warn('⚠️  Database connection not established, attempting to connect...');
      await testConnection();
    }

    const startTime = Date.now();
    const result = await pool.query(query, params);
    const duration = Date.now() - startTime;

    console.log(`📊 Query executed in ${duration}ms:`, query.split('\n')[0].trim());

    return result;
  } catch (error) {
    console.error('💥 Query execution failed:', error.message);
    throw new Error(`Database query failed: ${error.message}`);
  }
}

/**
 * Get database client for transactions
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
  if (isShuttingDown) {
    throw new Error('Cannot get client during shutdown');
  }

  try {
    const pool = createDatabasePool();
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('💥 Failed to get database client:', error.message);
    throw error;
  }
}

/**
 * Graceful shutdown handler
 */
function gracefulShutdown() {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log('🛑 Initiating graceful database shutdown...');

  if (dbPool) {
    dbPool.end()
      .then(() => {
        console.log('👋 Database pool closed gracefully');
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Error closing database pool:', err.message);
        process.exit(1);
      });
  } else {
    console.log('✅ No active database pool to close');
    process.exit(0);
  }
}

/**
 * Health check endpoint handler
 * @returns {Promise<Object>} Health check result
 */
async function healthCheck() {
  try {
    const connectionOk = await testConnection(0, 3); // 3 retries for health check

    if (connectionOk) {
      const result = await executeQuery('SELECT NOW() as current_time, version() as postgres_version');
      return {
        status: 'healthy',
        database: 'postgresql',
        provider: 'neon',
        currentTime: result.rows[0].current_time,
        postgresVersion: result.rows[0].postgres_version,
        connectionStatus: getConnectionStatus()
      };
    } else {
      return {
        status: 'unhealthy',
        database: 'postgresql',
        provider: 'neon',
        error: connectionStatus.lastError,
        connectionStatus: getConnectionStatus()
      };
    }
  } catch (error) {
    return {
      status: 'error',
      database: 'postgresql',
      provider: 'neon',
      error: error.message,
      connectionStatus: getConnectionStatus()
    };
  }
}

// Set up process signal handlers for graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Export the database module
module.exports = {
  createDatabasePool,
  testConnection,
  getConnectionStatus,
  executeQuery,
  getClient,
  healthCheck,
  gracefulShutdown,
  connectionStatus
};

// For browser compatibility (if needed)
if (typeof window !== 'undefined') {
  window.NeonDatabase = {
    testConnection,
    getConnectionStatus,
    healthCheck
  };
}