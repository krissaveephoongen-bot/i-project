const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function directSQLFix() {
  try {
    console.log('🔄 Direct SQL fix for production database...');
    
    // Use direct POST to Supabase REST API
    const statements = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP`,
      `UPDATE users SET locked_until = NULL, failed_login_attempts = 0, email_verified = true, phone_verified = false, two_factor_enabled = false WHERE locked_until IS NULL`
    ];
    
    for (const sql of statements) {
      console.log(`📄 Executing: ${sql.substring(0, 60)}...`);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ sql_query: sql })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ HTTP Error ${response.status}:`, errorText);
        } else {
          console.log(`✅ Success`);
        }
      } catch (err) {
        console.error(`❌ Exception:`, err);
      }
    }
    
    console.log('🎉 Direct SQL fix completed!');
    
    // Test the schema
    console.log('🔍 Testing schema...');
    const { data, error } = await supabase
      .from('users')
      .select('id,email,locked_until,failed_login_attempts,email_verified')
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

directSQLFix();
