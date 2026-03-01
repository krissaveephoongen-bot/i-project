// Check all tables in database and create projects table if needed
const { db } = require('./backend/lib/db.js');

async function checkAllTablesAndCreateProjects() {
  console.log('🔍 ตรวจสอบตารางทั้งหมดในฐานข้อมูล\n');
  
  try {
    console.log('1️⃣ ตรวจสอบตารางทั้งหมด...');
    const tables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 ตารางทั้งหมดในฐานข้อมูล:');
    if (tables.rows && tables.rows.length > 0) {
      tables.rows.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    } else {
      console.log('   ❌ ไม่พบตารางใดๆ');
    }
    
    // Check if we need to create projects table
    const hasProjects = tables.rows && tables.rows.some(table => table.table_name === 'projects');
    
    if (!hasProjects) {
      console.log('\n❌ ไม่พบตาราง projects - กำลังสร้างใหม่...');
      await createProjectsTable();
    } else {
      console.log('\n✅ พบตาราง projects แล้ว');
    }
    
    // Check for sample data
    console.log('\n2️⃣ ตรวจสอบข้อมูลตัวอย่าง...');
    await checkAndCreateSampleData();
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

async function createProjectsTable() {
  try {
    console.log('🔧 กำลังสร้างตาราง projects...');
    
    // Create projects table based on the schema
    await db.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        progress INTEGER DEFAULT 0,
        progress_plan INTEGER DEFAULT 0,
        spi NUMERIC DEFAULT 1.0,
        risk_level TEXT DEFAULT 'medium',
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        budget NUMERIC(12,2),
        spent NUMERIC(12,2) DEFAULT 0.00,
        remaining NUMERIC(12,2) DEFAULT 0.00,
        manager_id TEXT,
        client_id TEXT,
        hourly_rate NUMERIC(10,2) DEFAULT 0.00,
        priority TEXT DEFAULT 'medium',
        category TEXT,
        is_archived BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ สร้างตาราง projects สำเร็จ');
    
    // Create indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);`);
    
    console.log('✅ สร้าง indexes สำเร็จ');
    
  } catch (error) {
    console.error('❌ สร้างตารางไม่สำเร็จ:', error.message);
    throw error;
  }
}

async function checkAndCreateSampleData() {
  try {
    // Check projects count
    const countResult = await db.execute('SELECT COUNT(*) as count FROM projects');
    const projectCount = countResult.rows && countResult.rows.length > 0 ? parseInt(countResult.rows[0].count) : 0;
    
    console.log(`📊 จำนวน projects ปัจจุบัน: ${projectCount}`);
    
    if (projectCount === 0) {
      console.log('🔧 กำลังสร้างข้อมูลตัวอย่าง...');
      
      // Create sample projects
      const sampleProjects = [
        {
          id: 'project-001',
          name: 'โครงการพัฒนาเว็บไซต์บริษัท',
          code: 'WEB-001',
          description: 'พัฒนาเว็บไซต์สำหรับบริษัทตัวอย่าง',
          status: 'active',
          progress: 65,
          progress_plan: 70,
          spi: 0.93,
          risk_level: 'low',
          start_date: new Date('2024-01-01').toISOString(),
          end_date: new Date('2024-06-30').toISOString(),
          budget: 500000,
          spent: 325000,
          remaining: 175000,
          hourly_rate: 1500,
          priority: 'high',
          category: 'Web Development',
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'project-002',
          name: 'โครงการพัฒนา Mobile App',
          code: 'MOB-002',
          description: 'พัฒนาแอปพลิเคชันบนมือถือ',
          status: 'active',
          progress: 40,
          progress_plan: 45,
          spi: 0.89,
          risk_level: 'medium',
          start_date: new Date('2024-02-01').toISOString(),
          end_date: new Date('2024-08-31').toISOString(),
          budget: 800000,
          spent: 320000,
          remaining: 480000,
          hourly_rate: 1800,
          priority: 'medium',
          category: 'Mobile Development',
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'project-003',
          name: 'โครงการ System Integration',
          code: 'SYS-003',
          description: 'รวมระบบ ERP กับระบบบัญชี',
          status: 'pending',
          progress: 10,
          progress_plan: 15,
          spi: 0.67,
          risk_level: 'high',
          start_date: new Date('2024-03-01').toISOString(),
          end_date: new Date('2024-12-31').toISOString(),
          budget: 1200000,
          spent: 120000,
          remaining: 1080000,
          hourly_rate: 2000,
          priority: 'low',
          category: 'System Integration',
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      for (const project of sampleProjects) {
        await db.execute(`
          INSERT INTO projects (
            id, name, code, description, status, progress, progress_plan, spi, risk_level,
            start_date, end_date, budget, spent, remaining, hourly_rate, priority, category,
            is_archived, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
          )
        `, [
          project.id, project.name, project.code, project.description, project.status,
          project.progress, project.progress_plan, project.spi, project.risk_level,
          project.start_date, project.end_date, project.budget, project.spent, project.remaining,
          project.hourly_rate, project.priority, project.category, project.is_archived,
          project.created_at, project.updated_at
        ]);
      }
      
      console.log('✅ สร้างข้อมูลตัวอย่าง 3 projects สำเร็จ');
      
      // Verify the data was created
      const verifyResult = await db.execute('SELECT COUNT(*) as count FROM projects');
      const finalCount = verifyResult.rows && verifyResult.rows.length > 0 ? parseInt(verifyResult.rows[0].count) : 0;
      console.log(`📊 จำนวน projects หลังสร้าง: ${finalCount}`);
      
    } else {
      console.log('✅ มีข้อมูล projects อยู่แล้ว');
    }
    
  } catch (error) {
    console.error('❌ จัดการข้อมูลไม่สำเร็จ:', error.message);
  }
}

checkAllTablesAndCreateProjects();
