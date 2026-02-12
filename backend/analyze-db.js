import { Client } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = new Client({ connectionString });

async function analyzeDatabase() {
  try {
    await client.connect();
    console.log('Connected to database\n');

    // 1. List all tables
    console.log('=== TABLES ===');
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log(tables.rows.map(r => r.table_name).join('\n'));

    // 2. Check for missing indexes
    console.log('\n=== INDEXES ===');
    const indexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY indexname
    `);
    indexes.rows.forEach(row => {
      console.log(`${row.indexname}: ${row.indexdef.substring(0, 100)}...`);
    });

    // 3. Check for missing columns that schema expects
    console.log('\n=== USERS TABLE COLUMNS ===');
    const userCols = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    userCols.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });

    // 4. Check time_entries for approval columns
    console.log('\n=== TIME_ENTRIES TABLE COLUMNS ===');
    const timeCols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'time_entries'
      ORDER BY ordinal_position
    `);
    timeCols.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });

    // 5. Check for orphaned foreign keys
    console.log('\n=== FOREIGN KEY CONSTRAINTS ===');
    const fks = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(oid)
      FROM pg_constraint
      WHERE conrelid = (
        SELECT oid FROM pg_class WHERE relname = 'time_entries'
      )
    `);
    fks.rows.forEach(row => {
      console.log(`${row.conname}: ${row.pg_get_constraintdef.substring(0, 80)}`);
    });

    // 6. Check for large tables
    console.log('\n=== TABLE SIZES ===');
    const sizes = await client.query(`
      SELECT relname, pg_size_pretty(pg_relation_size(relid)) as size
      FROM pg_stat_user_tables
      ORDER BY pg_relation_size(relid) DESC
      LIMIT 10
    `);
    sizes.rows.forEach(row => {
      console.log(`${row.relname}: ${row.size}`);
    });

    console.log('\n=== Analysis Complete ===');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

analyzeDatabase();
