// Check Login API implementation
const fs = require('fs');
const path = require('path');

async function checkLoginAPI() {
  console.log('🔍 ตรวจสอบ Login API Implementation...\n');
  
  try {
    // 1. Find login route file
    console.log('1️⃣ ค้นหาไฟล์ Login API:');
    
    const possiblePaths = [
      'next-app/app/api/auth/login/route.ts',
      'next-app/app/api/auth/login/route.js',
      'next-app/pages/api/auth/login.ts',
      'next-app/pages/api/auth/login.js',
      'backend/src/routes/auth/login.ts',
      'backend/src/routes/auth/login.js'
    ];
    
    let loginFile = null;
    for (const filePath of possiblePaths) {
      const fullPath = path.join(__dirname, filePath);
      if (fs.existsSync(fullPath)) {
        loginFile = fullPath;
        console.log(`✅ พบไฟล์: ${filePath}`);
        break;
      }
    }
    
    if (!loginFile) {
      console.log('❌ ไม่พบไฟล์ Login API');
      console.log('🔍 ค้นหาในโฟลเดอร์อื่น...');
      
      // Search for login files
      const searchDirs = ['next-app', 'backend'];
      for (const dir of searchDirs) {
        const dirPath = path.join(__dirname, dir);
        if (fs.existsSync(dirPath)) {
          console.log(`🔍 ค้นหาใน ${dir}...`);
          
          const findLoginFiles = (currentDir, depth = 0) => {
            if (depth > 3) return;
            
            const items = fs.readdirSync(currentDir);
            for (const item of items) {
              const itemPath = path.join(currentDir, item);
              const stat = fs.statSync(itemPath);
              
              if (stat.isDirectory() && (item.includes('auth') || item.includes('login'))) {
                console.log(`   📁 ${itemPath}`);
                findLoginFiles(itemPath, depth + 1);
              } else if (item.includes('login') && !stat.isDirectory()) {
                console.log(`   📄 ${itemPath}`);
                loginFile = itemPath;
                return;
              }
            }
          };
          
          findLoginFiles(dirPath);
        }
      }
    }
    
    // 2. Read login file if found
    if (loginFile && fs.existsSync(loginFile)) {
      console.log('\n2️⃣ อ่านไฟล์ Login API:');
      const content = fs.readFileSync(loginFile, 'utf8');
      console.log('📄 เนื้อหาไฟล์:');
      console.log(content.substring(0, 1000) + (content.length > 1000 ? '...' : ''));
      
      // Look for password checking logic
      console.log('\n🔍 ตรวจสอบ logic การตรวจสอบ password:');
      
      if (content.includes('password')) {
        console.log('✅ พบการใช้งาน password ใน code');
        
        // Look for password comparison patterns
        if (content.includes('bcrypt') || content.includes('compare')) {
          console.log('✅ พบการใช้ bcrypt.compare');
        }
        
        if (content.includes('users table') || content.includes('FROM users')) {
          console.log('✅ พบการ query จากตาราง users');
        }
        
        // Look for table name
        const tableMatches = content.match(/FROM\s+(\w+)/g);
        if (tableMatches) {
          console.log(`📋 ตารางที่ใช้: ${[...new Set(tableMatches.map(m => m[1]))].join(', ')}`);
        }
      } else {
        console.log('❌ ไม่พบการใช้งาน password ใน code');
      }
    }
    
    // 3. Check if there are authentication-related files
    console.log('\n3️⃣ ค้นหาไฟล์ authentication อื่นๆ:');
    
    const authFiles = [
      'auth.ts', 'auth.js', 
      'middleware.ts', 'middleware.js',
      'supabase.ts', 'supabase.js'
    ];
    
    for (const authFile of authFiles) {
      const searchPaths = [
        `next-app/lib/${authFile}`,
        `next-app/utils/${authFile}`,
        `backend/src/${authFile}`,
        `backend/lib/${authFile}`
      ];
      
      for (const filePath of searchPaths) {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
          console.log(`✅ พบ: ${filePath}`);
          
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('password') || content.includes('auth')) {
              console.log(`   📄 มีการใช้งาน password/auth`);
            }
          } catch (e) {
            console.log(`   ❌ ไม่สามารถอ่าน: ${e.message}`);
          }
        }
      }
    }
    
    // 4. Check database schema files
    console.log('\n4️⃣ ค้นหาไฟล์ database schema:');
    
    const schemaFiles = [
      'prisma/schema.prisma',
      'backend/db/schema.ts',
      'backend/lib/schema.ts'
    ];
    
    for (const schemaFile of schemaFiles) {
      const fullPath = path.join(__dirname, schemaFile);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ พบ schema: ${schemaFile}`);
        
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('User') || content.includes('user')) {
            console.log('   📋 มีการนิยาม User model');
            
            // Look for password field
            if (content.includes('password')) {
              console.log('   ✅ มีฟิลด์ password ใน schema');
            } else {
              console.log('   ❌ ไม่มีฟิลด์ password ใน schema');
            }
          }
        } catch (e) {
          console.log(`   ❌ ไม่สามารถอ่าน schema: ${e.message}`);
        }
      }
    }
    
    console.log('\n📋 สรุปผลการตรวจสอบ:');
    console.log('=====================================');
    console.log('💡 ข้อสรุป:');
    console.log('1. Login API อาจจะใช้วิธีการตรวจสอบ password ที่ไม่ตรงกับ schema');
    console.log('2. อาจจะอ่านจากตารางอื่น ไม่ใช้ users');
    console.log('3. อาจจะมีการเข้ารหัสที่แตกต่างกัน');
    console.log('4. ต้องตรวจสอบ source code ของ Login API โดยตรง');
    
    console.log('\n🔧 แนะนำการแก้ไข:');
    console.log('1. ตรวจสอบว่า Login API ใช้ตาราง users จริงๆ');
    console.log('2. ตรวจสอบว่ามีการเข้ารหัส password ที่ถูกต้อง');
    console.log('3. แก้ไข Login API ให้ใช้คอลัมน์ password จากตาราง users');
    console.log('4. ทดสอบและ deploy ใหม่');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

checkLoginAPI().catch(console.error);
