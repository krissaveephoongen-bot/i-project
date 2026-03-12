// Verify users data and schema
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUsers() {
  try {
    console.log('🔍 Checking users table...\n');

    // Count users
    const userCount = await prisma.users.count();
    console.log(`✅ Total users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('⚠️  No users found in database!');
      console.log('\nNeed to seed users data first.');
      console.log('You can:');
      console.log('1. Restore from backup');
      console.log('2. Seed new data');
      console.log('3. Import from old database\n');
      return false;
    }

    // Get sample users
    const users = await prisma.users.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        department: true,
        position: true,
        hourlyRate: true,
        weeklyCapacity: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`\n📋 Sample users (showing ${users.length}):\n`);
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.name || user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Department: ${user.department || 'N/A'}`);
      console.log(`   Hourly Rate: ${user.hourlyRate || 0}`);
      console.log(`   Weekly Capacity: ${user.weeklyCapacity || 40} hours`);
      console.log('');
    });

    // Check schema alignment
    console.log('🔗 Schema alignment check:\n');
    
    const requiredFields = [
      'id', 'email', 'name', 'role', 'hourlyRate', 'weeklyCapacity'
    ];

    const sampleUser = users[0];
    let aligned = true;
    
    requiredFields.forEach(field => {
      const exists = field in sampleUser;
      console.log(`   ${exists ? '✅' : '❌'} ${field}`);
      if (!exists) aligned = false;
    });

    console.log(`\n${aligned ? '✅ Schema alignment: PASS' : '❌ Schema alignment: FAIL'}\n`);

    // Statistics
    const roleStats = await prisma.users.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    console.log('📊 Users by role:\n');
    roleStats.forEach(stat => {
      console.log(`   ${stat.role}: ${stat._count.id}`);
    });

    const departmentStats = await prisma.users.groupBy({
      by: ['department'],
      _count: {
        id: true,
      },
    });

    console.log('\n📊 Users by department:\n');
    departmentStats.forEach(stat => {
      console.log(`   ${stat.department || 'Unassigned'}: ${stat._count.id}`);
    });

    console.log('\n✅ Users verification complete!\n');
    return true;

  } catch (error) {
    console.error('❌ Error verifying users:', error.message);
    if (error.code === 'P2021') {
      console.error('\n⚠️  Table "users" does not exist!');
      console.error('This should not happen - the migration should have created it.');
    }
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

const result = await verifyUsers();
process.exit(result ? 0 : 1);
