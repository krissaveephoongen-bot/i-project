import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/lib/schema';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function runMigrations() {
  // Get connection string from environment variables
  const connectionString = process.env.DATABASE_URL || 
    'postgres://user:password@localhost:5432/project_management';

  console.log('Connecting to database...');
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(pool);

  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      console.log('Creating tables...');
      
      // Create enum types first
      await tx.execute(sql`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
            CREATE TYPE status AS ENUM ('todo', 'in_progress', 'in_review', 'done');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority') THEN
            CREATE TYPE priority AS ENUM ('low', 'medium', 'high');
          END IF;
        END $$;
      `);

      // Create users table
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL DEFAULT 'user',
          avatar TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      // Create projects table
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          status status NOT NULL DEFAULT 'todo',
          start_date TIMESTAMP WITH TIME ZONE,
          end_date TIMESTAMP WITH TIME ZONE,
          manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      // Create tasks table
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          status status NOT NULL DEFAULT 'todo',
          priority priority NOT NULL DEFAULT 'medium',
          due_date TIMESTAMP WITH TIME ZONE,
          project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      console.log('Tables created successfully!');
    });

    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations().catch(console.error);
