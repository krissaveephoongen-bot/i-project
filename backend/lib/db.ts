import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Client } from 'pg';
import * as schema from './schema';

// Create the connection using the pg driver
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = new Client({
  connectionString,
});

// Top-level await is available in ES modules
try {
  await client.connect();
  console.log('✅ Connected to the database');
} catch (error) {
  console.error('❌ Failed to connect to the database:', error);
  process.exit(1); // Exit if we can't connect
}

export const db = drizzle(client, { schema });

// Health check function
export async function checkDatabaseConnection() {
  try {
    const result = await db.execute(sql`SELECT 1 as health_check`);
    if (result.rowCount && result.rowCount > 0) {
        console.log('✅ Database connection successful');
        return { success: true, data: result.rows };
    } else {
        throw new Error('Health check query failed');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    const err = error as any;
    return {
      success: false,
      error: err.message || 'Unknown error',
      code: err.code || 'UNKNOWN',
      details: err
    };
  }
}