// Fix hourly_rate column issue in Projects Create API
const fs = require('fs');
const path = require('path');

function fixHourlyRateIssue() {
  const filePath = path.join(__dirname, 'next-app/app/api/projects/create/route.ts');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove hourly_rate from the query since it doesn't exist in projects table
    // It should be in users table, not projects table
    content = content.replace(/hourly_rate,/g, '');
    content = content.replace(/,hourly_rate/g, '');
    content = content.replace(/hourly_rate/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Fixed: next-app/app/api/projects/create/route.ts (removed hourly_rate)');
    return true;
  } catch (error) {
    console.error('❌ Error fixing hourly_rate issue:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔧 แก้ไขปัญหา hourly_rate column...\n');
  
  if (fixHourlyRateIssue()) {
    console.log('✅ แก้ไขสำเร็จ!');
    console.log('\n🚀 ขั้นตอนถัดไป:');
    console.log('1. cd next-app && npm run build');
    console.log('2. vercel --prod');
    console.log('3. node test-final-fixes.cjs');
    console.log('\n🎯 คาดหวังว่า Projects Create API จะทำงานได้!');
  } else {
    console.log('❌ แก้ไขล้มเหลว');
  }
}

main().catch(console.error);
