// Check the real schema of users table
const https = require('https');

async function checkRealSchema() {
  console.log('🔍 ตรวจสอบ Schema จริงของ Users Table...\n');
  
  try {
    // 1. Get sample user to see all columns
    console.log('1️⃣ ตรวจสอบคอลัมน์ทั้งหมดที่มีอยู่:');
    
    const supabaseUrl = 'https://vaunihijmwwkhqagjqjd.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.k1gvzBcV1lBiGAxS-_5nyH88OhhCSzd5ko2NTHtUUSc';
    
    const sampleResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=*&limit=1`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (sampleResponse.ok) {
      const users = await sampleResponse.json();
      if (users.length > 0) {
        const user = users[0];
        const columns = Object.keys(user);
        
        console.log('📋 คอลัมน์ที่มีอยู่จริง:');
        columns.forEach(col => {
          const value = user[col];
          const displayValue = value === null ? 'NULL' : 
                            value === true ? 'true' : 
                            value === false ? 'false' : 
                            typeof value === 'object' ? '[Object]' : 
                            String(value).substring(0, 50) + (String(value).length > 50 ? '...' : '');
          console.log(`   - ${col}: ${displayValue}`);
        });
        
        console.log('\n📊 สรุปคอลัมน์ที่มี:');
        console.log(`✅ มีทั้งหมด: ${columns.length} คอลัมน์`);
        
        // Check for missing columns
        const expectedColumns = [
          'id', 'name', 'email', 'password', 'role', 'is_active', 'is_deleted',
          'failed_login_attempts', 'last_login', 'locked_until', 'created_at', 'updated_at',
          'hourly_rate', 'timezone', 'department', 'position', 'avatar', 'phone', 'name_th'
        ];
        
        const missingColumns = expectedColumns.filter(col => !columns.includes(col));
        const extraColumns = columns.filter(col => !expectedColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log(`❌ คอลัมน์ที่หายไป: ${missingColumns.join(', ')}`);
        }
        
        if (extraColumns.length > 0) {
          console.log(`ℹ️ คอลัมน์ที่เพิ่มเติม: ${extraColumns.join(', ')}`);
        }
        
        // 2. Test query with only existing columns
        console.log('\n2️⃣ ทดสอบ Query ด้วยคอลัมน์ที่มีอยู่จริง:');
        
        const existingColumns = columns.join(',');
        const testQuery = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.jakgrits.ph@appworks.co.th&select=${existingColumns}`, {
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`
          }
        });
        
        console.log(`📊 Query Status: ${testQuery.status}`);
        
        if (testQuery.ok) {
          const testUsers = await testQuery.json();
          if (testUsers.length > 0) {
            console.log('✅ Query ด้วยคอลัมน์ที่มีอยู่สำเร็จ');
            console.log(`   พบ user: ${testUsers[0].name} (${testUsers[0].email})`);
            console.log(`   Password: ${testUsers[0].password ? 'มีค่า' : 'ไม่มี'}`);
          }
        } else {
          console.log('❌ Query ด้วยคอลัมน์ที่มีอยู่ล้มเหลว');
          const error = await testQuery.text();
          console.log(`   Error: ${error}`);
        }
        
        // 3. Create fixed query for Login API
        console.log('\n3️⃣ สร้าง Query ที่ถูกต้องสำหรับ Login API:');
        
        const loginColumns = columns.filter(col => 
          !['password_hash', 'hashed_password', 'user_password'].includes(col)
        ).join(',');
        
        console.log(`📋 คอลัมน์สำหรับ Login API: ${loginColumns}`);
        
        // 4. Summary
        console.log('\n📋 สรุปผลการตรวจสอบ Schema:');
        console.log('=====================================');
        console.log('🔍 สิ่งที่พบ:');
        console.log(`1. คอลัมน์ทั้งหมด: ${columns.length} คอลัมน์`);
        console.log(`2. คอลัมน์ที่หายไป: ${missingColumns.length} คอลัมน์`);
        console.log(`3. คอลัมน์ที่เพิ่มเติม: ${extraColumns.length} คอลัมน์`);
        
        if (missingColumns.length > 0) {
          console.log('\n❌ ปัญหาที่ต้องแก้ไข:');
          console.log('1. Login API ใช้คอลัมน์ที่ไม่มีใน database');
          console.log('2. ต้องแก้ไข Login API ให้ใช้เฉพาะคอลัมน์ที่มีอยู่');
          console.log('3. หรือต้องเพิ่มคอลัมน์ที่หายไปใน database');
          
          console.log('\n🔧 วิธีแก้ไข:');
          console.log('1. แก้ไข Login API ให้ใช้คอลัมน์ที่มีอยู่จริง');
          console.log('2. หรือเพิ่มคอลัมน์ที่หายไปใน database');
          console.log('3. ทดสอบ login ใหม่');
        } else {
          console.log('\n✅ Schema ถูกต้องทั้งหมด');
          console.log('ปัญหาน่าจะอยู่ที่อย่างอื่น');
        }
        
      } else {
        console.log('❌ ไม่พบข้อมูลในตาราง users');
      }
    } else {
      console.log('❌ ไม่สามารถดึงข้อมูลจากตาราง users');
      const error = await sampleResponse.text();
      console.log(`   Error: ${error}`);
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

checkRealSchema().catch(console.error);
