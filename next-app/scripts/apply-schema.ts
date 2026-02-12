import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: '.env.local' });

// Create supabase client with loaded environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyDashboardSchema() {
  console.log('Applying dashboard schema...');

  try {
    // Read the schema file
    const schemaSQL = readFileSync('./dashboard-schema.sql', 'utf8');

    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        console.log(`Statement ${i + 1} failed:`, error.message);
        // Continue with other statements
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    }

    console.log('Dashboard schema application completed!');

  } catch (error) {
    console.error('Error applying dashboard schema:', error);
  }
}

applyDashboardSchema();
