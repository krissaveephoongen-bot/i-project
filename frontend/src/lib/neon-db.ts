// Database Configuration for Project Management System using Neon
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, desc, and, or } from 'drizzle-orm';
import * as schema from './schema';

// Get connection string from environment variables
const connectionString = process.env.DATABASE_URL ||
  'postgres://user:password@localhost:5432/project_management';

// Create a connection pool
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create Drizzle ORM instance with schema
export const db = drizzle(pool, { schema });

// Database connection status
let isConnected = false;
let connectionError: Error | null = null;

// Test the database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isConnected = true;
    connectionError = null;
    return { connected: true, error: null };
  } catch (error) {
    isConnected = false;
    connectionError = error as Error;
    return { connected: false, error };
  }
}

// Get connection status
export function getConnectionStatus() {
  return {
    connected: isConnected,
    error: connectionError?.message,
    provider: 'Neon PostgreSQL'
  };
}

// Export database operations
export const database = {
  // Users
  async getUsers() {
    return await db.select().from(schema.users);
  },

  async createUser(user: typeof schema.users.$inferInsert) {
    const [result] = await db.insert(schema.users).values(user).returning();
    return result;
  },

  // Projects
  async getProjects() {
    return await db.select().from(schema.projects);
  },

  async createProject(project: typeof schema.projects.$inferInsert) {
    const [result] = await db.insert(schema.projects).values(project).returning();
    return result;
  },

  async updateProject(id: number, updates: Partial<typeof schema.projects.$inferInsert>) {
    const [result] = await db
      .update(schema.projects)
      .set(updates)
      .where(eq(schema.projects.id, id))
      .returning();
    return result;
  },

  async deleteProject(id: number) {
    await db.delete(schema.projects).where(eq(schema.projects.id, id));
  },

  // Tasks
  async getTasks() {
    return await db.select().from(schema.tasks);
  },

  async createTask(task: typeof schema.tasks.$inferInsert) {
    const [result] = await db.insert(schema.tasks).values(task).returning();
    return result;
  },

  async updateTask(id: number, updates: Partial<typeof schema.tasks.$inferInsert>) {
    const [result] = await db
      .update(schema.tasks)
      .set(updates)
      .where(eq(schema.tasks.id, id))
      .returning();
    return result;
  },

  async deleteTask(id: number) {
    await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
  },

  // Test connection
  testConnection,
  
  // Get connection status
  getConnectionStatus,
};

// Export types
export type Database = typeof database;
