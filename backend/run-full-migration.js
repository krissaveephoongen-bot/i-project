import { Client } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = new Client({ connectionString });

async function runFullMigration() {
  try {
    await client.connect();
    console.log('Connected to database');

    // 1. Add missing columns to time_entries table
    const timeEntriesColumns = [
      'project_manager_approval_status approval_status DEFAULT \'pending\'',
      'project_manager_id uuid REFERENCES users(id) ON DELETE SET NULL',
      'project_manager_approval_date timestamp',
      'supervisor_approval_status approval_status DEFAULT \'pending\'',
      'supervisor_id uuid REFERENCES users(id) ON DELETE SET NULL',
      'supervisor_approval_date timestamp'
    ];

    for (const col of timeEntriesColumns) {
      try {
        const colName = col.split(' ')[0];
        await client.query(`ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS ${col}`);
        console.log('Added column to time_entries:', colName);
      } catch (e) {
        console.log('Column exists or error:', e.message.split('\n')[0]);
      }
    }

    // 2. Create timesheet_approval_actions table if it doesn't exist
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS timesheet_approval_actions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          timesheet_id uuid NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
          action_type approval_action_type NOT NULL,
          previous_status approval_status NOT NULL,
          new_status approval_status NOT NULL,
          changed_by uuid REFERENCES users(id) ON DELETE SET NULL NOT NULL,
          reason text,
          created_at timestamp DEFAULT now() NOT NULL
        )
      `);
      console.log('Created table: timesheet_approval_actions');
    } catch (e) {
      console.log('Table exists or error:', e.message.split('\n')[0]);
    }

    // 3. Add missing columns to projects table
    const projectsColumns = [
      'client_id uuid REFERENCES clients(id) ON DELETE NO ACTION'
    ];

    for (const col of projectsColumns) {
      try {
        const colName = col.split(' ')[0];
        await client.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS ${col}`);
        console.log('Added column to projects:', colName);
      } catch (e) {
        console.log('Column exists or error:', e.message.split('\n')[0]);
      }
    }

    // 4. Verify time_entries columns
    const timeEntriesResult = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'time_entries' ORDER BY column_name");
    console.log('\nTime entries table columns:', timeEntriesResult.rows.map(x => x.column_name).join(', '));

    // 5. Verify timesheet_approval_actions table exists
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'timesheet_approval_actions'
    `);
    if (tableCheck.rows.length > 0) {
      console.log('Table timesheet_approval_actions exists');
      const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'timesheet_approval_actions' ORDER BY column_name");
      console.log('Timesheet approval actions columns:', cols.rows.map(x => x.column_name).join(', '));
    }

    console.log('\nFull migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runFullMigration();
