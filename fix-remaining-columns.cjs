// Fix remaining column name issues
const fs = require('fs');
const path = require('path');

// Files that still have column name issues
const filesToFix = [
  'next-app/app/api/projects/route.ts',
  'next-app/app/api/reports/financial/route.ts',
  'next-app/app/api/reports/projects/route.ts'
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
    
    // Fix specific column issues
    content = content.replace(/updatedAt/g, 'updated_at');
    content = content.replace(/startDate/g, 'start_date');
    content = content.replace(/endDate/g, 'end_date');
    content = content.replace(/progressPlan/g, 'progress_plan');
    content = content.replace(/dueDate/g, 'due_date');
    content = content.replace(/projectId/g, 'project_id');
    content = content.replace(/clientId/g, 'client_id');
    content = content.replace(/managerId/g, 'manager_id');
    content = content.replace(/userId/g, 'user_id');
    content = content.replace(/taskId/g, 'task_id');
    content = content.replace(/milestoneId/g, 'milestone_id');
    content = content.replace(/riskId/g, 'risk_id');
    content = content.replace(/expenseId/g, 'expense_id');
    content = content.replace(/dealId/g, 'deal_id');
    content = content.replace(/activityId/g, 'activity_id');
    content = content.replace(/timesheetId/g, 'timesheet_id');
    content = content.replace(/entryId/g, 'entry_id');
    
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
  console.log('🔧 Fix remaining column name issues...\n');
  
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
    console.log('\n🎉 แก้ไข column names เพิ่มเติมสำเร็จ!');
    console.log('📝 การเปลี่ยนแปลง:');
    console.log('   - updatedAt → updated_at');
    console.log('   - startDate → start_date');
    console.log('   - endDate → end_date');
    console.log('   - progressPlan → progress_plan');
    console.log('   - dueDate → due_date');
    console.log('   - projectId → project_id');
    console.log('   - clientId → client_id');
    console.log('   - managerId → manager_id');
    console.log('   - userId → user_id');
    console.log('   - taskId → task_id');
    console.log('   - milestoneId → milestone_id');
    console.log('   - riskId → risk_id');
    console.log('   - expenseId → expense_id');
    console.log('   - dealId → deal_id');
    console.log('   - activityId → activity_id');
    console.log('   - timesheetId → timesheet_id');
    console.log('   - entryId → entry_id');
    
    console.log('\n🚀 ตอนนี้สามารถอ deploy ได้แล้ว!');
  }
}

fixAllFiles().catch(console.error);
