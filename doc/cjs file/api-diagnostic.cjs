#!/usr/bin/env node

/**
 * 🔍 API Diagnostic Script
 * Identifies specific issues with API endpoints
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting API Diagnostic...\n');

class APIDiagnostic {
  constructor() {
    this.issues = [];
    this.fixes = [];
  }

  // Check API route files for common issues
  diagnoseAPIRoutes() {
    console.log('🔍 Diagnosing API Routes...');
    
    const apiRoutes = [
      'next-app/app/api/stakeholders/route.ts',
      'next-app/app/api/expenses/route.ts',
      'next-app/app/api/admin/users/route.ts',
      'next-app/app/api/timesheet/route.ts'
    ];

    for (const route of apiRoutes) {
      if (fs.existsSync(route)) {
        console.log(`\n📁 Checking ${route}...`);
        this.checkRouteFile(route);
      } else {
        console.log(`\n❌ Missing: ${route}`);
        this.issues.push(`Missing API route: ${route}`);
      }
    }
  }

  checkRouteFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for common issues
      const checks = [
        { pattern: /export\s+async\s+function\s+GET/, name: 'GET function export', critical: true },
        { pattern: /export\s+async\s+function\s+POST/, name: 'POST function export', critical: false },
        { pattern: /import.*supabase/, name: 'Supabase import', critical: true },
        { pattern: /await.*supabase/, name: 'Supabase usage', critical: true },
        { pattern: /try\s*{/, name: 'Error handling (try)', critical: true },
        { pattern: /catch\s*\(/, name: 'Error handling (catch)', critical: true },
        { pattern: /return.*ok\(/, name: 'Success response', critical: true },
        { pattern: /return.*err\(/, name: 'Error response', critical: true }
      ];

      let missingCritical = [];
      let allIssues = [];

      for (const check of checks) {
        if (check.pattern.test(content)) {
          console.log(`    ✅ ${check.name}`);
        } else {
          console.log(`    ❌ ${check.name} ${check.critical ? '(CRITICAL)' : '(optional)'}`);
          allIssues.push(check.name);
          if (check.critical) {
            missingCritical.push(check.name);
          }
        }
      }

      if (missingCritical.length > 0) {
        this.issues.push(`${filePath}: Missing critical elements: ${missingCritical.join(', ')}`);
        this.generateFix(filePath, missingCritical);
      } else if (allIssues.length > 0) {
        console.log(`    ⚠️ Optional improvements needed: ${allIssues.join(', ')}`);
      } else {
        console.log(`    ✅ Route file structure looks good`);
      }

    } catch (error) {
      console.log(`    ❌ Error reading file: ${error.message}`);
      this.issues.push(`Error reading ${filePath}: ${error.message}`);
    }
  }

  generateFix(filePath, issues) {
    const fixes = [];
    
    if (issues.includes('GET function export')) {
      fixes.push('Add GET function: export async function GET(req) { ... }');
    }
    if (issues.includes('Supabase import')) {
      fixes.push('Add Supabase import: import { supabase } from "@/app/lib/supabaseClient"');
    }
    if (issues.includes('Error handling (try)')) {
      fixes.push('Add try-catch block around database operations');
    }
    if (issues.includes('Success response')) {
      fixes.push('Add success response: return ok(data, 200)');
    }
    if (issues.includes('Error response')) {
      fixes.push('Add error response: return err(error.message, 500)');
    }

    this.fixes.push({
      file: filePath,
      issues: issues,
      fixes: fixes
    });
  }

  // Check environment variables
  checkEnvironment() {
    console.log('\n🔍 Checking Environment Variables...');
    
    try {
      const envPath = '.env.local';
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        
        const requiredVars = [
          'DATABASE_URL',
          'NEXT_PUBLIC_SUPABASE_URL',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          'SUPABASE_SERVICE_ROLE_KEY'
        ];

        for (const varName of requiredVars) {
          if (content.includes(`${varName}=`)) {
            console.log(`    ✅ ${varName} found`);
          } else {
            console.log(`    ❌ ${varName} missing`);
            this.issues.push(`Missing environment variable: ${varName}`);
          }
        }
      } else {
        console.log('    ❌ .env.local file not found');
        this.issues.push('Missing .env.local file');
      }
    } catch (error) {
      console.log(`    ❌ Error checking environment: ${error.message}`);
      this.issues.push(`Environment check error: ${error.message}`);
    }
  }

  // Check database schema
  checkDatabaseSchema() {
    console.log('\n🔍 Checking Database Schema...');
    
    try {
      const schemaPath = 'prisma/schema.prisma';
      if (fs.existsSync(schemaPath)) {
        const content = fs.readFileSync(schemaPath, 'utf8');
        
        const requiredTables = [
          'users',
          'projects', 
          'clients',
          'expenses',
          'time_entries',
          'tasks',
          'contacts' // for stakeholders
        ];

        for (const table of requiredTables) {
          if (content.includes(`model ${table}`)) {
            console.log(`    ✅ Table ${table} found`);
          } else {
            console.log(`    ❌ Table ${table} missing`);
            this.issues.push(`Missing database table: ${table}`);
          }
        }
      } else {
        console.log('    ❌ Prisma schema not found');
        this.issues.push('Missing prisma/schema.prisma');
      }
    } catch (error) {
      console.log(`    ❌ Error checking schema: ${error.message}`);
      this.issues.push(`Schema check error: ${error.message}`);
    }
  }

  // Generate diagnostic report
  generateReport() {
    console.log('\n📊 Diagnostic Report');
    console.log('==================');
    
    if (this.issues.length === 0) {
      console.log('✅ No critical issues found!');
    } else {
      console.log(`❌ Found ${this.issues.length} issues:`);
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    if (this.fixes.length > 0) {
      console.log('\n🔧 Suggested Fixes:');
      this.fixes.forEach((fix, index) => {
        console.log(`\n${index + 1}. Fix ${fix.file}:`);
        fix.fixes.forEach((fixItem, fixIndex) => {
          console.log(`   ${fixIndex + 1}. ${fixItem}`);
        });
      });
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      issues: this.issues,
      fixes: this.fixes,
      recommendations: this.getRecommendations()
    };

    fs.writeFileSync('api-diagnostic-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved: api-diagnostic-report.json');
  }

  getRecommendations() {
    const recommendations = [];

    if (this.issues.some(issue => issue.includes('DATABASE_URL'))) {
      recommendations.push('Set up DATABASE_URL in .env.local with your Supabase connection string');
    }

    if (this.issues.some(issue => issue.includes('Supabase import'))) {
      recommendations.push('Add Supabase client import to API routes');
    }

    if (this.issues.some(issue => issue.includes('GET function export'))) {
      recommendations.push('Ensure all API routes have proper GET function exports');
    }

    if (this.issues.some(issue => issue.includes('Error handling'))) {
      recommendations.push('Add proper try-catch error handling to all API routes');
    }

    if (recommendations.length === 0) {
      recommendations.push('API routes appear to be structured correctly. Check server logs for runtime errors.');
    }

    return recommendations;
  }

  // Run complete diagnostic
  runDiagnostic() {
    console.log('🚀 Starting Complete API Diagnostic...\n');
    
    this.checkEnvironment();
    this.checkDatabaseSchema();
    this.diagnoseAPIRoutes();
    this.generateReport();
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Fix the issues identified above');
    console.log('2. Restart the development server');
    console.log('3. Run: node robust-crud-tests.cjs');
    console.log('4. Check the server console for any remaining errors');
  }
}

// Run diagnostic if executed directly
if (require.main === module) {
  const diagnostic = new APIDiagnostic();
  diagnostic.runDiagnostic();
}

module.exports = APIDiagnostic;
