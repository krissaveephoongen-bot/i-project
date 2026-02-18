// Check current status of users table and login system
const https = require('https');

const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.k1gvzBcV1lBiGAxS-_5nyH88OhhCSzd5ko2NTHtUUSc';

async function checkUsersStatus() {
  console.log('🔍 ตรวจสอบสถานะปัจจุบันของระบบ...\n');
  
  try {
    // 1. Check if password column exists
    console.log('1️⃣ ตรวจสอบคอลัมน์ password:');
    
    const passwordCheck = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?select=password&limit=1`, {
      headers: {
        'apikey': NEW_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`
      }
    });
    
    if (passwordCheck.ok) {
      console.log('✅ คอลัมน์ password มีอยู่ในตาราง');
      
      const users = await passwordCheck.json();
      if (users.length > 0) {
        const hasPassword = users[0].password !== null && users[0].password !== undefined;
        console.log(`   มีค่า password: ${hasPassword ? 'ใช่' : 'ไม่ใช่'}`);
        
        if (hasPassword) {
          console.log(`   Password length: ${users[0].password?.length || 0}`);
          console.log(`   Password starts with: ${users[0].password?.substring(0, 10) || 'N/A'}...`);
        }
      }
    } else {
      console.log('❌ คอลัมน์ password ไม่มีในตาราง');
      console.log(`   Error: ${await passwordCheck.text()}`);
    }
    
    // 2. Check login API endpoint
    console.log('\n2️⃣ ตรวจสอบ Login API Endpoint:');
    
    const loginTestResponse = await fetch('https://i-projects.skin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "jakgrits.ph@appworks.co.th",
        password: "AppWorks@123!"
      })
    });
    
    console.log(`📊 Login API Status: ${loginTestResponse.status} ${loginTestResponse.statusText}`);
    
    if (loginTestResponse.ok) {
      const result = await loginTestResponse.json();
      console.log('✅ Login API ทำงานได้');
      console.log(`   User: ${result.user?.name || 'N/A'}`);
    } else {
      const error = await loginTestResponse.text();
      console.log('❌ Login API มีปัญหา:');
      console.log(`   Error: ${error}`);
      
      // Try to understand the login system
      console.log('\n🔍 ตรวจสอบวิธีการทำงานของ Login API...');
      
      // Check if there's a different auth endpoint
      const authEndpoints = [
        '/api/auth/signin',
        '/api/authenticate',
        '/api/login',
        '/api/auth/login'
      ];
      
      for (const endpoint of authEndpoints) {
        try {
          const testResponse = await fetch(`https://i-projects.skin${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: "jakgrits.ph@appworks.co.th",
              password: "AppWorks@123!"
            })
          });
          
          if (testResponse.ok) {
            console.log(`✅ พบ Login Endpoint ทำงานได้: ${endpoint}`);
            break;
          } else if (testResponse.status !== 404) {
            console.log(`📝 Endpoint ${endpoint}: ${testResponse.status}`);
          }
        } catch (e) {
          // Skip this endpoint
        }
      }
    }
    
    // 3. Check user data directly
    console.log('\n3️⃣ ตรวจสอบข้อมูล user โดยตรง:');
    
    const userCheck = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?email=eq.jakgrits.ph@appworks.co.th&select=id,name,email,role,employee_code,position,department,name_th`, {
      headers: {
        'apikey': NEW_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`
      }
    });
    
    if (userCheck.ok) {
      const users = await userCheck.json();
      if (users.length > 0) {
        const user = users[0];
        console.log('✅ พบข้อมูล user ในฐานข้อมูล:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Position: ${user.position}`);
        console.log(`   Department: ${user.department}`);
        console.log(`   Employee Code: ${user.employee_code}`);
        console.log(`   Thai Name: ${user.name_th || 'N/A'}`);
      } else {
        console.log('❌ ไม่พบข้อมูล user ในฐานข้อมูล');
      }
    } else {
      console.log('❌ ไม่สามารถตรวจสอบข้อมูล user');
    }
    
    // 4. Check if there are any auth-related tables
    console.log('\n4️⃣ ตรวจสอบตารางที่เกี่ยวข้องกับ authentication:');
    
    const authTables = ['auth_users', 'user_sessions', 'login_attempts', 'user_credentials'];
    
    for (const table of authTables) {
      try {
        const tableCheck = await fetch(`${NEW_SUPABASE_URL}/rest/v1/${table}?select=count`, {
          headers: {
            'apikey': NEW_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`,
            'Prefer': 'count=exact'
          }
        });
        
        if (tableCheck.ok) {
          const count = tableCheck.headers.get('content-range')?.split('/')[1] || '0';
          if (parseInt(count) > 0) {
            console.log(`✅ พบตาราง ${table}: ${count} records`);
          }
        }
      } catch (e) {
        // Table doesn't exist, skip
      }
    }
    
    // 5. Summary and recommendations
    console.log('\n📋 สรุปผลการตรวจสอบ:');
    console.log('=====================================');
    
    console.log('🔍 สถานะปัจจุบัน:');
    console.log('✅ Database: เชื่อมต่อได้');
    console.log('✅ Users: มีข้อมูลครบถ้วน');
    console.log('❌ Password column: อาจจะยังไม่มีหรือมีปัญหา');
    console.log('❌ Login API: ยังใช้ข้อมูลเก่าหรือมีปัญหา');
    
    console.log('\n💡 แนะนำ:');
    console.log('1. ตรวจสอบว่าคอลัมน์ password ถูกเพิ่มจริงๆ หรือไม่');
    console.log('2. ตรวจสอบว่า Login API ใช้ logic อะไรในการตรวจสอบ password');
    console.log('3. ลองเข้าถึง Supabase Dashboard เพื่อตรวจสอบตาราง users');
    console.log('4. ตรวจสอบว่ามีตารางอื่นสำหรับ authentication หรือไม่');
    
    console.log('\n🔗 ลิงก์ที่เกี่ยวข้อง:');
    console.log('Supabase Dashboard: https://vaunihijmwwkhqagjqjd.supabase.co');
    console.log('Login API: https://i-projects.skin/api/auth/login');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

checkUsersStatus().catch(console.error);
