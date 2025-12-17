import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/lib/schema';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgres://user:password@localhost:5432/project_management';

  console.log('🔌 Connecting to database...');
  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

  const db = drizzle(pool, { schema });

  try {
    console.log('🗑️  Clearing all data...');

    // Delete in order of foreign key dependencies
    try {
      await db.delete(schema.comments).execute();
    } catch (e) {
      console.log('   ℹ️  comments table not found');
    }
    try {
      await db.delete(schema.activityLog).execute();
    } catch (e) {
      console.log('   ℹ️  activity_log table not found');
    }
    try {
      await db.delete(schema.timeEntries).execute();
    } catch (e) {
      console.log('   ℹ️  time_entries table not found');
    }
    try {
      await db.delete(schema.expenses).execute();
    } catch (e) {
      console.log('   ℹ️  expenses table not found');
    }
    try {
      await db.delete(schema.budgetRevisions).execute();
    } catch (e) {
      console.log('   ℹ️  budget_revisions table not found');
    }
    try {
      await db.delete(schema.tasks).execute();
    } catch (e) {
      console.log('   ℹ️  tasks table not found');
    }
    try {
      await db.delete(schema.projects).execute();
    } catch (e) {
      console.log('   ℹ️  projects table not found');
    }
    try {
      await db.delete(schema.clients).execute();
    } catch (e) {
      console.log('   ℹ️  clients table not found');
    }
    try {
      await db.delete(schema.users).execute();
    } catch (e) {
      console.log('   ℹ️  users table not found');
    }

    console.log('✅ Database cleared');

    // Create users (Team Members)
    console.log('👥 Creating team members...');
    const users = [
      {
        name: 'สมชาย ผลการ์ด',
        email: 'somchai@company.com',
        role: 'admin',
      },
      {
        name: 'จิรา พนมปลาย',
        email: 'chira@company.com',
        role: 'manager',
      },
      {
        name: 'ณัฐวิทย์ สยามวิวัฒน์',
        email: 'natthawit@company.com',
        role: 'developer',
      },
      {
        name: 'ณฐา ศรีนวล',
        email: 'natha@company.com',
        role: 'developer',
      },
      {
        name: 'วิชญา ประดิษฐ์',
        email: 'wichya@company.com',
        role: 'designer',
      },
      {
        name: 'ปรชา สมประสิทธิ์',
        email: 'pracha@company.com',
        role: 'qa',
      },
    ];

    const createdUsers = await Promise.all(
      users.map((user) =>
        db
          .insert(schema.users)
          .values(user)
          .returning()
          .then((res) => res[0])
      )
    );

    console.log(`✅ Created ${createdUsers.length} users`);

    // Create client
    console.log('🏢 Creating client...');
    const [client] = await db
      .insert(schema.clients)
      .values({
        name: 'บริษัท ไทยเทค โซลูชั่น จำกัด',
        email: 'contact@thaitech.com',
        phone: '+66-2-123-4567',
        address: '123 ถนนวิทยุ เขตลุมพินี กรุงเทพ 10330',
        taxId: '0105555012345',
        notes: 'ลูกค้าหลักสำหรับโครงการซอฟต์แวร์',
      })
      .returning();

    console.log('✅ Created client');

    // Create comprehensive project
    console.log('📊 Creating comprehensive project...');
    const [project] = await db
      .insert(schema.projects)
      .values({
        name: 'ระบบจัดการโครงการ (Project Management System)',
        code: 'PMS-2025-001',
        description:
          'พัฒนาระบบจัดการโครงการแบบครบถ้วน พร้อมฟีเจอร์ติดตามความคืบหน้า เวลาทำงาน ค่าใช้จ่าย และการรายงานผล',
        status: 'done' as const,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        budget: '500000' as any,
        spent: '385000' as any,
        remaining: '115000' as any,
        managerId: createdUsers[1].id,
        clientId: client.id,
        hourlyRate: '500' as any,
      })
      .returning();

    console.log('✅ Created project');

    // Create tasks for the project
    console.log('✅ Creating tasks...');
    const tasks = [
      {
        title: 'วิเคราะห์และออกแบบระบบ',
        description: 'วิเคราะห์ความต้องการ ออกแบบระบบสถาปัตยกรรม และสร้าง wireframe',
        status: 'done' as const,
        priority: 'high' as const,
        weight: '2.0' as any,
        dueDate: new Date('2025-02-28'),
        completedAt: new Date('2025-02-25'),
        estimatedHours: '80' as any,
        actualHours: '85' as any,
        projectId: project.id,
        assignedTo: createdUsers[1].id,
        createdBy: createdUsers[0].id,
      },
      {
        title: 'พัฒนา Frontend',
        description: 'สร้าง UI components และ React pages สำหรับระบบจัดการโครงการ',
        status: 'done' as const,
        priority: 'high' as const,
        weight: '2.5' as any,
        dueDate: new Date('2025-05-31'),
        completedAt: new Date('2025-05-28'),
        estimatedHours: '200' as any,
        actualHours: '195' as any,
        projectId: project.id,
        assignedTo: createdUsers[2].id,
        createdBy: createdUsers[0].id,
      },
      {
        title: 'พัฒนา Backend API',
        description: 'สร้าง REST API และ database schema พร้อม business logic',
        status: 'done' as const,
        priority: 'high' as const,
        weight: '2.5' as any,
        dueDate: new Date('2025-05-31'),
        completedAt: new Date('2025-05-27'),
        estimatedHours: '200' as any,
        actualHours: '205' as any,
        projectId: project.id,
        assignedTo: createdUsers[3].id,
        createdBy: createdUsers[0].id,
      },
      {
        title: 'ออกแบบและพัฒนา UI/UX',
        description: 'ออกแบบ visual design และ user experience สำหรับแอปพลิเคชัน',
        status: 'done' as const,
        priority: 'medium' as const,
        weight: '1.5' as any,
        dueDate: new Date('2025-04-30'),
        completedAt: new Date('2025-04-28'),
        estimatedHours: '120' as any,
        actualHours: '115' as any,
        projectId: project.id,
        assignedTo: createdUsers[4].id,
        createdBy: createdUsers[0].id,
      },
      {
        title: 'ทดสอบและ QA',
        description: 'ทดสอบระบบทั้งหมด รวมถึง unit test, integration test และ UAT',
        status: 'done' as const,
        priority: 'high' as const,
        weight: '2.0' as any,
        dueDate: new Date('2025-07-31'),
        completedAt: new Date('2025-07-30'),
        estimatedHours: '160' as any,
        actualHours: '155' as any,
        projectId: project.id,
        assignedTo: createdUsers[5].id,
        createdBy: createdUsers[0].id,
      },
      {
        title: 'ปรับปรุงประสิทธิภาพและความปลอดภัย',
        description: 'ปรับปรุง performance, security และเพิ่มเติม features ตามความต้องการ',
        status: 'done' as const,
        priority: 'medium' as const,
        weight: '1.5' as any,
        dueDate: new Date('2025-08-31'),
        completedAt: new Date('2025-08-29'),
        estimatedHours: '100' as any,
        actualHours: '98' as any,
        projectId: project.id,
        assignedTo: createdUsers[2].id,
        createdBy: createdUsers[0].id,
      },
      {
        title: 'การฝึกอบรมและเอกสาร',
        description: 'เขียนเอกสารวิธีใช้ เอกสารเทคนิค และจัดฝึกอบรมให้กับผู้ใช้งาน',
        status: 'done' as const,
        priority: 'medium' as const,
        weight: '1.0' as any,
        dueDate: new Date('2025-09-30'),
        completedAt: new Date('2025-09-28'),
        estimatedHours: '60' as any,
        actualHours: '58' as any,
        projectId: project.id,
        assignedTo: createdUsers[1].id,
        createdBy: createdUsers[0].id,
      },
      {
        title: 'ปรับใช้ (Deployment) และ Go-Live',
        description: 'ทำการ deploy ระบบไปยัง production และ go-live ให้กับลูกค้า',
        status: 'done' as const,
        priority: 'high' as const,
        weight: '1.5' as any,
        dueDate: new Date('2025-10-31'),
        completedAt: new Date('2025-10-30'),
        estimatedHours: '80' as any,
        actualHours: '77' as any,
        projectId: project.id,
        assignedTo: createdUsers[1].id,
        createdBy: createdUsers[0].id,
      },
    ];

    const createdTasks = await Promise.all(
      tasks.map((task) =>
        db
          .insert(schema.tasks)
          .values(task)
          .returning()
          .then((res) => res[0])
      )
    );

    console.log(`✅ Created ${createdTasks.length} tasks`);

    // Create time entries (Timesheet)
    console.log('⏱️  Creating timesheet entries...');
    const timeEntries = [
      // January - Frontend Development
      {
        date: new Date('2025-01-06'),
        workType: 'project' as const,
        projectId: project.id,
        taskId: createdTasks[1].id, // Frontend task
        userId: createdUsers[2].id, // Natthawit
        startTime: '08:00',
        endTime: '17:00',
        hours: '8' as any,
        description: 'พัฒนา Dashboard component และ layout',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-01-06'),
      },
      {
        date: new Date('2025-01-07'),
        workType: 'project' as const,
        projectId: project.id,
        taskId: createdTasks[1].id,
        userId: createdUsers[2].id,
        startTime: '08:00',
        endTime: '17:30',
        hours: '8.5' as any,
        description: 'ปรับปรุง responsive design และการใช้ Tailwind CSS',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-01-07'),
      },
      {
        date: new Date('2025-01-08'),
        workType: 'project' as const,
        projectId: project.id,
        taskId: createdTasks[1].id,
        userId: createdUsers[2].id,
        startTime: '08:00',
        endTime: '18:00',
        hours: '9' as any,
        description: 'เชื่อมต่อ API endpoints และจัดการ state management',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-01-08'),
      },
      // Backend Development
      {
        date: new Date('2025-01-06'),
        workType: 'project' as const,
        projectId: project.id,
        taskId: createdTasks[2].id, // Backend task
        userId: createdUsers[3].id, // Natha
        startTime: '08:00',
        endTime: '17:00',
        hours: '8' as any,
        description: 'ตั้งค่า Express.js และ PostgreSQL database',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-01-06'),
      },
      {
        date: new Date('2025-01-07'),
        workType: 'project' as const,
        projectId: project.id,
        taskId: createdTasks[2].id,
        userId: createdUsers[3].id,
        startTime: '08:00',
        endTime: '19:00',
        hours: '10' as any,
        description: 'สร้าง REST API endpoints สำหรับ projects และ tasks',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-01-07'),
      },
      {
        date: new Date('2025-01-08'),
        workType: 'project' as const,
        projectId: project.id,
        taskId: createdTasks[2].id,
        userId: createdUsers[3].id,
        startTime: '09:00',
        endTime: '18:00',
        hours: '8' as any,
        description: 'เพิ่ม authentication และ authorization middleware',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-01-08'),
      },
      // Design
      {
        date: new Date('2025-01-06'),
        workType: 'project' as const,
        projectId: project.id,
        taskId: createdTasks[3].id, // Design task
        userId: createdUsers[4].id, // Wichya
        startTime: '09:00',
        endTime: '18:00',
        hours: '8' as any,
        description: 'สร้าง color palette และ design system',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-01-06'),
      },
      {
        date: new Date('2025-01-07'),
        workType: 'project' as const,
        projectId: project.id,
        taskId: createdTasks[3].id,
        userId: createdUsers[4].id,
        startTime: '09:00',
        endTime: '18:00',
        hours: '8' as any,
        description: 'ออกแบบ UI mockups ใน Figma',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-01-07'),
      },
      // PM oversight
      {
        date: new Date('2025-01-06'),
        workType: 'project' as const,
        projectId: project.id,
        taskId: createdTasks[0].id, // Design task
        userId: createdUsers[1].id, // PM
        startTime: '08:00',
        endTime: '12:00',
        hours: '4' as any,
        description: 'จัดประชุมวางแผนแบบ Agile และ sprint planning',
        status: 'approved' as const,
        approvedBy: createdUsers[0].id,
        approvedAt: new Date('2025-01-06'),
      },
    ];

    const createdTimeEntries = await Promise.all(
      timeEntries.map((entry) =>
        db
          .insert(schema.timeEntries)
          .values(entry)
          .returning()
          .then((res) => res[0])
      )
    );

    console.log(`✅ Created ${createdTimeEntries.length} timesheet entries`);

    // Create expenses
    console.log('💰 Creating expenses...');
    const expenses = [
      {
        date: new Date('2025-01-15'),
        projectId: project.id,
        taskId: createdTasks[2].id,
        userId: createdUsers[3].id,
        amount: '2500' as any,
        category: 'supplies' as const,
        description: 'ซื้อ IDE license (IntelliJ IDEA) และ development tools',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-01-16'),
        notes: 'ใบเสร็จ: INV-001-2025',
      },
      {
        date: new Date('2025-02-01'),
        projectId: project.id,
        taskId: createdTasks[4].id,
        userId: createdUsers[5].id,
        amount: '5000' as any,
        category: 'equipment' as const,
        description: 'ซื้อ testing tools และ software licenses',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-02-02'),
        notes: 'ใบเสร็จ: INV-002-2025',
      },
      {
        date: new Date('2025-02-10'),
        projectId: project.id,
        taskId: createdTasks[0].id,
        userId: createdUsers[2].id,
        amount: '3000' as any,
        category: 'training' as const,
        description: 'การศึกษาวิธีการ React advanced patterns',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-02-11'),
        notes: 'online course - Udemy',
      },
      {
        date: new Date('2025-03-05'),
        projectId: project.id,
        taskId: createdTasks[2].id,
        userId: createdUsers[1].id,
        amount: '4500' as any,
        category: 'travel' as const,
        description: 'ค่าเดินทางไปประชุมลูกค้าที่กรุงเทพ',
        status: 'approved' as const,
        approvedBy: createdUsers[0].id,
        approvedAt: new Date('2025-03-06'),
        notes: 'รวม: รถแท็กซี่, รถไฟฟ้า, อื่นๆ',
      },
      {
        date: new Date('2025-04-01'),
        projectId: project.id,
        taskId: createdTasks[5].id,
        userId: createdUsers[4].id,
        amount: '8000' as any,
        category: 'supplies' as const,
        description: 'ออกแบบและพิมพ์ marketing materials',
        status: 'approved' as const,
        approvedBy: createdUsers[1].id,
        approvedAt: new Date('2025-04-02'),
        notes: 'รวมการออกแบบ สัญญาณ และวิดีโอ',
      },
      {
        date: new Date('2025-05-15'),
        projectId: project.id,
        taskId: createdTasks[4].id,
        userId: createdUsers[5].id,
        amount: '12000' as any,
        category: 'equipment' as const,
        description: 'ซื้อ test automation tools และ CI/CD services',
        status: 'approved' as const,
        approvedBy: createdUsers[0].id,
        approvedAt: new Date('2025-05-16'),
        notes: 'GitHub Actions, Jenkins, Selenium licenses',
      },
      {
        date: new Date('2025-06-01'),
        projectId: project.id,
        taskId: createdTasks[6].id,
        userId: createdUsers[1].id,
        amount: '6000' as any,
        category: 'training' as const,
        description: 'การฝึกอบรมทีมสำหรับการใช้งานระบบใหม่',
        status: 'pending' as const,
        approvedBy: null,
        approvedAt: null,
        notes: 'อยู่ระหว่างการอนุมัติ',
      },
    ];

    const createdExpenses = await Promise.all(
      expenses.map((expense) =>
        db
          .insert(schema.expenses)
          .values(expense)
          .returning()
          .then((res) => res[0])
      )
    );

    console.log(`✅ Created ${createdExpenses.length} expenses`);

    // Create budget revisions
    console.log('📈 Creating budget revisions...');
    const budgetRevisions = [
      {
        projectId: project.id,
        previousBudget: '450000' as any,
        newBudget: '500000' as any,
        reason: 'เพิ่มคุณสมบัติและการปรับปรุงตามความต้องการของลูกค้า',
        changedBy: createdUsers[1].id,
      },
    ];

    await Promise.all(
      budgetRevisions.map((revision) =>
        db
          .insert(schema.budgetRevisions)
          .values(revision)
          .returning()
      )
    );

    console.log('✅ Created budget revisions');

    // Create activity logs
    console.log('📝 Creating activity logs...');
    const activities = [
      {
        entityType: 'project',
        entityId: project.id,
        type: 'create' as const,
        action: 'สร้างโครงการใหม่',
        description: 'สร้างโครงการ PMS-2025-001',
        userId: createdUsers[0].id,
        changes: { status: 'created' },
      },
      {
        entityType: 'project',
        entityId: project.id,
        type: 'status_change' as const,
        action: 'เปลี่ยนสถานะโครงการ',
        description: 'เปลี่ยนจาก in_progress เป็น done',
        userId: createdUsers[1].id,
        changes: { from: 'in_progress', to: 'done' },
      },
      {
        entityType: 'task',
        entityId: createdTasks[0].id,
        type: 'status_change' as const,
        action: 'เสร็จสิ้นงาน',
        description: 'ทำให้เสร็จสิ้นการวิเคราะห์และออกแบบระบบ',
        userId: createdUsers[1].id,
        changes: { status: 'done' },
      },
    ];

    await Promise.all(
      activities.map((activity) =>
        db
          .insert(schema.activityLog)
          .values(activity)
          .returning()
      )
    );

    console.log('✅ Created activity logs');

    console.log('\n✨ ✨ ✨ DATABASE SEEDING COMPLETE ✨ ✨ ✨\n');
    console.log('📊 Summary:');
    console.log(`   ✅ Users: ${createdUsers.length}`);
    console.log(`   ✅ Projects: 1`);
    console.log(`   ✅ Tasks: ${createdTasks.length}`);
    console.log(`   ✅ Time Entries: ${createdTimeEntries.length}`);
    console.log(`   ✅ Expenses: ${createdExpenses.length}`);
    console.log(`   ✅ Budget Revisions: ${budgetRevisions.length}`);
    console.log(`   ✅ Activity Logs: ${activities.length}`);
    console.log('\n💰 Project Budget Summary:');
    console.log(`   Budget: ฿500,000.00`);
    console.log(`   Spent: ฿385,000.00`);
    console.log(`   Remaining: ฿115,000.00`);
    console.log(`   Completion: 77.0%\n`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase().catch(console.error);
