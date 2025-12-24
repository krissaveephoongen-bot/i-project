#!/usr/bin/env node

/**
 * Detailed Cost Management Database Analysis
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
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}════════════════════════════════════════${colors.reset}\n${colors.bold}  ${msg}${colors.reset}\n${colors.bold}${colors.blue}════════════════════════════════════════${colors.reset}\n`)
};

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function query(sql, params = []) {
  const result = await client.query(sql, params);
  return result.rows;
}

async function getCostStats() {
  log.header('Cost Management Overview');
  
  const stats = await query(`
    SELECT 
      COUNT(*) as total_costs,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
      COALESCE(SUM(amount), 0) as total_amount,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN amount END), 0) as pending_amount,
      COALESCE(SUM(CASE WHEN status = 'approved' THEN amount END), 0) as approved_amount,
      COALESCE(SUM(CASE WHEN status = 'rejected' THEN amount END), 0) as rejected_amount
    FROM "Cost"
  `);

  const data = stats[0];
  
  console.log(`Total Costs:              ${colors.cyan}${data.total_costs}${colors.reset}`);
  console.log(`  ${colors.yellow}⏳ Pending:${colors.reset}             ${data.pending} items | $${parseFloat(data.pending_amount).toFixed(2)}`);
  console.log(`  ${colors.green}✓ Approved:${colors.reset}            ${data.approved} items | $${parseFloat(data.approved_amount).toFixed(2)}`);
  console.log(`  ${colors.red}✗ Rejected:${colors.reset}             ${data.rejected} items | $${parseFloat(data.rejected_amount).toFixed(2)}`);
  console.log(`\nTotal Amount:             $${parseFloat(data.total_amount).toFixed(2)}`);
}

async function getPendingCosts() {
  log.header('Pending Costs Awaiting Approval');
  
  const costs = await query(`
    SELECT 
      c."id",
      c."description",
      c."amount",
      c."category",
      c."date",
      c."invoiceNumber",
      u."name" as submitted_by,
      u."email",
      p."name" as project_name,
      p."code" as project_code,
      (NOW() - c."date")::interval as age
    FROM "Cost" c
    LEFT JOIN "User" u ON c."submittedBy" = u."id"
    LEFT JOIN "Project" p ON c."projectId" = p."id"
    WHERE c."status" = 'pending'
    ORDER BY c."date" ASC
  `);

  if (costs.length === 0) {
    log.success('No pending costs - everything approved!');
    return;
  }

  log.warn(`${costs.length} costs waiting for approval`);
  console.log('');

  costs.forEach((cost, idx) => {
    const amount = parseFloat(cost.amount).toFixed(2);
    // Extract days from interval
    const ageStr = cost.age.split(' ')[0];
    const daysOld = parseInt(ageStr) || 0;
    const ageColor = daysOld > 7 ? colors.red : daysOld > 3 ? colors.yellow : colors.green;
    
    console.log(`${idx + 1}. ${colors.cyan}${cost.description}${colors.reset}`);
    console.log(`   ID:       ${cost.id}`);
    console.log(`   Amount:   ${colors.green}$${amount}${colors.reset}`);
    console.log(`   Category: ${cost.category}`);
    console.log(`   Invoice:  ${cost.invoiceNumber || 'N/A'}`);
    console.log(`   Project:  ${cost.project_name || 'N/A'} (${cost.project_code || 'N/A'})`);
    console.log(`   Age:      ${ageColor}${daysOld} days${colors.reset}`);
    console.log(`   Submitted: ${cost.submitted_by || 'Unknown'} <${cost.email || 'N/A'}>`);
    console.log('');
  });
}

async function getApprovedCosts() {
  log.header('Recently Approved Costs');
  
  const costs = await query(`
    SELECT 
      c."id",
      c."description",
      c."amount",
      c."category",
      c."date",
      c."updatedAt",
      c."invoiceNumber",
      u_submitted."name" as submitted_by,
      u_approved."name" as approved_by,
      p."name" as project_name,
      p."code" as project_code
    FROM "Cost" c
    LEFT JOIN "User" u_submitted ON c."submittedBy" = u_submitted."id"
    LEFT JOIN "User" u_approved ON c."approvedBy" = u_approved."id"
    LEFT JOIN "Project" p ON c."projectId" = p."id"
    WHERE c."status" = 'approved'
    ORDER BY c."updatedAt" DESC
    LIMIT 10
  `);

  if (costs.length === 0) {
    log.warn('No approved costs');
    return;
  }

  log.success(`${costs.length} approved costs found`);
  console.log('');

  costs.forEach((cost, idx) => {
    const amount = parseFloat(cost.amount).toFixed(2);
    
    console.log(`${idx + 1}. ${colors.green}${cost.description}${colors.reset}`);
    console.log(`   Amount:      $${amount}`);
    console.log(`   Category:    ${cost.category}`);
    console.log(`   Invoice:     ${cost.invoiceNumber || 'N/A'}`);
    console.log(`   Project:     ${cost.project_name || 'N/A'} (${cost.project_code || 'N/A'})`);
    console.log(`   Submitted:   ${cost.submitted_by || 'Unknown'}`);
    console.log(`   Approved by: ${cost.approved_by || 'Pending'}`);
    console.log(`   Approved:    ${new Date(cost.updatedAt).toLocaleDateString()}`);
    console.log('');
  });
}

async function getCostsByCategory() {
  log.header('Cost Distribution by Category');
  
  const categories = await query(`
    SELECT 
      category,
      COUNT(*) as count,
      COALESCE(SUM(amount), 0) as total,
      COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
    FROM "Cost"
    GROUP BY category
    ORDER BY total DESC
  `);

  if (categories.length === 0) {
    log.warn('No categories found');
    return;
  }

  log.success(`Costs distributed across ${categories.length} categories`);
  console.log('');

  let grandTotal = 0;
  categories.forEach((cat, idx) => {
    const total = parseFloat(cat.total).toFixed(2);
    grandTotal += parseFloat(cat.total);
    const pct = ((parseFloat(cat.total) / categories.reduce((s, c) => s + parseFloat(c.total), 0)) * 100).toFixed(1);
    
    console.log(`${idx + 1}. ${cat.category.padEnd(15)} | Count: ${cat.count.toString().padStart(3)} | Amount: $${total.padStart(10)} (${pct}%) | Approved: ${cat.approved_count}, Pending: ${cat.pending_count}`);
  });
  console.log(`   ${'─'.repeat(80)}`);
  console.log(`   Total: $${grandTotal.toFixed(2)}`);
}

async function getCostsByProject() {
  log.header('Costs by Project');
  
  const projects = await query(`
    SELECT 
      p."id",
      p."name",
      p."code",
      p."budget",
      COUNT(c."id") as cost_count,
      COALESCE(SUM(c."amount"), 0) as total_cost,
      COALESCE(SUM(CASE WHEN c."status" = 'approved' THEN c."amount" END), 0) as approved_cost
    FROM "Project" p
    LEFT JOIN "Cost" c ON p."id" = c."projectId"
    GROUP BY p."id", p."name", p."code", p."budget"
    HAVING COUNT(c."id") > 0
    ORDER BY total_cost DESC
  `);

  if (projects.length === 0) {
    log.warn('No projects with costs');
    return;
  }

  log.success(`${projects.length} projects have costs`);
  console.log('');

  projects.forEach((proj, idx) => {
    const budget = parseFloat(proj.budget).toFixed(2);
    const totalCost = parseFloat(proj.total_cost).toFixed(2);
    const approvedCost = parseFloat(proj.approved_cost).toFixed(2);
    const remaining = (parseFloat(proj.budget) - parseFloat(proj.approved_cost)).toFixed(2);
    const pctUsed = ((parseFloat(proj.approved_cost) / parseFloat(proj.budget)) * 100).toFixed(1);
    
    const statusColor = parseFloat(remaining) < 0 ? colors.red : parseFloat(remaining) < parseFloat(proj.budget) * 0.1 ? colors.yellow : colors.green;
    
    console.log(`${idx + 1}. ${proj.name} (${proj.code})`);
    console.log(`   Budget:      $${budget}`);
    console.log(`   Total Costs: $${totalCost} (${proj.cost_count} items)`);
    console.log(`   Approved:    $${approvedCost}`);
    console.log(`   Remaining:   ${statusColor}$${remaining}${colors.reset} (${pctUsed}% used)`);
    console.log('');
  });
}

async function getApprovalStats() {
  log.header('Approval Audit Trail');
  
  const approvals = await query(`
    SELECT 
      ca."id",
      ca."status",
      ca."comment",
      u."name" as approved_by,
      u."email",
      c."description",
      c."amount",
      ca."createdAt"
    FROM "CostApproval" ca
    LEFT JOIN "User" u ON ca."approvedBy" = u."id"
    LEFT JOIN "Cost" c ON ca."costId" = c."id"
    ORDER BY ca."createdAt" DESC
    LIMIT 15
  `);

  if (approvals.length === 0) {
    log.info('No approval records found');
    return;
  }

  log.success(`${approvals.length} approval records in system`);
  console.log('');

  approvals.forEach((record, idx) => {
    const amount = parseFloat(record.amount).toFixed(2);
    const statusColor = record.status === 'approved' ? colors.green : colors.red;
    
    console.log(`${idx + 1}. ${record.description}`);
    console.log(`   Status: ${statusColor}${record.status.toUpperCase()}${colors.reset}`);
    console.log(`   Amount: $${amount}`);
    console.log(`   Approved by: ${record.approved_by || 'Unknown'} <${record.email || 'N/A'}>`);
    if (record.comment) {
      console.log(`   Comment: ${record.comment}`);
    }
    console.log(`   Date: ${new Date(record.createdAt).toLocaleString()}`);
    console.log('');
  });
}

async function getDataQuality() {
  log.header('Data Quality Check');
  
  const checks = [];

  // Check 1: Orphaned costs
  const orphaned = await query(`
    SELECT COUNT(*) as count FROM "Cost" 
    WHERE "projectId" NOT IN (SELECT "id" FROM "Project")
  `);
  checks.push({
    name: 'Orphaned costs (no project)',
    count: orphaned[0].count,
    ok: orphaned[0].count === 0
  });

  // Check 2: Missing submitter
  const noSubmitter = await query(`
    SELECT COUNT(*) as count FROM "Cost" WHERE "submittedBy" IS NULL
  `);
  checks.push({
    name: 'Costs without submitter',
    count: noSubmitter[0].count,
    ok: noSubmitter[0].count === 0
  });

  // Check 3: Approved without approver
  const approvedNoApprover = await query(`
    SELECT COUNT(*) as count FROM "Cost" 
    WHERE status = 'approved' AND "approvedBy" IS NULL
  `);
  checks.push({
    name: 'Approved costs without approver',
    count: approvedNoApprover[0].count,
    ok: approvedNoApprover[0].count === 0
  });

  // Check 4: Invalid amounts
  const invalidAmounts = await query(`
    SELECT COUNT(*) as count FROM "Cost" WHERE amount <= 0
  `);
  checks.push({
    name: 'Costs with zero/negative amount',
    count: invalidAmounts[0].count,
    ok: invalidAmounts[0].count === 0
  });

  // Check 5: Future dates
  const futureDates = await query(`
    SELECT COUNT(*) as count FROM "Cost" WHERE date > NOW()
  `);
  checks.push({
    name: 'Costs with future dates',
    count: futureDates[0].count,
    ok: futureDates[0].count === 0
  });

  checks.forEach(check => {
    if (check.ok) {
      log.success(`${check.name}: OK`);
    } else {
      log.warn(`${check.name}: ${check.count} issues found`);
    }
  });

  const allOk = checks.every(c => c.ok);
  console.log(`\n${allOk ? colors.green : colors.yellow}Overall Quality: ${allOk ? 'GOOD' : 'NEEDS ATTENTION'}${colors.reset}`);
}

async function runDiagnosis() {
  console.clear();
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║${colors.reset} Cost Management Database Analysis    ${colors.bold}${colors.blue}║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════╝${colors.reset}\n`);

  try {
    await client.connect();
    log.success('Connected to database');

    await getCostStats();
    await getPendingCosts();
    await getApprovedCosts();
    await getCostsByCategory();
    await getCostsByProject();
    await getApprovalStats();
    await getDataQuality();

    log.header('Analysis Complete');
    console.log(`${colors.green}✓ Database analysis finished successfully${colors.reset}\n`);
  } catch (error) {
    log.error(`Diagnosis failed: ${error.message}`);
    console.error(error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

runDiagnosis();
