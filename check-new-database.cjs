// Check actual data in new Supabase database
const https = require('https');

// New Supabase credentials  
const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw';

async function checkNewDatabase() {
  console.log('🔍 ตรวจสอบข้อมูลจริงใน Supabase ใหม่...\n');
  
  try {
    // Check Projects
    console.log('1️⃣ ตรวจสอบ Projects:');
    const projects = await fetchTable(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY, 'projects');
    console.log(`   📊 Projects: ${projects.length} records`);
    if (projects.length > 0) {
      projects.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i+1}. ${p.name} (${p.status}) - Budget: ${p.budget}`);
      });
    }
    
    // Check Users
    console.log('\n2️⃣ ตรวจสอบ Users:');
    const users = await fetchTable(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY, 'users');
    console.log(`   👥 Users: ${users.length} records`);
    if (users.length > 0) {
      users.slice(0, 3).forEach((u, i) => {
        console.log(`   ${i+1}. ${u.name} (${u.email}) - Role: ${u.role}`);
      });
    }
    
    // Check Clients
    console.log('\n3️⃣ ตรวจสอบ Clients:');
    const clients = await fetchTable(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY, 'clients');
    console.log(`   🏢 Clients: ${clients.length} records`);
    if (clients.length > 0) {
      clients.slice(0, 3).forEach((c, i) => {
        console.log(`   ${i+1}. ${c.name} - ${c.email}`);
      });
    }
    
    // Check Milestones
    console.log('\n4️⃣ ตรวจสอบ Milestones:');
    const milestones = await fetchTable(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY, 'milestones');
    console.log(`   🎯 Milestones: ${milestones.length} records`);
    if (milestones.length > 0) {
      milestones.slice(0, 3).forEach((m, i) => {
        console.log(`   ${i+1}. ${m.title} (${m.status}) - Project: ${m.project_id}`);
      });
    }
    
    // Check Cashflow
    console.log('\n5️⃣ ตรวจสอบ Cashflow:');
    const cashflow = await fetchTable(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY, 'cashflow');
    console.log(`   💰 Cashflow: ${cashflow.length} records`);
    if (cashflow.length > 0) {
      cashflow.slice(0, 3).forEach((c, i) => {
        console.log(`   ${i+1}. ${c.month} - Committed: ${c.committed}, Paid: ${c.paid}`);
      });
    }
    
    // Check SPI/CPI Snapshots
    console.log('\n6️⃣ ตรวจสอบ SPI/CPI Snapshots:');
    const snapshots = await fetchTable(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY, 'spi_cpi_daily_snapshot');
    console.log(`   📈 Snapshots: ${snapshots.length} records`);
    if (snapshots.length > 0) {
      const dates = [...new Set(snapshots.map(s => s.date))].sort().slice(-3);
      dates.forEach(date => {
        const count = snapshots.filter(s => s.date === date).length;
        console.log(`   ${date}: ${count} snapshots`);
      });
    }
    
    console.log('\n📋 สรุประ:');
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Clients: ${clients.length}`);
    console.log(`   Milestones: ${milestones.length}`);
    console.log(`   Cashflow: ${cashflow.length}`);
    console.log(`   SPI/CPI Snapshots: ${snapshots.length}`);
    
    // Check if data exists
    const totalRecords = projects.length + users.length + clients.length + milestones.length + cashflow.length + snapshots.length;
    
    if (totalRecords === 0) {
      console.log('\n❌ ไม่พบข้อมูลใดๆ ในฐานข้อมูล!');
      console.log('🔧 ต้องสร้างข้อมูลตัวอย่างใหม่');
    } else {
      console.log(`\n✅ พบข้อมูลทั้งหมด ${totalRecords} records`);
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

async function fetchTable(supabaseUrl, anonKey, tableName) {
  return new Promise((resolve) => {
    const url = `${supabaseUrl}/rest/v1/${tableName}?select=*`;
    
    https.get(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result || []);
        } catch (e) {
          console.log(`     ❌ Parse error for ${tableName}: ${e.message}`);
          resolve([]);
        }
      });
    }).on('error', (err) => {
      console.log(`     ❌ Network error for ${tableName}: ${err.message}`);
      resolve([]);
    });
  });
}

checkNewDatabase().catch(console.error);
