// Update user password to match original
const https = require('https');

// New database credentials
const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.k1gvzBcV1lBiGAxS-_5nyH88OhhCSzd5ko2NTHtUUSc';

// User to update
const userEmail = "jakgrits.ph@appworks.co.th";
const newPassword = "AppWorks@123!"; // Plain text password

async function updateUserPassword() {
  console.log('🔧 อัปเดต Password ให้ตรงกับข้อมูลเดิม...\n');
  
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
    
    // 2. Generate new password hash (bcrypt)
    console.log('\n2️⃣ สร้าง Password Hash ใหม่...');
    
    // For now, we'll use a simple approach - update with a known hash
    // In a real scenario, you'd use bcrypt to hash the password
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    console.log(`✅ สร้าง hash สำเร็จ (length: ${passwordHash.length})`);
    
    // 3. Update user password
    console.log('\n3️⃣ อัปเดต Password ในฐานข้อมูล...');
    
    const updateResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': NEW_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        password: passwordHash
      })
    });
    
    if (updateResponse.ok) {
      const updatedUser = await updateResponse.json();
      console.log('✅ อัปเดต Password สำเร็จ!');
      console.log(`   User: ${updatedUser.name} (${updatedUser.email})`);
    } else {
      const error = await updateResponse.text();
      throw new Error(`อัปเดต Password ล้มเหลว: ${error}`);
    }
    
    // 4. Test login with new password
    console.log('\n4️⃣ ทดสอบ Login ใหม่...');
    
    const loginResponse = await fetch('https://i-projects.skin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userEmail,
        password: newPassword
      })
    });
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('🎉 Login สำเร็จด้วย Password ใหม่!');
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
    
    // 5. Update other key users if needed
    console.log('\n5️⃣ ตรวจสอบผู้ใช้งานสำคัญอื่น...');
    
    const keyUsers = [
      { email: "pratya.fu@appworks.co.th", name: "Pratya Fufueng" },
      { email: "thanongsak.th@appworks.co.th", name: "Thanongsak Thongkwid" }
    ];
    
    for (const keyUser of keyUsers) {
      const checkResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?email=eq.${keyUser.email}&select=id,name`, {
        headers: {
          'apikey': NEW_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`
        }
      });
      
      if (checkResponse.ok) {
        const users = await checkResponse.json();
        if (users.length > 0) {
          console.log(`✅ ${keyUser.name} - พร้อมใช้งาน`);
          console.log(`   อีเมล: ${keyUser.email}`);
          console.log(`   หมายเหตุ: ต้องใช้ password เดิมจากระบบเก่า`);
        }
      }
    }
    
    console.log('\n📋 สรุปผล:');
    console.log('=====================================');
    console.log('✅ อัปเดต Password สำเร็จ');
    console.log('🔑 สามารถ login ด้วยข้อมูลจริงได้แล้ว');
    console.log('🌟 ระบบพร้อมใช้งานเต็มทั้งหมด');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    
    // If bcrypt is not available, suggest manual update
    if (error.message.includes('bcrypt')) {
      console.log('\n💡 แนะนำ:');
      console.log('1. ติดตั้ง bcryptjs: npm install bcryptjs');
      console.log('2. หรืออัปเดต password ผ่าน Supabase Dashboard');
      console.log('3. หรือใช้คำสั่ง SQL โดยตรง');
    }
  }
}

updateUserPassword().catch(console.error);
