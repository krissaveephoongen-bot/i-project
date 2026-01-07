import { Client } from '@neondatabase/serverless';

const client = new Client('postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function optimizeDatabase() {
  try {
    await client.connect();
    console.log('Connected to database\n');

    // 1. Create enums if not exist
    console.log('=== CREATING ENUMS ===');
    const enums = [
      { name: 'approval_status', values: ["pending", "approved", "rejected"] },
      { name: 'approval_action_type', values: ["project_manager_approval", "supervisor_approval"] }
    ];

    for (const e of enums) {
      try {
        await client.query(`DO $$ BEGIN CREATE TYPE ${e.name} AS ENUM (${e.values.map(v => "'" + v + "'").join(', ')}); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        console.log(`✓ Enum ${e.name} ready`);
      } catch (err) {
        console.log(`✗ Enum ${e.name} error: ${err.message}`);
      }
    }

    // 2. Add missing columns to time_entries
    console.log('\n=== ADDING MISSING COLUMNS TO time_entries ===');
    const timeEntryCols = [
      'project_manager_approval_status approval_status DEFAULT pending',
      'project_manager_id uuid',
      'project_manager_approval_date timestamp',
      'supervisor_approval_status approval_status DEFAULT pending',
      'supervisor_id uuid',
      'supervisor_approval_date timestamp'
    ];

    for (const col of timeEntryCols) {
      const [name, type] = col.split(' ');
      try {
        await client.query(`ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS ${name} ${type}`);
        console.log(`✓ Added column: ${name}`);
      } catch (err) {
        console.log(`✗ Column ${name} error: ${err.message}`);
      }
    }

    // 3. Add missing columns to users (position column was missing)
    console.log('\n=== CHECKING USERS COLUMNS ===');
    const userCols = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'users'
    `);
    const existingUserCols = userCols.rows.map(r => r.column_name);
    const neededUserCols = ['position', 'employee_code', 'hourly_rate', 'phone', 'status'];

    for (const col of neededUserCols) {
      if (!existingUserCols.includes(col)) {
        const types = {
          'position': 'text',
          'employee_code': 'text',
          'hourly_rate': 'numeric(10,2)',
          'phone': 'text',
          'status': 'text DEFAULT active'
        };
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col} ${types[col]}`);
        console.log(`✓ Added users.${col}`);
      } else {
        console.log(`✓ users.${col} exists`);
      }
    }

    // 4. Create indexes
    console.log('\n=== CREATING INDEXES ===');
    const indexes = [
      // projects
      { name: 'idx_projects_manager_id', table: 'projects', cols: ['manager_id'] },
      { name: 'idx_projects_status', table: 'projects', cols: ['status'] },
      { name: 'idx_projects_client_id', table: 'projects', cols: ['client_id'] },

      // tasks
      { name: 'idx_tasks_project_id', table: 'tasks', cols: ['project_id'] },
      { name: 'idx_tasks_assigned_to', table: 'tasks', cols: ['assigned_to'] },
      { name: 'idx_tasks_status', table: 'tasks', cols: ['status'] },
      { name: 'idx_tasks_created_by', table: 'tasks', cols: ['created_by'] },

      // time_entries
      { name: 'idx_time_entries_user_id', table: 'time_entries', cols: ['user_id'] },
      { name: 'idx_time_entries_project_id', table: 'time_entries', cols: ['project_id'] },
      { name: 'idx_time_entries_date', table: 'time_entries', cols: ['date'] },
      { name: 'idx_time_entries_status', table: 'time_entries', cols: ['status'] },
      { name: 'idx_time_entries_task_id', table: 'time_entries', cols: ['task_id'] },

      // expenses
      { name: 'idx_expenses_user_id', table: 'expenses', cols: ['user_id'] },
      { name: 'idx_expenses_project_id', table: 'expenses', cols: ['project_id'] },
      { name: 'idx_expenses_status', table: 'expenses', cols: ['status'] },
      { name: 'idx_expenses_category', table: 'expenses', cols: ['category'] },

      // users
      { name: 'idx_users_role', table: 'users', cols: ['role'] },
      { name: 'idx_users_is_active', table: 'users', cols: ['is_active'] },
      { name: 'idx_users_is_project_manager', table: 'users', cols: ['is_project_manager'] },
      { name: 'idx_users_is_supervisor', table: 'users', cols: ['is_supervisor'] },

      // comments
      { name: 'idx_comments_task_id', table: 'comments', cols: ['task_id'] },
      { name: 'idx_comments_user_id', table: 'comments', cols: ['user_id'] },

      // activity_log
      { name: 'idx_activity_log_entity', table: 'activity_log', cols: ['entity_type', 'entity_id'] },
      { name: 'idx_activity_log_user_id', table: 'activity_log', cols: ['user_id'] },
      { name: 'idx_activity_log_created_at', table: 'activity_log', cols: ['created_at'] },
    ];

    for (const idx of indexes) {
      try {
        await client.query(`CREATE INDEX IF NOT EXISTS ${idx.name} ON ${idx.table} USING btree (${idx.cols.join(', ')})`);
        console.log(`✓ Created index: ${idx.name}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`✓ Index exists: ${idx.name}`);
        } else {
          console.log(`✗ Index ${idx.name} error: ${err.message.substring(0, 50)}`);
        }
      }
    }

    // 5. Add foreign key constraints
    console.log('\n=== ADDING FOREIGN KEY CONSTRAINTS ===');
    const fks = [
      { name: 'fk_time_entries_pm_id', table: 'time_entries', col: 'project_manager_id', ref: 'users(id)' },
      { name: 'fk_time_entries_supervisor_id', table: 'time_entries', col: 'supervisor_id', ref: 'users(id)' },
    ];

    for (const fk of fks) {
      try {
        await client.query(`ALTER TABLE ${fk.table} ADD CONSTRAINT ${fk.name} FOREIGN KEY (${fk.col}) REFERENCES ${fk.ref} ON DELETE SET NULL`);
        console.log(`✓ Added FK: ${fk.name}`);
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log(`✓ FK exists: ${fk.name}`);
        } else {
          console.log(`✗ FK ${fk.name} error: ${err.message.substring(0, 50)}`);
        }
      }
    }

    // 6. Create timesheet_approval_actions table if not exists
    console.log('\n=== CREATING timesheet_approval_actions TABLE ===');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS timesheet_approval_actions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          timesheet_id uuid NOT NULL,
          action_type approval_action_type NOT NULL,
          previous_status approval_status NOT NULL,
          new_status approval_status NOT NULL,
          changed_by uuid,
          reason text,
          created_at timestamp DEFAULT now() NOT NULL
        )
      `);
      console.log('✓ Table timesheet_approval_actions created');

      // Add FK
      try {
        await client.query(`ALTER TABLE timesheet_approval_actions ADD CONSTRAINT fk_timesheet_actions_timesheet FOREIGN KEY (timesheet_id) REFERENCES time_entries(id) ON DELETE CASCADE`);
        console.log('✓ FK timesheet_actions_timesheet created');
      } catch (err) {
        if (!err.message.includes('already exists')) console.log(`✗ FK error: ${err.message.substring(0, 50)}`);
      }
    } catch (err) {
      console.log(`✗ Table error: ${err.message}`);
    }

    // 7. Update outdated_at triggers/functions if needed
    console.log('\n=== CREATING UPDATED_AT TRIGGER FUNCTION ===');
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ language 'plpgsql'
      `);
      console.log('✓ Function update_updated_at_column created');

      // Apply to tables
      const tablesToUpdate = ['users', 'projects', 'tasks', 'time_entries', 'expenses', 'clients', 'comments', 'activity_log', 'budget_revisions'];
      for (const table of tablesToUpdate) {
        try {
          await client.query(`
            DROP TRIGGER IF EXISTS ${table}_updated_at ON ${table};
            CREATE TRIGGER ${table}_updated_at
            BEFORE UPDATE ON ${table}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
          `);
          console.log(`✓ Trigger added to ${table}`);
        } catch (err) {
          console.log(`✗ Trigger ${table}: ${err.message.substring(0, 50)}`);
        }
      }
    } catch (err) {
      console.log(`✗ Function error: ${err.message}`);
    }

    console.log('\n=== OPTIMIZATION COMPLETE ===');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

optimizeDatabase();
