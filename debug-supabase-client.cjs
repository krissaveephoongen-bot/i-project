// Debug Supabase client configuration
const https = require('https');

async function debugSupabaseClient() {
  console.log('🔍 Debug Supabase Client Configuration...\n');
  
  try {
    // 1. Test direct database connection
    console.log('1️⃣ ทดสอบการเชื่อมต่อฐานข้อมูลโดยตรง:');
    
    const directResponse = await fetch('https://vaunihijmwwkhqagjqjd.supabase.co/rest/v1/users?email=eq.jakgrits.ph@appworks.co.th&select=id,name,email,password', {
      headers: {
        'apikey': 'sb_publishable_MXBRHnc3b8kCjjsVaacMfQ_WwT_5g15',
        'Authorization': 'Bearer sb_publishable_MXBRHnc3b8kCjjsVaacMfQ_WwT_5g15'
      }
    });
    
    if (directResponse.ok) {
      const users = await directResponse.json();
      if (users.length > 0) {
        const user = users[0];
        console.log('✅ พบข้อมูล user ในฐานข้อมูล:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${user.password ? 'มีค่า (length: ' + user.password.length + ')' : 'ไม่มี'}`);
        console.log(`   Password starts with: ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}`);
      }
    } else {
      console.log('❌ ไม่พบข้อมูล user ในฐานข้อมูล');
    }
    
    // 2. Test via API endpoint
    console.log('\n2️⃣ ทดสอบผ่าน Login API:');
    
    const loginResponse = await fetch('https://i-projects.skin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "jakgrits.ph@appworks.co.th",
        password: "AppWorks@123!"
      })
    });
    
    console.log(`📊 Login API Status: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const result = await loginResponse.json();
      console.log('✅ Login API สำเร็จ');
      console.log(`   User: ${result.user?.name || 'N/A'}`);
    } else {
      const error = await loginResponse.text();
      console.log('❌ Login API ล้มเหลว');
      console.log(`   Error: ${error}`);
    }
    
    // 3. Check environment variables
    console.log('\n3️⃣ ตรวจสอบ Environment Variables:');
    
    const envCheckResponse = await fetch('https://i-projects.skin/api/debug/env', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (envCheckResponse.ok) {
      const envData = await envCheckResponse.json();
      console.log('📋 Environment Variables:');
      Object.entries(envData).forEach(([key, value]) => {
        if (key.includes('SUPABASE') || key.includes('DATABASE')) {
          console.log(`   ${key}: ${value?.substring(0, 50) || 'N/A'}${value?.length > 50 ? '...' : ''}`);
        }
      });
    } else {
      console.log('❌ ไม่สามารถตรวจสอบ environment variables');
    }
    
    // 4. Test with different password
    console.log('\n4️⃣ ทดสอบด้วย password อื่น:');
    
    const testPasswords = [
      'AppWorks@123!',
      'password123',
      'admin123',
      'test123'
    ];
    
    for (const testPwd of testPasswords) {
      const testResponse = await fetch('https://i-projects.skin/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: "jakgrits.ph@appworks.co.th",
          password: testPwd
        })
      });
      
      if (testResponse.ok) {
        console.log(`✅ Password "${testPwd}" ทำงาน!`);
        break;
      } else {
        const error = await testResponse.text();
        if (!error.includes('rate limit')) {
          console.log(`❌ Password "${testPwd}" ไม่ทำงาน`);
        }
      }
    }
    
    // 5. Summary
    console.log('\n📋 สรุปผล:');
    console.log('=====================================');
    console.log('🔍 การวินิจฉัย:');
    console.log('1. Database มี user และ password hash');
    console.log('2. Login API ใช้ Supabase client');
    console.log('3. อาจจะมีปัญหาในการเปรียบเทียบ password');
    
    console.log('\n💡 ข้อแนะนำ:');
    console.log('1. ตรวจสอบว่า Login API ใช้ bcrypt.compare ถูกต้อง');
    console.log('2. ตรวจสอบว่า password hash ใน database ถูกต้อง');
    console.log('3. ลองเพิ่มคอลัมน์ password ในตาราง users');
    console.log('4. ตรวจสอบว่ามีการเข้ารหัส rate limiting');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

debugSupabaseClient().catch(console.error);
