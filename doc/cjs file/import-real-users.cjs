// Import real users from old database to new database
const https = require('https');

// New database credentials
const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.k1gvzBcV1lBiGAxS-_5nyH88OhhCSzd5ko2NTHtUUSc';

// Real users data from old database
const realUsers = [
  {
    "id": "cc4d0a66-5984-459f-92d8-32d4563bf9f1",
    "name": "Pratya Fufueng",
    "email": "pratya.fu@appworks.co.th",
    "password": "$2b$10$jxwTi3yZY7Zenv3Zx6RS/ecYuNr04Ku9W6YDixPvdGZBd.qQLtew2",
    "role": "manager",
    "avatar": null,
    "department": "Project management",
    "position": "Senior Project Manager",
    "employeeCode": "0183",
    "hourlyRate": "875.00",
    "phone": "0815539795",
    "status": "active",
    "isActive": true,
    "isDeleted": false,
    "failedLoginAttempts": 0,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "isProjectManager": false,
    "isSupervisor": false,
    "notificationPreferences": null,
    "timezone": "Asia/Bangkok",
    "createdAt": "2025-07-15 15:36:35.482",
    "updatedAt": "2025-07-15 15:36:35.482",
    "name_th": "ปรัชญา ฟูเฟื่อง"
  },
  {
    "id": "82df756a-4d46-4e49-b927-bb165d7dc489",
    "name": "Thanongsak Thongkwid",
    "email": "thanongsak.th@appworks.co.th",
    "password": "$2b$10$FI/eVlBJdZ0qk7P3ME2hROxQRHa7CSMagPyuXtV9/uXf62VHjq1Gy",
    "role": "admin",
    "avatar": null,
    "department": "Project management",
    "position": "Vice President",
    "employeeCode": "0285",
    "hourlyRate": "1000.00",
    "phone": "0869881782",
    "status": "active",
    "isActive": true,
    "isDeleted": false,
    "failedLoginAttempts": 0,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "isProjectManager": false,
    "isSupervisor": false,
    "notificationPreferences": null,
    "timezone": "Asia/Bangkok",
    "createdAt": "2025-07-15 15:36:35.482",
    "updatedAt": "2025-07-15 15:36:35.482",
    "name_th": "ทนงศักดิ์ ทองขวิด"
  },
  {
    "id": "d4e57618-7358-4e95-8bec-1c3d7904a8fa",
    "name": "Sasithon Sukha",
    "email": "sasithon.su@appworks.co.th",
    "password": "$2b$10$My/DDePah7TGJV4UwqFZwe.TK1SjolR0zswhehmdO6h8I3Fucle1S",
    "role": "admin",
    "avatar": null,
    "department": "Sales Administration",
    "position": "Project Coordinator",
    "employeeCode": "0306",
    "hourlyRate": "275.00",
    "phone": "0624154419",
    "status": "active",
    "isActive": true,
    "isDeleted": false,
    "failedLoginAttempts": 0,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "isProjectManager": false,
    "isSupervisor": false,
    "notificationPreferences": null,
    "timezone": "Asia/Bangkok",
    "createdAt": "2025-07-15 15:36:35.482",
    "updatedAt": "2025-07-15 15:36:35.482",
    "name_th": "ศศิธร สุขะ"
  },
  {
    "id": "edaa1ff1-d7bb-4e03-9510-132d607899ee",
    "name": "Pannee Sae-Chee",
    "email": "pannee.sa@appworks.co.th",
    "password": "$2b$10$jyiXStpqAMlUI6aRsghoZ.peaTa07cnCwe.1Nkdc4KxgF/cnsw/zK",
    "role": "manager",
    "avatar": null,
    "department": "Project management",
    "position": "Project Manager",
    "employeeCode": "0294",
    "hourlyRate": "875.00",
    "phone": "0824351694",
    "status": "active",
    "isActive": true,
    "isDeleted": false,
    "failedLoginAttempts": 0,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "isProjectManager": false,
    "isSupervisor": false,
    "notificationPreferences": null,
    "timezone": "Asia/Bangkok",
    "createdAt": "2025-07-15 15:36:35.482",
    "updatedAt": "2025-07-15 15:36:35.482",
    "name_th": "พรรณี แซ่ฉี่"
  },
  {
    "id": "07695a36-cb77-4bd6-a413-dbd4ad22aac0",
    "name": "Napapha Tipaporn",
    "email": "napapha.ti@appworks.co.th",
    "password": "$2b$10$xIJxZm5Gs7GF0H3/1ek/4.rVQb.l2AN4he7ftZMNiyeLr8Z0ABXLK",
    "role": "manager",
    "avatar": null,
    "department": "Project management",
    "position": "Project Manager",
    "employeeCode": "0240",
    "hourlyRate": "750.00",
    "phone": "0626455542",
    "status": "active",
    "isActive": true,
    "isDeleted": false,
    "failedLoginAttempts": 0,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "isProjectManager": false,
    "isSupervisor": false,
    "notificationPreferences": null,
    "timezone": "Asia/Bangkok",
    "createdAt": "2025-07-15 15:36:35.482",
    "updatedAt": "2025-07-15 15:36:35.482",
    "name_th": "ณปภา ทิพย์อาภรณ์"
  },
  {
    "id": "0dfc2e1b-0d5f-40e2-99ca-0721ea5ec8dc",
    "name": "Jakgrits Phoongen",
    "email": "jakgrits.ph@appworks.co.th",
    "password": "$2b$10$P.U105Y1cGusMNjn7gD5qOb7qabqUwreQVLtrNMg1BszALTLcO6AK",
    "role": "admin",
    "avatar": null,
    "department": "Project management",
    "position": "Project Manager",
    "employeeCode": "0281",
    "hourlyRate": "750.00",
    "phone": "0841687176",
    "status": "active",
    "isActive": true,
    "isDeleted": false,
    "failedLoginAttempts": 0,
    "lastLogin": "2026-01-19 06:12:00.017",
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "isProjectManager": false,
    "isSupervisor": false,
    "notificationPreferences": null,
    "timezone": "Asia/Bangkok",
    "createdAt": "2025-07-15 15:36:35.482",
    "updatedAt": "2025-07-15 15:36:35.482",
    "name_th": "จักรกฤษณ์ ภูเงิน"
  },
  {
    "id": "56e2d716-faee-42bb-abbb-9c0d04cfbb64",
    "name": "Nawin Bunjoputsa",
    "email": "nawin.bu@appworks.co.th",
    "password": "$2b$10$aW/3Pa4s2PD.80KenYdRlec.bA1.wAHpxW5mbRMAE9l2aB/qJ55l2",
    "role": "admin",
    "avatar": null,
    "department": "Project management",
    "position": "Project Manager",
    "employeeCode": "0276",
    "hourlyRate": "750.00",
    "phone": "0956282395",
    "status": "active",
    "isActive": true,
    "isDeleted": false,
    "failedLoginAttempts": 0,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "isProjectManager": false,
    "isSupervisor": false,
    "notificationPreferences": null,
    "timezone": "Asia/Bangkok",
    "createdAt": "2025-07-15 15:36:35.482",
    "updatedAt": "2025-07-16 10:35:16.155",
    "name_th": "นาวิน บรรจบพุดซา"
  },
  {
    "id": "69965309-5683-4436-999b-fb94030e398d",
    "name": "Thapana Chatmanee",
    "email": "thapana.ch@appworks.co.th",
    "password": "$2b$10$hSI/iWaleNP6B.13/1iY9uwcrHjp.B1ewHzwCMwyCapjq0BuSs1IW",
    "role": "admin",
    "avatar": null,
    "department": "Project management",
    "position": "Project Manager",
    "employeeCode": "0272",
    "hourlyRate": "750.00",
    "phone": "0632397890",
    "status": "active",
    "isActive": true,
    "isDeleted": false,
    "failedLoginAttempts": 0,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "isProjectManager": false,
    "isSupervisor": false,
    "notificationPreferences": null,
    "timezone": "Asia/Bangkok",
    "createdAt": "2025-07-15 15:36:35.482",
    "updatedAt": "2025-07-15 15:36:35.482",
    "name_th": "ฐาปนา ฉัตรมณี"
  },
  {
    "id": "6aab71dd-03aa-4936-8091-a141ec3e2cf2",
    "name": "Pattaraprapa Chotipattachakorn",
    "email": "pattaraprapa.ch@appworks.co.th",
    "password": "$2b$10$M1YJ5ML1SeYHxwd24ffjV.KqmSQvA1jMPmMd0PHT8NQBB/huRp.kW",
    "role": "manager",
    "avatar": null,
    "department": "Project management",
    "position": "Senior Project Manager",
    "employeeCode": "0222",
    "hourlyRate": "875.00",
    "phone": "0835945929",
    "status": "active",
    "isActive": true,
    "isDeleted": false,
    "failedLoginAttempts": 0,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "isProjectManager": false,
    "isSupervisor": false,
    "notificationPreferences": null,
    "timezone": "Asia/Bangkok",
    "createdAt": "2025-07-15 15:36:35.482",
    "updatedAt": "2025-07-16 11:08:06.23",
    "name_th": "ภัทรปภา โชติภัทร์เตชากร"
  },
  {
    "id": "914439f4-1d31-4b4c-9465-6d1df4fa3d95",
    "name": "Suthat Wanprom",
    "email": "suthat.wa@appworks.co.th",
    "password": "$2b$10$oHsZn8Pei6uxlz6CCkTuPeH/bxh5bmcaTfz562lgXmQ67gQLSpo9.",
    "role": "manager",
    "avatar": null,
    "department": "Project management",
    "position": "Project Manager",
    "employeeCode": "0111",
    "hourlyRate": "750.00",
    "phone": "0846607022",
    "status": "active",
    "isActive": true,
    "isDeleted": false,
    "failedLoginAttempts": 0,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "isProjectManager": false,
    "isSupervisor": false,
    "notificationPreferences": null,
    "timezone": "Asia/Bangkok",
    "createdAt": "2025-07-15 15:36:35.482",
    "updatedAt": "2025-07-15 15:36:35.482",
    "name_th": "สุทัศน์ วันพรม"
  },
  {
    "id": "b74cded6-0ae9-44e2-813f-124e5908adaa",
    "name": "Sophonwith Valaisathien",
    "email": "sophonwith.va@appworks.co.th",
    "password": "$2b$10$9u4V.CXicQTCH0hzHZGNhOLbIFEiIyBuAo.cRxKN8OBupd1O7KIsy",
    "role": "manager",
    "avatar": null,
    "department": "Project management",
    "position": "Senior Project Manager",
    "employeeCode": "0134",
    "hourlyRate": "875.00",
    "phone": "0909931446",
    "status": "active",
    "isActive": true,
    "isDeleted": false,
    "failedLoginAttempts": 0,
    "lastLogin": null,
    "lockedUntil": null,
    "resetToken": null,
    "resetTokenExpiry": null,
    "isProjectManager": false,
    "isSupervisor": false,
    "notificationPreferences": null,
    "timezone": "Asia/Bangkok",
    "createdAt": "2025-07-15 15:36:35.482",
    "updatedAt": "2025-07-15 15:36:35.482",
    "name_th": "โสภณวิชญ์ วลัยเสถียร"
  }
];

