// Check backend sync with new database
const https = require('https');

const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'sb_publishable_MXBRHnc3b8kCjjsVaacMfQ_WwT_5g15';
const NEW_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.k1gvzBcV1lBiGAxS-_5nyH88OhhCSzd5ko2NTHtUUSc';

async function checkBackendSync() {
  console.log('🔍 ตรวจสอบ Backend Sync กับฐานข้อมูลใหม่...\n');
  
  try {
    // 1. Test direct database connection
    console.log('1️⃣ ทดสอบการเชื่อมต่อฐานข้อมูลโดยตรง:');
    
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
    
    const tableStatus = {};
    
    for (const table of tables) {
      try {
        const response = await fetch(`${NEW_SUPABASE_URL}/rest/v1/${table}?select=count`, {
          headers: {
            'apikey': NEW_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`,
            'Prefer': 'count=exact'
          }
        });
        
        if (response.ok) {
          const count = response.headers.get('content-range')?.split('/')[1] || '0';
          tableStatus[table] = { count: parseInt(count), status: 'exists' };
        } else {
          tableStatus[table] = { count: 0, status: 'error' };
        }
      } catch (error) {
        tableStatus[table] = { count: 0, status: 'error', error: error.message };
      }
    }
    
    console.log('📊 สถานะตารางในฐานข้อมูล:');
    Object.entries(tableStatus).forEach(([name, info]) => {
      const icon = info.status === 'exists' ? '✅' : '❌';
      const count = info.count > 0 ? `${info.count} records` : 'empty';
      console.log(`   ${icon} ${name}: ${count}`);
    });
    
    // 2. Check if essential data exists
    console.log('\n2️⃣ ตรวจสอบข้อมูลสำคัญ:');
    
    const essentialTables = ['users', 'clients', 'projects', 'milestones', 'cashflow', 'spi_cpi_daily_snapshot'];
    const hasEssentialData = essentialTables.every(table => tableStatus[table].count > 0);
    
    if (hasEssentialData) {
      console.log('✅ มีข้อมูลสำคัญครบถ้วน');
      
      // Get sample data for verification
      console.log('\n📋 ตัวอย่างข้อมูล:');
      
      // Users
      const usersResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?select=id,name,email,role&limit=3`, {
        headers: {
          'apikey': NEW_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
        }
      });
      
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        console.log(`   👥 Users (${users.length}):`);
        users.forEach((u, i) => console.log(`     ${i+1}. ${u.name} (${u.email}) - ${u.role}`));
      }
      
      // Projects
      const projectsResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/projects?select=id,name,status,progress,budget,spi&limit=3`, {
        headers: {
          'apikey': NEW_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
        }
      });
      
      if (projectsResponse.ok) {
        const projects = await projectsResponse.json();
        console.log(`   📊 Projects (${projects.length}):`);
        projects.forEach((p, i) => console.log(`     ${i+1}. ${p.name} (${p.status}) - Progress: ${p.progress}%, SPI: ${p.spi}`));
      }
      
      // SPI/CPI Snapshots
      const snapshotsResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/spi_cpi_daily_snapshot?select=date,spi,cpi&limit=3`, {
        headers: {
          'apikey': NEW_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
        }
      });
      
      if (snapshotsResponse.ok) {
        const snapshots = await snapshotsResponse.json();
        console.log(`   📈 SPI/CPI Snapshots (${snapshots.length}):`);
        snapshots.forEach((s, i) => console.log(`     ${i+1}. ${s.date} - SPI: ${s.spi}, CPI: ${s.cpi}`));
      }
      
    } else {
      console.log('❌ ไม่มีข้อมูลสำคัญครบถ้วน');
      console.log('🔧 ต้องสร้างข้อมูลตัวอย่าง');
    }
    
    // 3. Test backend API endpoints
    console.log('\n3️⃣ ทดสอบ Backend API Endpoints:');
    
    const apiEndpoints = [
      { name: 'Portfolio', url: '/api/dashboard/portfolio' },
      { name: 'Executive Report', url: '/api/projects/executive-report' },
      { name: 'Weekly Summary', url: '/api/projects/weekly-summary' },
      { name: 'SPI/CPI Snapshot', url: '/api/jobs/spi-cpi-snapshot' }
    ];
    
    const apiStatus = {};
    
    for (const endpoint of apiEndpoints) {
      try {
        const method = endpoint.name === 'SPI/CPI Snapshot' ? 'POST' : 'GET';
        const response = await fetch(`https://i-projects.skin${endpoint.url}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        apiStatus[endpoint.name] = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        };
        
        const icon = response.ok ? '✅' : '❌';
        console.log(`   ${icon} ${endpoint.name}: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          const error = await response.text();
          console.log(`     Error: ${error.substring(0, 100)}...`);
        }
        
      } catch (error) {
        apiStatus[endpoint.name] = {
          status: 'ERROR',
          ok: false,
          error: error.message
        };
        console.log(`   ❌ ${endpoint.name}: Network error - ${error.message}`);
      }
    }
    
    // 4. Check if backend is reading from new database
    console.log('\n4️⃣ ตรวจสอบว่า Backend อ่านจากฐานข้อมูลใหม่:');
    
    if (apiStatus['Portfolio'].ok) {
      const portfolioResponse = await fetch('https://i-projects.skin/api/dashboard/portfolio');
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        
        if (portfolioData.rows && portfolioData.rows.length > 0) {
          const sampleProject = portfolioData.rows[0];
          console.log(`   📊 Sample project from API: "${sampleProject.name}"`);
          
          // Check if it's Thai project names (new database)
          if (sampleProject.name.includes('เว็บไซต์') || sampleProject.name.includes('ระบบ') || sampleProject.name.includes('โครงการ')) {
            console.log('   ✅ Backend กำลังใช้ฐานข้อมูลใหม่ (พบชื่อโครงการภาษาไทย)');
          } else {
            console.log('   ⚠️ Backend อาจจะยังใช้ฐานข้อมูลเก่า');
          }
        } else {
          console.log('   ❌ API ไม่พบข้อมูล projects');
        }
      }
    }
    
    // 5. Summary
    console.log('\n📋 สรุปผลการตรวจสอบ:');
    console.log('=====================================');
    
    const workingAPIs = Object.values(apiStatus).filter(status => status.ok).length;
    const totalAPIs = Object.keys(apiStatus).length;
    
    console.log(`📊 Database Tables: ${Object.values(tableStatus).filter(t => t.status === 'exists').length}/${tables.length}`);
    console.log(`🔌 Backend APIs: ${workingAPIs}/${totalAPIs}`);
    console.log(`📊 Essential Data: ${hasEssentialData ? '✅' : '❌'}`);
    
    if (hasEssentialData && workingAPIs === totalAPIs) {
      console.log('\n🎉 Backend sync สำเร็จสมบูรณ์!');
      console.log('🌟 ระบบพร้อมใช้งานเต็มทั้งหมด');
    } else if (workingAPIs === totalAPIs) {
      console.log('\n✅ Backend API ทำงานได้ แต่ต้องเพิ่มข้อมูล');
      console.log('📊 ต้องสร้างข้อมูลตัวอย่างในฐานข้อมูล');
    } else {
      console.log('\n⚠️ Backend API มีปัญหา ต้องแก้ไข');
      console.log('🔧 ตรวจสอบ API endpoints และ environment variables');
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

checkBackendSync().catch(console.error);
