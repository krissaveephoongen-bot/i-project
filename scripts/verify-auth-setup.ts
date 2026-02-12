#!/usr/bin/env node

/**
 * Verification script for authentication setup
 * Checks that all required files and configs are in place
 */

import fs from 'fs';
import path from 'path';

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function check(condition: boolean, message: string, isWarning = false) {
  if (condition) {
    console.log(`✅ ${message}`);
    checks.passed++;
  } else {
    if (isWarning) {
      console.warn(`⚠️ ${message}`);
      checks.warnings++;
    } else {
      console.error(`❌ ${message}`);
      checks.failed++;
    }
  }
}

function fileExists(filePath: string, description: string) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  check(exists, `${description} exists at ${filePath}`);
  return exists;
}

function fileContains(filePath: string, content: string, description: string) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    check(false, `${description} - file not found: ${filePath}`);
    return false;
  }
  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  const contains = fileContent.includes(content);
  check(contains, `${description} contains required content`);
  return contains;
}

function envVarExists(varName: string) {
  const exists = !!process.env[varName];
  check(exists, `Environment variable ${varName} is set`, true);
  return exists;
}

console.log('\n🔍 Authentication Setup Verification\n');

// ============================================================================
console.log('📁 Backend Files');
// ============================================================================

fileExists('next-app/lib/auth-utils.ts', 'Auth utilities');
fileExists('next-app/lib/auth-middleware.ts', 'Auth middleware');
fileExists('next-app/lib/api-client.ts', 'API client');
fileExists('next-app/app/api/auth/login/route.ts', 'Login endpoint');
fileExists('next-app/app/api/auth/verify/route.ts', 'Verify endpoint');
fileExists('next-app/app/api/auth/logout/route.ts', 'Logout endpoint');
fileExists('next-app/app/api/auth/refresh/route.ts', 'Refresh endpoint');

// ============================================================================
console.log('\n📁 Frontend Files');
// ============================================================================

fileExists('hooks/useAuthToken.ts', 'Auth token hook');

// ============================================================================
console.log('\n📁 Documentation Files');
// ============================================================================

fileExists('SCHEMA_FIX_GUIDE.md', 'Schema fix guide');
fileExists('FIXES_APPLIED.md', 'Fixes summary');

// ============================================================================
console.log('\n📋 Prisma Schema');
// ============================================================================

fileContains(
  'next-app/prisma/schema.prisma',
  'model AuthToken',
  'AuthToken model defined'
);

fileContains(
  'next-app/prisma/schema.prisma',
  'model Session',
  'Session model defined'
);

fileContains(
  'next-app/prisma/schema.prisma',
  'model ActivityLog',
  'ActivityLog model defined'
);

fileContains(
  'next-app/prisma/schema.prisma',
  '@map("auth_tokens")',
  'auth_tokens table mapping'
);

fileContains(
  'next-app/prisma/schema.prisma',
  '@map("sessions")',
  'sessions table mapping'
);

fileContains(
  'next-app/prisma/schema.prisma',
  '@map("created_at")',
  'Timestamp mapping to snake_case'
);

// ============================================================================
console.log('\n🗄️ Database Migration');
// ============================================================================

fileExists(
  'next-app/prisma/migrations/20260211_fix_schema/migration.sql',
  'Schema fix migration'
);

// ============================================================================
console.log('\n🔐 Environment Variables');
// ============================================================================

envVarExists('JWT_SECRET');
envVarExists('DATABASE_URL');

// ============================================================================
console.log('\n📝 Login Endpoint Implementation');
// ============================================================================

fileContains(
  'next-app/app/api/auth/login/route.ts',
  'generateAccessToken',
  'Access token generation in login'
);

fileContains(
  'next-app/app/api/auth/login/route.ts',
  'generateRefreshToken',
  'Refresh token generation in login'
);

fileContains(
  'next-app/app/api/auth/login/route.ts',
  'auth_tokens',
  'Token storage in auth_tokens table'
);

fileContains(
  'next-app/app/api/auth/login/route.ts',
  'sessions',
  'Session creation in login'
);

// ============================================================================
console.log('\n🔍 Verify Endpoint Implementation');
// ============================================================================

fileContains(
  'next-app/app/api/auth/verify/route.ts',
  'verifyToken',
  'JWT verification in verify endpoint'
);

fileContains(
  'next-app/app/api/auth/verify/route.ts',
  'auth_tokens',
  'Token revocation check in verify'
);

fileContains(
  'next-app/app/api/auth/verify/route.ts',
  'extractTokenFromHeader',
  'Bearer token extraction in verify'
);

// ============================================================================
console.log('\n🚪 Logout Endpoint Implementation');
// ============================================================================

fileContains(
  'next-app/app/api/auth/logout/route.ts',
  'revoked_at',
  'Token revocation in logout'
);

// ============================================================================
console.log('\n🔄 Refresh Endpoint Implementation');
// ============================================================================

fileContains(
  'next-app/app/api/auth/refresh/route.ts',
  'generateAccessToken',
  'New token generation in refresh'
);

// ============================================================================
console.log('\n🛡️ Middleware Implementation');
// ============================================================================

fileContains(
  'next-app/lib/auth-middleware.ts',
  'verifyAuth',
  'verifyAuth function exported'
);

fileContains(
  'next-app/lib/auth-middleware.ts',
  'requireRole',
  'Role checking function exported'
);

fileContains(
  'next-app/lib/auth-middleware.ts',
  'isAdmin',
  'Admin check function exported'
);

// ============================================================================
console.log('\n\n📊 Summary\n');
// ============================================================================

console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️ Warnings: ${checks.warnings}`);

if (checks.failed > 0) {
  console.log('\n❌ Setup is incomplete. Please review failures above.');
  process.exit(1);
}

if (checks.warnings > 0) {
  console.log('\n⚠️ Setup is mostly complete but some optional items are missing.');
  process.exit(0);
}

console.log('\n✅ All checks passed! Authentication setup is complete.');
console.log('\n📝 Next steps:');
console.log('  1. Run: npx prisma migrate deploy');
console.log('  2. Set JWT_SECRET in .env');
console.log('  3. Test login endpoint: POST /api/auth/login');
console.log('  4. Review SCHEMA_FIX_GUIDE.md for usage');
process.exit(0);
