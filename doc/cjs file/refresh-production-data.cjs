const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function refreshData() {
  try {
    console.log('🔄 Refreshing production data...');
    
    // 1. Check current projects
    console.log('\n📊 Checking projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, updatedAt, updated_at, progress, spi, cpi')
      .order('updatedAt', { ascending: false });
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
      return;
    }
    
    console.log(`✅ Found ${projects?.length || 0} projects`);
    if (projects && projects.length > 0) {
      console.log('Latest project:', {
        id: projects[0].id,
        name: projects[0].name,
        updatedAt: projects[0].updatedAt || projects[0].updated_at,
        progress: projects[0].progress,
        spi: projects[0].spi,
        cpi: projects[0].cpi
      });
    }
    
    // 2. Check SPI/CPI snapshots
    console.log('\n📈 Checking SPI/CPI snapshots...');
    const { data: snapshots, error: snapshotsError } = await supabase
      .from('spi_cpi_daily_snapshot')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (snapshotsError) {
      console.error('❌ Error fetching snapshots:', snapshotsError);
    } else {
      console.log(`✅ Found ${snapshots?.length || 0} recent snapshots`);
      if (snapshots && snapshots.length > 0) {
        console.log('Latest snapshot date:', snapshots[0].date);
      }
    }
    
    // 3. Manually trigger SPI/CPI calculation
    console.log('\n🔄 Triggering SPI/CPI snapshot...');
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    
    // Calculate SPI/CPI for all projects
    const rows = (projects || []).map((p) => {
      const budget = Number(p.budget || 0);
      const progress = Number(p.progress || 0);
      const actual = Number(p.spent || 0);
      const ev = budget * (progress / 100);
      const cpi = actual > 0 ? ev / actual : (progress > 0 ? 2 : 1);
      const spi = Number(p.spi ?? 1);
      
      return { 
        id: `${p.id}-${dateStr}`, 
        projectId: p.id, 
        date: dateStr, 
        spi: Number(spi.toFixed(2)), 
        cpi: Number(cpi.toFixed(2)) 
      };
    });
    
    if (rows.length > 0) {
      const { error: upErr } = await supabase
        .from('spi_cpi_daily_snapshot')
        .upsert(rows, { onConflict: 'id' });
      
      if (upErr) {
        console.error('❌ Error updating snapshots:', upErr);
      } else {
        console.log(`✅ Updated ${rows.length} project snapshots for ${dateStr}`);
      }
    } else {
      console.log('⚠️ No projects to update');
    }
    
    // 4. Verify dashboard data freshness
    console.log('\n🔍 Verifying dashboard API endpoints...');
    
    // Test portfolio endpoint
    const portfolioResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/dashboard/portfolio?t=${Date.now()}`);
    if (portfolioResponse.ok) {
      const portfolioData = await portfolioResponse.json();
      console.log(`✅ Portfolio API: ${portfolioData.rows?.length || 0} projects, cashflow: ${portfolioData.cashflow?.length || 0} months`);
    } else {
      console.log('❌ Portfolio API failed');
    }
    
    console.log('\n✅ Data refresh complete!');
    
  } catch (error) {
    console.error('❌ Error during refresh:', error);
  }
}

// Run if called directly
if (require.main === module) {
  refreshData();
}

module.exports = { refreshData };
