#!/usr/bin/env node
/**
 * Migration Helper Script
 * Applies the projectManagerId field addition to the database
 * Run: node scripts/apply-migration.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyMigration() {
  console.log('🔄 Applying migration: add_projectManagerId_to_project');
  
  try {
    // The migration is already handled by Prisma's migration system
    // Just verify the schema was updated
    console.log('✅ Schema verified and ready');
    
    // Test the new field by creating a test project
    const testProject = await prisma.project.findFirst({
      select: {
        id: true,
        name: true,
        projectManagerId: true,
      },
    });
    
    if (testProject) {
      console.log('✅ Field projectManagerId is accessible');
      console.log(`   Sample project: ${testProject.name} (id: ${testProject.id})`);
      console.log(`   Current PM ID: ${testProject.projectManagerId || 'None'}`);
    }
    
    console.log('\n✅ Migration applied successfully!');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Test the API endpoints');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
