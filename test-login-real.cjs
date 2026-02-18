// Test login with real user credentials
const https = require('https');

async function testLogin() {
  console.log('🔑 ทดสอบ Login ด้วยข้อมูลจริง...\n');
  
  const loginData = {
    email: "jakgrits.ph@appworks.co.th",
    password: "AppWorks@123!"
  };
  
  console.log('📋 ข้อมูล Login:');
  console.log(`   Email: ${loginData.email}`);
  console.log(`   Password: ${loginData.password}`);
  
  try {
    console.log('\n🔄 กำลังทดสอบ Login...');
    
    const response = await fetch('https://i-projects.skin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ Login สำเร็จ!');
      console.log('📋 ผลลัพธ์:');
      console.log(`   User: ${result.user?.name || 'N/A'}`);
      console.log(`   Email: ${result.user?.email || 'N/A'}`);
      console.log(`   Role: ${result.user?.role || 'N/A'}`);
      console.log(`   Token: ${result.token ? 'Received' : 'Not received'}`);
      
      if (result.user) {
        console.log('\n👤 ข้อมูลผู้ใช้งาน:');
        console.log(`   ชื่อ: ${result.user.name}`);
        console.log(`   อีเมล: ${result.user.email}`);
        console.log(`   ตำแหน่ง: ${result.user.position || 'N/A'}`);
        console.log(`   แผนก: ${result.user.department || 'N/A'}`);
        console.log(`   รหัสพนักงาน: ${result.user.employee_code || 'N/A'}`);
        console.log(`   ชื่อไทย: ${result.user.name_th || 'N/A'}`);
        console.log(`   เขต้าล่าสุดท้าย: ${result.user.last_login || 'N/A'}`);
      }
      
      // Test dashboard access with token
      if (result.token) {
        console.log('\n🧪 ทดสอบการเข้าถึง Dashboard...');
        
        const dashboardResponse = await fetch('https://i-projects.skin/api/dashboard/portfolio', {
          headers: {
            'Authorization': `Bearer ${result.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          console.log(`✅ Dashboard API: พบ ${dashboardData.rows?.length || 0} projects`);
        } else {
          console.log(`❌ Dashboard API: ${dashboardResponse.status}`);
        }
      }
      
    } else {
      const error = await response.text();
      console.log('\n❌ Login ล้มเหลว!');
      console.log('📄 ข้อความผิดพลาด:');
      console.log(`   ${error}`);
      
      // Try to parse error details
      try {
        const errorObj = JSON.parse(error);
        if (errorObj.error) {
          console.log(`   Error Type: ${errorObj.error}`);
        }
        if (errorObj.message) {
          console.log(`   Message: ${errorObj.message}`);
        }
      } catch (e) {
        // Error is not JSON, display as is
      }
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error.message);
  }
}

testLogin().catch(console.error);
