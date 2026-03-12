// Backup users before migration
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function backupUsers() {
  try {
    const users = await prisma.users.findMany({
      include: {
        project_members: true,
        sessions: true,
        authTokens: true,
      },
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `users-backup-${timestamp}.json`;
    
    fs.writeFileSync(
      filename,
      JSON.stringify(users, null, 2),
      'utf-8'
    );

    console.log(`✓ Backup saved to ${filename}`);
    console.log(`✓ Total users: ${users.length}`);
    return filename;
  } catch (error) {
    console.error('✗ Backup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupUsers();
