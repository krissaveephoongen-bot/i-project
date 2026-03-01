// Debug admin users API - check what's actually being sent
const https = require('https');

async function debugAdminUsers() {
  console.log('🔍 Debug Admin Users API...\n');
  
  try {
    // 1. Test direct database query to see what columns exist
    console.log('1️⃣ ตรวจสอบ columns ในตาราง users:');
    
    const supabaseUrl = 'https://vaunihijmwwkhqagjqjd.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.k1gvzBcV1lBiGAxS-_5nyH88OhhCSzd5ko2NTHtUUSc';
    
    const schemaCheck = await fetch(`${supabaseUrl}/rest/v1/users?select=*&limit=1`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (schemaCheck.ok) {
      const users = await schemaCheck.json();
      if (users.length > 0) {
        const columns = Object.keys(users[0]);
        console.log('📋 Columns ที่มีอยู่จริง:');
        columns.forEach(col => {
          console.log(`   - ${col}`);
        });
        
        // Check for createdAt vs created_at
        const hasCreatedAt = columns.includes('createdAt');
        const hasCreatedAtUnderscore = columns.includes('created_at');
        
        console.log('\n🔍 ตรวจสอบ column ที่เกี่ยวข้อง:');
        console.log(`   createdAt: ${hasCreatedAt ? '✅ มี' : '❌ ไม่มี'}`);
        console.log(`   created_at: ${hasCreatedAtUnderscore ? '✅ มี' : '❌ ไม่มี'}`);
        
        if (hasCreatedAt && !hasCreatedAtUnderscore) {
          console.log('\n⚠️  ใช้ createdAt แต่ API ใช้ created_at');
        } else if (!hasCreatedAt && hasCreatedAtUnderscore) {
          console.log('\n✅ ใช้ created_at ถูกต้อง');
        } else if (hasCreatedAt && hasCreatedAtUnderscore) {
          console.log('\n❓ มีทั้ง createdAt และ created_at');
        }
      }
    }
    
    // 2. Check what the API is actually trying to do
    console.log('\n2️⃣ ทดสอบว่า API ทำงานอย่างไร:');
    
    // Try a simple query first
    const simpleQuery = await fetch('https://i-projects.skin/api/admin/users?limit=1', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Simple Query Status: ${simpleQuery.status}`);
    
    if (!simpleQuery.ok) {
      const error = await simpleQuery.text();
      console.log('❌ Simple Query ล้มเหลว:');
      console.log(`   Error: ${error}`);
      
      // Try to understand what's wrong
      if (error.includes('createdAt')) {
        console.log('\n🔍 พบปัญหา: API ยังใช้ createdAt แต่ database ใช้ created_at');
        console.log('ต้องตรวจสอบ code ทั้งหมดที่อาจจะมีการใช้ createdAt');
      }
    } else {
      const data = await simpleQuery.json();
      console.log('✅ Simple Query สำเร็จ');
      console.log(`   พบ ${data.users?.length || 0} users`);
    }
    
    // 3. Check if there are any cached/deployed versions
    console.log('\n3️⃣ ตรวจสอบว่ามีการ deploy ใหม่:');
    
    const versionCheck = await fetch('https://i-projects.skin/api/admin/users', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Version Check Status: ${versionCheck.status}`);
    
    // 4. Try to find where createdAt is still being used
    console.log('\n4️⃣ ค้นหาการใช้ createdAt ใน code:');
    
    const fs = require('fs');
    const path = require('path');
    
    function searchInFile(filePath, searchTerm) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes(searchTerm);
      } catch (e) {
        return false;
      }
    }
    
    function searchInDirectory(dir, searchTerm, results = []) {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
            searchInDirectory(fullPath, searchTerm, results);
          } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
            if (searchInFile(fullPath, searchTerm)) {
              results.push(fullPath);
            }
          }
        }
      } catch (e) {
        // Skip directories we can't read
      }
      return results;
    }
    
    const apiDir = path.join(__dirname, 'next-app/app/api');
    const createdAtFiles = searchInDirectory(apiDir, 'createdAt');
    
    if (createdAtFiles.length > 0) {
      console.log('❌ พบไฟล์ที่ยังใช้ createdAt:');
      createdAtFiles.forEach(file => {
        console.log(`   - ${file}`);
      });
    } else {
      console.log('✅ ไม่พบการใช้ createdAt ใน API directory');
    }
    
    // 5. Check admin users page
    console.log('\n5️⃣ ตรวจสอบ Admin Users Page:');
    
    const adminPageCheck = await fetch('https://i-projects.skin/admin/users', {
      headers: {
        'Content-Type': 'text/html'
      }
    });
    
    console.log(`📊 Admin Page Status: ${adminPageCheck.status}`);
    
    if (adminPageCheck.ok) {
      console.log('✅ Admin Users page สามารถเข้าถึงได้');
    } else {
      console.log('❌ Admin Users page ไม่สามารถเข้าถึงได้');
    }
    
    console.log('\n📋 สรุปผลการ debug:');
    console.log('=====================================');
    console.log('🔍 สิ่งที่ต้องตรวจสอบ:');
    console.log('1. ตรวจสอบว่ามีการ deploy ใหม่');
    console.log('2. ตรวจสอบว่ามี caching ใน Vercel หรือไม่');
    console.log('3. ตรวจสอบว่า code ถูก deploy หรือไม่');
    console.log('4. ลอง deploy ใหม่');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

debugAdminUsers().catch(console.error);
