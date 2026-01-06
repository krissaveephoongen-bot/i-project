import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Create the connection using Neon serverless driver
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Validate connection string format for Neon
if (!connectionString.includes('neon.tech') && !connectionString.includes('vercel-storage.com')) {
  console.warn('⚠️  WARNING: DATABASE_URL does not appear to be a Neon or Vercel Postgres connection string');
}

// For serverless environments like Vercel, use HTTP-based connection
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

// Health check function
export async function checkDatabaseConnection() {
  try {
    const result = await sql`SELECT 1 as health_check`;
    console.log('✅ Database connection successful');
    return { success: true };
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