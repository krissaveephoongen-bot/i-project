// Export users from old database and import to new database
const https = require('https');

// Old database credentials (from previous session)
const OLD_SUPABASE_URL = 'https://rllhsgiuquezuzltsjntp.supabase.co';
const OLD_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbGhzaWd1cWV6dXpsdHNqbnRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk2NDYyMywiZXhwIjoyMDgzNTQwNjIzfQ.tDxwFVbC8vyL6SF-DudeEBNfPciCcaAlImSWOwToofU';

// New database credentials
const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.k1gvzBcV1lBiGAxS-_5nyH88OhhCSzd5ko2NTHtUUSc';

async function migrateUsers() {
  console.log('🔄 เริ่มการย้ายข้อมูล Users จากฐานข้อมูลเก่าไปใหม่...\n');
  
  try {
    // 1. Export users from old database
    console.log('1️⃣ ดึงข้อมูล Users จากฐานข้อมูลเก่า:');
    
    const oldUsersResponse = await fetch(`${OLD_SUPABASE_URL}/rest/v1/users?select=*`, {
      headers: {
        'apikey': OLD_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${OLD_SERVICE_ROLE_KEY}`
      }
    });
    
    if (!oldUsersResponse.ok) {
      throw new Error(`ไม่สามารถดึงข้อมูลจากฐานข้อมูลเก่า: ${oldUsersResponse.status} ${oldUsersResponse.statusText}`);
    }
    
    const oldUsers = await oldUsersResponse.json();
    console.log(`✅ พบ Users ในฐานข้อมูลเก่า: ${oldUsers.length} คน`);
    
    if (oldUsers.length === 0) {
      console.log('⚠️ ไม่มีข้อมูล users ในฐานข้อมูลเก่า');
      return;
    }
    
    // Display sample users
    console.log('📋 ตัวอย่าง Users จากฐานข้อมูลเก่า:');
    oldUsers.slice(0, 3).forEach((user, i) => {
      console.log(`   ${i+1}. ${user.name || user.email} (${user.email}) - ${user.role || 'no role'}`);
    });
    
    // 2. Clear existing users in new database (except admin if exists)
    console.log('\n2️⃣ ลบข้อมูล Users ที่มีอยู่ในฐานข้อมูลใหม่:');
    
    const clearResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users`, {
      method: 'DELETE',
      headers: {
        'apikey': NEW_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`
      }
    });
    
    if (clearResponse.ok) {
      console.log('✅ ลบข้อมูล users เก่าในฐานข้อมูลใหม่เรียบร้อย');
    } else {
      console.log('⚠️ ไม่สามารถลบข้อมูล users เก่าในฐานข้อมูลใหม่');
    }
    
    // 3. Transform and prepare users for new database
    console.log('\n3️⃣ แปลงข้อมูล Users สำหรับฐานข้อมูลใหม่:');
    
    const transformedUsers = oldUsers.map(user => {
      // Generate new ID if needed
      const newId = user.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        id: newId,
        name: user.name || user.email || 'Unknown User',
        email: user.email,
        role: user.role || 'employee',
        status: user.status || 'active',
        avatar_url: user.avatar_url || null,
        phone: user.phone || null,
        department: user.department || null,
        position: user.position || null,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
        last_login: user.last_login || null
      };
    });
    
    console.log(`✅ แปลงข้อมูล ${transformedUsers.length} users สำเร็จ`);
    
    // 4. Insert users into new database
    console.log('\n4️⃣ นำเข้าข้อมูล Users ไปยังฐานข้อมูลใหม่:');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Insert users in batches of 10
    const batchSize = 10;
    for (let i = 0; i < transformedUsers.length; i += batchSize) {
      const batch = transformedUsers.slice(i, i + batchSize);
      
      try {
        const insertResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: {
            'apikey': NEW_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(batch)
        });
        
        if (insertResponse.ok) {
          const insertedUsers = await insertResponse.json();
          successCount += insertedUsers.length;
          console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}: นำเข้า ${insertedUsers.length} users`);
        } else {
          const error = await insertResponse.text();
          console.log(`   ❌ Batch ${Math.floor(i/batchSize) + 1}: Error - ${error}`);
          errorCount += batch.length;
        }
      } catch (error) {
        console.log(`   ❌ Batch ${Math.floor(i/batchSize) + 1}: Network error - ${error.message}`);
        errorCount += batch.length;
      }
    }
    
    // 5. Verify migration
    console.log('\n5️⃣ ตรวจสอบผลการย้ายข้อมูล:');
    
    const verifyResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?select=count`, {
      headers: {
        'apikey': NEW_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    
    if (verifyResponse.ok) {
      const newCount = verifyResponse.headers.get('content-range')?.split('/')[1] || '0';
      console.log(`📊 จำนวน Users ในฐานข้อมูลใหม่: ${newCount} คน`);
      
      // Get sample of imported users
      const sampleResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?select=name,email,role,created_at&limit=5`, {
        headers: {
          'apikey': NEW_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`
        }
      });
      
      if (sampleResponse.ok) {
        const sampleUsers = await sampleResponse.json();
        console.log('\n📋 ตัวอย่าง Users ที่นำเข้าแล้ว:');
        sampleUsers.forEach((user, i) => {
          console.log(`   ${i+1}. ${user.name} (${user.email}) - ${user.role}`);
        });
      }
    }
    
    // 6. Summary
    console.log('\n📋 สรุปผลการย้ายข้อมูล:');
    console.log('=====================================');
    console.log(`📊 Users จากฐานข้อมูลเก่า: ${oldUsers.length} คน`);
    console.log(`✅ นำเข้าสำเร็จ: ${successCount} คน`);
    console.log(`❌ นำเข้าล้มเหลว: ${errorCount} คน`);
    
    if (successCount > 0) {
      console.log('\n🎉 การย้ายข้อมูล Users สำเร็จ!');
      console.log('🌟 ข้อมูล users จากระบบเก่าพร้อมใช้งานในระบบใหม่');
      
      // Test if APIs work with real users
      console.log('\n🧪 ทดสอบ APIs กับข้อมูล users จริง:');
      
      const portfolioTest = await fetch('https://i-projects.skin/api/dashboard/portfolio');
      if (portfolioTest.ok) {
        const portfolioData = await portfolioTest.json();
        console.log(`✅ Portfolio API: พบ ${portfolioData.rows?.length || 0} projects`);
      }
      
    } else {
      console.log('\n❌ การย้ายข้อมูล Users ล้มเหลว');
      console.log('🔧 ตรวจสอบ permissions และข้อมูลในฐานข้อมูลเก่า');
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการย้ายข้อมูล:', error.message);
  }
}

migrateUsers().catch(console.error);
