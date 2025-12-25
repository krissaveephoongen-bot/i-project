const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default users
  const defaultUsers = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@1234',
      role: 'ADMIN',
    },
    {
      name: 'Project Manager',
      email: 'pm@example.com',
      password: 'Manager@1234',
      role: 'PROJECT_MANAGER',
    },
    {
      name: 'Team Lead',
      email: 'lead@example.com',
      password: 'Lead@1234',
      role: 'TEAM_LEAD',
    },
    {
      name: 'Developer',
      email: 'dev@example.com',
      password: 'Dev@1234',
      role: 'DEVELOPER',
    },
  ];

  // Hash passwords and create users
  for (const userData of defaultUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        status: 'active',
      },
    });
    console.log(`✅ Created/Updated user: ${user.email} (${user.role})`);
  }

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
