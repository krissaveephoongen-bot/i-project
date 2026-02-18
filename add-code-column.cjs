// Add code column to projects table
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.vaunihijmwwkhqagjqjd:AppWorks@123!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addCodeColumn() {
  console.log('🔧 เพิ่มคอลัมน์ code ในตาราง projects...\n');
  
  try {
    // Test connection
    console.log('1️⃣ ทดสอบการเชื่อมต่อ...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ เชื่อมต่อสำเร็จ');
    
    // Check if code column exists
    console.log('\n2️⃣ ตรวจสอบคอลัมน์ code...');
    const columnCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
        AND table_schema = 'public'
        AND column_name = 'code'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ คอลัมน์ code มีอยู่แล้ว');
      console.log(`   Type: ${columnCheck.rows[0].data_type}`);
    } else {
      console.log('❌ คอลัมน์ code ไม่มีอยู่ - กำลังเพิ่ม...');
      
      // Add code column
      await pool.query(`
        ALTER TABLE projects 
        ADD COLUMN code TEXT
      `);
      
      console.log('✅ เพิ่มคอลัมน์ code สำเร็จ');
      
      // Add unique constraint
      await pool.query(`
        ALTER TABLE projects 
        ADD CONSTRAINT projects_code_unique UNIQUE (code)
      `);
      
      console.log('✅ เพิ่ม unique constraint สำเร็จ');
      
      // Add sample codes for existing projects
      await pool.query(`
        UPDATE projects 
        SET code = 'PROJ-' || LPAD(id::text, 6, '0')
        WHERE code IS NULL OR code = ''
      `);
      
      console.log('✅ อัปเดตข้อมูลเริ่มต้นสำเร็จ');
    }
    
    // Verify the changes
    console.log('\n3️⃣ ตรวจสอบการเปลี่ยนแปลง...');
    const verifyResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
        AND table_schema = 'public'
        AND column_name = 'code'
    `);
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ ตรวจสอบสำเร็จ - คอลัมน์ code มีอยู่');
      console.log(`   Type: ${verifyResult.rows[0].data_type}`);
      console.log(`   Nullable: ${verifyResult.rows[0].is_nullable}`);
    }
    
    // Check sample data
    console.log('\n4️⃣ ตรวจสอบข้อมูลตัวอย่าง...');
    const sampleData = await pool.query(`
      SELECT id, name, code 
      FROM projects 
      LIMIT 3
    `);
    
    console.log(`✅ พบ ${sampleData.rows.length} projects:`);
    sampleData.rows.forEach((project, i) => {
      console.log(`   ${i+1}. ${project.name} - Code: ${project.code || 'NULL'}`);
    });
    
    // Add index for better performance
    console.log('\n5️⃣ เพิ่ม Index...');
    try {
      await pool.query('CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code)');
      console.log('✅ เพิ่ม index สำหรับ code สำเร็จ');
    } catch (error) {
      console.log('ℹ️  Index อาจจะมีอยู่แล้ว');
    }
    
    console.log('\n🎉 คอลัมน์ code พร้อมใช้งาน!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.message.includes('unique constraint')) {
      console.log('ℹ️  Unique constraint อาจจะมีอยู่แล้ว');
    }
  } finally {
    await pool.end();
  }
}

addCodeColumn().catch(console.error);
