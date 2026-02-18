// Create data using correct anon key
const { createClient } = require('@supabase/supabase-js');

// New Supabase anon key
const supabaseUrl = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw';

async function createDataWithAnonKey() {
  console.log('🔄 สร้างข้อมูลด้วย Anon Key (Legacy)...\n');
  
  const supabase = createClient(supabaseUrl, anonKey);
  
  try {
    // Step 1: Create sample users
    console.log('1️⃣ สร้าง Users:');
    const users = [
      {
        id: 'admin-001',
        email: 'admin@example.com',
        name: 'Administrator',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user-001',
        email: 'manager@example.com',
        name: 'Project Manager',
        role: 'manager',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user-002',
        email: 'employee@example.com',
        name: 'Team Member',
        role: 'employee',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const { error: usersError } = await supabase
      .from('users')
      .upsert(users, { onConflict: 'id' });
    
    if (usersError) {
      console.log(`   ❌ Users Error: ${usersError.message}`);
    } else {
      console.log(`   ✅ ${users.length} users created`);
    }
    
    // Step 2: Create sample clients
    console.log('\n2️⃣ สร้าง Clients:');
    const clients = [
      {
        id: 'client-001',
        name: 'ABC Corporation',
        email: 'contact@abc.com',
        phone: '+66-2-123-4567',
        address: 'Bangkok, Thailand',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'client-002',
        name: 'XYZ Company',
        email: 'info@xyz.com',
        phone: '+66-2-987-6543',
        address: 'Chiang Mai, Thailand',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const { error: clientsError } = await supabase
      .from('clients')
      .upsert(clients, { onConflict: 'id' });
    
    if (clientsError) {
      console.log(`   ❌ Clients Error: ${clientsError.message}`);
    } else {
      console.log(`   ✅ ${clients.length} clients created`);
    }
    
    // Step 3: Create sample projects
    console.log('\n3️⃣ สร้าง Projects:');
    const now = new Date().toISOString();
    const projects = [
      {
        id: 'proj-001',
        name: 'เว็บไซต์บริษัท ABC',
        description: 'พัฒนาเว็บไซต์สำหรับบริษัท ABC',
        client_id: 'client-001',
        status: 'active',
        progress: 75,
        budget: 500000,
        spent: 350000,
        spi: 1.1,
        cpi: 1.05,
        start_date: '2026-01-01',
        end_date: '2026-06-30',
        created_at: now,
        updated_at: now
      },
      {
        id: 'proj-002',
        name: 'ระบบ Mobile App',
        description: 'พัฒนาแอปพลิเคชันสำหรับ iOS และ Android',
        client_id: 'client-001',
        status: 'active',
        progress: 45,
        budget: 750000,
        spent: 400000,
        spi: 0.9,
        cpi: 0.95,
        start_date: '2026-02-01',
        end_date: '2026-08-31',
        created_at: now,
        updated_at: now
      },
      {
        id: 'proj-003',
        name: 'โครงการ Cloud Migration',
        description: 'ย้ายข้อมูลไปยังระบบคลาวด์',
        client_id: 'client-002',
        status: 'active',
        progress: 90,
        budget: 300000,
        spent: 280000,
        spi: 1.05,
        cpi: 1.02,
        start_date: '2025-12-01',
        end_date: '2026-03-31',
        created_at: now,
        updated_at: now
      },
      {
        id: 'proj-004',
        name: 'ระบบวิเคราะห์ข้อมูล',
        description: 'พัฒนาระบบวิเคราะห์และรายงานประจอบ',
        client_id: 'client-002',
        status: 'pending',
        progress: 15,
        budget: 600000,
        spent: 80000,
        spi: 0.95,
        cpi: 0.85,
        start_date: '2026-03-01',
        end_date: '2026-12-31',
        created_at: now,
        updated_at: now
      }
    ];
    
    const { error: projectsError } = await supabase
      .from('projects')
      .upsert(projects, { onConflict: 'id' });
    
    if (projectsError) {
      console.log(`   ❌ Projects Error: ${projectsError.message}`);
    } else {
      console.log(`   ✅ ${projects.length} projects created`);
    }
    
    // Step 4: Create sample milestones
    console.log('\n4️⃣ สร้าง Milestones:');
    const milestones = [
      {
        id: 'mile-001',
        project_id: 'proj-001',
        title: 'Design Phase',
        description: 'ออกแบบ UI/UX และโครงสร้าง',
        status: 'completed',
        due_date: '2026-02-15',
        completed_date: '2026-02-10',
        created_at: now,
        updated_at: now
      },
      {
        id: 'mile-002',
        project_id: 'proj-001',
        title: 'Development Phase',
        description: 'พัฒนา Frontend และ Backend',
        status: 'in_progress',
        due_date: '2026-04-30',
        completed_date: null,
        created_at: now,
        updated_at: now
      },
      {
        id: 'mile-003',
        project_id: 'proj-002',
        title: 'UI Design',
        description: 'ออกแบบหน้าจอแอปพลิเคชัน',
        status: 'completed',
        due_date: '2026-03-15',
        completed_date: '2026-03-12',
        created_at: now,
        updated_at: now
      }
    ];
    
    const { error: milestonesError } = await supabase
      .from('milestones')
      .upsert(milestones, { onConflict: 'id' });
    
    if (milestonesError) {
      console.log(`   ❌ Milestones Error: ${milestonesError.message}`);
    } else {
      console.log(`   ✅ ${milestones.length} milestones created`);
    }
    
    // Step 5: Create sample cashflow
    console.log('\n5️⃣ สร้าง Cashflow:');
    const cashflow = [
      {
        id: 'cash-001',
        month: '2026-01',
        committed: 200000,
        paid: 150000,
        created_at: now,
        updated_at: now
      },
      {
        id: 'cash-002',
        month: '2026-02',
        committed: 250000,
        paid: 200000,
        created_at: now,
        updated_at: now
      },
      {
        id: 'cash-003',
        month: '2026-03',
        committed: 300000,
        paid: 180000,
        created_at: now,
        updated_at: now
      }
    ];
    
    const { error: cashflowError } = await supabase
      .from('cashflow')
      .upsert(cashflow, { onConflict: 'id' });
    
    if (cashflowError) {
      console.log(`   ❌ Cashflow Error: ${cashflowError.message}`);
    } else {
      console.log(`   ✅ ${cashflow.length} cashflow entries created`);
    }
    
    // Step 6: Create sample SPI/CPI snapshots
    console.log('\n6️⃣ สร้าง SPI/CPI Snapshots:');
    const snapshots = [];
    const today = new Date();
    
    // Create snapshots for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      
      projects.forEach(project => {
        snapshots.push({
          id: `${project.id}-${dateStr}`,
          projectId: project.id,
          date: dateStr,
          spi: project.spi + (Math.random() * 0.2 - 0.1), // Small variation
          cpi: project.cpi + (Math.random() * 0.2 - 0.1), // Small variation
          budget: project.budget,
          spent: project.spent,
          progress: project.progress,
          created_at: now
        });
      });
    }
    
    const { error: snapshotsError } = await supabase
      .from('spi_cpi_daily_snapshot')
      .upsert(snapshots, { onConflict: 'id' });
    
    if (snapshotsError) {
      console.log(`   ❌ Snapshots Error: ${snapshotsError.message}`);
    } else {
      console.log(`   ✅ ${snapshots.length} snapshots created`);
    }
    
    console.log('\n✅ การสร้างข้อมูลตัวอย่างสำเร็จสมบูรณ์!');
    console.log('📊 สรุประ:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Clients: ${clients.length}`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Milestones: ${milestones.length}`);
    console.log(`   Cashflow: ${cashflow.length}`);
    console.log(`   SPI/CPI Snapshots: ${snapshots.length}`);
    
    // Verify data was created
    console.log('\n🔍 ตรวจสอบข้อมูลที่สร้าง:');
    await verifyData(supabase);
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

async function verifyData(supabase) {
  const tables = ['users', 'clients', 'projects', 'milestones', 'cashflow', 'spi_cpi_daily_snapshot'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ${table}: Error - ${error.message}`);
    } else {
      console.log(`   ${table}: ${count} records`);
    }
  }
}

createDataWithAnonKey().catch(console.error);
