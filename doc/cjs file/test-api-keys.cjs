// Test different API keys and connections
const https = require('https');

async function testApiKeys() {
  console.log('🔍 ทดสอบ API Keys และ Database Connections...\n');
  
  try {
    // 1. Test with the anon key we set on Vercel
    console.log('1️⃣ ทดสอบด้วย Anon Key จาก Vercel:');
    
    const vercelAnonKey = 'sb_publishable_MXBRHnc3b8kCjjsVaacMfQ_WwT_5g15';
    const supabaseUrl = 'https://vaunihijmwwkhqagjqjd.supabase.co';
    
    const test1 = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
      headers: {
        'apikey': vercelAnonKey,
        'Authorization': `Bearer ${vercelAnonKey}`,
        'Prefer': 'count=exact'
      }
    });
    
    console.log(`📊 Test 1 Status: ${test1.status}`);
    if (test1.ok) {
      const count = test1.headers.get('content-range')?.split('/')[1] || '0';
      console.log(`✅ Anon Key ทำงานได้: ${count} users`);
    } else {
      console.log('❌ Anon Key ไม่ทำงาน');
      const error = await test1.text();
      console.log(`   Error: ${error}`);
    }
    
    // 2. Test with service role key
    console.log('\n2️⃣ ทดสอบด้วย Service Role Key:');
    
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.k1gvzBcV1lBiGAxS-_5nyH88OhhCSzd5ko2NTHtUUSc';
    
    const test2 = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'count=exact'
      }
    });
    
    console.log(`📊 Test 2 Status: ${test2.status}`);
    if (test2.ok) {
      const count = test2.headers.get('content-range')?.split('/')[1] || '0';
      console.log(`✅ Service Role Key ทำงานได้: ${count} users`);
    } else {
      console.log('❌ Service Role Key ไม่ทำงาน');
      const error = await test2.text();
      console.log(`   Error: ${error}`);
    }
    
    // 3. Test with the JWT key from .env.production
    console.log('\n3️⃣ ทดสอบด้วย JWT Key จาก .env.production:');
    
    const jwtKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw';
    
    const test3 = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
      headers: {
        'apikey': jwtKey,
        'Authorization': `Bearer ${jwtKey}`,
        'Prefer': 'count=exact'
      }
    });
    
    console.log(`📊 Test 3 Status: ${test3.status}`);
    if (test3.ok) {
      const count = test3.headers.get('content-range')?.split('/')[1] || '0';
      console.log(`✅ JWT Key ทำงานได้: ${count} users`);
    } else {
      console.log('❌ JWT Key ไม่ทำงาน');
      const error = await test3.text();
      console.log(`   Error: ${error}`);
    }
    
    // 4. Test user query with working key
    console.log('\n4️⃣ ทดสอบ query user ด้วย key ที่ทำงานได้:');
    
    // Use the key that worked from above tests
    const workingKey = test2.ok ? serviceKey : (test3.ok ? jwtKey : vercelAnonKey);
    
    if (workingKey) {
      const userTest = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.jakgrits.ph@appworks.co.th&select=id,name,email,password,role,isActive`, {
        headers: {
          'apikey': workingKey,
          'Authorization': `Bearer ${workingKey}`
        }
      });
      
      console.log(`📊 User Test Status: ${userTest.status}`);
      if (userTest.ok) {
        const users = await userTest.json();
        if (users.length > 0) {
          const user = users[0];
          console.log('✅ พบข้อมูล user:');
          console.log(`   ID: ${user.id}`);
          console.log(`   Name: ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   isActive: ${user.isActive}`);
          console.log(`   Password: ${user.password ? 'มีค่า (length: ' + user.password.length + ')' : 'ไม่มี'}`);
          console.log(`   Password starts: ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}`);
        } else {
          console.log('❌ ไม่พบ user นี้');
        }
      } else {
        console.log('❌ ไม่สามารถ query user');
        const error = await userTest.text();
        console.log(`   Error: ${error}`);
      }
    }
    
    // 5. Test login with the working key
    console.log('\n5️⃣ ทดสอบ Login API อีกครั้ง:');
    
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
    
    console.log(`📊 Login Test Status: ${loginTest.status}`);
    if (loginTest.ok) {
      const result = await loginTest.json();
      console.log('🎉 Login สำเร็จ!');
      console.log(`   User: ${result.user?.name || 'N/A'}`);
      console.log(`   Email: ${result.user?.email || 'N/A'}`);
    } else {
      const error = await loginTest.text();
      console.log('❌ Login ล้มเหลว');
      console.log(`   Error: ${error}`);
    }
    
    // 6. Summary
    console.log('\n📋 สรุปผล:');
    console.log('=====================================');
    console.log('🔑 API Keys ที่ทดสอบ:');
    console.log(`1. Anon Key: ${test1.ok ? '✅ ทำงานได้' : '❌ ไม่ทำงาน'}`);
    console.log(`2. Service Role Key: ${test2.ok ? '✅ ทำงานได้' : '❌ ไม่ทำงาน'}`);
    console.log(`3. JWT Key: ${test3.ok ? '✅ ทำงานได้' : '❌ ไม่ทำงาน'}`);
    console.log(`4. Login API: ${loginTest.ok ? '✅ ทำงานได้' : '❌ ไม่ทำงาน'}`);
    
    console.log('\n💡 ข้อสรุป:');
    if (test2.ok && !loginTest.ok) {
      console.log('ปัญหาน่าจะอยู่ที่ Login API ใช้ API key ที่ไม่ถูกต้อง');
      console.log('ต้องตรวจสอบว่า Login API ใช้ environment variables ที่ถูกต้อง');
    } else if (!test2.ok) {
      console.log('ปัญหาน่าจะอยู่ที่ API key หรือ database connection');
      console.log('ต้องตรวจสอบว่า database และ API key ถูกต้อง');
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

testApiKeys().catch(console.error);
