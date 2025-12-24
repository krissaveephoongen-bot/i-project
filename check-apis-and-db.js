#!/usr/bin/env node

/**
 * Cost Management API & Database Health Check Script
 * Tests all relevant APIs and verifies database records
 */

const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
require('dotenv').config();

const prisma = new PrismaClient();
const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.blue}═══ ${msg} ═══${colors.reset}`),
  data: (data) => console.log(JSON.stringify(data, null, 2))
};

async function testDatabase() {
  log.header('Database Health Check');
  
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    log.success('Database connection working');

    // Check Users table
    const userCount = await prisma.user.count();
    log.info(`Users in database: ${userCount}`);

    // Check Projects table
    const projectCount = await prisma.project.count();
    log.info(`Projects in database: ${projectCount}`);

    // Check Costs table
    const costCount = await prisma.cost.count();
    log.info(`Costs in database: ${costCount}`);

    return true;
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    return false;
  }
}

async function testCostAPI() {
  log.header('Cost Management API Tests');

  try {
    // Test 1: Get all costs
    log.info('Testing GET /api/prisma/costs...');
    const listResponse = await fetch(`${API_BASE}/prisma/costs`);
    
    if (!listResponse.ok) {
      log.error(`GET /api/prisma/costs failed with status ${listResponse.status}`);
      return false;
    }

    const listData = await listResponse.json();
    log.success(`GET /api/prisma/costs - Retrieved ${listData.data?.length || 0} costs`);
    
    if (listData.data && listData.data.length > 0) {
      log.info('Sample cost record:');
      log.data(listData.data[0]);
    } else {
      log.warn('No cost records found in database');
    }

    return true;
  } catch (error) {
    log.error(`Cost API test failed: ${error.message}`);
    return false;
  }
}

async function testCreateCost() {
  log.header('Cost Creation Test');

  try {
    // First, get a project to associate with
    const project = await prisma.project.findFirst();
    if (!project) {
      log.warn('No project found, creating test project...');
      const newProject = await prisma.project.create({
        data: {
          name: 'Test Project for Costs',
          code: 'TEST-' + Date.now(),
          budget: 50000,
          startDate: new Date(),
          description: 'Temporary test project'
        }
      });
      log.success(`Created test project: ${newProject.id}`);
    }

    // Get a user to submit the cost
    let user = await prisma.user.findFirst();
    if (!user) {
      log.warn('No user found, creating test user...');
      user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          password: 'hashed_password_placeholder',
          role: 'USER'
        }
      });
      log.success(`Created test user: ${user.id}`);
    }

    const projectId = project?.id || (await prisma.project.findFirst()).id;

    // Create a test cost
    const testCost = await prisma.cost.create({
      data: {
        projectId,
        description: 'Test Expense - ' + new Date().toISOString(),
        amount: 1500.50,
        category: 'Software',
        date: new Date(),
        status: 'pending',
        submittedBy: user.id,
        invoiceNumber: 'TEST-INV-' + Date.now()
      },
      include: {
        project: true,
        submitted: { select: { id: true, name: true, email: true } }
      }
    });

    log.success('Cost created successfully via Prisma:');
    log.data(testCost);

    return testCost.id;
  } catch (error) {
    log.error(`Cost creation test failed: ${error.message}`);
    return null;
  }
}

async function testApprovedCosts() {
  log.header('Approved Costs Verification');

  try {
    const approvedCosts = await prisma.cost.findMany({
      where: { status: 'approved' },
      include: {
        project: { select: { id: true, name: true, code: true } },
        submitted: { select: { id: true, name: true, email: true } },
        approved: { select: { id: true, name: true, email: true } }
      },
      take: 5
    });

    if (approvedCosts.length > 0) {
      log.success(`Found ${approvedCosts.length} approved costs`);
      approvedCosts.forEach((cost, idx) => {
        console.log(`\n  [${idx + 1}] ${cost.description}`);
        console.log(`      Amount: $${cost.amount}`);
        console.log(`      Project: ${cost.project.name}`);
        console.log(`      Submitted by: ${cost.submitted.name}`);
        if (cost.approved) {
          console.log(`      Approved by: ${cost.approved.name}`);
        }
      });
    } else {
      log.warn('No approved costs found');
    }

    return approvedCosts;
  } catch (error) {
    log.error(`Approved costs check failed: ${error.message}`);
    return [];
  }
}

async function testPendingCosts() {
  log.header('Pending Costs for Review');

  try {
    const pendingCosts = await prisma.cost.findMany({
      where: { status: 'pending' },
      include: {
        project: { select: { id: true, name: true, code: true } },
        submitted: { select: { id: true, name: true, email: true } }
      },
      take: 5
    });

    if (pendingCosts.length > 0) {
      log.success(`Found ${pendingCosts.length} pending costs`);
      pendingCosts.forEach((cost, idx) => {
        console.log(`\n  [${idx + 1}] ${cost.description}`);
        console.log(`      Amount: $${cost.amount}`);
        console.log(`      Category: ${cost.category}`);
        console.log(`      Project: ${cost.project.name}`);
        console.log(`      Submitted by: ${cost.submitted.name} (${cost.submitted.email})`);
        console.log(`      Date: ${new Date(cost.date).toLocaleDateString()}`);
      });
    } else {
      log.warn('No pending costs found');
    }

    return pendingCosts;
  } catch (error) {
    log.error(`Pending costs check failed: ${error.message}`);
    return [];
  }
}

async function testCostsByCategory() {
  log.header('Cost Distribution by Category');

  try {
    const categories = await prisma.cost.groupBy({
      by: ['category'],
      _sum: { amount: true },
      _count: true,
      where: { status: { in: ['approved', 'pending'] } }
    });

    if (categories.length > 0) {
      log.success(`Found costs in ${categories.length} categories`);
      console.log('\n  Category Breakdown:');
      let totalAmount = 0;
      categories.forEach(cat => {
        const amount = cat._sum.amount || 0;
        totalAmount += amount;
        console.log(`    • ${cat.category}: $${amount.toFixed(2)} (${cat._count} items)`);
      });
      console.log(`    ─────────────────────`);
      console.log(`    Total: $${totalAmount.toFixed(2)}`);
    } else {
      log.warn('No cost categories found');
    }

    return categories;
  } catch (error) {
    log.error(`Category analysis failed: ${error.message}`);
    return [];
  }
}

async function testDataIntegrity() {
  log.header('Data Integrity Check');

  try {
    // Check for orphaned costs (costs without projects)
    const orphanedCosts = await prisma.cost.findMany({
      where: {
        project: null
      }
    });

    if (orphanedCosts.length > 0) {
      log.warn(`Found ${orphanedCosts.length} costs without associated projects`);
    } else {
      log.success('No orphaned costs found - data integrity OK');
    }

    // Check for costs without submitter
    const costsWithoutSubmitter = await prisma.cost.count({
      where: {
        submittedBy: null
      }
    });

    if (costsWithoutSubmitter > 0) {
      log.warn(`Found ${costsWithoutSubmitter} costs without submitter`);
    } else {
      log.success('All costs have submitters');
    }

    return true;
  } catch (error) {
    log.error(`Data integrity check failed: ${error.message}`);
    return false;
  }
}

async function generateReport() {
  log.header('Final Summary Report');

  try {
    const stats = {
      totalCosts: await prisma.cost.count(),
      pendingCosts: await prisma.cost.count({ where: { status: 'pending' } }),
      approvedCosts: await prisma.cost.count({ where: { status: 'approved' } }),
      rejectedCosts: await prisma.cost.count({ where: { status: 'rejected' } }),
      totalAmount: await prisma.cost.aggregate({
        _sum: { amount: true },
        where: { status: 'approved' }
      }),
      pendingAmount: await prisma.cost.aggregate({
        _sum: { amount: true },
        where: { status: 'pending' }
      })
    };

    console.log('\nCost Management Statistics:');
    console.log(`  Total Costs: ${stats.totalCosts}`);
    console.log(`  ├─ Pending: ${stats.pendingCosts} (Amount: $${(stats.pendingAmount._sum.amount || 0).toFixed(2)})`);
    console.log(`  ├─ Approved: ${stats.approvedCosts} (Amount: $${(stats.totalAmount._sum.amount || 0).toFixed(2)})`);
    console.log(`  └─ Rejected: ${stats.rejectedCosts}`);
    console.log(`\n  Total Approved: $${(stats.totalAmount._sum.amount || 0).toFixed(2)}`);
    console.log(`  Total Pending: $${(stats.pendingAmount._sum.amount || 0).toFixed(2)}`);

    return stats;
  } catch (error) {
    log.error(`Report generation failed: ${error.message}`);
  }
}

async function runAllTests() {
  console.clear();
  console.log(`${colors.blue}╔══════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║   Cost Management API & Database Health Check        ║${colors.reset}`);
  console.log(`${colors.blue}╚══════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`API Base URL: ${API_BASE}\n`);

  try {
    // Run all tests
    await testDatabase();
    await testCostAPI();
    const newCostId = await testCreateCost();
    await testApprovedCosts();
    await testPendingCosts();
    await testCostsByCategory();
    await testDataIntegrity();
    await generateReport();

    log.header('Tests Complete');
    log.success('All API and database checks completed');
  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run tests
runAllTests();
