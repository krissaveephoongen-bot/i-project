import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Create the connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

console.log('Creating database connection...');
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});
export const db = drizzle(client, { schema });
console.log('Database connection created successfully');

// Health check function
export async function checkDatabaseConnection() {
  try {
    const result = await client`SELECT 1 as health_check`;
    console.log('✅ Database connection successful');
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    const err = error;
    return {
      success: false,
      error: err.message || 'Unknown error',
      code: err.code || 'UNKNOWN',
      details: err
    };
  }
}
