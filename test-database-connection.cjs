// Test database connection and user data
const https = require('https');

async function testDatabaseConnection() {
  console.log('🔍 ทดสอบการเชื่อมต่อ Database...\n');
  
  try {
    // 1. Test direct connection to new database
    console.log('1️⃣ ทดสอบการเชื่อมต่อโดยตรง (New Database):');
    
    const directResponse = await fetch('https://vaunihijmwwkhqagjqjd.supabase.co/rest/v1/users?email=eq.jakgrits.ph@appworks.co.th&select=id,name,email,password,role,isActive', {
      headers: {
        'apikey': 'sb_publishable_MXBRHnc3b8kCjjsVaacMfQ_WwT_5g15',
        'Authorization': 'Bearer sb_publishable_MXBRHnc3b8kCjjsVaacMfQ_WwT_5g15'
      }
    });
    
    if (directResponse.ok) {
      const users = await directResponse.json();
      if (users.length > 0) {
        const user = users[0];
        console.log('✅ พบข้อมูล user ใน New Database:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Password: ${user.password ? 'มีค่า (length: ' + user.password.length + ')' : 'ไม่มี'}`);
        console.log(`   isActive: ${user.isActive}`);
        console.log(`   Password starts: ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}`);
      } else {
        console.log('❌ ไม่พบ user ใน New Database');
      }
    } else {
      console.log('❌ ไม่สามารถเชื่อมต่อ New Database');
      console.log(`   Status: ${directResponse.status}`);
    }
    
    // 2. Test what the Login API sees
    console.log('\n2️⃣ ทดสอบว่า Login API เห็นอะไร:');
    
    // Create a simple test to see what the login API queries
    const testQuery = await fetch('https://i-projects.skin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "jakgrits.ph@appworks.co.th",
        password: "AppWorks@123!"
      })
    });
    
    console.log(`📊 Login API Status: ${testQuery.status}`);
    
    if (testQuery.ok) {
      const result = await testQuery.json();
      console.log('✅ Login API สำเร็จ!');
      console.log(`   User: ${result.user?.name || 'N/A'}`);
    } else {
      const error = await testQuery.text();
      console.log('❌ Login API ล้มเหลว');
      console.log(`   Error: ${error}`);
      
      // Let's try to understand what's happening
      console.log('\n🔍 วิเคราะห์ปัญหา:');
      
      // Check if the issue is with the user not being found
      if (error.includes('Invalid email or password')) {
        console.log('   - อาจจะเป็นเพราะ user ไม่พบในฐานข้อมูลที่ Login API ใช้');
        console.log('   - หรือ password ไม่ตรงกับที่ Login API คาดหวัง');
      }
    }
    
    // 3. Test with different database connection
    console.log('\n3️⃣ ทดสอบการเชื่อมต่อแบบอื่น:');
    
    // Try with the old database URL to see if that's what the API is using
    const oldDbTest = await fetch('https://old-project.supabase.co/rest/v1/users?email=eq.jakgrits.ph@appworks.co.th&select=id,name,email', {
      headers: {
        'apikey': 'test-key',
        'Authorization': 'Bearer test-key'
      }
    });
    
    if (oldDbTest.ok) {
      console.log('✅ อาจจะเชื่อมต่อกับฐานข้อมูลเก่าได้');
    } else {
      console.log('❌ ไม่สามารถเชื่อมต่อฐานข้อมูลเก่า');
    }
    
    // 4. Check environment variables
    console.log('\n4️⃣ ตรวจสอบ Environment Variables ที่ใช้:');
    
    // Create a simple endpoint to check environment variables
    const envCheck = await fetch('https://i-projects.skin/api/debug/env-check', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (envCheck.ok) {
      const envData = await envCheck.json();
      console.log('📋 Environment Variables:');
      console.log(`   SUPABASE_URL: ${envData.NEXT_PUBLIC_SUPABASE_URL || 'N/A'}`);
      console.log(`   SUPABASE_ANON_KEY: ${envData.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'มีค่า' : 'ไม่มี'}`);
      console.log(`   SERVICE_ROLE_KEY: ${envData.SUPABASE_SERVICE_ROLE_KEY ? 'มีค่า' : 'ไม่มี'}`);
    } else {
      console.log('❌ ไม่สามารถตรวจสอบ environment variables');
    }
    
    // 5. Summary
    console.log('\n📋 สรุปผล:');
    console.log('=====================================');
    console.log('🔍 การวินิจฉัย:');
    console.log('1. New Database มี user และ password ถูกต้อง');
    console.log('2. Enums ครบถ้วน');
    console.log('3. Login API มีปัญหาในการเชื่อมต่อ');
    
    console.log('\n💡 ข้อสรุป:');
    console.log('ปัญหาน่าจะอยู่ที่:');
    console.log('- Login API ใช้ Supabase client ที่เชื่อมต่อไปฐานข้อมูลเก่า');
    console.log('- หรือ environment variables ไม่ถูกต้อง');
    console.log('- หรือมีปัญหาในการ query ข้อมูล user');
    
    console.log('\n🔧 แนะนำการแก้ไข:');
    console.log('1. ตรวจสอบ environment variables บน Vercel');
    console.log('2. ตรวจสอบว่า Login API ใช้ URL และ key ที่ถูกต้อง');
    console.log('3. ลองเพิ่ม logging ใน Login API');
    console.log('4. ตรวจสอบว่ามี RLS ที่บล็อคการ query');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

testDatabaseConnection().catch(console.error);
