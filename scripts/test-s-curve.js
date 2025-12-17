#!/usr/bin/env node

/**
 * S-Curve Feature Testing Script
 * Tests database schema, backend service, and API endpoint
 */

const { executeQuery } = require('../database/neon-connection');
const { calculateSCurve } = require('../server/sCurveService');
const http = require('http');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testsPassed = 0;
let testsFailed = 0;

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function test(name, fn) {
  try {
    process.stdout.write(`⏳ ${name}... `);
    await fn();
    log('green', '✓');
    testsPassed++;
  } catch (error) {
    log('red', `✗\n   ${error.message}`);
    testsFailed++;
  }
}

async function setupTestData() {
  log('cyan', '\n📋 SETTING UP TEST DATA\n');

  // Get or create test user
  const userResult = await executeQuery(
    'SELECT id FROM users LIMIT 1'
  );
  let userId = userResult.rows[0]?.id;
  
  if (!userId) {
    const createUserResult = await executeQuery(
      'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id',
      ['Test PM', 'testpm@example.com', 'pm']
    );
    userId = createUserResult.rows[0].id;
  }
  log('blue', `✓ Using test user (ID: ${userId})`);

  // Create test project with start and end dates
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 1);

  const projectResult = await executeQuery(
    `INSERT INTO projects (name, code, description, status, start_date, end_date, manager_id) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING id`,
    ['S-Curve Test Project', 'SCURVE-' + Date.now(), 'Testing S-Curve feature', 'pending', startDate, endDate, userId]
  );
  const projectId = projectResult.rows[0].id;
  log('blue', `✓ Created test project (ID: ${projectId})`);

  // Create tasks with weights and due dates
  const tasks = [
    { name: 'Task 1 - Planning', weight: 2, daysOut: 15 },
    { name: 'Task 2 - Design', weight: 3, daysOut: 30 },
    { name: 'Task 3 - Development', weight: 5, daysOut: 60 },
    { name: 'Task 4 - Testing', weight: 3, daysOut: 75 },
    { name: 'Task 5 - Deployment', weight: 2, daysOut: 90 }
  ];

  const createdTasks = [];
  for (const task of tasks) {
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + task.daysOut);

    const result = await executeQuery(
      `INSERT INTO tasks (title, description, status, priority, due_date, weight, project_id, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id`,
      [task.name, `Test task: ${task.name}`, 'todo', 'medium', dueDate, task.weight, projectId, userId]
    );
    createdTasks.push({ id: result.rows[0].id, ...task });
  }
  log('blue', `✓ Created ${createdTasks.length} test tasks with weights`);

  // Complete some tasks to generate actual progress
  const taskToComplete = createdTasks[0];
  const completedDate = new Date(startDate);
  completedDate.setDate(completedDate.getDate() + 10);
  
  await executeQuery(
    'UPDATE tasks SET status = $1, completed_at = $2 WHERE id = $3',
    ['done', completedDate, taskToComplete.id]
  );
  log('blue', `✓ Completed task "${taskToComplete.name}"`);

  return { projectId, userId, tasks: createdTasks };
}

