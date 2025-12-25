import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const users = [
  {
    email: 'thanongsak.th@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Thanongsak Thongkwid',
    role: 'ADMIN',
    position: 'Vice President',
    department: 'Project management',
  },
  {
    email: 'pratya.fu@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Pratya Fufueng',
    role: 'PROJECT_MANAGER',
    position: 'Senior Project Manager',
    department: 'Project management',
  },
  {
    email: 'sophonwith.va@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Sophonwith Valaisathien',
    role: 'PROJECT_MANAGER',
    position: 'Senior Project Manager',
    department: 'Project management',
  },
  {
    email: 'suthat.wa@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Suthat Wanprom',
    role: 'PROJECT_MANAGER',
    position: 'Project Manager',
    department: 'Project management',
  },
  {
    email: 'napapha.ti@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Napapha Tipaporn',
    role: 'PROJECT_MANAGER',
    position: 'Project Manager',
    department: 'Project management',
  },
  {
    email: 'thapana.ch@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Thapana Chatmanee',
    role: 'ADMIN',
    position: 'Project Manager',
    department: 'Project management',
  },
  {
    email: 'jakgrits.ph@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Jakgrits Phoongen',
    role: 'ADMIN',
    position: 'Project Manager',
    department: 'Project management',
  },
  {
    email: 'pannee.sa@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Pannee Sae-Chee',
    role: 'PROJECT_MANAGER',
    position: 'Project Manager',
    department: 'Project management',
  },
  {
    email: 'sasithon.su@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Sasithon Sukha',
    role: 'ADMIN',
    position: 'Project Coordinator',
    department: 'Sales Administration',
  },
  {
    email: 'nawin.bu@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Nawin Bunjoputsa',
    role: 'USER',
    position: 'Project Manager',
    department: 'Project management',
  },
  {
    email: 'pattaraprapa.ch@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Pattaraprapa Chotipattachakorn',
    role: 'PROJECT_MANAGER',
    position: 'Senior Project Manager',
    department: 'Project management',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
        position: userData.position,
        department: userData.department,
        status: 'active',
        timezone: 'Asia/Bangkok',
      },
    });

    console.log(`✅ Created user: ${user.email}`);
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
