const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

const users = [
  {
    email: 'thanongsak.th@appworks.co.th',
    password: '$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K',
    name: 'Thanongsak Thongkwid',
    role: 'ADMIN'
  },
  {
    email: 'pratya.fu@appworks.co.th',
    password: '$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K',
    name: 'Pratya Fufueng',
    role: 'MANAGER'
  },
  {
    email: 'sophonwith.va@appworks.co.th',
    password: '$2a$10$5LHiSUsUiJlBkLyNvlb5/.ymb.cyQfFEOMrKpdPPAxd0MOLFvOgqe',
    name: 'Sophonwith Valaisathien',
    role: 'MANAGER'
  },
  {
    email: 'suthat.wa@appworks.co.th',
    password: '$2a$10$CVc6OYoCpEDV9SWRN2gyYewdghP9nZLtAxZQce0qjuDLC7ImjzBDS',
    name: 'Suthat Wanprom',
    role: 'MANAGER'
  },
  {
    email: 'napapha.ti@appworks.co.th',
    password: '$2a$10$rnh2ZABfssq8HL1p9Jn56.WrxO8RLdWqlCmUstiWatG6kVn2YUAWG',
    name: 'Napapha Tipaporn',
    role: 'MANAGER'
  },
  {
    email: 'thapana.ch@appworks.co.th',
    password: '$2a$10$mW10t65N5C5igQH3hZx7/u6GMjx4yNMM800Y6L3cixTANs4nx1u0O',
    name: 'Thapana Chatmanee',
    role: 'ADMIN'
  },
  {
    email: 'jakgrits.ph@appworks.co.th',
    password: '$2a$10$yW.odM7tSqm5R2GrVPxkYuFjAfdswb2BFK5FzYUSnuvaAbjHGZIOO',
    name: 'Jakgrits Phoongen',
    role: 'ADMIN'
  },
  {
    email: 'pannee.sa@appworks.co.th',
    password: '$2a$10$h.H77awzLualYK3.SvS1sOwKuMG7r5ZAnywp0PXUH/FhFMXaL29fO',
    name: 'Pannee Sae-Chee',
    role: 'MANAGER'
  },
  {
    email: 'sasithon.su@appworks.co.th',
    password: '$2a$10$SIaFuy93z3BfEhKCj9.bUOR26fsl8myU9808ctt32MZXWn1SJiISW',
    name: 'Sasithon Sukha',
    role: 'ADMIN'
  },
  {
    email: 'nawin.bu@appworks.co.th',
    password: '$2a$10$x5JyYGuFlCOQMpMWuEl2wONBMRVti7bmTly7zI8zkkL0wGMiV7rCC',
    name: 'Nawin Bunjoputsa',
    role: 'USER'
  },
  {
    email: 'pattaraprapa.ch@appworks.co.th',
    password: '$2a$10$Odd8TQ.AISv1AOhVjEaNR.ZXtDNyD93dRnQphK4NoG6FnHaJRB9WC',
    name: 'Pattaraprapa Chotipattachakorn',
    role: 'MANAGER'
  }
];

// Manager data with additional information
const managerData = {
  'thanongsak.th@appworks.co.th': {
    position: 'Vice President',
    department: 'Project management'
  },
  'pratya.fu@appworks.co.th': {
    position: 'Senior Project Manager',
    department: 'Project management'
  },
  'sophonwith.va@appworks.co.th': {
    position: 'Senior Project Manager',
    department: 'Project management'
  },
  'suthat.wa@appworks.co.th': {
    position: 'Project Manager',
    department: 'Project management'
  },
  'napapha.ti@appworks.co.th': {
    position: 'Project Manager',
    department: 'Project management'
  },
  'thapana.ch@appworks.co.th': {
    position: 'Project Manager',
    department: 'Project management'
  },
  'jakgrits.ph@appworks.co.th': {
    position: 'Project Manager',
    department: 'Project management'
  },
  'pannee.sa@appworks.co.th': {
    position: 'Project Manager',
    department: 'Project management'
  },
  'sasithon.su@appworks.co.th': {
    position: 'Project Coordinator',
    department: 'Sales Administration'
  },
  'pattaraprapa.ch@appworks.co.th': {
    position: 'Senior Project Manager',
    department: 'Project management'
  }
};

async function seedUsers() {
  try {
    console.log('Starting to seed users...');
    
    // Check if users already exist
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: users.map(user => user.email)
        }
      },
      select: {
        email: true
      }
    });

    const existingEmails = new Set(existingUsers.map(user => user.email));
    const newUsers = users.filter(user => !existingEmails.has(user.email));

    if (newUsers.length === 0) {
      console.log('All users already exist in the database.');
      return;
    }

    console.log(`Found ${newUsers.length} new users to add.`);
    
    // Create users in a transaction
    const result = await prisma.$transaction(
      newUsers.map(user => 
        prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            password: user.password, // Using pre-hashed passwords
            role: user.role
          }
        })
      )
    );

    console.log(`\n✅ Successfully added ${result.length} users to the database.`);
    
    // Create ProjectManager entries for managers and admins
    const managers = result.filter(user => 
      (user.role === 'MANAGER' || user.role === 'ADMIN') && managerData[user.email]
    );
    
    if (managers.length > 0) {
      console.log(`\nCreating ProjectManager entries for ${managers.length} managers/admins...`);
      
      for (const manager of managers) {
        try {
          const managerInfo = managerData[manager.email];
          console.log(`Creating ProjectManager for ${manager.email} (${manager.role})...`);
          
          // Check if ProjectManager already exists for this user
          const existingManager = await prisma.projectManager.findUnique({
            where: { userId: manager.id }
          });
          
          if (!existingManager) {
            await prisma.projectManager.create({
              data: {
                userId: manager.id,
                managerRole: managerInfo.position || 'Project Manager',
                department: managerInfo.department || 'Project Management',
                status: 'active',
                isAvailable: true,
                maxProjects: 5,
                phone: null,
                joinDate: new Date(),
                lastActive: new Date()
              }
            });
            console.log(`✅ Created ProjectManager for ${manager.email}`);
          } else {
            console.log(`ℹ️ ProjectManager already exists for ${manager.email}`);
          }
        } catch (error) {
          console.error(`❌ Error creating ProjectManager for ${manager.email}:`, error.message);
        }
      }
      
      console.log(`✅ Completed creating ProjectManager entries`);
    }
    
  } catch (error) {
    console.error('\n❌ Error seeding users:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedUsers();
