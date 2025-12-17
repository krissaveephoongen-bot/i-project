import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function fixEnum() {
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

  try {
    const client = await pool.connect();
    try {
      // Check if 'pending' value exists in status enum
      const result = await client.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = 'status'::regtype 
        ORDER BY enumsortorder;
      `);
      
      console.log('Current status enum values:', result.rows.map((r: any) => r.enumlabel));

      // Try to add 'pending' if it doesn't exist
      if (!result.rows.some((r: any) => r.enumlabel === 'pending')) {
        await client.query(`
          ALTER TYPE status ADD VALUE 'pending' BEFORE 'approved';
        `);
        console.log('✅ Added "pending" to status enum');
      } else {
        console.log('✅ "pending" already exists in status enum');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixEnum().catch(console.error);
