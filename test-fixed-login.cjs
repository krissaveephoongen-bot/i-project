// Test login after fixing column names
const https = require('https');

async function testFixedLogin() {
  console.log('🔍 ทดสอบ Login หลังแก้ไข Column Names...\n');
  
  try {
    // 1. Test direct query with correct column names
    console.log('1️⃣ ทดสอบ Direct Query ด้วย Column Names ที่ถูกต้อง:');
    
    const supabaseUrl = 'https://vaunihijmwwkhqagjqjd.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.k1gvzBcV1lBiGAxS-_5nyH88OhhCSzd5ko2NTHtUUSc';
    
    const directQuery = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.jakgrits.ph@appworks.co.th&select=id,name,email,password,is_active,is_deleted,failed_login_attempts,last_login,locked_until,created_at,updated_at,hourly_rate,timezone`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    console.log(`📊 Direct Query Status: ${directQuery.status}`);
    
    if (directQuery.ok) {
      const users = await directQuery.json();
      if (users.length > 0) {
        const user = users[0];
        console.log('✅ พบข้อมูล user ด้วย column names ที่ถูกต้อง:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   is_active: ${user.is_active}`);
        console.log(`   is_deleted: ${user.is_deleted}`);
        console.log(`   failed_login_attempts: ${user.failed_login_attempts}`);
        console.log(`   Password: ${user.password ? 'มีค่า (length: ' + user.password.length + ')' : 'ไม่มี'}`);
        console.log(`   Password starts: ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}`);
        
        // Test password verification
        const bcrypt = require('bcryptjs');
        const testPassword = "AppWorks@123!";
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`   Password verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        
      } else {
        console.log('❌ ไม่พบ user');
      }
    } else {
      console.log('❌ Direct query ล้มเหลว');
      const error = await directQuery.text();
      console.log(`   Error: ${error}`);
    }
    
    // 2. Test login API
    console.log('\n2️⃣ ทดสอบ Login API หลังแก้ไข:');
    
    const loginTest = await fetch('https://i-projects.skin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "jakgrits.ph@appworks.co.th",
        password: "AppWorks@123!"
      })
    });
    
    console.log(`📊 Login API Status: ${loginTest.status}`);
    
    if (loginTest.ok) {
      const result = await loginTest.json();
      console.log('🎉 Login API สำเร็จ!');
      console.log('📋 ข้อมูลผู้ใช้งาน:');
      console.log(`   ID: ${result.user?.id || 'N/A'}`);
      console.log(`   Name: ${result.user?.name || 'N/A'}`);
      console.log(`   Email: ${result.user?.email || 'N/A'}`);
      console.log(`   Role: ${result.user?.role || 'N/A'}`);
      console.log(`   Position: ${result.user?.position || 'N/A'}`);
      console.log(`   Department: ${result.user?.department || 'N/A'}`);
      console.log(`   Thai Name: ${result.user?.name_th || 'N/A'}`);
      console.log(`   Token: ${result.token ? 'Received ✓' : 'Not received ✗'}`);
      
      // Test dashboard access
      if (result.token) {
        console.log('\n🧪 ทดสอบ Dashboard API:');
        
        const dashboardTest = await fetch('https://i-projects.skin/api/dashboard/portfolio', {
          headers: {
            'Authorization': `Bearer ${result.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (dashboardTest.ok) {
          const dashboardData = await dashboardTest.json();
          console.log(`✅ Dashboard API: พบ ${dashboardData.rows?.length || 0} projects`);
        } else {
          console.log(`❌ Dashboard API: ${dashboardTest.status}`);
        }
      }
      
    } else {
      const error = await loginTest.text();
      console.log('❌ Login API ยังล้มเหลว');
      console.log(`   Error: ${error}`);
      
      // Try to understand the issue
      console.log('\n🔍 วิเคราะห์ปัญหา:');
      
      if (error.includes('Invalid email or password')) {
        console.log('   - อาจจะเป็นเพราะ:');
        console.log('     1. User ไม่พบในฐานข้อมูลที่ Login API ใช้');
        console.log('     2. Password ไม่ตรงกับที่ Login API คาดหวัง');
        console.log('     3. Login API ยังใช้ environment variables ที่ผิด');
        console.log('     4. มีการตรวจสอบเพิ่มเติมที่ทำให้ล้มเหลว');
      }
    }
    
    // 3. Test with different user
    console.log('\n3️⃣ ทดสอบกับ user อื่น:');
    
    const otherUserTest = await fetch('https://i-projects.skin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123"
      })
    });
    
    console.log(`📊 Other User Login Status: ${otherUserTest.status}`);
    
    if (otherUserTest.ok) {
      console.log('✅ User อื่น login ได้');
    } else {
      console.log('❌ User อื่น login ไม่ได้');
    }
    
    // 4. Summary
    console.log('\n📋 สรุปผล:');
    console.log('=====================================');
    console.log('🔍 การวินิจฉัย:');
    console.log('1. Direct query ด้วย column names ที่ถูกต้อง: ' + (directQuery.ok ? '✅ สำเร็จ' : '❌ ล้มเหลว'));
    console.log('2. Login API: ' + (loginTest.ok ? '✅ สำเร็จ' : '❌ ล้มเหลว'));
    console.log('3. Other user login: ' + (otherUserTest.ok ? '✅ สำเร็จ' : '❌ ล้มเหลว'));
    
    console.log('\n💡 ข้อสรุป:');
    if (directQuery.ok && !loginTest.ok) {
      console.log('ปัญหาน่าจะอยู่ที่ Login API ยังใช้ environment variables ที่ผิด');
      console.log('หรือมีการตรวจสอบเพิ่มเติมที่ทำให้ login ล้มเหลว');
    } else if (!directQuery.ok) {
      console.log('ปัญหาน่าจะอยู่ที่ database connection หรือ column names');
    }
    
    console.log('\n🔧 แนะนำการแก้ไข:');
    console.log('1. ตรวจสอบว่า Login API ใช้ environment variables ที่ถูกต้อง');
    console.log('2. ตรวจสอบว่ามีการตรวจสอบเพิ่มเติมใน Login API');
    console.log('3. ลองเพิ่ม logging ใน Login API เพื่อ debug');
    console.log('4. ตรวจสอบว่ามี RLS ที่บล็อคการ query');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

testFixedLogin().catch(console.error);
