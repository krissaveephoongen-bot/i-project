// Check risks table schema
const https = require('https');

const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw';

async function checkRisksSchema() {
  console.log('🔍 Checking risks table schema...\n');
  
  try {
    // Get risks table structure
    const response = await fetch(`${NEW_SUPABASE_URL}/rest/v1/risks?select=*&limit=1`, {
      headers: {
        'apikey': NEW_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 Sample risks record:', data[0] || 'No records');
      
      // Get column information
      const columnsResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/rpc/get_table_columns?table_name=risks`, {
        headers: {
          'apikey': NEW_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
        }
      });
      
      if (columnsResponse.ok) {
        const columns = await columnsResponse.json();
        console.log('📋 Table columns:', columns);
      }
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRisksSchema().catch(console.error);
