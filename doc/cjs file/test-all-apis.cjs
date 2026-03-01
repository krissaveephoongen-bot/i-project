// Test all APIs to ensure they work after column name fixes
const https = require('https');

const API_ENDPOINTS = [
  // Dashboard APIs
  { name: 'Dashboard Portfolio', url: '/api/dashboard/portfolio' },
  { name: 'Dashboard Activities', url: '/api/dashboard/activities' },
  
  // Projects APIs
  { name: 'Projects List', url: '/api/projects' },
  { name: 'Projects Executive Report', url: '/api/projects/executive-report' },
  { name: 'Projects Weekly Summary', url: '/api/projects/weekly-summary' },
  { name: 'Projects Create', url: '/api/projects/create', method: 'POST', body: { name: 'Test Project', code: 'TEST-001' } },
  
  // Users APIs
  { name: 'Users List', url: '/api/users' },
  { name: 'Users Profile', url: '/api/users/profile' },
  
  // Timesheet APIs
  { name: 'Timesheet Entries', url: '/api/timesheet/entries' },
  { name: 'Timesheet Activities', url: '/api/timesheet/activities' },
  { name: 'Timesheet Weekly', url: '/api/timesheet/weekly' },
  
  // Expenses APIs
  { name: 'Expenses List', url: '/api/expenses' },
  
  // Sales APIs
  { name: 'Sales Activities', url: '/api/sales/activities' },
  { name: 'Sales Deals', url: '/api/sales/deals' },
  { name: 'Sales Pipeline', url: '/api/sales/pipeline' },
  
  // Staff APIs
  { name: 'Staff Projects', url: '/api/staff/projects' },
  { name: 'Staff Tasks', url: '/api/staff/tasks' },
  { name: 'Staff Timesheet', url: '/api/staff/timesheet' },
  
  // Reports APIs
  { name: 'Reports Financial', url: '/api/reports/financial' },
  { name: 'Reports Hours', url: '/api/reports/hours' },
  { name: 'Reports Projects', url: '/api/reports/projects' },
  
  // Admin APIs
  { name: 'Admin Users', url: '/api/admin/users' },
];

async function testAllAPIs() {
  console.log('🔍 ทดสอบ API ทั้งหมดหลังการแก้ไข Column Names...\n');
  
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (const api of API_ENDPOINTS) {
    try {
      const options = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (api.method === 'POST' && api.body) {
        options.method = 'POST';
        options.body = JSON.stringify(api.body);
      }
      
      const response = await fetch(`https://i-projects.skin${api.url}`, options);
      
      const status = response.status;
      const success = response.ok;
      
      if (success) {
        results.success++;
        console.log(`✅ ${api.name}: ${status} - สำเร็จ`);
      } else {
        results.failed++;
        const error = await response.text();
        results.errors.push({ name: api.name, error, status });
        console.log(`❌ ${api.name}: ${status} - ล้มเหลว`);
        
        // Check if it's a column name error
        if (error.includes('does not exist') && error.includes('column')) {
          console.log(`   🔍 Column Error: ${error.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ name: api.name, error: error.message });
      console.log(`❌ ${api.name}: Network Error - ${error.message}`);
    }
  }
  
  // Summary
  console.log('\n📋 สรุปผลการทดสอบ API:');
  console.log('=====================================');
  console.log(`✅ สำเร็จ: ${results.success} APIs`);
  console.log(`❌ ล้มเหลว: ${results.failed} APIs`);
  console.log(`📊 ทั้งหมด: ${API_ENDPOINTS.length} APIs`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ APIs ที่ล้มเหลว:');
    results.errors.forEach(error => {
      console.log(`   - ${error.name}: ${error.status || 'Network'} - ${error.error.substring(0, 100)}...`);
    });
    
    // Check for column name errors specifically
    const columnErrors = results.errors.filter(e => 
      e.error.includes('does not exist') && e.error.includes('column')
    );
    
    if (columnErrors.length > 0) {
      console.log('\n🔍 Column Name Errors ที่ยังค้าง:');
      columnErrors.forEach(error => {
        console.log(`   - ${error.name}`);
      });
      
      console.log('\n💡 แนะนำการแก้ไข:');
      console.log('1. ตรวจสอบไฟล์ API ที่ยังล้มเหลว');
      console.log('2. แก้ไข column names ที่ยังใช้ camelCase');
      console.log('3. Deploy ใหม่');
    }
  } else {
    console.log('\n🎉 ทุก API ทำงานได้สำเร็จ!');
    console.log('✅ Column names ถูกต้องทั้งหมด');
    console.log('✅ Database schema ตรงกัน');
    console.log('✅ ระบบพร้อมใช้งานเต็มที่');
  }
  
  // Test specific problematic APIs if any
  if (results.failed > 0) {
    console.log('\n🔍 ทดสอบ API ที่มีปัญหาเพิ่มเติม:');
    
    // Test some specific APIs that might have issues
    const problematicAPIs = [
      '/api/projects',
      '/api/users',
      '/api/timesheet/entries',
      '/api/expenses',
      '/api/sales/deals'
    ];
    
    for (const api of problematicAPIs) {
      try {
        const response = await fetch(`https://i-projects.skin${api}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log(`\n🔍 ${api}:`);
        console.log(`   Status: ${response.status}`);
        
        if (!response.ok) {
          const error = await response.text();
          console.log(`   Error: ${error.substring(0, 200)}...`);
          
          // Try to identify the specific column issue
          if (error.includes('column')) {
            console.log(`   🔍 Column Issue Detected`);
          }
        } else {
          const data = await response.json();
          console.log(`   ✅ Success - ${Array.isArray(data) ? data.length : 'object'} items`);
        }
      } catch (error) {
        console.log(`   ❌ Network Error: ${error.message}`);
      }
    }
  }
}

testAllAPIs().catch(console.error);
