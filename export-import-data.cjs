// Export data from old Supabase and import to new Supabase
const https = require('https');

// Old Supabase credentials
const OLD_SUPABASE_URL = 'https://rllhsiguqezuzltsjntp.supabase.co';
const OLD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbGhzaWd1cWV6dXpsdHNqbnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3OTI0NjQsImV4cCI6MjA1NTM2ODQ2NH0.q-p5oNpKl2qN6zLr-3q3X7bX8hYqZJ9oKqL1n3s7r3w';

// New Supabase credentials  
const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw';

async function exportImportData() {
  console.log('🔄 เริ่มการ Export/Import ข้อมูลระหว่าง Supabase...\n');
  
  try {
    // Step 1: Export data from old Supabase
    console.log('1️⃣ Export ข้อมูลจาก Supabase เก่า:');
    const oldData = await exportFromSupabase(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY);
    
    // Step 2: Import data to new Supabase
    console.log('\n2️⃣ Import ข้อมูลไปยัง Supabase ใหม่:');
    await importToSupabase(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY, oldData);
    
    console.log('\n✅ การ Export/Import สำเร็จสมบูรณ์!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

async function exportFromSupabase(supabaseUrl, anonKey) {
  const exportData = {
    projects: [],
    users: [],
    clients: [],
    milestones: [],
    cashflow: [],
    spi_cpi_daily_snapshot: []
  };
  
  // Export Projects
  console.log('   📊 Export Projects...');
  const projects = await fetchTable(supabaseUrl, anonKey, 'projects');
  exportData.projects = projects;
  console.log(`      ✅ ${projects.length} projects`);
  
  // Export Users
  console.log('   👥 Export Users...');
  const users = await fetchTable(supabaseUrl, anonKey, 'users');
  exportData.users = users;
  console.log(`      ✅ ${users.length} users`);
  
  // Export Clients
  console.log('   🏢 Export Clients...');
  const clients = await fetchTable(supabaseUrl, anonKey, 'clients');
  exportData.clients = clients;
  console.log(`      ✅ ${clients.length} clients`);
  
  // Export Milestones
  console.log('   🎯 Export Milestones...');
  const milestones = await fetchTable(supabaseUrl, anonKey, 'milestones');
  exportData.milestones = milestones;
  console.log(`      ✅ ${milestones.length} milestones`);
  
  // Export Cashflow
  console.log('   💰 Export Cashflow...');
  const cashflow = await fetchTable(supabaseUrl, anonKey, 'cashflow');
  exportData.cashflow = cashflow;
  console.log(`      ✅ ${cashflow.length} cashflow entries`);
  
  // Export SPI/CPI Snapshots
  console.log('   📈 Export SPI/CPI Snapshots...');
  const snapshots = await fetchTable(supabaseUrl, anonKey, 'spi_cpi_daily_snapshot');
  exportData.spi_cpi_daily_snapshot = snapshots;
  console.log(`      ✅ ${snapshots.length} snapshots`);
  
  return exportData;
}

async function importToSupabase(supabaseUrl, anonKey, data) {
  // Import Projects
  console.log('   📊 Import Projects...');
  if (data.projects.length > 0) {
    await insertTable(supabaseUrl, anonKey, 'projects', data.projects);
    console.log(`      ✅ ${data.projects.length} projects imported`);
  }
  
  // Import Users
  console.log('   👥 Import Users...');
  if (data.users.length > 0) {
    await insertTable(supabaseUrl, anonKey, 'users', data.users);
    console.log(`      ✅ ${data.users.length} users imported`);
  }
  
  // Import Clients
  console.log('   🏢 Import Clients...');
  if (data.clients.length > 0) {
    await insertTable(supabaseUrl, anonKey, 'clients', data.clients);
    console.log(`      ✅ ${data.clients.length} clients imported`);
  }
  
  // Import Milestones
  console.log('   🎯 Import Milestones...');
  if (data.milestones.length > 0) {
    await insertTable(supabaseUrl, anonKey, 'milestones', data.milestones);
    console.log(`      ✅ ${data.milestones.length} milestones imported`);
  }
  
  // Import Cashflow
  console.log('   💰 Import Cashflow...');
  if (data.cashflow.length > 0) {
    await insertTable(supabaseUrl, anonKey, 'cashflow', data.cashflow);
    console.log(`      ✅ ${data.cashflow.length} cashflow entries imported`);
  }
  
  // Import SPI/CPI Snapshots
  console.log('   📈 Import SPI/CPI Snapshots...');
  if (data.spi_cpi_daily_snapshot.length > 0) {
    await insertTable(supabaseUrl, anonKey, 'spi_cpi_daily_snapshot', data.spi_cpi_daily_snapshot);
    console.log(`      ✅ ${data.spi_cpi_daily_snapshot.length} snapshots imported`);
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

async function insertTable(supabaseUrl, anonKey, tableName, records) {
  return new Promise((resolve) => {
    const url = `${supabaseUrl}/rest/v1/${tableName}`;
    const data = JSON.stringify(records);
    
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Prefer': 'return=minimal'
      }
    }, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`     ✅ ${tableName}: HTTP ${res.statusCode}`);
        } else {
          console.log(`     ❌ ${tableName}: HTTP ${res.statusCode}`);
          console.log(`     Response: ${responseData}`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`     ❌ Network error for ${tableName}: ${err.message}`);
      resolve();
    });
    
    req.write(data);
    req.end();
  });
}

exportImportData().catch(console.error);
