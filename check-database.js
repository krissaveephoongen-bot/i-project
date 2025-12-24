#!/usr/bin/env node

/**
 * Direct PostgreSQL Database Check Script
 * Checks all Cost-related tables and their data
 */

const { Client } = require('pg');
require('dotenv').config();

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
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════╗${colors.reset}\n${colors.bold}${colors.blue}║${colors.reset} ${msg.padEnd(38)} ${colors.bold}${colors.blue}║${colors.reset}\n${colors.bold}${colors.blue}╚════════════════════════════════════════╝${colors.reset}\n`)
};

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function executeQuery(query, params = []) {
  try {
    const result = await client.query(query, params);
    return result;
  } catch (error) {
    log.error(`Query failed: ${error.message}`);
    return null;
  }
}

async function testConnection() {
  log.header('Database Connection');
  try {
    await client.connect();
    log.success('Connected to PostgreSQL database');
    return true;
  } catch (error) {
    log.error(`Connection failed: ${error.message}`);
    return false;
  }
}

async function checkTables() {
  log.header('Checking Tables');
  
  const tables = ['public.users', 'public.projects', 'public."Cost"', 'public."CostApproval"', 'public."Attachment"'];
  
  for (const table of tables) {
    const result = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      ) as exists;
    `, [table.split('.')[1]]);
    
    if (result && result.rows[0]?.exists) {
      log.success(`Table found: ${table}`);
    } else {
      log.warn(`Table not found: ${table}`);
    }
  }
}

async function getCostStats() {
  log.header('Cost Management Statistics');
  
  try {
    // Total costs count
    const totalResult = await executeQuery('SELECT COUNT(*) as count FROM public."Cost"');
    const totalCosts = totalResult?.rows[0]?.count || 0;
    log.info(`Total costs in database: ${totalCosts}`);
    
    // Costs by status
    const statusResult = await executeQuery(`
      SELECT status, COUNT(*) as count, SUM(amount) as total_amount 
      FROM public."Cost" 
      GROUP BY status 
      ORDER BY status
    `);
    
    if (statusResult && statusResult.rows.length > 0) {
      console.log('\nCosts by Status:');
      statusResult.rows.forEach(row => {
        console.log(`  • ${row.status.padEnd(10)}: ${row.count} items | $${parseFloat(row.total_amount || 0).toFixed(2)}`);
      });
    }

    // Costs by category
    const categoryResult = await executeQuery(`
      SELECT category, COUNT(*) as count, SUM(amount) as total_amount 
      FROM public."Cost" 
      GROUP BY category 
      ORDER BY total_amount DESC
    `);
    
    if (categoryResult && categoryResult.rows.length > 0) {
      console.log('\nCosts by Category:');
      categoryResult.rows.forEach(row => {
        console.log(`  • ${row.category.padEnd(15)}: ${row.count} items | $${parseFloat(row.total_amount || 0).toFixed(2)}`);
      });
    }

  } catch (error) {
    log.error(`Failed to get statistics: ${error.message}`);
  }
}

async function getPendingCosts() {
  log.header('Pending Costs for Approval');
  
  try {
    const result = await executeQuery(`
      SELECT 
        c."id",
        c."description",
        c."amount",
        c."category",
        c."date",
        c."status",
        u."name" as submitted_by,
        u."email",
        p."name" as project_name
      FROM public."Cost" c
      LEFT JOIN public."User" u ON c."submittedBy" = u."id"
      LEFT JOIN public."Project" p ON c."projectId" = p."id"
      WHERE c."status" = 'pending'
      ORDER BY c."date" ASC
      LIMIT 10
    `);
    
    if (!result || result.rows.length === 0) {
      log.success('No pending costs - all caught up!');
      return;
    }

    log.warn(`${result.rows.length} pending costs waiting for approval`);
    console.log('');
    
    result.rows.forEach((row, idx) => {
      const amount = parseFloat(row.amount).toFixed(2);
      const daysOld = Math.floor((Date.now() - new Date(row.date)) / (1000 * 60 * 60 * 24));
      const ageColor = daysOld > 7 ? colors.red : daysOld > 3 ? colors.yellow : colors.green;
      
      console.log(`[${idx + 1}] ${row.description}`);
      console.log(`    Amount: $${amount}`);
      console.log(`    Category: ${row.category}`);
      console.log(`    Age: ${ageColor}${daysOld} days${colors.reset}`);
      console.log(`    Project: ${row.project_name || 'N/A'}`);
      console.log(`    Submitted by: ${row.name} (${row.email})`);
      console.log('');
    });

  } catch (error) {
    log.error(`Failed to get pending costs: ${error.message}`);
  }
}

