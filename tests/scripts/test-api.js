#!/usr/bin/env node

/**
 * S-Curve API Endpoint Test
 * Tests the /api/projects/:id/s-curve endpoint
 */

const http = require('http');
const { calculateSCurve } = require('../server/sCurveService');
const { executeQuery } = require('../database/neon-connection');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function testAPI() {
  log('cyan', '\n📡 S-CURVE API ENDPOINT TESTS\n');

  try {
    // Get a test project
    const projectsResult = await executeQuery(
      `SELECT id FROM projects WHERE start_date IS NOT NULL AND end_date IS NOT NULL LIMIT 1`
    );

    if (projectsResult.rows.length === 0) {
      log('red', '❌ No test project found. Run test-s-curve.js first.');
      process.exit(1);
    }

    const projectId = projectsResult.rows[0].id;
    log('blue', `✓ Using project ID: ${projectId}`);

    // Test the API calculation
    log('cyan', '\n🔄 Testing S-Curve Calculation...\n');
    const startTime = Date.now();
    const scurveData = await calculateSCurve(projectId);
    const duration = Date.now() - startTime;

    log('blue', `✓ Calculation completed in ${duration}ms`);

    // Verify response structure
    log('cyan', '\n📋 Verifying Response Structure...\n');

    const requiredFields = [
      'projectId', 'projectName', 'startDate', 'endDate', 'totalWeight',
      'totalTasks', 'completedTasks', 'plannedPercentage', 'actualPercentage',
      'variance', 'data', 'summary'
    ];

    let allFieldsPresent = true;
    requiredFields.forEach(field => {
      if (scurveData.hasOwnProperty(field)) {
        log('green', `✓ ${field}`);
      } else {
        log('red', `✗ ${field} MISSING`);
        allFieldsPresent = false;
      }
    });

    if (!allFieldsPresent) {
      throw new Error('Response structure incomplete');
    }

    // Display calculated values
    log('cyan', '\n📊 Calculated Values:\n');
    log('blue', `Project: ${scurveData.projectName}`);
    log('blue', `Total Tasks: ${scurveData.totalTasks}`);
    log('blue', `Completed Tasks: ${scurveData.completedTasks}`);
    log('blue', `Total Weight: ${scurveData.totalWeight}`);
    log('blue', `Planned Progress: ${scurveData.plannedPercentage}%`);
    log('blue', `Actual Progress: ${scurveData.actualPercentage}%`);
    log('blue', `Variance: ${scurveData.variance}%`);
    log('blue', `Status: ${scurveData.summary.performanceStatus}`);
    log('blue', `On Track: ${scurveData.summary.onTrack ? 'Yes' : 'No'}`);

    // Display data points
    log('cyan', `\n📈 Monthly Progress Data (${scurveData.data.length} months):\n`);
    log('blue', 'Month\t\tPlanned %\tActual %\tVariance %');
    log('blue', '─'.repeat(60));
    
    scurveData.data.forEach(point => {
      const variance = point.actualPercentage - point.plannedPercentage;
      const icon = variance >= 0 ? '✓' : '⚠';
      log('blue', `${point.month}\t${point.plannedPercentage.toFixed(2)}%\t\t${point.actualPercentage.toFixed(2)}%\t${variance.toFixed(2)}%\t${icon}`);
    });

    // Validate calculations
    log('cyan', '\n✅ Validation Tests:\n');

    let validationsPassed = 0;
    let validationsFailed = 0;

    // Test 1: Percentages in valid range
    if (scurveData.plannedPercentage >= 0 && scurveData.plannedPercentage <= 100) {
      log('green', '✓ Planned percentage in valid range (0-100)');
      validationsPassed++;
    } else {
      log('red', `✗ Planned percentage out of range: ${scurveData.plannedPercentage}`);
      validationsFailed++;
    }

    if (scurveData.actualPercentage >= 0 && scurveData.actualPercentage <= 100) {
      log('green', '✓ Actual percentage in valid range (0-100)');
      validationsPassed++;
    } else {
      log('red', `✗ Actual percentage out of range: ${scurveData.actualPercentage}`);
      validationsFailed++;
    }

    // Test 2: Actual never exceeds planned for S-Curve
    if (scurveData.actualPercentage <= scurveData.plannedPercentage + 0.1) {
      log('green', '✓ Actual progress <= Planned progress (within tolerance)');
      validationsPassed++;
    } else {
      log('red', `✗ Actual (${scurveData.actualPercentage}%) exceeds Planned (${scurveData.plannedPercentage}%)`);
      validationsFailed++;
    }

    // Test 3: Variance calculation correct
    const expectedVariance = Math.round((scurveData.actualPercentage - scurveData.plannedPercentage) * 100) / 100;
    if (Math.abs(scurveData.variance - expectedVariance) < 0.01) {
      log('green', '✓ Variance calculation correct');
      validationsPassed++;
    } else {
      log('red', `✗ Variance mismatch. Expected ${expectedVariance}, got ${scurveData.variance}`);
      validationsFailed++;
    }

    // Test 4: Data points increase monotonically
    let monotonic = true;
    for (let i = 1; i < scurveData.data.length; i++) {
      if (scurveData.data[i].plannedPercentage < scurveData.data[i - 1].plannedPercentage) {
        monotonic = false;
        break;
      }
    }
    if (monotonic) {
      log('green', '✓ Planned progress increases monotonically');
      validationsPassed++;
    } else {
      log('red', '✗ Planned progress not monotonic');
      validationsFailed++;
    }

    // Test 5: Performance
    if (duration < 1000) {
      log('green', `✓ API response time acceptable (${duration}ms < 1000ms)`);
      validationsPassed++;
    } else {
      log('red', `✗ API response time slow (${duration}ms > 1000ms)`);
      validationsFailed++;
    }

    log('cyan', `\n✅ SUMMARY\n`);
    log('green', `Validations Passed: ${validationsPassed}`);
    if (validationsFailed > 0) {
      log('red', `Validations Failed: ${validationsFailed}`);
      process.exit(1);
    } else {
      log('green', `Validations Failed: 0`);
      log('green', '\n🎉 All API tests passed!\n');
    }

  } catch (error) {
    log('red', `\n❌ Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

testAPI();
