// Check public.projects table specifically
const { db } = require('./backend/lib/db.js');

async function checkPublicProjects() {
  console.log('🔍 ตรวจสอบตาราง public.projects โดยเฉพาะ\n');
  
  try {
    console.log('1️⃣ ตรวจสอบตาราง projects ใน schema public...');
    
    // Check if table exists in public schema
    const tableCheck = await db.execute(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'projects'
    `);
    
    if (tableCheck.rows && tableCheck.rows.length > 0) {
      console.log('✅ พบตาราง projects ใน schema public');
      
      console.log('\n2️⃣ ตรวจสอบโครงสร้างตาราง...');
      const schema = await db.execute(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'projects' 
        ORDER BY ordinal_position
      `);
      
      console.log('📋 คอลัมน์ในตาราง public.projects:');
      if (schema.rows && schema.rows.length > 0) {
        schema.rows.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable})${col.column_default ? ` [default: ${col.column_default}]` : ''}`);
        });
      } else {
        console.log('   ❌ ไม่พบข้อมูลคอลัมน์');
      }
      
      console.log('\n3️⃣ ตรวจสอบจำนวนข้อมูล...');
      const countResult = await db.execute('SELECT COUNT(*) as count FROM public.projects');
      const projectCount = countResult.rows && countResult.rows.length > 0 ? parseInt(countResult.rows[0].count) : 0;
      
      console.log(`📊 จำนวน projects ทั้งหมด: ${projectCount}`);
      
      if (projectCount > 0) {
        console.log('\n4️⃣ แสดงข้อมูล projects...');
        const projects = await db.execute(`
          SELECT id, name, code, status, created_at, updated_at 
          FROM public.projects 
          ORDER BY created_at DESC
          LIMIT 5
        `);
        
        console.log('📋 รายการ projects (5 รายการล่าสุด):');
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
        
        console.log('5️⃣ ทดสอบ query แบบง่าย...');
        const testQuery = await db.execute('SELECT name FROM public.projects LIMIT 1');
        if (testQuery.rows && testQuery.rows.length > 0) {
          console.log(`✅ Query ทำงานได้: ${testQuery.rows[0].name}`);
        } else {
          console.log('❌ Query ไม่พบข้อมูล');
        }
        
      } else {
        console.log('\n❌ ไม่มีข้อมูลในตาราง projects');
        console.log('🔧 กำลังสร้างข้อมูลตัวอย่าง...');
        await createSampleProjects();
      }
      
    } else {
      console.log('❌ ไม่พบตาราง projects ใน schema public');
      
      // Check all schemas
      console.log('\n🔍 ตรวจสอบ schemas ทั้งหมด...');
      const schemas = await db.execute(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        ORDER BY schema_name
      `);
      
      console.log('📋 Schemas ทั้งหมด:');
      if (schemas.rows && schemas.rows.length > 0) {
        schemas.rows.forEach(schema => {
          console.log(`   - ${schema.schema_name}`);
        });
      }
      
      // Check if projects table exists in any schema
      console.log('\n🔍 ตรวจสอบตาราง projects ในทุก schema...');
      const allProjectsTables = await db.execute(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_name = 'projects'
        ORDER BY table_schema
      `);
      
      if (allProjectsTables.rows && allProjectsTables.rows.length > 0) {
        console.log('📋 พบตาราง projects ใน schemas:');
        allProjectsTables.rows.forEach(table => {
          console.log(`   - ${table.table_schema}.${table.table_name}`);
        });
      } else {
        console.log('❌ ไม่พบตาราง projects ใน schema ใดๆ');
      }
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    console.error('Stack:', error.stack);
  }
}

async function createSampleProjects() {
  try {
    console.log('🔧 สร้างข้อมูลตัวอย่างใน public.projects...');
    
    const sampleProjects = [
      {
        id: 'project-demo-001',
        name: 'โครงการตัวอย่างที่ 1',
        code: 'DEMO-001',
        description: 'โครงการสำหรับทดสอบระบบ',
        status: 'active',
        progress: 75,
        progress_plan: 80,
        spi: 0.94,
        risk_level: 'low',
        start_date: new Date('2024-01-01').toISOString(),
        end_date: new Date('2024-06-30').toISOString(),
        budget: 500000,
        spent: 375000,
        remaining: 125000,
        hourly_rate: 1500,
        priority: 'high',
        category: 'Demo',
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'project-demo-002',
        name: 'โครงการตัวอย่างที่ 2',
        code: 'DEMO-002',
        description: 'โครงการทดสอบอีกรายการ',
        status: 'active',
        progress: 45,
        progress_plan: 50,
        spi: 0.90,
        risk_level: 'medium',
        start_date: new Date('2024-02-01').toISOString(),
        end_date: new Date('2024-08-31').toISOString(),
        budget: 750000,
        spent: 337500,
        remaining: 412500,
        hourly_rate: 1800,
        priority: 'medium',
        category: 'Demo',
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
    
    console.log('✅ สร้างข้อมูลตัวอย่าง 2 projects สำเร็จ');
    
    // Verify
    const verifyResult = await db.execute('SELECT COUNT(*) as count FROM public.projects');
    const finalCount = verifyResult.rows && verifyResult.rows.length > 0 ? parseInt(verifyResult.rows[0].count) : 0;
    console.log(`📊 จำนวน projects หลังสร้าง: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ สร้างข้อมูลตัวอย่างไม่สำเร็จ:', error.message);
  }
}

checkPublicProjects();
