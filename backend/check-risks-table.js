import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.development' });

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(DATABASE_URL);

async function checkRisksTable() {
  try {
    console.log('Checking risks table structure...');
    
    // Check if table exists and get its columns
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'risks' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('Risks table columns:');
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check if status column exists
    const hasStatus = result.some(col => col.column_name === 'status');
    console.log(`\nStatus column exists: ${hasStatus}`);
    
    if (!hasStatus) {
      console.log('Adding status column...');
      await sql`ALTER TABLE "risks" ADD COLUMN "status" text NOT NULL DEFAULT 'open'`;
      console.log('✅ Status column added!');
    }
    
    // Add sample data if table is empty
    const count = await sql`SELECT COUNT(*) as count FROM "risks"`;
    if (count[0].count === 0) {
      console.log('Adding sample risks...');
      await sql`
        INSERT INTO "risks" ("title", "description", "impact", "probability", "risk_score", "status", "project_id", "assigned_to", "created_at", "updated_at")
        VALUES 
          ('High Budget Risk', 'Project may exceed budget due to scope creep', 'High', 'Medium', 75, 'open', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
          ('Timeline Delay', 'Key dependencies may cause delays', 'Medium', 'High', 60, 'open', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
          ('Resource Shortage', 'Limited availability of key resources', 'High', 'Low', 40, 'in_progress', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW())
      `;
      console.log('✅ Sample risks added!');
    } else {
      console.log(`Risks table has ${count[0].count} records`);
    }
    
  } catch (error) {
    console.error('❌ Error checking risks table:', error);
  } finally {
    await sql.end();
  }
}

checkRisksTable();
