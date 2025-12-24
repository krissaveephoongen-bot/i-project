#!/usr/bin/env node

/**
 * Check Existing Database Schema
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // Get all tables
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📋 Existing Tables in Database:');
    console.log('═'.repeat(40));
    
    if (tableResult.rows.length === 0) {
      console.log('⚠️  No tables found in public schema');
    } else {
      tableResult.rows.forEach(row => {
        console.log(`  • ${row.table_name}`);
      });
    }

    console.log('\n📊 Table Details:\n');

    // Get detailed info about each table
    for (const row of tableResult.rows) {
      const table = row.table_name;
      
      // Get columns
      const columnResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      console.log(`\n${table}:`);
      console.log('─'.repeat(40));
      columnResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`  ${col.column_name.padEnd(20)} ${col.data_type.padEnd(15)} ${nullable}`);
      });
    }

    // Check for schema_migrations (Prisma uses this)
    const migrationsResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      ) as exists;
    `);

    console.log(`\n\n🔍 Prisma Migration Status:`);
    console.log('═'.repeat(40));
    if (migrationsResult.rows[0].exists) {
      console.log('✓ _prisma_migrations table exists');
      const migrations = await client.query('SELECT * FROM _prisma_migrations ORDER BY started_at DESC LIMIT 5');
      migrations.rows.forEach(m => {
        console.log(`  • ${m.migration_name}`);
      });
    } else {
      console.log('✗ _prisma_migrations table NOT found');
      console.log('  → Prisma has never run migrations on this database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
