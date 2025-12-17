const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

async function checkUsersAndManagers() {
  try {
    console.log('🔍 Checking users and their project manager status...');
    
    // Get all users with their project manager details
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        projectManager: {
          select: {
            id: true,
            managerRole: true,
            department: true,
            status: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('\n👥 Users and Their Project Manager Status:');
    console.log('='.repeat(120));
    console.log(
      'ID'.padEnd(38),
      '|',
      'Name'.padEnd(25),
      '|',
      'Email'.padEnd(30),
      '|',
      'Role'.padEnd(10),
      '|',
      'Is Manager?'.padEnd(10),
      '|',
      'Manager Role'.padEnd(20),
      '|',
      'Department'
    );
    console.log('='.repeat(120));

    users.forEach(user => {
      console.log(
        user.id,
        '|',
        String(user.name || '').padEnd(25),
        '|',
        String(user.email || '').padEnd(30),
        '|',
        String(user.role || '').padEnd(10),
        '|',
        (user.projectManager ? '✅' : '❌').padEnd(10),
        '|',
        String(user.projectManager?.managerRole || '-').padEnd(20),
        '|',
        user.projectManager?.department || '-'
      );
    });

    console.log('='.repeat(120) + '\n');

    // Get all project managers with their user details
    const projectManagers = await prisma.projectManager.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    console.log('\n👔 Project Managers List:');
    console.log('='.repeat(120));
    console.log(
      'Manager ID'.padEnd(38),
      '|',
      'User ID'.padEnd(38),
      '|',
      'Name'.padEnd(25),
      '|',
      'Role'.padEnd(10),
      '|',
      'Manager Role'.padEnd(20),
      '|',
      'Department'
    );
    console.log('='.repeat(120));

    projectManagers.forEach(pm => {
      console.log(
        pm.id,
        '|',
        pm.userId,
        '|',
        String(pm.user?.name || '').padEnd(25),
        '|',
        String(pm.user?.role || '').padEnd(10),
        '|',
        String(pm.managerRole || '').padEnd(20),
        '|',
        pm.department || '-'
      );
    });

    console.log('='.repeat(120));
    console.log(`\n✅ Found ${users.length} users in total`);
    console.log(`✅ Found ${projectManagers.length} project managers`);
    
  } catch (error) {
    console.error('\n❌ Error checking users and managers:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
checkUsersAndManagers();
