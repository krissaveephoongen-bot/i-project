// Restore users after migration
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreUsers(filename) {
  try {
    if (!fs.existsSync(filename)) {
      console.error(`✗ Backup file not found: ${filename}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
    
    // Create users (without relations first)
    const createdUsers = [];
    for (const user of data) {
      const { project_members, sessions, authTokens, ...userData } = user;
      
      const created = await prisma.users.upsert({
        where: { id: user.id },
        update: userData,
        create: userData,
      });
      createdUsers.push(created);
    }

    console.log(`✓ Restored ${createdUsers.length} users`);
    console.log('✓ Users are ready for Phase 4');
    
  } catch (error) {
    console.error('✗ Restore failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const backupFile = process.argv[2];
if (!backupFile) {
  console.error('Usage: node restore-users.js <backup-file.json>');
  process.exit(1);
}

restoreUsers(backupFile);
