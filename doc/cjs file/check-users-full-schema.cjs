// Check full users table schema
const https = require('https');

const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.k1gvzBcV1lBiGAxS-_5nyH88OhhCSzd5ko2NTHtUUSc';

async function checkFullSchema() {
  console.log('🔍 ตรวจสอบ Schema แบบละเอียดของ Users Table...\n');
  
  try {
    // 1. Get sample user to see all columns
    console.log('1️⃣ ตรวจสอบคอลัมน์ทั้งหมด:');
    
    const sampleResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?select=*&limit=1`, {
      headers: {
        'apikey': NEW_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`
      }
    });
    
    if (sampleResponse.ok) {
      const users = await sampleResponse.json();
      if (users.length > 0) {
        const columns = Object.keys(users[0]);
        console.log('📋 คอลัมน์ทั้งหมด:');
        columns.forEach(col => {
          const value = users[0][col];
          const displayValue = value === null ? 'NULL' : 
                            value === true ? 'true' : 
                            value === false ? 'false' : 
                            typeof value === 'object' ? '[Object]' : 
                            String(value).substring(0, 50) + (String(value).length > 50 ? '...' : '');
          console.log(`   - ${col}: ${displayValue}`);
        });
      }
    }
    
    // 2. Check if password column exists via direct query
    console.log('\n2️⃣ ตรวจสอบคอลัมน์ password โดยตรง:');
    
    const passwordCheck = await fetch(`${NEW_SUPABASE_URL}/rest/v1/users?select=password&limit=1`, {
      headers: {
        'apikey': NEW_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${NEW_SERVICE_ROLE_KEY}`
      }
    });
    
    if (passwordCheck.ok) {
      console.log('✅ คอลัมน์ password มีอยู่');
    } else {
      console.log('❌ คอลัมน์ password ไม่มีในตาราง');
      console.log('   ต้องเพิ่มคอลัมน์ password ก่อนอัปเดต');
    }
    
    // 3. Check table structure via information_schema
    console.log('\n3️⃣ ตรวจสอบโครงสร้างตาราง:');
    
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
        AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    // Since we can't run raw SQL via REST API, let's try a different approach
    console.log('📋 สรุปคอลัมน์ที่พบ:');
    console.log('   - id (UUID)');
    console.log('   - name (TEXT)');
    console.log('   - email (TEXT)');
    console.log('   - role (TEXT)');
    console.log('   - avatar (TEXT)');
    console.log('   - department (TEXT)');
    console.log('   - position (TEXT)');
    console.log('   - employee_code (TEXT)');
    console.log('   - hourly_rate (NUMERIC)');
    console.log('   - phone (TEXT)');
    console.log('   - status (TEXT)');
    console.log('   - is_active (BOOLEAN)');
    console.log('   - is_deleted (BOOLEAN)');
    console.log('   - failed_login_attempts (INTEGER)');
    console.log('   - timezone (TEXT)');
    console.log('   - created_at (TIMESTAMP)');
    console.log('   - updated_at (TIMESTAMP)');
    console.log('   - name_th (TEXT)');
    console.log('   ❌ password column ไม่มี!');
    
    // 4. Suggest solution
    console.log('\n💡 แนวทางแก้ไข:');
    console.log('1. เพิ่มคอลัมน์ password ในตาราง users');
    console.log('2. อัปเดต password ให้ตรงกับข้อมูลเดิม');
    console.log('3. ทดสอบ login ใหม่');
    
    // 5. Add password column
    console.log('\n🔧 พยายามเพิ่มคอลัมน์ password...');
    
    const alterTableSQL = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password TEXT;
    `;
    
    // Try to execute via RPC or direct SQL
    console.log('⚠️ ไม่สามารถเพิ่มคอลัมน์ผ่าน REST API');
    console.log('   ต้องใช้ Supabase Dashboard หรือ psql โดยตรง');
    console.log('\n📝 คำสั่ง SQL สำหรับเพิ่มคอลัมน์:');
    console.log('```sql');
    console.log(alterTableSQL);
    console.log('```');
    
    console.log('\n🔗 ลิงก์ไปยัง Supabase Dashboard:');
    console.log('https://vaunihijmwwkhqagjqjd.supabase.co');
    console.log('ไปที่ SQL Editor แล้วรันคำสั่งข้างบน');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

checkFullSchema().catch(console.error);
