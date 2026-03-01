// Create projects table in public schema
const { db } = require('./backend/lib/db.js');

async function createProjectsTable() {
  console.log('🔧 สร้างตาราง projects ใน public schema\n');
  
  try {
    console.log('1️⃣ สร้างตาราง projects...');
    
    // Drop existing table if it exists (to start fresh)
    try {
      await db.execute('DROP TABLE IF EXISTS public.projects CASCADE;');
      console.log('🗑️ ลบตารางเก่า (ถ้ามี)');
    } catch (error) {
      console.log('   (ไม่มีตารางเก่าที่ต้องลบ)');
    }
    
    // Create the projects table
    await db.execute(`
      CREATE TABLE public.projects (
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
    console.log('2️⃣ สร้าง indexes...');
    try {
      await db.execute('CREATE INDEX idx_projects_status ON public.projects(status);');
      await db.execute('CREATE INDEX idx_projects_manager_id ON public.projects(manager_id);');
      await db.execute('CREATE INDEX idx_projects_client_id ON public.projects(client_id);');
      await db.execute('CREATE INDEX idx_projects_created_at ON public.projects(created_at);');
      await db.execute('CREATE INDEX idx_projects_code ON public.projects(code);');
      console.log('✅ สร้าง indexes สำเร็จ');
    } catch (indexError) {
      console.log('⚠️ สร้าง indexes มีปัญหา:', indexError.message);
    }
    
    // Verify table was created
    console.log('3️⃣ ตรวจสอบตาราง...');
    const tableCheck = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
      );
    `);
    
    const exists = tableCheck.rows && tableCheck.rows.length > 0 ? tableCheck.rows[0].exists : false;
    console.log(`📋 ตาราง projects มีอยู่: ${exists ? '✅ มี' : '❌ ไม่มี'}`);
    
    if (exists) {
      console.log('4️⃣ สร้างข้อมูลตัวอย่าง...');
      await createSampleData();
    }
    
  } catch (error) {
    console.error('❌ สร้างตารางไม่สำเร็จ:', error.message);
    console.error('Stack:', error.stack);
  }
}

async function createSampleData() {
  try {
    console.log('🔧 สร้างข้อมูลตัวอย่าง...');
    
    const sampleProjects = [
      {
        id: 'proj-001',
        name: 'โครงการพัฒนาเว็บไซต์',
        code: 'WEB-001',
        description: 'พัฒนาเว็บไซต์สำหรับบริษัท',
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
        id: 'proj-002',
        name: 'โครงการ Mobile App',
        code: 'MOB-002',
        description: 'พัฒนาแอปพลิเคชันมือถือ',
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
        id: 'proj-003',
        name: 'โครงการ System Integration',
        code: 'SYS-003',
        description: 'รวมระบบ ERP',
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
        INSERT INTO public.projects (
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
    
    // Verify data
    const countResult = await db.execute('SELECT COUNT(*) as count FROM public.projects');
    const projectCount = countResult.rows && countResult.rows.length > 0 ? parseInt(countResult.rows[0].count) : 0;
    console.log(`📊 จำนวน projects ทั้งหมด: ${projectCount}`);
    
    // Show sample data
    const projects = await db.execute(`
      SELECT id, name, code, status, budget, progress 
      FROM public.projects 
      ORDER BY created_at
    `);
    
    console.log('\n📋 รายการ projects:');
    if (projects.rows && projects.rows.length > 0) {
      projects.rows.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.name} (${project.code})`);
        console.log(`      ID: ${project.id}`);
        console.log(`      Status: ${project.status}`);
        console.log(`      Budget: ${project.budget}`);
        console.log(`      Progress: ${project.progress}%`);
        console.log('');
      });
    }
    
    console.log('\n🎉 พร้อมทดสอบ tabs ได้แล้ว!');
    
  } catch (error) {
    console.error('❌ สร้างข้อมูลไม่สำเร็จ:', error.message);
  }
}

createProjectsTable();
