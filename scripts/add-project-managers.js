const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

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

async function addProjectManagers() {
  try {
    console.log('🔍 Finding users who should be project managers...');
    
    // Get all users who are managers or admins
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'MANAGER' },
          { role: 'ADMIN' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        projectManager: true
      }
    });

    console.log(`\nFound ${users.length} users with MANAGER or ADMIN role`);
    
    let createdCount = 0;
    let existingCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const managerInfo = managerData[user.email];
        
        if (!managerInfo) {
          console.log(`⚠️ No manager data found for ${user.email}, skipping...`);
          continue;
        }

        console.log(`\nProcessing ${user.name} (${user.email})...`);
        
        // Check if ProjectManager already exists for this user
        if (user.projectManager) {
          console.log(`ℹ️ ProjectManager already exists for ${user.email}`);
          existingCount++;
          continue;
        }
        
        // Create ProjectManager record
        console.log(`Creating ProjectManager for ${user.email}...`);
        
        await prisma.projectManager.create({
          data: {
            userId: user.id,
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
        
        console.log(`✅ Created ProjectManager for ${user.email}`);
        createdCount++;
        
      } catch (error) {
        console.error(`❌ Error processing ${user.email}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log('='.repeat(50));
    console.log(`Total users processed: ${users.length}`);
    console.log(`New ProjectManagers created: ${createdCount}`);
    console.log(`Existing ProjectManagers: ${existingCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Error adding project managers:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addProjectManagers();
