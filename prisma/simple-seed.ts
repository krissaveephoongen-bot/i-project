import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

async function main() {
  console.log('Starting to seed users...');

  const users = [
    {
      email: 'admin@company.com',
      password: '$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K',
      name: 'Admin User',
      role: Role.ADMIN,
      position: 'Administrator',
      department: 'IT'
    },
    {
      email: 'manager@company.com',
      password: '$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K',
      name: 'Project Manager',
      role: Role.PROJECT_MANAGER,
      position: 'Project Manager',
      department: 'Project Management'
    },
    {
      email: 'dev@company.com',
      password: '$2a$10$5LHiSUsUiJlBkLyNvlb5/.ymb.cyQfFEOMrKpdPPAxd0MOLFvOgqe',
      name: 'Developer',
      role: Role.DEVELOPER,
      position: 'Software Developer',
      department: 'Development'
    }
  ];

  for (const userData of users) {
    try {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          position: userData.position,
          department: userData.department,
          status: 'active',
        },
      });
      console.log(`✅ User created/updated: ${user.email}`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }

  // Create a sample project
  try {
    const project = await prisma.project.upsert({
      where: { code: 'SAMPLE-001' },
      update: {},
      create: {
        name: 'Sample Project',
        code: 'SAMPLE-001',
        description: 'A sample project for testing',
        budget: 100000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'IN_PROGRESS',
        priority: 'medium',
        progress: 25,
      },
    });
    console.log(`✅ Project created: ${project.name}`);
  } catch (error) {
    console.error('❌ Error creating project:', error);
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });