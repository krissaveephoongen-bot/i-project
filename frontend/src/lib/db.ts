// @ts-nocheck
// Server-side Database Configuration for Project Management System using Neon DB
// This file should ONLY be imported on the server side
// DO NOT import this in client-side code

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, count } from 'drizzle-orm';
import * as schema from './schema';

// This file should only be used on the server-side
if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side');
}

// Get connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a connection pool
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create Drizzle ORM instance with schema
const db = drizzle(pool, { schema });

// Database connection status
let isConnected = false;
let connectionError: Error | null = null;

// Test the database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isConnected = true;
    connectionError = null;
    return true;
  } catch (error) {
    isConnected = false;
    connectionError = error as Error;
    console.error('Database connection error:', error);
    return false;
  }
}

// Get connection status
function getConnectionStatus() {
  return { isConnected, error: connectionError?.message };
}

// Database operations
const database = {
  // Connection
  testConnection,
  getConnectionStatus,

  // Projects
  async getProjects() {
    return db.select().from(schema.projects);
  },

  async getProjectById(id: number) {
    const [project] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, id));
    return project || null;
  },

  async createProject(project: typeof schema.projects.$inferInsert) {
    const [newProject] = await db
      .insert(schema.projects)
      .values(project)
      .returning();
    return newProject;
  },

  async updateProject(id: number, updates: Partial<typeof schema.projects.$inferInsert>) {
    const [updatedProject] = await db
      .update(schema.projects)
      .set(updates)
      .where(eq(schema.projects.id, id))
      .returning();
    return updatedProject;
  },

  async deleteProject(id: number) {
    const [deletedProject] = await db
      .delete(schema.projects)
      .where(eq(schema.projects.id, id))
      .returning();
    return deletedProject;
  },

  // Tasks
  async getTasks(projectId?: number) {
    if (projectId) {
      return db
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.projectId, projectId));
    }
    return db.select().from(schema.tasks);
  },

  async getTaskById(id: number) {
    const [task] = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, id));
    return task || null;
  },

  async createTask(task: typeof schema.tasks.$inferInsert) {
    const [newTask] = await db
      .insert(schema.tasks)
      .values(task)
      .returning();
    return newTask;
  },

  async updateTask(id: number, updates: Partial<typeof schema.tasks.$inferInsert>) {
    const [updatedTask] = await db
      .update(schema.tasks)
      .set(updates)
      .where(eq(schema.tasks.id, id))
      .returning();
    return updatedTask;
  },

  async deleteTask(id: number) {
    const [deletedTask] = await db
      .delete(schema.tasks)
      .where(eq(schema.tasks.id, id))
      .returning();
    return deletedTask;
  },

  // Users
  async getUsers() {
    return db.select().from(schema.users);
  },

  async getUserById(id: number) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return user || null;
  },

  async getUserByEmail(email: string) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return user || null;
  },

  async createUser(user: typeof schema.users.$inferInsert) {
    const [newUser] = await db
      .insert(schema.users)
      .values(user)
      .returning();
    return newUser;
  },

  async updateUser(id: number, updates: Partial<typeof schema.users.$inferInsert>) {
    const [updatedUser] = await db
      .update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  },

  // Dashboard Statistics
  async getDashboardStats() {
    const [
      projectsResult,
      tasksResult,
      completedTasksResult,
      usersResult
    ] = await Promise.all([
      db.select({ count: count() }).from(schema.projects),
      db.select({ count: count() }).from(schema.tasks),
      db.select({ count: count() })
        .from(schema.tasks)
        .where(eq(schema.tasks.status, 'done')),
      db.select({ count: count() }).from(schema.users),
    ]);

    return {
      projectsCount: projectsResult[0]?.count || 0,
      tasksCount: tasksResult[0]?.count || 0,
      completedTasks: completedTasksResult[0]?.count || 0,
      usersCount: usersResult[0]?.count || 0,
    };
  },

  // Raw SQL query helper
  async query<T = any>(sqlQuery: string, params: any[] = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(sqlQuery, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  },
};

// Initialize the database connection
export async function initializeDatabase() {
  try {
    const connected = await testConnection();
    console.log('Database connected:', connected);
    if (!connected && connectionError) {
      console.error('Database connection error:', connectionError);
    }
    return { db, pool, isConnected: connected };
  } catch (error) {
    console.error('Error initializing database connection:', error);
    throw error;
  }
}

// Export for server-side use
export { pool, testConnection, getConnectionStatus };

export default database;
