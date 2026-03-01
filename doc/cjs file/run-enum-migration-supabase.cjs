/**
 * Run Enum Migration via Supabase REST API
 * 
 * This script creates all PostgreSQL enum types using Supabase REST API.
 * Run with: node run-enum-migration-supabase.cjs
 */

const SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.5y9iB5QK8L2eX3m7n8wR6pF9sT1kL2jH3gV4cY8wZ7k';

// SQL statements for creating enums
const enumSQLs = [
  // User Related Enums
  `DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE user_status AS ENUM ('active', 'inactive'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Project Related Enums
  `DO $$ BEGIN CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Task Related Enums
  `DO $$ BEGIN CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE task_category AS ENUM ('development', 'design', 'testing', 'documentation', 'maintenance', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Timesheet & Time Entry Enums
  `DO $$ BEGIN CREATE TYPE work_type AS ENUM ('project', 'office', 'training', 'leave', 'overtime', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE time_entry_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Leave Management Enums
  `DO $$ BEGIN CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'personal', 'maternity', 'unpaid'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Expense Enums
  `DO $$ BEGIN CREATE TYPE expense_category AS ENUM ('travel', 'supplies', 'equipment', 'training', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected', 'reimbursed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('cash', 'credit_card', 'bank_transfer', 'check', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Client Enums
  `DO $$ BEGIN CREATE TYPE client_status AS ENUM ('active', 'inactive', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE client_type AS ENUM ('individual', 'company', 'government'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Sales Enums
  `DO $$ BEGIN CREATE TYPE sales_status AS ENUM ('prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE sales_stage AS ENUM ('lead', 'contact', 'meeting', 'demo', 'proposal', 'contract', 'won', 'lost'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Stakeholder Enums
  `DO $$ BEGIN CREATE TYPE stakeholder_role AS ENUM ('executive', 'manager', 'team_member', 'client', 'vendor', 'consultant', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE stakeholder_type AS ENUM ('internal', 'external', 'partner'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE involvement_level AS ENUM ('high', 'medium', 'low', 'minimal'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Resource Enums
  `DO $$ BEGIN CREATE TYPE resource_type AS ENUM ('human', 'equipment', 'material', 'software', 'facility', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE resource_status AS ENUM ('available', 'in_use', 'maintenance', 'retired', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE allocation_status AS ENUM ('requested', 'approved', 'allocated', 'deallocated', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Audit & Activity Enums
  `DO $$ BEGIN CREATE TYPE activity_type AS ENUM ('create', 'update', 'delete', 'comment', 'assign', 'status_change'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE audit_severity AS ENUM ('low', 'medium', 'high', 'critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Milestone Enums
  `DO $$ BEGIN CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Risk Enums
  `DO $$ BEGIN CREATE TYPE risk_impact AS ENUM ('low', 'medium', 'high', 'critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE risk_probability AS ENUM ('low', 'medium', 'high', 'very_high'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE risk_status AS ENUM ('open', 'mitigated', 'closed', 'accepted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  
  // Generic Status Enum (for backward compatibility)
  `DO $$ BEGIN CREATE TYPE status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'pending', 'approved', 'rejected', 'active', 'inactive'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'urgent'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
];

async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const text = await response.text();
    // Try alternative method using direct query
    const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ query: sql }),
    });
    return altResponse;
  }
  
  return response;
}

async function runMigrationViaTable() {
  console.log('🔗 Connecting to Supabase...');
  console.log('📄 Running enum migration...\n');
  
  let successCount = 0;
  let skipCount = 0;
  
  for (let i = 0; i < enumSQLs.length; i++) {
    const sql = enumSQLs[i];
    console.log(`[${i + 1}/${enumSQLs.length}] Executing...`);
    
    try {
      // Use the SQL execution endpoint
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ sql }),
      });
      
      if (response.ok) {
        successCount++;
        console.log('  ✅ Success');
      } else {
        const text = await response.text();
        if (text.includes('already exists') || text.includes('duplicate')) {
          skipCount++;
          console.log('  ⏭️  Already exists (skipped)');
        } else {
          console.log(`  ⚠️  ${text.substring(0, 100)}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Created: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log('='.repeat(50));
}

// Alternative: Use Supabase Management API
async function runMigrationViaPSQL() {
  console.log('\n📋 To run the migration, use one of these methods:\n');
  console.log('Method 1: Supabase Dashboard SQL Editor');
  console.log('  1. Go to: https://supabase.com/dashboard/project/vaunihijmwwkhqagjqjd/sql');
  console.log('  2. Copy the contents of: backend/db/migrations/0004_create_enums.sql');
  console.log('  3. Paste and run in the SQL editor\n');
  
  console.log('Method 2: Local psql command');
  console.log('  psql "postgresql://postgres.vaunihijmwwkhqagjqjd:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" -f backend/db/migrations/0004_create_enums.sql\n');
  
  console.log('Method 3: Using Prisma');
  console.log('  npx prisma db push\n');
}

// Run
runMigrationViaPSQL();
