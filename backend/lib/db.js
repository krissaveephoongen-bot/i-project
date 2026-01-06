import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from '@vercel/postgres';
import * as schema from './schema.js';

// Create the connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

// Configure connection for Vercel serverless
const connectionOptions = {
  prepare: false,
  max: 1, // Limit connections for serverless
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
  charset: 'utf8', // Ensure UTF-8 encoding for Thai characters
  onnotice: (notice) => console.log('PostgreSQL notice:', notice),
  onparameter: (key, value) => console.log('PostgreSQL parameter:', key, value),
};

console.log('Creating database connection...');
const client = postgres(connectionString, connectionOptions);
console.log('Database connection created successfully');

export const db = drizzle(client, { schema });

// For Vercel serverless, ensure connections are cleaned up
if (typeof process !== 'undefined' && process.env.VERCEL) {
  process.on('beforeExit', () => {
    console.log('Closing database connections...');
    client.end();
  });
}
