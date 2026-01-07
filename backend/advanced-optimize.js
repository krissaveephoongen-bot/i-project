import { Client } from '@neondatabase/serverless';

const client = new Client('postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function advancedOptimize() {
  try {
    await client.connect();
    console.log('Connected to database\n');

    // 1. Composite indexes for common multi-column queries
    console.log('=== CREATING COMPOSITE INDEXES ===');
    const compositeIndexes = [
      // Tasks - common combinations
      { name: 'idx_tasks_project_status', table: 'tasks', cols: ['project_id', 'status'] },
      { name: 'idx_tasks_project_assigned', table: 'tasks', cols: ['project_id', 'assigned_to'] },
      { name: 'idx_tasks_assigned_status', table: 'tasks', cols: ['assigned_to', 'status'] },
      { name: 'idx_tasks_due_date_status', table: 'tasks', cols: ['due_date', 'status'] },

      // Time entries - common combinations
      { name: 'idx_time_user_date', table: 'time_entries', cols: ['user_id', 'date'] },
      { name: 'idx_time_project_date', table: 'time_entries', cols: ['project_id', 'date'] },
      { name: 'idx_time_user_status', table: 'time_entries', cols: ['user_id', 'status'] },
      { name: 'idx_time_project_status', table: 'time_entries', cols: ['project_id', 'status'] },
      { name: 'idx_time_pm_status', table: 'time_entries', cols: ['project_manager_approval_status', 'project_manager_id'] },
      { name: 'idx_time_supervisor_status', table: 'time_entries', cols: ['supervisor_approval_status', 'supervisor_id'] },

      // Projects - common combinations
      { name: 'idx_projects_status_archived', table: 'projects', cols: ['status', 'is_archived'] },
      { name: 'idx_projects_manager_status', table: 'projects', cols: ['manager_id', 'status'] },

      // Users - common combinations
      { name: 'idx_users_active_role', table: 'users', cols: ['is_active', 'role'] },
      { name: 'idx_users_active_dept', table: 'users', cols: ['is_active', 'department'] },

      // Expenses - common combinations
      { name: 'idx_expenses_user_date', table: 'expenses', cols: ['user_id', 'date'] },
      { name: 'idx_expenses_project_status', table: 'expenses', cols: ['project_id', 'status'] },
      { name: 'idx_expenses_user_status', table: 'expenses', cols: ['user_id', 'status'] },

      // Comments
      { name: 'idx_comments_task_user', table: 'comments', cols: ['task_id', 'user_id'] },

      // Activity log
      { name: 'idx_activity_user_created', table: 'activity_log', cols: ['user_id', 'created_at'] },
      { name: 'idx_activity_entity_type', table: 'activity_log', cols: ['entity_type', 'entity_id'] },
    ];

    for (const idx of compositeIndexes) {
      try {
        await client.query(`CREATE INDEX IF NOT EXISTS ${idx.name} ON ${idx.table} USING btree (${idx.cols.join(', ')})`);
        console.log(`✓ ${idx.name}`);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`✗ ${idx.name}: ${err.message.substring(0, 40)}`);
        } else {
          console.log(`✓ ${idx.name} (exists)`);
        }
      }
    }

    // 2. Partial indexes for common filters
    console.log('\n=== CREATING PARTIAL INDEXES ===');
    const partialIndexes = [
      // Active records only
      { name: 'idx_tasks_active', table: 'tasks', cond: 'status NOT IN (\'done\', \'archived\')' },
      { name: 'idx_projects_active', table: 'projects', cond: 'is_archived = false AND status NOT IN (\'done\', \'inactive\')' },
      { name: 'idx_users_active_only', table: 'users', cond: 'is_active = true' },
      { name: 'idx_time_entries_pending', table: 'time_entries', cond: 'status = \'pending\'' },
      { name: 'idx_expenses_pending', table: 'expenses', cond: 'status = \'pending\'' },

      // Overdue tasks
      { name: 'idx_tasks_overdue', table: 'tasks', cond: 'due_date < now() AND status NOT IN (\'done\', \'archived\')' },
    ];

    for (const idx of partialIndexes) {
      try {
        await client.query(`CREATE INDEX IF NOT EXISTS ${idx.name} ON ${idx.table} USING btree (created_at) WHERE ${idx.cond}`);
        console.log(`✓ ${idx.name}`);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`✗ ${idx.name}: ${err.message.substring(0, 40)}`);
        } else {
          console.log(`✓ ${idx.name} (exists)`);
        }
      }
    }

    // 3. Text search optimization (GIN indexes)
    console.log('\n=== CREATING TEXT SEARCH INDEXES ===');
    const textIndexes = [
      { name: 'idx_users_name_gin', table: 'users', col: 'name', method: 'gin' },
      { name: 'idx_users_email_gin', table: 'users', col: 'email', method: 'gin' },
      { name: 'idx_projects_name_gin', table: 'projects', col: 'name', method: 'gin' },
      { name: 'idx_projects_code_gin', table: 'projects', col: 'code', method: 'gin' },
      { name: 'idx_tasks_title_gin', table: 'tasks', col: 'title', method: 'gin' },
      { name: 'idx_clients_name_gin', table: 'clients', col: 'name', method: 'gin' },
    ];

    for (const idx of textIndexes) {
      try {
        await client.query(`CREATE INDEX IF NOT EXISTS ${idx.name} ON ${idx.table} USING ${idx.method} (to_tsvector('english', ${idx.col}))`);
        console.log(`✓ ${idx.name}`);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`✗ ${idx.name}: ${err.message.substring(0, 40)}`);
        } else {
          console.log(`✓ ${idx.name} (exists)`);
        }
      }
    }

    // 4. Create extension for full text search if not exists
    console.log('\n=== ENABLING EXTENSIONS ===');
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
      console.log('✓ pg_trgm extension');
    } catch (err) {
      console.log(`✗ pg_trgm: ${err.message}`);
    }

    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS fuzzystrmatch`);
      console.log('✓ fuzzystrmatch extension');
    } catch (err) {
      console.log(`✗ fuzzystrmatch: ${err.message}`);
    }

    // 5. Trigram indexes for fuzzy search (better than GIN for ilike)
    console.log('\n=== CREATING TRIGRAM INDEXES ===');
    const trigramIndexes = [
      { name: 'idx_users_name_trgm', table: 'users', col: 'name' },
      { name: 'idx_users_email_trgm', table: 'users', col: 'email' },
      { name: 'idx_projects_name_trgm', table: 'projects', col: 'name' },
      { name: 'idx_projects_code_trgm', table: 'projects', col: 'code' },
      { name: 'idx_tasks_title_trgm', table: 'tasks', col: 'title' },
      { name: 'idx_clients_name_trgm', table: 'clients', col: 'name' },
    ];

    for (const idx of trigramIndexes) {
      try {
        await client.query(`CREATE INDEX IF NOT EXISTS ${idx.name} ON ${idx.table} USING gin (${idx.col} gin_trgm_ops)`);
        console.log(`✓ ${idx.name}`);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`✗ ${idx.name}: ${err.message.substring(0, 40)}`);
        } else {
          console.log(`✓ ${idx.name} (exists)`);
        }
      }
    }

    // 6. Analyze tables to update statistics
    console.log('\n=== ANALYZING TABLES ===');
    const tables = ['users', 'projects', 'tasks', 'time_entries', 'expenses', 'clients', 'comments', 'activity_log', 'budget_revisions'];
    for (const table of tables) {
      try {
        await client.query(`ANALYZE ${table}`);
        console.log(`✓ Analyzed ${table}`);
      } catch (err) {
        console.log(`✗ ${table}: ${err.message.substring(0, 30)}`);
      }
    }

    // 7. Show current indexes
    console.log('\n=== CURRENT INDEXES ===');
    const allIndexes = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY indexname
    `);
    console.log(`Total indexes: ${allIndexes.rows.length}`);
    allIndexes.rows.forEach(row => console.log(`  - ${row.indexname}`));

    console.log('\n=== ADVANCED OPTIMIZATION COMPLETE ===');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

advancedOptimize();
