#!/usr/bin/env node
/**
 * Data Connection Verification Script
 * Verifies all project data relationships are correctly configured
 * Run: node scripts/verify-data-connections.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(type, message) {
  const prefix = {
    error: `${colors.red}❌ ERROR${colors.reset}`,
    success: `${colors.green}✅ SUCCESS${colors.reset}`,
    warning: `${colors.yellow}⚠️  WARNING${colors.reset}`,
    info: `${colors.blue}ℹ️  INFO${colors.reset}`,
  };
  console.log(`${prefix[type] || type} ${message}`);
}

async function verifyDataConnections() {
  console.log(`\n${colors.blue}=== Project Data Connection Verification ===${colors.reset}\n`);

  let passCount = 0;
  let failCount = 0;

  try {
    // Test 1: Verify projectManagerId field exists
    log('info', 'Testing projectManagerId field...');
    try {
      const project = await prisma.project.findFirst({
        select: {
          id: true,
          projectManagerId: true,
        },
      });
      if (project !== null) {
        log('success', 'projectManagerId field is accessible');
        passCount++;
      } else {
        log('warning', 'No projects found in database');
      }
    } catch (e) {
      if (e.message.includes('Unknown field')) {
        log('error', 'projectManagerId field not found in schema');
        failCount++;
      } else {
        throw e;
      }
    }

    // Test 2: Verify Task S-Curve fields
    log('info', 'Testing Task S-Curve fields...');
    try {
      const task = await prisma.task.findFirst({
        select: {
          id: true,
          plannedStartDate: true,
          plannedEndDate: true,
          plannedProgressWeight: true,
          actualProgress: true,
        },
      });
      if (task) {
        log('success', 'All S-Curve fields are accessible on Task');
        passCount++;
      } else {
        log('warning', 'No tasks found in database');
      }
    } catch (e) {
      log('error', `Task S-Curve field error: ${e.message}`);
      failCount++;
    }

    // Test 3: Verify Project Relations
    log('info', 'Testing Project relations...');
    try {
      const project = await prisma.project.findFirst({
        include: {
          client: true,
          projectManager: {
            include: {
              user: true,
            },
          },
          tasks: {
            select: {
              id: true,
              assignee: true,
              reporter: true,
            },
            take: 1,
          },
        },
      });
      
      if (project) {
        log('success', 'Project relations load correctly');
        passCount++;
      }
    } catch (e) {
      log('error', `Project relations error: ${e.message}`);
      failCount++;
    }

    // Test 4: Count data statistics
    log('info', 'Gathering data statistics...');
    const stats = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.projectManager.count(),
      prisma.project.count({ where: { projectManagerId: { not: null } } }),
    ]);

    console.log(`\n${colors.blue}Data Statistics:${colors.reset}`);
    console.log(`  • Total Projects: ${stats[0]}`);
    console.log(`  • Total Tasks: ${stats[1]}`);
    console.log(`  • Total Project Managers: ${stats[2]}`);
    console.log(`  • Projects with assigned Manager: ${stats[3]}`);
    passCount++;

    // Test 5: Check for orphaned records
    log('info', 'Checking for orphaned records...');
    const orphanedTasks = await prisma.task.count({
      where: { projectId: null },
    });
    
    if (orphanedTasks === 0) {
      log('success', 'No orphaned tasks found');
      passCount++;
    } else {
      log('warning', `Found ${orphanedTasks} orphaned tasks`);
    }

    // Test 6: Verify cascading relationships
    log('info', 'Testing relationships integrity...');
    try {
      const projectWithAll = await prisma.project.findFirst({
        include: {
          client: true,
          projectManager: { include: { user: true } },
          tasks: { take: 5 },
          costs: { take: 5 },
          timesheets: { take: 5 },
          comments: { take: 5 },
        },
      });

      if (projectWithAll) {
        log('success', 'All project relationships are properly configured');
        console.log(`  • Related Client: ${projectWithAll.client ? 'Yes' : 'No'}`);
        console.log(`  • Related Manager: ${projectWithAll.projectManager ? 'Yes' : 'No'}`);
        console.log(`  • Related Tasks: ${projectWithAll.tasks.length}`);
        console.log(`  • Related Costs: ${projectWithAll.costs.length}`);
        console.log(`  • Related Timesheets: ${projectWithAll.timesheets.length}`);
        console.log(`  • Related Comments: ${projectWithAll.comments.length}`);
        passCount++;
      }
    } catch (e) {
      log('error', `Relationship integrity check failed: ${e.message}`);
      failCount++;
    }

  } catch (error) {
    log('error', `Verification error: ${error.message}`);
    failCount++;
  } finally {
    await prisma.$disconnect();

    // Summary
    console.log(`\n${colors.blue}=== Verification Summary ===${colors.reset}`);
    console.log(`${colors.green}✅ Passed: ${passCount}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);

    if (failCount === 0) {
      console.log(`\n${colors.green}All data connections verified successfully!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`\n${colors.red}Some verifications failed. Check errors above.${colors.reset}\n`);
      process.exit(1);
    }
  }
}

verifyDataConnections();
