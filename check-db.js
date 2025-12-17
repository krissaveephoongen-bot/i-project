const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://neondb_owner:npg_6FSH4YyQIoeb@ep-muddy-cherry-ah612m1a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&connection_limit=1'
      }
    }
  });

  try {
    // Test the connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    // Count users
    const userCount = await prisma.user.count();
    console.log(`\n📊 Total users in the database: ${userCount}`);

    if (userCount > 0) {
      // Get all users
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log('\n👥 User List:');
      console.log('='.repeat(100));
      console.log(
        'ID'.padEnd(38),
        '|',
        'Name'.padEnd(20),
        '|',
        'Email'.padEnd(25),
        '|',
        'Role'.padEnd(10),
        '|',
        'Created At'
      );
      console.log('='.repeat(100));

      users.forEach(user => {
        console.log(
          user.id,
          '|',
          String(user.name || '').padEnd(20),
          '|',
          String(user.email || '').padEnd(25),
          '|',
          String(user.role || '').padEnd(10),
          '|',
          user.createdAt.toLocaleString('th-TH')
        );
      });

      console.log('='.repeat(100) + '\n');
    }

  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
