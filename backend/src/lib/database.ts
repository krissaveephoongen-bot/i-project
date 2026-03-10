import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from './schema';
import { config } from 'dotenv';

// Load environment variables
config();

// Database connection configuration
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create database connection
export const db = drizzle(connectionString, { schema });

// Migration function
export async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    // Test database connection
    await db.select().from(schema.users).limit(1);
    return { status: 'healthy', message: 'Database connection successful' };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'unhealthy', message: 'Database connection failed', error };
  }
}

// Export for use in other modules
export { schema };
export default db;
