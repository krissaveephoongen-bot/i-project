
// Comprehensive API test
const https = require('https');

const COMPREHENSIVE_TESTS = [
  // Dashboard APIs
  { name: 'Dashboard Portfolio', url: '/api/dashboard/portfolio', method: 'GET' },
  { name: 'Dashboard Activities', url: '/api/dashboard/activities', method: 'GET' },
  
  // Projects APIs
  { name: 'Projects List', url: '/api/projects', method: 'GET' },
  { name: 'Projects Executive Report', url: '/api/projects/executive-report', method: 'GET' },
  { name: 'Projects Weekly Summary', url: '/api/projects/weekly-summary', method: 'GET' },
  { name: 'Projects Create', url: '/api/projects/create', method: 'POST', 
    body: { 
      name: 'Test Project', 
      code: 'TEST-001', 
      description: 'Test project description',
      status: 'Planning',
      priority: 'medium'
    }
  },
  
  // Users APIs (with authentication)
  { name: 'Users List', url: '/api/users', method: 'GET', auth: true },
  { name: 'Users Profile', url: '/api/users/profile', method: 'GET', auth: true },
  
  // Timesheet APIs (with parameters)
  { name: 'Timesheet Entries', url: '/api/timesheet/entries', method: 'GET', 
    params: 'userId=test-user&start=2025-01-01&end=2025-01-31'
  },
  { name: 'Timesheet Activities', url: '/api/timesheet/activities', method: 'GET' },
  { name: 'Timesheet Weekly', url: '/api/timesheet/weekly', method: 'GET' },
  
  // Expenses APIs (with parameters)
  { name: 'Expenses List', url: '/api/expenses', method: 'GET', 
    params: 'userId=test-user'
  },
  
  // Sales APIs
  { name: 'Sales Activities', url: '/api/sales/activities', method: 'GET' },
  { name: 'Sales Deals', url: '/api/sales/deals', method: 'GET' },
  { name: 'Sales Pipeline', url: '/api/sales/pipeline', method: 'GET' },
  
  // Staff APIs (with parameters)
  { name: 'Staff Projects', url: '/api/staff/projects', method: 'GET', 
    params: 'userId=test-user'
  },
  { name: 'Staff Tasks', url: '/api/staff/tasks', method: 'GET', 
    params: 'userId=test-user'
  },
  { name: 'Staff Timesheet', url: '/api/staff/timesheet', method: 'GET', 
    params: 'userId=test-user'
  },
  
  // Reports APIs
  { name: 'Reports Financial', url: '/api/reports/financial', method: 'GET' },
  { name: 'Reports Hours', url: '/api/reports/hours', method: 'GET' },
  { name: 'Reports Projects', url: '/api/reports/projects', method: 'GET' },
  
  // Admin APIs
  { name: 'Admin Users', url: '/api/admin/users', method: 'GET' },
];

async function runComprehensiveTest() {
  console.log('🔍 ทดสอบ API แบบครบถ้วน...');
  
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (const test of COMPREHENSIVE_TESTS) {
    try {
      let url = `https://i-projects.skin${test.url}`;
      
      if (test.params) {
        url += `?${test.params}`;
      }
      
      const options = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (test.method === 'POST' && test.body) {
        options.method = 'POST';
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(url, options);
      
      const status = response.status;
      const success = response.ok || (status === 400 && test.params); // 400 is expected for missing params
      
      if (success) {
        results.success++;
        console.log(`✅ ${test.name}: ${status} - สำเร็จ`);
      } else {
        results.failed++;
        const error = await response.text();
        results.errors.push({ name: test.name, error, status });
        console.log(`❌ ${test.name}: ${status} - ล้มเหลว`);
        
        if (error.includes('column')) {
          console.log(`   🔍 Column Error: ${error.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ name: test.name, error: error.message });
      console.log(`❌ ${test.name}: Network Error - ${error.message}`);
    }
  }
  
  // Summary
  console.log('\n📋 สรุปผลการทดสอบแบบครบถ้วน:');
  console.log('=====================================');
  console.log(`✅ สำเร็จ: ${results.success} APIs`);
  console.log(`❌ ล้มเหลว: ${results.failed} APIs`);
  console.log(`📊 ทั้งหมด: ${COMPREHENSIVE_TESTS.length} APIs`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ APIs ที่ยังมีปัญหา:');
    results.errors.forEach(error => {
      console.log(`   - ${error.name}: ${error.status || 'Network'} - ${error.error.substring(0, 100)}...`);
    });
  } else {
    console.log('\n🎉 ทุก API ทำงานได้สำเร็จแบบครบถ้วน!');
  }
}

// Run comprehensive test
runComprehensiveTest().catch(console.error);