async function importRealUsers() {
  console.log('🔄 นำเข้าข้อมูล Users จริงจากฐานข้อมูลเก่า...\n');
  
  try {
    // 1. Clear existing users in new database
    console.log('1️⃣ ลบข้อมูล Users ที่มีอยู่ในฐานข้อมูลใหม่:');
    
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
    
    // 2. Transform users for new database schema
    console.log('\n2️⃣ แปลงข้อมูล Users สำหรับฐานข้อมูลใหม่:');
    
    const transformedUsers = realUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar,
      department: user.department,
      position: user.position,
      employee_code: user.employeeCode,
      hourly_rate: parseFloat(user.hourlyRate),
      phone: user.phone.replace(/\r\n/g, '').trim(), // Clean phone number
      status: user.status,
      is_active: user.isActive,
      is_deleted: user.isDeleted,
      failed_login_attempts: user.failedLoginAttempts,
      last_login: user.lastLogin,
      locked_until: user.lockedUntil,
      reset_token: user.resetToken,
      reset_token_expiry: user.resetTokenExpiry,
      is_project_manager: user.isProjectManager,
      is_supervisor: user.isSupervisor,
      notification_preferences: user.notificationPreferences,
      timezone: user.timezone,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      name_th: user.name_th
    }));
    
    console.log(`✅ แปลงข้อมูล ${transformedUsers.length} users สำเร็จ`);
    
    // 3. Insert users in batches
    console.log('\n3️⃣ นำเข้าข้อมูล Users ไปยังฐานข้อมูลใหม่:');
    
    let successCount = 0;
    let errorCount = 0;
    const batchSize = 5; // Smaller batches for better reliability
    
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
          
          // Show inserted users
          insertedUsers.forEach(user => {
            console.log(`      👤 ${user.name} (${user.email}) - ${user.role}`);
          });
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
    
    // 4. Verify import
    console.log('\n4️⃣ ตรวจสอบผลการนำเข้าข้อมูล:');
    
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
      const sampleResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?select=name,email,role,department,position&limit=5`, {
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
          console.log(`      ${user.position} - ${user.department}`);
        });
      }
    }
    
    // 5. Test APIs with real users
    console.log('\n5️⃣ ทดสอบ APIs กับข้อมูล users จริง:');
    
    const portfolioTest = await fetch('https://i-projects.skin/api/dashboard/portfolio');
    if (portfolioTest.ok) {
      const portfolioData = await portfolioTest.json();
      console.log(`✅ Portfolio API: พบ ${portfolioData.rows?.length || 0} projects`);
    }
    
    const execReportTest = await fetch('https://i-projects.skin/api/projects/executive-report');
    if (execReportTest.ok) {
      const execData = await execReportTest.json();
      console.log(`✅ Executive Report API: พบ ${execData.projects?.length || 0} projects`);
    }
    
    // 6. Summary
    console.log('\n📋 สรุปผลการนำเข้าข้อมูล:');
    console.log('=====================================');
    console.log(`📊 Users จากฐานข้อมูลเก่า: ${realUsers.length} คน`);
    console.log(`✅ นำเข้าสำเร็จ: ${successCount} คน`);
    console.log(`❌ นำเข้าล้มเหลว: ${errorCount} คน`);
    
    if (successCount > 0) {
      console.log('\n🎉 การนำเข้าข้อมูล Users สำเร็จ!');
      console.log('🌟 ข้อมูล users จริงจากระบบเก่าพร้อมใช้งานในระบบใหม่');
      console.log('🔑 สามารถ login ด้วย email และ password เดิมได้');
      
      // Show login info for key users
      console.log('\n🔑 ข้อมูล login สำหรับผู้ใช้งานหลัก:');
      realUsers.slice(0, 3).forEach(user => {
        console.log(`   👤 ${user.name} (${user.email}) - ${user.role}`);
        console.log(`      ${user.position} - ${user.department}`);
      });
      
    } else {
      console.log('\n❌ การนำเข้าข้อมูล Users ล้มเหลว');
      console.log('🔧 ตรวจสอบ permissions และข้อมูล');
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการนำเข้าข้อมูล:', error.message);
  }
}

importRealUsers().catch(console.error);
