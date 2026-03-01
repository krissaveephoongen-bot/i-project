// Update user password with specific hash
const https = require('https');

// New database credentials
const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.k1gvzBcV1lBiGAxS-_5nyH88OhhCSzd5ko2NTHtUUSc';

// User to update
const userEmail = "jakgrits.ph@appworks.co.th";
const passwordHash = "$2b$10$P.U105Y1cGusMNjn7gD5qOb7qabqUwreQVLtrNMg1BszALTLcO6AK";

async function updatePasswordHash() {
  console.log('🔧 อัปเดต Password ด้วย Hash ที่กำหนด...\n');
  
  try {
    // 1. Find the user
    console.log('1️⃣ ค้นหาผู้ใช้งาน...');
    
    const findResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?email=eq.${userEmail}&select=id,name,email`, {
      headers: {
        'apikey': NEW_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`
      }
    });
    
    if (!findResponse.ok) {
      throw new Error(`ไม่พบผู้ใช้งาน: ${findResponse.status}`);
    }
    
    const users = await findResponse.json();
    if (users.length === 0) {
      throw new Error('ไม่พบผู้ใช้งานในระบบ');
    }
    
    const user = users[0];
    console.log(`✅ พบผู้ใช้งาน: ${user.name} (${user.email})`);
    
    // 2. Add password column if it doesn't exist (try anyway)
    console.log('\n2️⃣ พยายามเพิ่มคอลัมน์ password...');
    
    // First, let's try to add the password column via direct SQL
    // Since we can't run raw SQL via REST API, we'll try a workaround
    
    // 3. Update user with password hash using RPC or direct approach
    console.log('\n3️⃣ อัปเดต Password Hash...');
    
    // Try to update using the service role with a direct approach
    const updateResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': NEW_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        // Try different column names that might exist
        password: passwordHash,
        user_password: passwordHash,
        pass_hash: passwordHash,
        hashed_password: passwordHash
      })
    });
    
    if (updateResponse.ok) {
      const updatedUser = await updateResponse.json();
      console.log('✅ อัปเดต Password สำเร็จ!');
      console.log(`   User: ${updatedUser.name} (${updatedUser.email})`);
    } else {
      const error = await updateResponse.text();
      console.log('❌ อัปเดต Password ล้มเหลว:');
      console.log(`   Error: ${error}`);
      
      // Try alternative approach - create a new user with password
      console.log('\n🔄 ลองวิธีอื่น...');
      
      // Check if we can create a new table or use a different approach
      const createResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/rpc/add_user_password`, {
        method: 'POST',
        headers: {
          'apikey': NEW_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          password_hash: passwordHash
        })
      });
      
      if (createResponse.ok) {
        console.log('✅ สร้าง password record สำเร็จ!');
      } else {
        console.log('❌ ไม่สามารถสร้าง password record');
        console.log('ต้องใช้ Supabase Dashboard ในการเพิ่มคอลัมน์ password');
      }
    }
    
    // 4. Test login
    console.log('\n4️⃣ ทดสอบ Login ใหม่...');
    
    const loginResponse = await fetch('https://i-projects.skin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userEmail,
        password: "AppWorks@123!" // The original password
      })
    });
    
    console.log(`📊 Login Status: ${loginResponse.status} ${loginResponse.statusText}`);
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('🎉 Login สำเร็จ!');
      console.log('📋 ข้อมูลผู้ใช้งาน:');
      console.log(`   ชื่อ: ${loginResult.user?.name || 'N/A'}`);
      console.log(`   อีเมล: ${loginResult.user?.email || 'N/A'}`);
      console.log(`   ตำแหน่ง: ${loginResult.user?.position || 'N/A'}`);
      console.log(`   แผนก: ${loginResult.user?.department || 'N/A'}`);
      console.log(`   รหัสพนักงาน: ${loginResult.user?.employee_code || 'N/A'}`);
      console.log(`   ชื่อไทย: ${loginResult.user?.name_th || 'N/A'}`);
      console.log(`   Token: ${loginResult.token ? 'Received ✓' : 'Not received ✗'}`);
      
      // Test dashboard access
      if (loginResult.token) {
        console.log('\n🧪 ทดสอบ Dashboard API...');
        
        const dashboardResponse = await fetch('https://i-projects.skin/api/dashboard/portfolio', {
          headers: {
            'Authorization': `Bearer ${loginResult.token}`,
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
      const loginError = await loginResponse.text();
      console.log('❌ Login ยังล้มเหลว:');
      console.log(`   Error: ${loginError}`);
    }
    
    // 5. Summary and next steps
    console.log('\n📋 สรุปผล:');
    console.log('=====================================');
    console.log('🔧 การอัปเดต password:');
    
    if (updateResponse.ok) {
      console.log('✅ อัปเดตสำเร็จผ่าน API');
    } else {
      console.log('❌ ไม่สามารถอัปเดตผ่าน API');
      console.log('💡 ต้องทำดังนี้:');
      console.log('1. เปิด Supabase Dashboard: https://vaunihijmwwkhqagjqjd.supabase.co');
      console.log('2. ไปที่ SQL Editor');
      console.log('3. รันคำสั่ง: ALTER TABLE users ADD COLUMN password TEXT;');
      console.log('4. รันคำสั่งอัปเดต password ด้วย hash ที่ถูกต้อง');
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

updatePasswordHash().catch(console.error);
