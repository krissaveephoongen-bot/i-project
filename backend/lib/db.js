import postgres from 'postgres';

// Lazy database connection
let client = null;
let db = null;
let connectionPromise = null;

function getConnectionString() {
  return process.env.DATABASE_URL;
}

function createConnection() {
  const connectionString = getConnectionString();
  
  if (!connectionString) {
    console.warn('DATABASE_URL is not defined. Database features will be disabled.');
    return { client: null, db: null };
  }

  console.log('Creating database connection...');
  try {
    const sql = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    console.log('Database connection created successfully');
    return { client: sql, db: null };
  } catch (error) {
    console.error('Failed to create database connection:', error.message);
    return { client: null, db: null };
  }
}

function getDb() {
  if (!client && !connectionPromise) {
    connectionPromise = createConnection();
  }
  if (client && !db) {
    // Import drizzle dynamically to avoid circular dependencies
    import('drizzle-orm/postgres-js').then(({ drizzle }) => {
      import('./schema.js').then(({ default: schema }) => {
        db = drizzle(client, { schema });
      }).catch(() => {
        // Schema might already be imported
        import('./schema.js').then(schemaModule => {
          db = drizzle(client, { schema: schemaModule });
        }).catch(() => {});
      });
    }).catch(() => {});
  }
  return db;
}

function getClient() {
  if (!client && !connectionPromise) {
    connectionPromise = createConnection();
  }
  return client;
}

// Health check function
export async function checkDatabaseConnection() {
  const sql = getClient();
  
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

// Lazy exports for db and client
export function getDbClient() {
  return {
    db: getDb(),
    client: getClient()
  };
}

export default {
  checkDatabaseConnection,
  getDbClient
};
