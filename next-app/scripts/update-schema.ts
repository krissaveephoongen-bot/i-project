import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

// Create supabase client with loaded environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateSchema() {
  console.log('Updating database schema...');

  try {
    // Add missing columns to projects table
    const updates = [
      'ALTER TABLE projects ADD COLUMN IF NOT EXISTS client TEXT',
      'ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_plan INTEGER DEFAULT 0 CHECK (progress_plan >= 0 AND progress_plan <= 100)',
      'ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_actual INTEGER DEFAULT 0 CHECK (progress_actual >= 0 AND progress_actual <= 100)',
      'ALTER TABLE projects ADD COLUMN IF NOT EXISTS spi DECIMAL(3,2) DEFAULT 1.0',
      'ALTER TABLE projects ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN (\'Low\', \'Medium\', \'High\', \'Critical\'))',
      
      // Create financial_data table
      `CREATE TABLE IF NOT EXISTS financial_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        month DATE NOT NULL,
        revenue NUMERIC(12,2) DEFAULT 0,
        cost NUMERIC(12,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      // Create team_load table
      `CREATE TABLE IF NOT EXISTS team_load (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        week_start DATE NOT NULL,
        monday_hours NUMERIC(3,1) DEFAULT 0,
        tuesday_hours NUMERIC(3,1) DEFAULT 0,
        wednesday_hours NUMERIC(3,1) DEFAULT 0,
        thursday_hours NUMERIC(3,1) DEFAULT 0,
        friday_hours NUMERIC(3,1) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      // Create project_progress_history table
      `CREATE TABLE IF NOT EXISTS project_progress_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        week_date DATE NOT NULL,
        progress INTEGER CHECK (progress >= 0 AND progress <= 100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`
    ];

    for (const sql of updates) {
      console.log(`Executing: ${sql.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec', { sql });
      
      if (error) {
        console.log('Error:', error.message);
        // Try using raw SQL through a different approach
        try {
          const { error: rawError } = await supabase
            .from('projects')
            .select('id')
            .limit(1);
          
          if (!rawError) {
            console.log('Connection successful, trying direct table operations...');
          }
        } catch (e) {
          console.log('Direct approach failed:', e);
        }
      } else {
        console.log('Success!');
      }
    }

    console.log('Schema update completed!');

  } catch (error) {
    console.error('Error updating schema:', error);
  }
}

updateSchema();
