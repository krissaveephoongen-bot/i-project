#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Checks if .env files are properly configured
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFile(filePath, name) {
  log(colors.blue, `\n📋 Checking ${name}...`);

  if (!fs.existsSync(filePath)) {
    log(colors.red, `✗ ${name} not found: ${filePath}`);
    return { exists: false, errors: [] };
  }

  log(colors.green, `✓ ${name} exists`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  const errors = [];

  return { exists: true, content, lines, errors };
}

function validateFrontend() {
  log(colors.blue, '\n🔍 FRONTEND VALIDATION');
  log(colors.blue, '='.repeat(50));

  const result = checkFile('.env.local', 'Frontend .env.local');

  if (!result.exists) {
    log(colors.yellow, '\nℹ Create .env.local from .env.local.example:');
    log(colors.yellow, '  cp .env.local.example .env.local');
    return;
  }

  // Required variables
  const required = ['VITE_API_URL'];
  const variables = {};

  result.lines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    variables[key.trim()] = valueParts.join('=').trim();
  });

  log(colors.blue, '\nRequired Variables:');
  required.forEach(key => {
    if (variables[key]) {
      log(colors.green, `  ✓ ${key} = ${variables[key]}`);
    } else {
      log(colors.red, `  ✗ ${key} - MISSING`);
      result.errors.push(`Missing required variable: ${key}`);
    }
  });

  // Optional variables with warnings
  if (!variables['VITE_SUPABASE_URL']) {
    log(colors.yellow, '  ℹ VITE_SUPABASE_URL - not set (optional)');
  }

  // Check if API URL is valid
  if (variables['VITE_API_URL']) {
    try {
      new URL(variables['VITE_API_URL']);
      log(colors.green, '  ✓ VITE_API_URL is valid URL format');
    } catch (e) {
      log(colors.red, '  ✗ VITE_API_URL is not a valid URL');
      result.errors.push('VITE_API_URL is not a valid URL');
    }
  }

  return result;
}

function validateBackend() {
  log(colors.blue, '\n🔍 BACKEND VALIDATION');
  log(colors.blue, '='.repeat(50));

  const result = checkFile('.env', 'Backend .env');

  if (!result.exists) {
    log(colors.yellow, '\nℹ Create .env from .env.backend.example:');
    log(colors.yellow, '  cp .env.backend.example .env');
    return;
  }

  // Required variables
  const required = [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
    'SESSION_SECRET',
    'CORS_ORIGIN',
    'ADMIN_EMAIL',
  ];

  const variables = {};

  result.lines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    variables[key.trim()] = valueParts.join('=').trim();
  });

  log(colors.blue, '\nRequired Variables:');
  required.forEach(key => {
    if (variables[key]) {
      const value = variables[key];
      // Hide sensitive values
      const display =
        key.includes('SECRET') || key.includes('PASSWORD')
          ? '[hidden]'
          : value.substring(0, 50) + (value.length > 50 ? '...' : '');
      log(colors.green, `  ✓ ${key} = ${display}`);
    } else {
      log(colors.red, `  ✗ ${key} - MISSING`);
      result.errors.push(`Missing required variable: ${key}`);
    }
  });

  // Validation checks
  log(colors.blue, '\nValidation Checks:');

  // Check JWT_SECRET length
  if (variables['JWT_SECRET']) {
    if (variables['JWT_SECRET'].length >= 32) {
      log(colors.green, `  ✓ JWT_SECRET length: ${variables['JWT_SECRET'].length} chars (good)`);
    } else {
      log(colors.yellow, `  ⚠ JWT_SECRET length: ${variables['JWT_SECRET'].length} chars (should be 32+)`);
      result.errors.push('JWT_SECRET should be at least 32 characters');
    }
  }

  // Check SESSION_SECRET length
  if (variables['SESSION_SECRET']) {
    if (variables['SESSION_SECRET'].length >= 32) {
      log(colors.green, `  ✓ SESSION_SECRET length: ${variables['SESSION_SECRET'].length} chars (good)`);
    } else {
      log(colors.yellow, `  ⚠ SESSION_SECRET length: ${variables['SESSION_SECRET'].length} chars (should be 32+)`);
      result.errors.push('SESSION_SECRET should be at least 32 characters');
    }
  }

  // Check DATABASE_URL format
  if (variables['DATABASE_URL']) {
    if (variables['DATABASE_URL'].startsWith('postgresql://')) {
      log(colors.green, '  ✓ DATABASE_URL format is valid');
    } else {
      log(colors.red, '  ✗ DATABASE_URL should start with postgresql://');
      result.errors.push('Invalid DATABASE_URL format');
    }
  }

  // Check ADMIN_EMAIL format
  if (variables['ADMIN_EMAIL']) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(variables['ADMIN_EMAIL'])) {
      log(colors.green, `  ✓ ADMIN_EMAIL format is valid`);
    } else {
      log(colors.yellow, `  ⚠ ADMIN_EMAIL format looks invalid`);
    }
  }

  // Check CORS_ORIGIN
  if (variables['CORS_ORIGIN']) {
    try {
      new URL(variables['CORS_ORIGIN']);
      log(colors.green, '  ✓ CORS_ORIGIN is valid URL');
    } catch (e) {
      log(colors.yellow, '  ⚠ CORS_ORIGIN may not be valid URL format');
    }
  }

  // Optional warnings
  log(colors.blue, '\nOptional Variables:');
  const optional = ['REDIS_URL'];
  optional.forEach(key => {
    if (variables[key]) {
      log(colors.green, `  ✓ ${key} is set`);
    } else {
      log(colors.yellow, `  ℹ ${key} - not set (optional)`);
    }
  });

  return result;
}

function summary(frontendResult, backendResult) {
  log(colors.blue, '\n📊 SUMMARY');
  log(colors.blue, '='.repeat(50));

  const totalErrors =
    (frontendResult?.errors?.length || 0) + (backendResult?.errors?.length || 0);

  if (totalErrors === 0) {
    log(colors.green, '✓ All environment variables are properly configured!');
    log(colors.green, '\nYou can now run:');
    log(colors.yellow, '  npm run dev          # Frontend');
    log(colors.yellow, '  npm run dev          # Backend');
    return true;
  } else {
    log(colors.red, `✗ Found ${totalErrors} error(s)\n`);

    if (frontendResult?.errors?.length > 0) {
      log(colors.red, 'Frontend errors:');
      frontendResult.errors.forEach(err => log(colors.red, `  - ${err}`));
    }

    if (backendResult?.errors?.length > 0) {
      log(colors.red, 'Backend errors:');
      backendResult.errors.forEach(err => log(colors.red, `  - ${err}`));
    }

    return false;
  }
}

// Main execution
console.clear();
log(colors.blue, '╔════════════════════════════════════════════╗');
log(colors.blue, '║  Environment Variables Validation Script   ║');
log(colors.blue, '╚════════════════════════════════════════════╝');

// Check if running from project root
if (!fs.existsSync('package.json')) {
  log(colors.red, '\n✗ Error: Run this script from project root directory');
  process.exit(1);
}

const frontendResult = validateFrontend();
const backendResult = validateBackend();

const success = summary(frontendResult, backendResult);

process.exit(success ? 0 : 1);
