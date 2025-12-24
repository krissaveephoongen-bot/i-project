import { Role } from '@prisma/client';
import prisma from '../lib/prisma';

const users = [
  {
    "email": "thanongsak.th@appworks.co.th",
    "password": "$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K",
    "name": "Thanongsak Thongkwid",
    "role": Role.ADMIN,
    "position": "Vice President",
    "department": "Project management"
  },
  {
    "email": "pratya.fu@appworks.co.th",
    "password": "$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K",
    "name": "Pratya Fufueng",
    "role": Role.PROJECT_MANAGER,
    "position": "Senior Project Manager",
    "department": "Project management"
  },
  {
    "email": "sophonwith.va@appworks.co.th",
    "password": "$2a$10$5LHiSUsUiJlBkLyNvlb5/.ymb.cyQfFEOMrKpdPPAxd0MOLFvOgqe",
    "name": "Sophonwith Valaisathien",
    "role": Role.PROJECT_MANAGER,
    "position": "Senior Project Manager",
    "department": "Project management"
  },
  {
    "email": "suthat.wa@appworks.co.th",
    "password": "$2a$10$CVc6OYoCpEDV9SWRN2gyYewdghP9nZLtAxZQce0qjuDLC7ImjzBDS",
    "name": "Suthat Wanprom",
    "role": Role.PROJECT_MANAGER,
    "position": "Project Manager",
    "department": "Project management"
  },
  {
    "email": "napapha.ti@appworks.co.th",
    "password": "$2a$10$rnh2ZABfssq8HL1p9Jn56.WrxO8RLdWqlCmUstiWatG6kVn2YUAWG",
    "name": "Napapha Tipaporn",
    "role": Role.PROJECT_MANAGER,
    "position": "Project Manager",
    "department": "Project management"
  },
  {
    "email": "thapana.ch@appworks.co.th",
    "password": "$2a$10$mW10t65N5C5igQH3hZx7/u6GMjx4yNMM800Y6L3cixTANs4nx1u0O",
    "name": "Thapana Chatmanee",
    "role": Role.ADMIN,
    "position": "Project Manager",
    "department": "Project management"
  },
  {
    "email": "jakgrits.ph@appworks.co.th",
    "password": "$2a$10$yW.odM7tSqm5R2GrVPxkYuFjAfdswb2BFK5FzYUSnuvaAbjHGZIOO",
    "name": "Jakgrits Phoongen",
    "role": Role.ADMIN,
    "position": "Project Manager",
    "department": "Project management"
  },
  {
    "email": "pannee.sa@appworks.co.th",
    "password": "$2a$10$h.H77awzLualYK3.SvS1sOwKuMG7r5ZAnywp0PXUH/FhFMXaL29fO",
    "name": "Pannee Sae-Chee",
    "role": Role.PROJECT_MANAGER,
    "position": "Project Manager",
    "department": "Project management"
  },
  {
    "email": "sasithon.su@appworks.co.th",
    "password": "$2a$10$SIaFuy93z3BfEhKCj9.bUOR26fsl8myU9808ctt32MZXWn1SJiISW",
    "name": "Sasithon Sukha",
    "role": Role.ADMIN,
    "position": "Project Coordinator",
    "department": "Sales Administration"
  },
  {
    "email": "nawin.bu@appworks.co.th",
    "password": "$2a$10$x5JyYGuFlCOQMpMWuEl2wONBMRVti7bmTly7zI8zkkL0wGMiV7rCC",
    "name": "Nawin Bunjoputsa",
    "role": Role.USER,
    "position": "Project Manager",
    "department": "Project management",
    "employeeCode": "0276"
  },
  {
    "email": "pattaraprapa.ch@appworks.co.th",
    "password": "$2a$10$Odd8TQ.AISv1AOhVjEaNR.ZXtDNyD93dRnQphK4NoG6FnHaJRB9WC",
    "name": "Pattaraprapa Chotipattachakorn",
    "role": Role.PROJECT_MANAGER,
    "position": "Senior Project Manager",
    "department": "Project management",
    "employeeCode": "0222"
  }
];

async function main() {
  console.log('Starting to seed users...');
  
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
          ...(userData.employeeCode && { employeeCode: userData.employeeCode })
        },
      });
      console.log(`✅ User created/updated: ${user.email}`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
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
