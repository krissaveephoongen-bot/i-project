// Check all tables and their data
const https = require('https');

const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw';

async function checkAllTables() {
  console.log('🔍 Checking all tables in new database...\n');
  
  const tables = [
    'users', 'clients', 'projects', 'milestones', 'tasks',
    'risks', 'issues', 'budget_lines', 'documents',
    'time_entries', 'timesheet_submissions', 'cashflow',
    'expenses', 'financial_data', 'sales_pipelines', 'sales_stages',
    'sales_deals', 'sales_activities', 'spi_cpi_daily_snapshot',
    'project_progress_snapshots', 'project_progress_history',
    'audit_logs', 'notifications', 'saved_views', 'stakeholders',
    'project_members', 'task_plan_points', 'task_actual_logs'
  ];
  
  for (const table of tables) {
    try {
      console.log(`📋 Checking ${table}:`);
      
      // Get sample data to see columns
      const response = await fetch(`${NEW_SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
        headers: {
          'apikey': NEW_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          console.log(`   ✅ Columns: ${columns.join(', ')}`);
          console.log(`   📊 Sample: ${JSON.stringify(data[0], null, 2).substring(0, 200)}...`);
        } else {
          console.log(`   ✅ Table exists but empty`);
        }
      } else {
        const error = await response.text();
        console.log(`   ❌ Error: ${error}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}\n`);
    }
  }
}

checkAllTables().catch(console.error);
