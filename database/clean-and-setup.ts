import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';

dotenv.config();

async function cleanAndSetup() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgres://user:password@localhost:5432/project_management';

  console.log('🔌 Connecting to database...');
  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

  const db = drizzle(pool);

  try {
    console.log('🗑️  Dropping all tables...\n');

    // Drop tables in reverse order of dependencies
    const client = await pool.connect();
    try {
      await client.query(`DROP TABLE IF EXISTS comments CASCADE;`);
      await client.query(`DROP TABLE IF EXISTS activity_log CASCADE;`);
      await client.query(`DROP TABLE IF EXISTS time_entries CASCADE;`);
      await client.query(`DROP TABLE IF EXISTS expenses CASCADE;`);
      await client.query(`DROP TABLE IF EXISTS budget_revisions CASCADE;`);
      await client.query(`DROP TABLE IF EXISTS tasks CASCADE;`);
      await client.query(`DROP TABLE IF EXISTS projects CASCADE;`);
      await client.query(`DROP TABLE IF EXISTS clients CASCADE;`);
      await client.query(`DROP TABLE IF EXISTS users CASCADE;`);
      
      // Drop old enums
      await client.query(`DROP TYPE IF EXISTS status CASCADE;`);
      await client.query(`DROP TYPE IF EXISTS priority CASCADE;`);
      await client.query(`DROP TYPE IF EXISTS activity_type CASCADE;`);
      await client.query(`DROP TYPE IF EXISTS work_type CASCADE;`);
      await client.query(`DROP TYPE IF EXISTS expense_category CASCADE;`);
      await client.query(`DROP TYPE IF EXISTS expense_status CASCADE;`);
      
      console.log('✅ All tables and types dropped\n');
    } finally {
      client.release();
    }

    console.log('📋 Creating fresh schema...\n');

    // Create new enums with proper values
    await db.execute(sql`
      CREATE TYPE status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'pending', 'approved', 'rejected');
    `);
    console.log('✅ Status enum created');

    await db.execute(sql`
      CREATE TYPE priority AS ENUM ('low', 'medium', 'high');
    `);
    console.log('✅ Priority enum created');

    await db.execute(sql`
      CREATE TYPE activity_type AS ENUM ('create', 'update', 'delete', 'comment', 'assign', 'status_change');
    `);
    console.log('✅ Activity type enum created');

    await db.execute(sql`
      CREATE TYPE work_type AS ENUM ('project', 'office', 'other');
    `);
    console.log('✅ Work type enum created');

    await db.execute(sql`
      CREATE TYPE expense_category AS ENUM ('travel', 'supplies', 'equipment', 'training', 'other');
    `);
    console.log('✅ Expense category enum created');

    await db.execute(sql`
      CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected', 'reimbursed');
    `);
    console.log('✅ Expense status enum created');

    // Users table
    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'user',
        avatar TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created');

    // Clients table
    await db.execute(sql`
      CREATE TABLE clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        tax_id TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Clients table created');

    // Projects table
    await db.execute(sql`
      CREATE TABLE projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE,
        description TEXT,
        status status NOT NULL DEFAULT 'todo',
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        budget NUMERIC(12, 2),
        spent NUMERIC(12, 2) DEFAULT 0.00,
        remaining NUMERIC(12, 2) DEFAULT 0.00,
        manager_id INTEGER REFERENCES users(id),
        client_id INTEGER REFERENCES clients(id),
        hourly_rate NUMERIC(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Projects table created');

    // Tasks table
    await db.execute(sql`
      CREATE TABLE tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status status NOT NULL DEFAULT 'todo',
        priority priority NOT NULL DEFAULT 'medium',
        due_date TIMESTAMP WITH TIME ZONE,
        estimated_hours NUMERIC(6, 2),
        actual_hours NUMERIC(6, 2) DEFAULT 0.00,
        weight NUMERIC(10, 2) DEFAULT 1.00,
        completed_at TIMESTAMP WITH TIME ZONE,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tasks table created');

    // Time entries table
    await db.execute(sql`
      CREATE TABLE time_entries (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        work_type work_type NOT NULL,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_time TIME NOT NULL,
        end_time TIME,
        hours NUMERIC(5, 2) NOT NULL,
        description TEXT,
        status status NOT NULL DEFAULT 'approved',
        approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Time entries table created');

    // Expenses table
    await db.execute(sql`
      CREATE TABLE expenses (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        category expense_category NOT NULL,
        description TEXT NOT NULL,
        receipt_url TEXT,
        status expense_status NOT NULL DEFAULT 'pending',
        approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Expenses table created');

    // Budget revisions table
    await db.execute(sql`
      CREATE TABLE budget_revisions (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        previous_budget NUMERIC(12, 2) NOT NULL,
        new_budget NUMERIC(12, 2) NOT NULL,
        reason TEXT NOT NULL,
        changed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Budget revisions table created');

    // Activity log table
    await db.execute(sql`
      CREATE TABLE activity_log (
        id SERIAL PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        type activity_type NOT NULL,
        action TEXT NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        changes JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Activity log table created');

    // Comments table
    await db.execute(sql`
      CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Comments table created');

    console.log('\n✨ ✨ ✨ SETUP COMPLETE ✨ ✨ ✨\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanAndSetup().catch(console.error);
