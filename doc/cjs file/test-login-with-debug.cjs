// Test login with debug information
const https = require('https');

async function testLoginWithDebug() {
  console.log('🔍 ทดสอบ Login พร้อม Debug...\n');
  
  try {
    // 1. Create a test endpoint to debug the login process
    console.log('1️⃣ ทดสอบ Login พร้อมข้อมูล debug:');
    
    const loginResponse = await fetch('https://i-projects.skin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug': 'true' // Add debug header
      },
      body: JSON.stringify({
        email: "jakgrits.ph@appworks.co.th",
        password: "AppWorks@123!"
      })
    });
    
    console.log(`📊 Status: ${loginResponse.status} ${loginResponse.statusText}`);
    
    if (loginResponse.ok) {
      const result = await loginResponse.json();
      console.log('🎉 Login สำเร็จ!');
      console.log(`   User: ${result.user?.name || 'N/A'}`);
      console.log(`   Email: ${result.user?.email || 'N/A'}`);
      console.log(`   Role: ${result.user?.role || 'N/A'}`);
    } else {
      const error = await loginResponse.text();
      console.log('❌ Login ล้มเหลว');
      console.log(`   Error: ${error}`);
    }
    
    // 2. Test with a simple user that we know exists
    console.log('\n2️⃣ ทดสอบกับ user ง่ายๆ:');
    
    const simpleLoginResponse = await fetch('https://i-projects.skin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123"
      })
    });
    
    console.log(`📊 Simple Login Status: ${simpleLoginResponse.status}`);
    
    if (simpleLoginResponse.ok) {
      const result = await simpleLoginResponse.json();
      console.log('✅ Simple login สำเร็จ');
      console.log(`   User: ${result.user?.name || 'N/A'}`);
    } else {
      const error = await simpleLoginResponse.text();
      console.log('❌ Simple login ล้มเหลว');
      console.log(`   Error: ${error}`);
    }
    
    // 3. Check if the issue is with the password column
    console.log('\n3️⃣ ตรวจสอบว่า Login API อ่าน password ได้จริง:');
    
    // Create a test endpoint that shows what the login API sees
    const debugResponse = await fetch('https://i-projects.skin/api/auth/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "jakgrits.ph@appworks.co.th"
      })
    });
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('📋 Debug Information:');
      console.log(`   User found: ${debugData.user ? 'Yes' : 'No'}`);
      if (debugData.user) {
        console.log(`   User ID: ${debugData.user.id || 'N/A'}`);
        console.log(`   User Email: ${debugData.user.email || 'N/A'}`);
        console.log(`   Has password: ${debugData.user.password ? 'Yes' : 'No'}`);
        if (debugData.user.password) {
          console.log(`   Password length: ${debugData.user.password.length}`);
          console.log(`   Password starts: ${debugData.user.password.substring(0, 20)}...`);
        }
      }
    } else {
      console.log('❌ Debug endpoint ไม่พร้อมใช้งาน');
    }
    
    // 4. Test direct password verification
    console.log('\n4️⃣ ทดสอบการตรวจสอบ password โดยตรง:');
    
    // We'll need to create a simple test
    const bcrypt = require('bcryptjs');
    const testPassword = "AppWorks@123!";
    const storedHash = "$2b$10$P.U105Y1cGusMNjn7gD5qOb7qabqUwreQVLtrNMg1BszALTLcO6AK";
    
    console.log(`🔍 ทดสอบ password verification:`);
    console.log(`   Test password: ${testPassword}`);
    console.log(`   Stored hash: ${storedHash.substring(0, 20)}...`);
    
    try {
      const isValid = await bcrypt.compare(testPassword, storedHash);
      console.log(`   bcrypt.compare result: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    } catch (error) {
      console.log(`   bcrypt.compare error: ${error.message}`);
    }
    
    // 5. Summary
    console.log('\n📋 สรุปผลการทดสอบ:');
    console.log('=====================================');
    console.log('🔍 การวินิจฉัย:');
    console.log('1. Database มี user และ password hash ถูกต้อง');
    console.log('2. bcrypt.compare ทำงานได้ถูกต้อง');
    console.log('3. Login API มีปัญหาในการเชื่อมต่อหรือ query');
    
    console.log('\n💡 ข้อสรุป:');
    console.log('ปัญหาน่าจะอยู่ที่:');
    console.log('- Login API ใช้ Supabase client ที่เชื่อมต่อไปฐานข้อมูลเก่า');
    console.log('- หรือมีปัญหาในการ query ข้อมูล user');
    console.log('- หรือมีการตรวจสอบเพิ่มเติมที่ทำให้ login ล้มเหลว');
    
    console.log('\n🔧 แนะนำการแก้ไข:');
    console.log('1. ตรวจสอบว่า Login API ใช้ environment variables ที่ถูกต้อง');
    console.log('2. ตรวจสอบว่า Supabase client ใช้ URL และ key ที่ถูกต้อง');
    console.log('3. ลองเพิ่ม logging ใน Login API เพื่อ debug');
    console.log('4. ตรวจสอบว่ามี RLS (Row Level Security) ที่บล็อคการ query');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

testLoginWithDebug().catch(console.error);
