#!/usr/bin/env node

/**
 * Prisma Query Tool for Cost Management
 * Direct database queries using Prisma ORM
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  log: ['warn', 'error']
});

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}╔═══════════════════════════════════════════════╗${colors.reset}\n${colors.bold}${colors.blue}║${colors.reset} ${msg.padEnd(47)} ${colors.bold}${colors.blue}║${colors.reset}\n${colors.bold}${colors.blue}╚═══════════════════════════════════════════════╝${colors.reset}`),
  data: (data, indent = 0) => console.log(JSON.stringify(data, null, 2).split('\n').map(line => ' '.repeat(indent) + line).join('\n')),
  table: (data) => console.table(data)
};

async function getAllCosts() {
  log.header('All Costs in Database');
  try {
    const costs = await prisma.cost.findMany({
      include: {
        project: { select: { id: true, name: true, code: true, budget: true } },
        submitted: { select: { id: true, name: true, email: true } },
        approved: { select: { id: true, name: true, email: true } },
        attachments: true,
        approvals: { include: { approved: { select: { name: true, email: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (costs.length === 0) {
      log.warn('No costs found in database');
      return [];
    }

    log.success(`Found ${costs.length} costs`);
    
    costs.forEach((cost, idx) => {
      console.log(`\n${colors.cyan}[${idx + 1}] ${cost.description}${colors.reset}`);
      console.log(`    ID: ${cost.id}`);
      console.log(`    Amount: ${colors.green}$${cost.amount.toFixed(2)}${colors.reset}`);
      console.log(`    Status: ${cost.status === 'approved' ? colors.green : cost.status === 'pending' ? colors.yellow : colors.red}${cost.status}${colors.reset}`);
      console.log(`    Category: ${cost.category}`);
      console.log(`    Project: ${cost.project?.name || 'N/A'} (${cost.project?.code || 'N/A'})`);
      console.log(`    Date: ${new Date(cost.date).toLocaleDateString()}`);
      console.log(`    Submitted by: ${cost.submitted?.name || 'Unknown'} (${cost.submitted?.email || 'N/A'})`);
      if (cost.approved) {
        console.log(`    Approved by: ${cost.approved.name} (${cost.approved.email})`);
      }
      if (cost.attachments?.length > 0) {
        console.log(`    Attachments: ${cost.attachments.length}`);
      }
    });

    return costs;
  } catch (error) {
    log.error(`Failed to fetch costs: ${error.message}`);
    return [];
  }
}

async function getCostsByStatus() {
  log.header('Costs by Status');
  try {
    const byStatus = await prisma.cost.groupBy({
      by: ['status'],
      _count: true,
      _sum: { amount: true }
    });

    if (byStatus.length === 0) {
      log.warn('No costs found');
      return;
    }

    console.log('\n  Status Summary:');
    const statuses = ['pending', 'approved', 'rejected'];
    statuses.forEach(status => {
      const record = byStatus.find(r => r.status === status);
      if (record) {
        const icon = status === 'approved' ? '✓' : status === 'pending' ? '⏳' : '✗';
        console.log(`    ${icon} ${status.toUpperCase()}: ${record._count} costs, Total: $${(record._sum.amount || 0).toFixed(2)}`);
      }
    });

    return byStatus;
  } catch (error) {
    log.error(`Failed to group by status: ${error.message}`);
  }
}

async function getCostsByProject() {
  log.header('Costs by Project');
  try {
    const byProject = await prisma.project.findMany({
      include: {
        costs: {
          select: { amount: true, status: true }
        }
      },
      where: {
        costs: {
          some: {}
        }
      }
    });

    if (byProject.length === 0) {
      log.warn('No projects with costs found');
      return;
    }

    log.success(`Found ${byProject.length} projects with costs`);
    
    console.log('\n  Project Breakdown:');
    byProject.forEach((project, idx) => {
      const totalAmount = project.costs.reduce((sum, cost) => sum + cost.amount, 0);
      const approvedAmount = project.costs
        .filter(c => c.status === 'approved')
        .reduce((sum, cost) => sum + cost.amount, 0);
      console.log(`\n    [${idx + 1}] ${project.name} (${project.code})`);
      console.log(`        Budget: $${project.budget.toFixed(2)}`);
      console.log(`        Total Costs: $${totalAmount.toFixed(2)}`);
      console.log(`        Approved: $${approvedAmount.toFixed(2)}`);
      console.log(`        Remaining: $${(project.budget - approvedAmount).toFixed(2)}`);
      console.log(`        Items: ${project.costs.length}`);
    });

    return byProject;
  } catch (error) {
    log.error(`Failed to get costs by project: ${error.message}`);
  }
}

async function getCostsByCategory() {
  log.header('Costs by Category');
  try {
    const byCategory = await prisma.cost.groupBy({
      by: ['category'],
      _count: true,
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } }
    });

    if (byCategory.length === 0) {
      log.warn('No cost categories found');
      return;
    }

    log.success(`Found costs in ${byCategory.length} categories`);
    
    console.log('\n  Category Breakdown:');
    let grandTotal = 0;
    byCategory.forEach((cat, idx) => {
      const amount = cat._sum.amount || 0;
      grandTotal += amount;
      const percentage = ((amount / byCategory.reduce((sum, c) => sum + (c._sum.amount || 0), 0)) * 100).toFixed(1);
      console.log(`    ${idx + 1}. ${cat.category.padEnd(15)}: ${cat._count} items | $${amount.toFixed(2).padStart(10)} (${percentage}%)`);
    });
    console.log(`    ${'─'.repeat(50)}`);
    console.log(`    Total: $${grandTotal.toFixed(2)}`);

    return byCategory;
  } catch (error) {
    log.error(`Failed to get costs by category: ${error.message}`);
  }
}

async function getPendingApprovals() {
  log.header('Pending Cost Approvals');
  try {
    const pending = await prisma.cost.findMany({
      where: { status: 'pending' },
      include: {
        project: { select: { name: true, code: true } },
        submitted: { select: { name: true, email: true } }
      },
      orderBy: { date: 'asc' }
    });

    if (pending.length === 0) {
      log.success('No pending approvals - all caught up!');
      return [];
    }

    log.warn(`${pending.length} pending approvals waiting for review`);
    
    console.log('\n  Pending Items (oldest first):');
    let totalAmount = 0;
    pending.forEach((cost, idx) => {
      totalAmount += cost.amount;
      const daysOld = Math.floor((Date.now() - new Date(cost.date)) / (1000 * 60 * 60 * 24));
      const ageColor = daysOld > 7 ? colors.red : daysOld > 3 ? colors.yellow : colors.green;
      console.log(`\n    [${idx + 1}] ${cost.description}`);
      console.log(`        Amount: $${cost.amount.toFixed(2)}`);
      console.log(`        Category: ${cost.category}`);
      console.log(`        Age: ${ageColor}${daysOld} days old${colors.reset}`);
      console.log(`        Project: ${cost.project?.name || 'N/A'}`);
      console.log(`        Submitted by: ${cost.submitted?.name}`);
    });
    console.log(`\n    Total Pending Amount: $${totalAmount.toFixed(2)}`);

    return pending;
  } catch (error) {
    log.error(`Failed to get pending approvals: ${error.message}`);
    return [];
  }
}

async function getApprovalStats() {
  log.header('Approval Statistics');
  try {
    const approvals = await prisma.costApproval.findMany({
      include: {
        cost: { select: { description: true, amount: true } },
        approved: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    if (approvals.length === 0) {
      log.warn('No approval records found');
      return;
    }

    log.success(`Found ${approvals.length} approval records`);
    
    console.log('\n  Recent Approvals (last 20):');
    approvals.forEach((approval, idx) => {
      console.log(`\n    [${idx + 1}] ${approval.cost.description}`);
      console.log(`        Status: ${approval.status}`);
      console.log(`        Amount: $${approval.cost.amount.toFixed(2)}`);
      console.log(`        Approved by: ${approval.approved.name} (${approval.approved.email})`);
      console.log(`        Date: ${new Date(approval.createdAt).toLocaleString()}`);
      if (approval.comment) {
        console.log(`        Comment: ${approval.comment}`);
      }
    });

    return approvals;
  } catch (error) {
    log.error(`Failed to get approval stats: ${error.message}`);
  }
}

async function verifyDataIntegrity() {
  log.header('Data Integrity Verification');
  try {
    let passed = 0;
    let failed = 0;

    // Check 1: All costs have projects
    const costsWithoutProject = await prisma.cost.count({
      where: { projectId: null }
    });
    if (costsWithoutProject === 0) {
      log.success('All costs have associated projects');
      passed++;
    } else {
      log.error(`${costsWithoutProject} costs missing project association`);
      failed++;
    }

    // Check 2: All costs have submitters
    const costsWithoutSubmitter = await prisma.cost.count({
      where: { submittedBy: null }
    });
    if (costsWithoutSubmitter === 0) {
      log.success('All costs have submitters');
      passed++;
    } else {
      log.error(`${costsWithoutSubmitter} costs missing submitter`);
      failed++;
    }

    // Check 3: Approved costs have approvers
    const approvedWithoutApprover = await prisma.cost.count({
      where: { status: 'approved', approvedBy: null }
    });
    if (approvedWithoutApprover === 0) {
      log.success('All approved costs have approvers');
      passed++;
    } else {
      log.warn(`${approvedWithoutApprover} approved costs missing approver info`);
      failed++;
    }

    // Check 4: No invalid amounts
    const invalidAmounts = await prisma.cost.count({
      where: { amount: { lte: 0 } }
    });
    if (invalidAmounts === 0) {
      log.success('All costs have valid amounts');
      passed++;
    } else {
      log.error(`${invalidAmounts} costs with invalid amounts`);
      failed++;
    }

    console.log(`\n  Integrity Check Results: ${colors.green}${passed} passed${colors.reset}, ${failed > 0 ? colors.red : colors.green}${failed} failed${colors.reset}`);
  } catch (error) {
    log.error(`Integrity check failed: ${error.message}`);
  }
}

async function runFullDiagnosis() {
  console.clear();
  console.log(`${colors.bold}${colors.blue}╔═══════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║${colors.reset}  Prisma Database Diagnostic Tool                ${colors.bold}${colors.blue}║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║${colors.reset}  Cost Management System Analysis                ${colors.bold}${colors.blue}║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚═══════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    await getAllCosts();
    await getCostsByStatus();
    await getCostsByCategory();
    await getCostsByProject();
    await getPendingApprovals();
    await getApprovalStats();
    await verifyDataIntegrity();

    log.header('Diagnosis Complete');
    log.success('Database analysis finished successfully');
  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run diagnosis
runFullDiagnosis();
