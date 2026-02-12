// Database Index Updater
// This script will connect to your PostgreSQL database and apply the indexes

import postgres from 'postgres';

// Your database connection string
const DATABASE_URL = 'postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

async function checkDatabaseStructure() {
  console.log('🔍 Checking database structure...');
  
  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    connect_timeout: 10,
  });

  try {
    // Check all tables
    console.log('\n📋 Tables in database:');
    const tables = await sql`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.table(tables);

    // Check users table columns
    console.log('\n👤 Users table columns:');
    const userColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    console.table(userColumns);

    // Check projects table columns
    console.log('\n📁 Projects table columns:');
    const projectColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'projects' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    console.table(projectColumns);

    // Check time_entries table columns
    console.log('\n⏰ Time entries table columns:');
    const timeColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'time_entries' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    console.table(timeColumns);

    // Check existing indexes
    console.log('\n🔍 Existing indexes:');
    const indexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname
    `;
    console.table(indexes);

    // Check table sizes
    console.log('\n📊 Table sizes:');
    const sizes = await sql`
      SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
      FROM pg_tables t 
      WHERE schemaname = 'public' 
        AND tablename IN ('users', 'projects', 'time_entries', 'tasks', 'expenses')
      ORDER BY size_bytes DESC
    `;
    console.table(sizes);

    await sql.end();
    return { tables, userColumns, projectColumns, timeColumns, indexes, sizes };
    
  } catch (error) {
    console.error('❌ Error checking database structure:', error);
    await sql.end();
    throw error;
  }
}

async function applyIndexes() {
  console.log('🚀 Applying database indexes...');
  
  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    connect_timeout: 10,
  });

  try {
    // Users table indexes
    console.log('📝 Creating users table indexes...');
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
      console.log('✅ idx_users_email created');
    } catch (e) {
      console.log('⚠️  idx_users_email:', e.message);
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;
      console.log('✅ idx_users_role created');
    } catch (e) {
      console.log('⚠️  idx_users_role:', e.message);
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`;
      console.log('✅ idx_users_created_at created');
    } catch (e) {
      console.log('⚠️  idx_users_created_at:', e.message);
    }

    // Conditional indexes for users
    const userColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
    `;
    const userColumnNames = userColumns.map(col => col.column_name);

    if (userColumnNames.includes('status')) {
      try {
        await sql`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`;
        console.log('✅ idx_users_status created');
      } catch (e) {
        console.log('⚠️  idx_users_status:', e.message);
      }
    }

    if (userColumnNames.includes('is_active')) {
      try {
        await sql`CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)`;
        console.log('✅ idx_users_is_active created');
      } catch (e) {
        console.log('⚠️  idx_users_is_active:', e.message);
      }
    }

    if (userColumnNames.includes('department')) {
      try {
        await sql`CREATE INDEX IF NOT EXISTS idx_users_department ON users(department)`;
        console.log('✅ idx_users_department created');
      } catch (e) {
        console.log('⚠️  idx_users_department:', e.message);
      }
    }

    // Projects table indexes
    console.log('📝 Creating projects table indexes...');
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`;
      console.log('✅ idx_projects_status created');
    } catch (e) {
      console.log('⚠️  idx_projects_status:', e.message);
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at)`;
      console.log('✅ idx_projects_created_at created');
    } catch (e) {
      console.log('⚠️  idx_projects_created_at:', e.message);
    }

    // Time entries table indexes (most important)
    console.log('📝 Creating time_entries table indexes...');
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id)`;
      console.log('✅ idx_time_entries_user_id created');
    } catch (e) {
      console.log('⚠️  idx_time_entries_user_id:', e.message);
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date)`;
      console.log('✅ idx_time_entries_date created');
    } catch (e) {
      console.log('⚠️  idx_time_entries_date:', e.message);
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at)`;
      console.log('✅ idx_time_entries_created_at created');
    } catch (e) {
      console.log('⚠️  idx_time_entries_created_at:', e.message);
    }

    // Analyze tables
    console.log('📊 Analyzing tables...');
    
    const tablesToAnalyze = ['users', 'projects', 'time_entries', 'tasks', 'expenses'];
    for (const table of tablesToAnalyze) {
      try {
        await sql`ANALYZE ${sql(table)}`;
        console.log(`✅ Analyzed ${table}`);
      } catch (e) {
        console.log(`⚠️  Could not analyze ${table}:`, e.message);
      }
    }

    await sql.end();
    console.log('🎉 Database indexes applied successfully!');
    
  } catch (error) {
    console.error('❌ Error applying indexes:', error);
    await sql.end();
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === 'check') {
      await checkDatabaseStructure();
    } else if (command === 'indexes') {
      await applyIndexes();
    } else {
      console.log('Usage:');
      console.log('  node update-database.js check    - Check database structure');
      console.log('  node update-database.js indexes  - Apply performance indexes');
      console.log('');
      console.log('Example:');
      console.log('  node update-database.js check');
      console.log('  node update-database.js indexes');
    }
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();
