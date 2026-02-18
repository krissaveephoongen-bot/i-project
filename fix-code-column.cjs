// Fix code column issues
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.vaunihijmwwkhqagjqjd:AppWorks@123!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixCodeColumn() {
  console.log('🔧 แก้ไขปัญหาคอลัมน์ code...\n');
  
  try {
    // Remove unique constraint first
    console.log('1️⃣ ลบ unique constraint...');
    try {
      await pool.query('ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_code_unique');
      console.log('✅ ลบ unique constraint สำเร็จ');
    } catch (error) {
      console.log('ℹ️  Unique constraint ไม่มีอยู่หรือไม่สามารถลบได้');
    }
    
    // Update existing projects with unique codes
    console.log('\n2️⃣ อัปเดตข้อมูล projects ด้วย codes ที่ไม่ซ้ำกัน...');
    await pool.query(`
      UPDATE projects 
      SET code = 'PROJ-' || LPAD(id::text, 6, '0')
      WHERE code IS NULL OR code = ''
    `);
    
    console.log('✅ อัปเดตข้อมูลสำเร็จ');
    
    // Check for duplicates and fix them
    console.log('\n3️⃣ ตรวจสอบและแก้ไข duplicate codes...');
    const duplicateCheck = await pool.query(`
      SELECT code, COUNT(*) as count
      FROM projects 
      WHERE code IS NOT NULL AND code != ''
      GROUP BY code
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateCheck.rows.length > 0) {
      console.log('⚠️ พบ duplicate codes กำลังแก้ไข...');
      
      for (const duplicate of duplicateCheck.rows) {
        await pool.query(`
          UPDATE projects 
          SET code = code || '-' || ROW_NUMBER() OVER (PARTITION BY code ORDER BY id)
          WHERE code = $1
        `, [duplicate.code]);
      }
      
      console.log('✅ แก้ไข duplicate codes สำเร็จ');
    } else {
      console.log('✅ ไม่พบ duplicate codes');
    }
    
    // Add unique constraint back
    console.log('\n4️⃣ เพิ่ม unique constraint ใหม่...');
    try {
      await pool.query('ALTER TABLE projects ADD CONSTRAINT projects_code_unique UNIQUE (code)');
      console.log('✅ เพิ่ม unique constraint สำเร็จ');
    } catch (error) {
      console.log('ℹ️  ยังมีปัญหากับ unique constraint');
    }
    
    // Verify the changes
    console.log('\n5️⃣ ตรวจสอบผลลัพธ์...');
    const verifyResult = await pool.query(`
      SELECT id, name, code 
      FROM projects 
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('✅ ข้อมูล projects ล่าสุด:');
    verifyResult.rows.forEach((project, i) => {
      console.log(`   ${i+1}. ${project.name} - Code: ${project.code || 'NULL'}`);
    });
    
    console.log('\n🎉 แก้ไขคอลัมน์ code เสร็จสมบูรณ์!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    await pool.end();
  }
}

fixCodeColumn().catch(console.error);
