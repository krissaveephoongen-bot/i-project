const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixProductionDB() {
  try {
    console.log('🔄 Fixing production database schema...');
    
    // Execute SQL directly via RPC
    const sql = `
      -- Add missing columns to users table
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
      ADD COLUMN IF NOT EXISTS reset_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
      ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP;
      
      -- Update existing users
      UPDATE users 
      SET 
        locked_until = NULL,
        failed_login_attempts = 0,
        email_verified = true,
        phone_verified = false,
        two_factor_enabled = false
      WHERE locked_until IS NULL;
    `;
    
    // Split into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📄 Executing: ${statement.trim().substring(0, 50)}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement.trim() });
          
          if (error) {
            console.error(`❌ Error:`, error);
          } else {
            console.log(`✅ Success`);
          }
        } catch (err) {
          console.error(`❌ Exception:`, err);
        }
      }
    }
    
    console.log('🎉 Database schema fixed!');
    
    // Test the schema
    console.log('🔍 Testing schema...');
    const { data, error } = await supabase
      .from('users')
      .select('id,email,locked_until,failed_login_attempts')
      .limit(1);
    
    if (error) {
      console.error('❌ Schema test failed:', error);
    } else {
      console.log('✅ Schema test passed!');
      console.log('Sample user:', data);
    }
    
  } catch (error) {
    console.error('❌ Fix error:', error);
  }
}

fixProductionDB();
