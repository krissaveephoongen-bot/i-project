// @ts-check
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const users = [
  {
    "email": "thanongsak.th@appworks.co.th",
    "password": "$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K",
    "name": "Thanongsak Thongkwid",
    "role": "ADMIN",
    "position": "Vice President",
    "department": "Project management"
  },
  {
    "email": "pratya.fu@appworks.co.th",
    "password": "$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K",
    "name": "Pratya Fufueng",
    "role": "MANAGER",
    "position": "Senior Project Manager",
    "department": "Project management"
  },
  {
    "email": "sophonwith.va@appworks.co.th",
    "password": "$2a$10$5LHiSUsUiJlBkLyNvlb5/.ymb.cyQfFEOMrKpdPPAxd0MOLFvOgqe",
    "name": "Sophonwith Valaisathien",
    "role": "MANAGER",
    "position": "Senior Project Manager",
    "department": "Project management"
  },
  {
    "email": "suthat.wa@appworks.co.th",
    "password": "$2a$10$CVc6OYoCpEDV9SWRN2gyYewdghP9nZLtAxZQce0qjuDLC7ImjzBDS",
    "name": "Suthat Wanprom",
    "role": "MANAGER",
    "position": "Project Manager",
    "department": "Project management"
  },
  {
    "email": "napapha.ti@appworks.co.th",
    "password": "$2a$10$rnh2ZABfssq8HL1p9Jn56.WrxO8RLdWqlCmUstiWatG6kVn2YUAWG",
    "name": "Napapha Tipaporn",
    "role": "MANAGER",
    "position": "Project Manager",
    "department": "Project management"
  },
  {
    "email": "thapana.ch@appworks.co.th",
    "password": "$2a$10$mW10t65N5C5igQH3hZx7/u6GMjx4yNMM800Y6L3cixTANs4nx1u0O",
    "name": "Thapana Chatmanee",
    "role": "ADMIN",
    "position": "Project Manager",
    "department": "Project management"
  },
  {
    "email": "jakgrits.ph@appworks.co.th",
    "password": "$2a$10$yW.odM7tSqm5R2GrVPxkYuFjAfdswb2BFK5FzYUSnuvaAbjHGZIOO",
    "name": "Jakgrits Phoongen",
    "role": "ADMIN",
    "position": "Project Manager",
    "department": "Project management"
  },
  {
    "email": "pannee.sa@appworks.co.th",
    "password": "$2a$10$h.H77awzLualYK3.SvS1sOwKuMG7r5ZAnywp0PXUH/FhFMXaL29fO",
    "name": "Pannee Sae-Chee",
    "role": "MANAGER",
    "position": "Project Manager",
    "department": "Project management"
  },
  {
    "email": "sasithon.su@appworks.co.th",
    "password": "$2a$10$SIaFuy93z3BfEhKCj9.bUOR26fsl8myU9808ctt32MZXWn1SJiISW",
    "name": "Sasithon Sukha",
    "role": "ADMIN",
    "position": "Project Coordinator",
    "department": "Sales Administration"
  },
  {
    "email": "nawin.bu@appworks.co.th",
    "password": "$2a$10$x5JyYGuFlCOQMpMWuEl2wONBMRVti7bmTly7zI8zkkL0wGMiV7rCC",
    "name": "Nawin Bunjoputsa",
    "role": "USER",
    "position": "Project Manager",
    "department": "Project management"
  },
  {
    "email": "pattaraprapa.ch@appworks.co.th",
    "password": "$2a$10$Odd8TQ.AISv1AOhVjEaNR.ZXtDNyD93dRnQphK4NoG6FnHaJRB9WC",
    "name": "Pattaraprapa Chotipattachakorn",
    "role": "MANAGER",
    "position": "Senior Project Manager",
    "department": "Project management"
  }
];

async function main() {
  console.log('Starting user migration...');
  
  // Clean up existing users
  console.log('Cleaning up existing users...');
  await prisma.user.deleteMany({}).catch(() => {
    console.log('No existing users to delete');
  });
  console.log('✅ Existing users deleted');

  // Process each user
  for (const userData of users) {
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: userData.password,
          role: userData.role,
          position: userData.position || null,
          department: userData.department || null,
          status: 'active',
          timezone: 'Asia/Bangkok'
        },
      });
      console.log(`✅ User created: ${user.email} (${user.id})`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }

  console.log('✅ User migration completed!');
}

main()
  .catch((e) => {
    console.error('❌ Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {
      console.log('Prisma client disconnected');
    });
  });
