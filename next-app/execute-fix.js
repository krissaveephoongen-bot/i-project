const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function executeSQL() {
  try {
    console.log('Executing SQL to fix RLS policies...');
    
    // Read the SQL file
    const fs = require('fs');
    const sql = fs.readFileSync('fix-rls-policies.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try alternative approach - execute statements one by one
      const statements = sql.split(';').filter(s => s.trim());
      console.log(`Executing ${statements.length} statements individually...`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          console.log(`Executing statement ${i + 1}: ${statement.substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement });
          if (stmtError) {
            console.error(`Error in statement ${i + 1}:`, stmtError);
          } else {
            console.log(`Statement ${i + 1} executed successfully`);
          }
        }
      }
    } else {
      console.log('SQL executed successfully:', data);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

executeSQL();
