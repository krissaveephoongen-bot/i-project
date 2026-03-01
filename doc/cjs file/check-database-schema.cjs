const { createClient } = require('@supabase/supabase-js');

// Use production environment variables from Vercel
const supabaseUrl = 'https://rllhsiguqezuzltsjntp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbGhzaWd1cWV6dXpsdHNqbnRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTc5MjQ2NCwiZXhwIjoyMDU1MzY4NDY0fQ.q-p5oNpKl2qN6zLr-3q3X7bX8hYqZJ9oKqL1n3s7r3w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');
    
    // Check projects table
    console.log('📊 Projects table:');
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);
    
    if (projError) {
      console.log('❌ Projects error:', projError.message);
    } else {
      console.log('✅ Projects table accessible');
      if (projects.length > 0) {
        console.log('📋 Columns:', Object.keys(projects[0]).join(', '));
      }
    }
    
    // Check spi_cpi_daily_snapshot table
    console.log('\n📈 SPI/CPI Daily Snapshot table:');
    const { data: snapshots, error: snapError } = await supabase
      .from('spi_cpi_daily_snapshot')
      .select('*')
      .limit(1);
    
    if (snapError) {
      console.log('❌ Snapshots error:', snapError.message);
    } else {
      console.log('✅ Snapshots table accessible');
      if (snapshots.length > 0) {
        console.log('📋 Columns:', Object.keys(snapshots[0]).join(', '));
      } else {
        console.log('📋 Table is empty, checking schema...');
      }
    }
    
    // Check table structure via information_schema
    console.log('\n🔧 Checking table structures...');
    
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type')
      .in('table_name', ['projects', 'spi_cpi_daily_snapshot'])
      .order('table_name, ordinal_position');
    
    if (tableError) {
      console.log('❌ Schema check error:', tableError.message);
    } else {
      const currentTable = '';
      tables?.forEach(row => {
        if (row.table_name !== currentTable) {
          console.log(`\n📋 ${row.table_name}:`);
        }
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
    }
    
    // Try to create a snapshot manually
    console.log('\n🔄 Testing manual snapshot creation...');
    const today = new Date().toISOString().slice(0, 10);
    
    const { data: projectList, error: listError } = await supabase
      .from('projects')
      .select('id, name, budget, progress, spent, spi, cpi');
    
    if (listError) {
      console.log('❌ Could not fetch projects for snapshot:', listError.message);
    } else {
      console.log(`✅ Found ${projectList.length} projects for snapshot`);
      
      // Try to insert a snapshot
      const testSnapshot = {
        project_id: projectList[0]?.id,
        date: today,
        spi: projectList[0]?.spi || 1.0,
        cpi: projectList[0]?.cpi || 1.0,
        budget: projectList[0]?.budget || 0,
        spent: projectList[0]?.spent || 0,
        progress: projectList[0]?.progress || 0
      };
      
      console.log('🧪 Testing snapshot insert:', testSnapshot);
      
      const { data: insertResult, error: insertError } = await supabase
        .from('spi_cpi_daily_snapshot')
        .insert([testSnapshot])
        .select();
      
      if (insertError) {
        console.log('❌ Snapshot insert error:', insertError.message);
        console.log('🔧 This explains why SPI/CPI snapshot job fails');
      } else {
        console.log('✅ Snapshot created successfully');
      }
    }
    
  } catch (e) {
    console.error('❌ Schema check failed:', e.message);
  }
}

checkSchema();
