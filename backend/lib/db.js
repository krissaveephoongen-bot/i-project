import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Create the connection lazily
let _client = null;
let _db = null;

function getConnectionString() {
  return process.env.DATABASE_URL;
}

function ensureConnection() {
  if (_db) return { client: _client, db: _db };
  
  const connectionString = getConnectionString();
  
  if (!connectionString) {
    console.warn('DATABASE_URL is not defined. Database features will be disabled.');
    return { client: null, db: null };
  }

  console.log('Creating database connection...');
  try {
    _client = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: true, // Explicitly enable SSL
    });
    _db = drizzle(_client, { schema });
    console.log('Database connection created successfully');
    return { client: _client, db: _db };
  } catch (error) {
    console.error('Failed to create database connection:', error.message);
    _client = null;
    _db = null;
    return { client: null, db: null };
  }
}

// Health check function
export async function checkDatabaseConnection() {
  const { client: sql } = ensureConnection();
  
  if (!sql) {
    return {
      success: false,
      error: 'Database connection not configured',
      code: 'NOT_CONFIGURED',
    };
  }
  
  try {
    const result = await sql`SELECT 1 as health_check`;
    console.log('✅ Database connection successful');
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return {
      success: false,
      error: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN',
    };
  }
}

// Export db for backward compatibility (lazy)
export const db = new Proxy({}, {
  get(target, prop) {
    const { db: dbInstance } = ensureConnection();
    if (!dbInstance) return undefined;
    return dbInstance[prop];
  }
});

// Export client for backward compatibility
export const client = null;

// New lazy accessor for new code
export function getDbClient() {
  const { client: sql, db: dbInstance } = ensureConnection();
  return { db: dbInstance, client: sql };
}

export default {
  checkDatabaseConnection,
  getDbClient,
  db: new Proxy({}, {
    get(target, prop) {
      const { db: dbInstance } = ensureConnection();
      if (!dbInstance) return undefined;
      return dbInstance[prop];
    }
  })
};
