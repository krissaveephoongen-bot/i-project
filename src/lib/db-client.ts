import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { isServer } from '@/utils/environment';

// Get the database URL from environment variables
export const getDatabaseUrl = (): string => {
  if (isServer()) {
    throw new Error('getDatabaseUrl should not be called on the server side');
  }

  const url = import.meta.env.VITE_DATABASE_URL;
  if (!url) {
    throw new Error('VITE_DATABASE_URL is not set in environment variables');
  }
  return url;
};

// Create a database client for browser usage
type DbClient = {
  db: ReturnType<typeof drizzle<typeof schema>>;
  sql: ReturnType<typeof neon>;
};

let dbClient: DbClient | null = null;

export const createDbClient = (): DbClient => {
  if (isServer()) {
    throw new Error('createDbClient should not be called on the server side');
  }

  if (!dbClient) {
    const sql = neon(getDatabaseUrl());
    dbClient = {
      db: drizzle(sql, { schema }),
      sql,
    };
  }

  return dbClient;
};

// Get or create the database client
export const getDbClient = (): DbClient => {
  if (!dbClient) {
    return createDbClient();
  }
  return dbClient;
};

// Initialize the client when this module is imported
if (typeof window !== 'undefined') {
  try {
    dbClient = createDbClient();
  } catch (error) {
    console.error('Failed to initialize database client:', error);
  }
}

export default getDbClient();
