// Batch fix all createdAt to created_at in API files
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'next-app/app/api/auth/login/route.ts',
  'next-app/app/api/auth/register/route.ts',
  'next-app/app/api/dashboard/activities/route.ts',
  'next-app/app/api/dev/seed/route.ts',
  'next-app/app/api/direct-cashflow-query/route.ts',
  'next-app/app/api/direct-projects-query/route.ts',
  'next-app/app/api/direct-snapshot-query/route.ts',
  'next-app/app/api/expenses/route.ts',
  'next-app/app/api/projects/create/route.ts',
  'next-app/app/api/projects/documents/route.ts',
  'next-app/app/api/projects/milestones/create/route.ts',
  'next-app/app/api/projects/overview/[id]/route.ts',
  'next-app/app/api/projects/risks/route.ts',
  'next-app/app/api/projects/tasks/create/route.ts',
  'next-app/app/api/projects/update/route.ts',
  'next-app/app/api/projects/[id]/scurve/route.ts',
  'next-app/app/api/sales/activities/route.ts',
  'next-app/app/api/sales/deals/route.ts',
  'next-app/app/api/sales/deals/[id]/route.ts',
  'next-app/app/api/sales/pipeline/route.ts',
  'next-app/app/api/staff/projects/route.ts',
  'next-app/app/api/staff/tasks/route.ts',
  'next-app/app/api/staff/timesheet/route.ts',
  'next-app/app/api/tasks/route.ts',
  'next-app/app/api/users/profile/route.ts',
  'next-app/app/api/users/route.ts',
  'next-app/app/api/vendor/tasks/route.ts',
  'next-app/app/api/_lib/schema.ts'
];

function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Replace all instances of createdAt with created_at
    content = content.replace(/createdAt/g, 'created_at');
    
    // Also replace updatedAt with updated_at
    content = content.replace(/updatedAt/g, 'updated_at');
    
    // Replace other common camelCase to snake_case patterns
    content = content.replace(/isActive/g, 'is_active');
    content = content.replace(/isDeleted/g, 'is_deleted');
    content = content.replace(/failedLoginAttempts/g, 'failed_login_attempts');
    content = content.replace(/lastLogin/g, 'last_login');
    content = content.replace(/lockedUntil/g, 'locked_until');
    content = content.replace(/resetToken/g, 'reset_token');
    content = content.replace(/resetTokenExpiry/g, 'reset_token_expiry');
    content = content.replace(/isProjectManager/g, 'is_project_manager');
    content = content.replace(/isSupervisor/g, 'is_supervisor');
    content = content.replace(/hourlyRate/g, 'hourly_rate');
    content = content.replace(/employeeCode/g, 'employee_code');
    content = content.replace(/nameTh/g, 'name_th');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function fixAllFiles() {
  console.log('🔧 Batch fix all createdAt to created_at...\n');
  
  let fixedCount = 0;
  let errorCount = 0;
  
  for (const filePath of filesToFix) {
    try {
      const fixed = fixFile(filePath);
      if (fixed) fixedCount++;
    } catch (error) {
      console.error(`❌ Error with ${filePath}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📋 สรุปผล:');
  console.log('=====================================');
  console.log(`✅ แก้ไขสำเร็จ: ${fixedCount} ไฟล์`);
  console.log(`❌ แก้ไขล้มเหลว: ${errorCount} ไฟล์`);
  console.log(`📊 ทั้งหมด: ${filesToFix.length} ไฟล์`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 แก้ไข column names เสร็จสมบูรณ์!');
    console.log('📝 การเปลี่ยนแปลง:');
    console.log('   - createdAt → created_at');
    console.log('   - updatedAt → updated_at');
    console.log('   - isActive → is_active');
    console.log('   - isDeleted → is_deleted');
    console.log('   - failedLoginAttempts → failed_login_attempts');
    console.log('   - lastLogin → last_login');
    console.log('   - lockedUntil → locked_until');
    console.log('   - resetToken → reset_token');
    console.log('   - resetTokenExpiry → reset_token_expiry');
    console.log('   - isProjectManager → is_project_manager');
    console.log('   - isSupervisor → is_supervisor');
    console.log('   - hourlyRate → hourly_rate');
    console.log('   - employeeCode → employee_code');
    console.log('   - nameTh → name_th');
    
    console.log('\n🚀 ตอนนี้สามารถ deploy ได้แล้ว!');
  }
}

fixAllFiles().catch(console.error);