async function getApprovedCosts() {
  log.header('Recently Approved Costs');
  
  try {
    const result = await executeQuery(`
      SELECT 
        c."id",
        c."description",
        c."amount",
        c."category",
        c."date",
        c."updatedAt",
        u_submitted."name" as submitted_by,
        u_approved."name" as approved_by,
        p."name" as project_name
      FROM public."Cost" c
      LEFT JOIN public."User" u_submitted ON c."submittedBy" = u_submitted."id"
      LEFT JOIN public."User" u_approved ON c."approvedBy" = u_approved."id"
      LEFT JOIN public."Project" p ON c."projectId" = p."id"
      WHERE c."status" = 'approved'
      ORDER BY c."updatedAt" DESC
      LIMIT 5
    `);
    
    if (!result || result.rows.length === 0) {
      log.warn('No approved costs found');
      return;
    }

    log.success(`${result.rows.length} recently approved costs`);
    console.log('');
    
    result.rows.forEach((row, idx) => {
      const amount = parseFloat(row.amount).toFixed(2);
      
      console.log(`[${idx + 1}] ${row.description}`);
      console.log(`    Amount: $${amount}`);
      console.log(`    Category: ${row.category}`);
      console.log(`    Project: ${row.project_name || 'N/A'}`);
      console.log(`    Submitted by: ${row.submitted_by || 'Unknown'}`);
      console.log(`    Approved by: ${row.approved_by || 'Pending'}`);
      console.log(`    Approved: ${new Date(row.updatedAt).toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    log.error(`Failed to get approved costs: ${error.message}`);
  }
}

async function verifyDataIntegrity() {
  log.header('Data Integrity Check');
  
  try {
    let checks = [];

    // Check 1: Orphaned costs
    const orphaned = await executeQuery(`
      SELECT COUNT(*) as count FROM public."Cost" 
      WHERE "projectId" NOT IN (SELECT "id" FROM public."Project")
    `);
    const orphanedCount = orphaned?.rows[0]?.count || 0;
    checks.push({
      name: 'Orphaned costs (without project)',
      status: orphanedCount === 0,
      message: orphanedCount === 0 ? 'OK' : `${orphanedCount} found`
    });

    // Check 2: Missing submitter
    const noSubmitter = await executeQuery(`
      SELECT COUNT(*) as count FROM public."Cost" 
      WHERE "submittedBy" IS NULL
    `);
    const noSubmitterCount = noSubmitter?.rows[0]?.count || 0;
    checks.push({
      name: 'Costs without submitter',
      status: noSubmitterCount === 0,
      message: noSubmitterCount === 0 ? 'OK' : `${noSubmitterCount} found`
    });

    // Check 3: Approved without approver
    const approvedNoApprover = await executeQuery(`
      SELECT COUNT(*) as count FROM public."Cost" 
      WHERE "status" = 'approved' AND "approvedBy" IS NULL
    `);
    const approvedNoApproverCount = approvedNoApprover?.rows[0]?.count || 0;
    checks.push({
      name: 'Approved costs without approver',
      status: approvedNoApproverCount === 0,
      message: approvedNoApproverCount === 0 ? 'OK' : `${approvedNoApproverCount} found`
    });

    // Check 4: Invalid amounts
    const invalidAmounts = await executeQuery(`
      SELECT COUNT(*) as count FROM public."Cost" 
      WHERE "amount" <= 0
    `);
    const invalidAmountsCount = invalidAmounts?.rows[0]?.count || 0;
    checks.push({
      name: 'Costs with invalid amounts',
      status: invalidAmountsCount === 0,
      message: invalidAmountsCount === 0 ? 'OK' : `${invalidAmountsCount} found`
    });

    // Display results
    console.log('');
    checks.forEach(check => {
      const icon = check.status ? colors.green + '✓' : colors.red + '✗';
      console.log(`${icon}${colors.reset} ${check.name}: ${check.message}`);
    });

  } catch (error) {
    log.error(`Integrity check failed: ${error.message}`);
  }
}

async function generateSummaryReport() {
  log.header('Database Summary Report');
  
  try {
    const result = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM public."Cost") as total_costs,
        (SELECT COUNT(*) FROM public."Cost" WHERE status = 'pending') as pending_costs,
        (SELECT COUNT(*) FROM public."Cost" WHERE status = 'approved') as approved_costs,
        (SELECT COUNT(*) FROM public."Cost" WHERE status = 'rejected') as rejected_costs,
        (SELECT COALESCE(SUM(amount), 0) FROM public."Cost" WHERE status = 'approved') as approved_total,
        (SELECT COALESCE(SUM(amount), 0) FROM public."Cost" WHERE status = 'pending') as pending_total,
        (SELECT COUNT(*) FROM public."User") as total_users,
        (SELECT COUNT(*) FROM public."Project") as total_projects,
        (SELECT COUNT(*) FROM public."CostApproval") as approval_records
    `);

    if (result && result.rows.length > 0) {
      const data = result.rows[0];
      console.log(`Total Costs:              ${data.total_costs}`);
      console.log(`  ├─ Pending:            ${data.pending_costs} (Amount: $${parseFloat(data.pending_total).toFixed(2)})`);
      console.log(`  ├─ Approved:           ${data.approved_costs} (Amount: $${parseFloat(data.approved_total).toFixed(2)})`);
      console.log(`  └─ Rejected:           ${data.rejected_costs}`);
      console.log(`\nApproval Records:        ${data.approval_records}`);
      console.log(`Total Users:             ${data.total_users}`);
      console.log(`Total Projects:          ${data.total_projects}`);
    }

  } catch (error) {
    log.error(`Failed to generate report: ${error.message}`);
  }
}

async function runAllChecks() {
  console.clear();
  console.log(`${colors.bold}${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║${colors.reset} Database Health Check - Cost Management ${colors.bold}${colors.blue}║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════╝${colors.reset}`);
  
  const connected = await testConnection();
  
  if (!connected) {
    process.exit(1);
  }

  try {
    await checkTables();
    await getCostStats();
    await getPendingCosts();
    await getApprovedCosts();
    await verifyDataIntegrity();
    await generateSummaryReport();
    
    log.header('Check Complete');
    log.success('Database analysis finished');
  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
  } finally {
    await client.end();
    process.exit(0);
  }
}

runAllChecks();
