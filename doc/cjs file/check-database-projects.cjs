// Check actual database for projects data
const { db } = require('./backend/lib/db.js');

async function checkDatabaseProjects() {
  console.log('🔍 ตรวจสอบข้อมูล projects ในฐานข้อมูลจริง\n');
  
  try {
    console.log('1️⃣ ตรวจสอบการเชื่อมต่อฐานข้อมูล...');
    await db.execute('SELECT 1');
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ\n');
    
    console.log('2️⃣ ตรวจสอบตาราง projects...');
    
    // Check if projects table exists
    const tableCheck = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
      );
    `);
    
    const tableExists = tableCheck.rows && tableCheck.rows.length > 0 ? tableCheck.rows[0].exists : false;
    console.log(`📋 ตาราง projects มีอยู่: ${tableExists ? '✅ มี' : '❌ ไม่มี'}`);
    
    if (!tableExists) {
      console.log('❌ ไม่พบตาราง projects ในฐานข้อมูล');
      return;
    }
    
    console.log('\n3️⃣ ตรวจสอบโครงสร้างตาราง projects...');
    const schema = await db.execute(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY ordinal_position
    `);
    
    console.log('📝 คอลัมน์ในตาราง projects:');
    if (schema.rows && schema.rows.length > 0) {
      schema.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable})${col.column_default ? ` [default: ${col.column_default}]` : ''}`);
      });
    } else {
      console.log('   ❌ ไม่พบข้อมูลคอลัมน์');
    }
    
    console.log('\n4️⃣ ตรวจสอบจำนวน projects ทั้งหมด...');
    const countResult = await db.execute('SELECT COUNT(*) as count FROM projects');
    const projectCount = countResult.rows && countResult.rows.length > 0 ? parseInt(countResult.rows[0].count) : 0;
    
    console.log(`📊 จำนวน projects ทั้งหมด: ${projectCount}`);
    
    if (projectCount > 0) {
      console.log('\n5️⃣ แสดงข้อมูล projects ทั้งหมด...');
      const projects = await db.execute(`
        SELECT id, name, code, status, created_at, updated_at 
        FROM projects 
        ORDER BY created_at DESC
      `);
      
      console.log('📋 รายการ projects:');
      if (projects.rows && projects.rows.length > 0) {
        projects.rows.forEach((project, index) => {
          console.log(`   ${index + 1}. ${project.name} (${project.code || 'N/A'})`);
          console.log(`      ID: ${project.id}`);
          console.log(`      Status: ${project.status}`);
          console.log(`      Created: ${project.created_at}`);
          console.log(`      Updated: ${project.updated_at || 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('   ❌ ไม่พบข้อมูล projects');
      }
      
      console.log('6️⃣ ตรวจสอบข้อมูลที่เกี่ยวข้อง...');
      
      // Check related tables
      const relatedTables = ['tasks', 'milestones', 'risks', 'documents', 'users', 'clients'];
      
      for (const table of relatedTables) {
        try {
          const tableExistsCheck = await db.execute(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = '${table}'
            );
          `);
          
          const exists = tableExistsCheck.rows && tableExistsCheck.rows.length > 0 ? tableExistsCheck.rows[0].exists : false;
          
          if (exists) {
            const count = await db.execute(`SELECT COUNT(*) as count FROM ${table}`);
            const recordCount = count.rows && count.rows.length > 0 ? parseInt(count.rows[0].count) : 0;
            console.log(`📊 ${table}: ${recordCount} records`);
          } else {
            console.log(`📊 ${table}: ไม่พบตาราง`);
          }
        } catch (error) {
          console.log(`📊 ${table}: ❌ ตรวจสอบไม่ได้ - ${error.message}`);
        }
      }
      
    } else {
      console.log('\n❌ ไม่มีข้อมูล projects ในฐานข้อมูล');
      console.log('💡 นี่คือสาเหตุที่ tabs ต่างๆ แสดงผลเป็น loading/error state');
      console.log('🔧 ต้องสร้างข้อมูล projects ก่อนจึงจะทดสอบ tabs ได้เต็มที่');
    }
    
    console.log('\n📋 สรุปผลการตรวจสอบฐานข้อมูล:');
    console.log(`- ตาราง projects: ${tableExists ? '✅ มี' : '❌ ไม่มี'}`);
    console.log(`- ข้อมูล projects: ${projectCount > 0 ? `✅ มี ${projectCount} รายการ` : '❌ ไม่มี'}`);
    
    if (projectCount === 0) {
      console.log('\n🎯 ข้อเสนอแนะ:');
      console.log('1. สร้างข้อมูล projects ตัวอย่างเพื่อทดสอบระบบ');
      console.log('2. ตรวจสอบว่ามีการ migrate database ครบถ้วย');
      console.log('3. ตรวจสอบ process สร้าง projects ว่าทำงานได้');
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบฐานข้อมูล:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkDatabaseProjects();
