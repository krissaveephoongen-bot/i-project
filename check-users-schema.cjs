// Check users table schema in new database
const https = require('https');

const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'sb_publishable_MXBRHnc3b8kCjjsVaacMfQ_WwT_5g15';

async function checkUsersSchema() {
  console.log('🔍 ตรวจสอบ Schema ของ Users Table ในฐานข้อมูลใหม่...\n');
  
  try {
    // 1. Check table columns
    console.log('1️⃣ ตรวจสอบคอลัมน์ใน users table:');
    
    const schemaResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?select=*&limit=1`, {
      headers: {
        'apikey': NEW_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
      }
    });
    
    if (schemaResponse.ok) {
      const sampleData = await schemaResponse.json();
      if (sampleData.length > 0) {
        const columns = Object.keys(sampleData[0]);
        console.log('📋 คอลัมน์ที่มีอยู่:');
        columns.forEach(col => console.log(`   - ${col}`));
      } else {
        console.log('⚠️ ไม่พบข้อมูลใน users table');
      }
    } else {
      console.log(`❌ ไม่สามารถตรวจสอบ schema: ${schemaResponse.status}`);
    }
    
    // 2. Check information_schema
    console.log('\n2️⃣ ตรวจสอบจาก information_schema:');
    
    const infoSchemaResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/information_schema.columns?select=column_name,data_type,is_nullable&table_name=users&order_by=ordinal_position`, {
      headers: {
        'apikey': NEW_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
      }
    });
    
    if (infoSchemaResponse.ok) {
      const columns = await infoSchemaResponse.json();
      console.log('📋 คอลัมน์จาก information_schema:');
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
        console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}`);
      });
    } else {
      console.log(`❌ ไม่สามารถตรวจสอบ information_schema: ${infoSchemaResponse.status}`);
    }
    
    // 3. Show current users
    console.log('\n3️⃣ ข้อมูล users ปัจจุบัน:');
    
    const usersResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?select=id,name,email,role&limit=5`, {
      headers: {
        'apikey': NEW_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
      }
    });
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log(`📊 พบ ${users.length} users ในระบบ:`);
      users.forEach((user, i) => {
        console.log(`   ${i+1}. ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

checkUsersSchema().catch(console.error);