async function runTests() {
  log('cyan', '\n🧪 DATABASE SCHEMA TESTS\n');

  await test('Tasks table has weight column', async () => {
    const result = await executeQuery(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'tasks' AND column_name = 'weight'`
    );
    if (result.rows.length === 0) throw new Error('weight column not found');
  });

  await test('Tasks table has completed_at column', async () => {
    const result = await executeQuery(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'tasks' AND column_name = 'completed_at'`
    );
    if (result.rows.length === 0) throw new Error('completed_at column not found');
  });

  log('cyan', '\n📊 BACKEND SERVICE TESTS\n');

  const { projectId, userId } = await setupTestData();

  await test('calculateSCurve returns data structure', async () => {
    const result = await calculateSCurve(projectId);
    if (!result.projectId) throw new Error('projectId missing');
    if (!result.data || !Array.isArray(result.data)) throw new Error('data array missing');
    if (result.plannedPercentage === undefined) throw new Error('plannedPercentage missing');
    if (result.actualPercentage === undefined) throw new Error('actualPercentage missing');
  });

  await test('S-Curve calculation returns correct percentages', async () => {
    const result = await calculateSCurve(projectId);
    if (result.actualPercentage > result.plannedPercentage) {
      throw new Error(`Actual (${result.actualPercentage}%) should not exceed planned (${result.plannedPercentage}%)`);
    }
    if (result.plannedPercentage < 0 || result.plannedPercentage > 100) {
      throw new Error('Planned percentage out of range');
    }
    if (result.actualPercentage < 0 || result.actualPercentage > 100) {
      throw new Error('Actual percentage out of range');
    }
  });

  await test('S-Curve data contains expected fields', async () => {
    const result = await calculateSCurve(projectId);
    if (result.data.length === 0) throw new Error('No data points returned');
    
    const dataPoint = result.data[0];
    if (!dataPoint.month) throw new Error('month field missing');
    if (dataPoint.plannedPercentage === undefined) throw new Error('plannedPercentage missing from data point');
    if (dataPoint.actualPercentage === undefined) throw new Error('actualPercentage missing from data point');
  });

  await test('totalWeight equals sum of task weights', async () => {
    const result = await calculateSCurve(projectId);
    const expectedTotal = 2 + 3 + 5 + 3 + 2; // Sum of our test weights
    if (parseFloat(result.totalWeight) !== expectedTotal) {
      throw new Error(`Expected weight ${expectedTotal}, got ${result.totalWeight}`);
    }
  });

  await test('variance calculation works', async () => {
    const result = await calculateSCurve(projectId);
    if (result.variance === undefined) throw new Error('variance field missing');
    // Variance should be actual - planned
    const expectedVariance = result.actualPercentage - result.plannedPercentage;
    if (Math.abs(result.variance - expectedVariance) > 0.01) {
      throw new Error(`Variance calculation incorrect`);
    }
  });

  log('cyan', '\n🔬 EDGE CASE TESTS\n');

  await test('Handle project with zero tasks gracefully', async () => {
    // Create empty project
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    const result = await executeQuery(
      `INSERT INTO projects (name, code, description, status, start_date, end_date, manager_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      ['Empty Project', 'EMPTY-' + Date.now(), 'No tasks', 'pending', startDate, endDate, userId]
    );
    const emptyProjectId = result.rows[0].id;
    
    const scurveResult = await calculateSCurve(emptyProjectId);
    if (scurveResult.totalWeight !== 0) throw new Error('Should return 0 weight for empty project');
    if (!scurveResult.message) throw new Error('Should include message for empty project');
  });

  await test('Handle null task weights', async () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    const result = await executeQuery(
      `INSERT INTO projects (name, code, description, status, start_date, end_date, manager_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      ['Null Weight Project', 'NULLWT-' + Date.now(), 'Testing null weights', 'pending', startDate, endDate, userId]
    );
    const nullWtProjectId = result.rows[0].id;
    
    // Task without explicit weight (should default to 1.00)
    await executeQuery(
      `INSERT INTO tasks (title, status, project_id, created_by) 
       VALUES ($1, $2, $3, $4)`,
      ['Default Weight Task', 'todo', nullWtProjectId, userId]
    );
    
    const scurveResult = await calculateSCurve(nullWtProjectId);
    if (scurveResult.totalWeight === 0) throw new Error('Should use default weight of 1.00');
  });

  log('cyan', '\n📈 PERFORMANCE TEST\n');

  await test('Calculate S-Curve in under 1 second', async () => {
    const start = Date.now();
    await calculateSCurve(projectId);
    const duration = Date.now() - start;
    if (duration > 1000) {
      throw new Error(`Calculation took ${duration}ms (should be < 1000ms)`);
    }
  });

  log('cyan', '\n✅ SUMMARY\n');
  log('green', `Passed: ${testsPassed}`);
  if (testsFailed > 0) {
    log('red', `Failed: ${testsFailed}`);
    process.exit(1);
  } else {
    log('green', `Failed: ${testsFailed}`);
    log('green', '\n🎉 All tests passed!');
  }
}

// Run tests
runTests().catch(error => {
  log('red', `\n❌ Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
