/**
 * Database Seeding Script
 * 
 * This script seeds the Supabase database with initial data for the i-Project system
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seedDatabase() {
  console.log('🚀 Starting database seeding...');

  try {
    // Clean existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning existing data...');
    await prisma.timeEntry.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.document.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.risk.deleteMany();
    await prisma.task.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();
    await prisma.financialData.deleteMany();

    // Seed users
    console.log('👤 Seeding users...');
    const adminUser = await prisma.user.create({
      data: {
        email: 'jakgrits.ph@appworks.co.th',
        password: await hashPassword('AppWorks@123!'),
        name: 'Jakgrits Ph.',
        role: 'admin',
        position: 'System Administrator',
        department: 'IT',
        employeeCode: 'EMP001',
        hourlyRate: 1500.00,
        phone: '+66-81-234-5678',
      },
    });

    const managerUser = await prisma.user.create({
      data: {
        email: 'manager@example.com',
        password: await hashPassword('AppWorks@123!'),
        name: 'Manager Mike',
        role: 'manager',
        position: 'Project Manager',
        department: 'PMO',
        employeeCode: 'EMP002',
        hourlyRate: 1200.00,
        phone: '+66-81-234-5679',
      },
    });

    const employeeUser = await prisma.user.create({
      data: {
        email: 'employee@example.com',
        password: await hashPassword('AppWorks@123!'),
        name: 'Employee Emma',
        role: 'employee',
        position: 'Software Engineer',
        department: 'Development',
        employeeCode: 'EMP003',
        hourlyRate: 800.00,
        phone: '+66-81-234-5680',
      },
    });

    // Seed clients
    console.log('🏢 Seeding clients...');
    const techCorpClient = await prisma.client.create({
      data: {
        name: 'TechCorp Industries',
        email: 'contact@techcorp.com',
        phone: '+66-2-123-4567',
      },
    });

    const globalFinanceClient = await prisma.client.create({
      data: {
        name: 'Global Finance Ltd',
        email: 'info@globalfinance.com',
        phone: '+66-2-234-5678',
      },
    });

    // Seed projects
    console.log('📁 Seeding projects...');
    const erpProject = await prisma.project.create({
      data: {
        name: 'Enterprise ERP Implementation',
        description: 'Complete ERP system implementation for TechCorp Industries',
        status: 'in_progress',
        progress: 65,
        progressPlan: 70,
        spi: 0.93,
        riskLevel: 'medium',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 15000000.00,
        spent: 9750000.00,
        remaining: 5250000.00,
        priority: 'high',
        category: 'Enterprise Software',
        managerId: managerUser.id,
        clientId: techCorpClient.id,
      },
    });

    const cloudProject = await prisma.project.create({
      data: {
        name: 'Cloud Migration Phase 2',
        description: 'Phase 2 of cloud infrastructure migration for Global Finance',
        status: 'in_progress',
        progress: 45,
        progressPlan: 50,
        spi: 0.90,
        riskLevel: 'low',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        budget: 8000000.00,
        spent: 3600000.00,
        remaining: 4400000.00,
        priority: 'medium',
        category: 'Infrastructure',
        managerId: managerUser.id,
        clientId: globalFinanceClient.id,
      },
    });

    // Seed tasks
    console.log('📋 Seeding tasks...');
    await prisma.task.createMany({
      data: [
        {
          title: 'Requirements Analysis',
          description: 'Gather and analyze business requirements',
          status: 'done',
          priority: 'high',
          dueDate: new Date('2024-02-15'),
          estimatedHours: 160.00,
          actualHours: 145.00,
          weight: 20.00,
          category: 'Analysis',
          projectId: erpProject.id,
          assignedTo: employeeUser.id,
          createdBy: managerUser.id,
        },
        {
          title: 'Database Design',
          description: 'Design database schema and architecture',
          status: 'done',
          priority: 'high',
          dueDate: new Date('2024-03-01'),
          estimatedHours: 200.00,
          actualHours: 180.00,
          weight: 25.00,
          category: 'Design',
          projectId: erpProject.id,
          assignedTo: employeeUser.id,
          createdBy: managerUser.id,
        },
        {
          title: 'Frontend Development',
          description: 'Develop user interface components',
          status: 'in_progress',
          priority: 'high',
          dueDate: new Date('2024-08-15'),
          estimatedHours: 400.00,
          actualHours: 250.00,
          weight: 30.00,
          category: 'Development',
          projectId: erpProject.id,
          assignedTo: employeeUser.id,
          createdBy: managerUser.id,
        },
      ],
    });

    // Seed risks
    console.log('⚠️ Seeding risks...');
    await prisma.risk.createMany({
      data: [
        {
          title: 'Scope Creep',
          description: 'Client continuously adding new requirements',
          impact: 'high',
          probability: 'medium',
          riskScore: 15,
          mitigationPlan: 'Implement change control process',
          status: 'open',
          project_id: erpProject.id,
          assigned_to: managerUser.id,
        },
        {
          title: 'Resource Availability',
          description: 'Limited availability of senior developers',
          impact: 'medium',
          probability: 'high',
          riskScore: 12,
          mitigationPlan: 'Cross-train junior developers',
          status: 'open',
          project_id: erpProject.id,
          assigned_to: managerUser.id,
        },
      ],
    });

    // Seed milestones
    console.log('🎯 Seeding milestones...');
    await prisma.milestone.createMany({
      data: [
        {
          title: 'Requirements Sign-off',
          description: 'Client signs off on requirements',
          dueDate: new Date('2024-02-28'),
          amount: 2000000.00,
          status: 'completed',
          progress: 100,
          projectId: erpProject.id,
        },
        {
          title: 'Phase 1 Delivery',
          description: 'Delivery of core modules',
          dueDate: new Date('2024-06-30'),
          amount: 5000000.00,
          status: 'pending',
          progress: 70,
          projectId: erpProject.id,
        },
      ],
    });

    // Seed time entries
    console.log('⏰ Seeding time entries...');
    await prisma.timeEntry.createMany({
      data: [
        {
          date: new Date('2024-01-15'),
          workType: 'project',
          projectId: erpProject.id,
          userId: employeeUser.id,
          startTime: '09:00',
          endTime: '17:00',
          hours: 8.00,
          description: 'Requirements analysis and documentation',
          status: 'approved',
        },
        {
          date: new Date('2024-01-16'),
          workType: 'project',
          projectId: erpProject.id,
          userId: employeeUser.id,
          startTime: '09:00',
          endTime: '17:00',
          hours: 8.00,
          description: 'Database schema design',
          status: 'approved',
        },
      ],
    });

    // Seed financial data
    console.log('💰 Seeding financial data...');
    await prisma.financialData.createMany({
      data: [
        {
          month: new Date('2024-01-01'),
          revenue: 2500000.00,
          cost: 1800000.00,
        },
        {
          month: new Date('2024-02-01'),
          revenue: 3200000.00,
          cost: 2100000.00,
        },
        {
          month: new Date('2024-03-01'),
          revenue: 2800000.00,
          cost: 1950000.00,
        },
      ],
    });

    // Create project memberships
    console.log('👥 Creating project memberships...');
    await prisma.projectMember.createMany({
      data: [
        {
          projectId: erpProject.id,
          userId: adminUser.id,
          role: 'admin',
        },
        {
          projectId: erpProject.id,
          userId: managerUser.id,
          role: 'manager',
        },
        {
          projectId: erpProject.id,
          userId: employeeUser.id,
          role: 'member',
        },
      ],
    });

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Seeding Summary:');
    console.log('- Users: 3');
    console.log('- Clients: 2');
    console.log('- Projects: 2');
    console.log('- Tasks: 3');
    console.log('- Risks: 2');
    console.log('- Milestones: 2');
    console.log('- Time Entries: 2');
    console.log('- Financial Data: 3');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };
