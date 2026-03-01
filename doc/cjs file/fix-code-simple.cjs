// Simple fix for code column
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.vaunihijmwwkhqagjqjd:AppWorks@123!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixCodeSimple() {
  console.log('🔧 แก้ไขคอลัมน์ code แบบง่าย...\n');
  
  try {
    // Update all projects with unique codes using timestamp
    console.log('1️⃣ อัปเดตข้อมูล projects ด้วย unique codes...');
    
    await pool.query(`
      UPDATE projects 
      SET code = 'PROJ-' || EXTRACT(EPOCH FROM created_at)::text
      WHERE code IS NULL OR code = ''
    `);
    
    console.log('✅ อัปเดตข้อมูลสำเร็จ');
    
    // Verify the changes
    console.log('\n2️⃣ ตรวจสอบผลลัพธ์...');
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
    
    // Check if all projects have codes
    const countResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(code) as with_code,
        COUNT(*) - COUNT(code) as without_code
      FROM projects
    `);
    
    const stats = countResult.rows[0];
    console.log(`\n📊 สถิติ:`);
    console.log(`   ทั้งหมด: ${stats.total} projects`);
    console.log(`   มี code: ${stats.with_code} projects`);
    console.log(`   ไม่มี code: ${stats.without_code} projects`);
    
    if (stats.without_code === 0) {
      console.log('\n🎉 ทุก projects มี code แล้ว!');
    } else {
      console.log(`\n⚠️ ยังมี ${stats.without_code} projects ที่ไม่มี code`);
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    await pool.end();
  }
}

fixCodeSimple().catch(console.error);
