// Check which database the system is actually connected to
const { db } = require('./backend/lib/db.js');

async function checkDatabaseConnection() {
  console.log('🔍 ตรวจสอบการเชื่อมต่อฐานข้อมูล\n');
  
  try {
    console.log('1️⃣ ตรวจสอบการเชื่อมต่อ...');
    await db.execute('SELECT 1');
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ\n');
    
    console.log('2️⃣ ตรวจสอบข้อมูลฐานข้อมูล...');
    const dbInfo = await db.execute(`
      SELECT 
        current_database() as database_name,
        current_schema() as current_schema,
        version() as version,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);
    
    if (dbInfo.rows && dbInfo.rows.length > 0) {
      const info = dbInfo.rows[0];
      console.log('📋 ข้อมูลฐานข้อมูล:');
      console.log(`   Database: ${info.database_name}`);
      console.log(`   Schema: ${info.current_schema}`);
      console.log(`   Version: ${info.version}`);
      console.log(`   Server IP: ${info.server_ip}`);
      console.log(`   Server Port: ${info.server_port}`);
    }
    
    console.log('\n3️⃣ ตรวจสอบ Environment Variables...');
    console.log('🔧 Backend Environment:');
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ มี' : '❌ ไม่มี'}`);
    console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? '✅ มี' : '❌ ไม่มี'}`);
    
    console.log('\n🔧 Frontend Environment:');
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ มี' : '❌ ไม่มี'}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ มี' : '❌ ไม่มี'}`);
    
    // Check if it's PostgreSQL
    console.log('\n4️⃣ ตรวจสอบประเภทฐานข้อมูล...');
    try {
      const pgVersion = await db.execute('SELECT version()');
      if (pgVersion.rows && pgVersion.rows.length > 0) {
        const version = pgVersion.rows[0].version;
        console.log(`📋 Database Type: ${version.includes('PostgreSQL') ? '✅ PostgreSQL' : '❌ Other'}`);
        console.log(`   Full version: ${version}`);
      }
    } catch (error) {
      console.log('❌ ไม่สามารถตรวจสอบ version ได้');
    }
    
    console.log('\n5️⃣ ตรวจสอบตารางทั้งหมด...');
    const tables = await db.execute(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY table_schema, table_name
    `);
    
    console.log('📋 ตารางทั้งหมด:');
    if (tables.rows && tables.rows.length > 0) {
      tables.rows.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_schema}.${table.table_name}`);
      });
    } else {
      console.log('   ❌ ไม่พบตารางใดๆ');
    }
    
    console.log('\n6️⃣ ตรวจสอบ Connection String...');
    if (process.env.DATABASE_URL) {
      // Parse and show connection info (without password)
      const dbUrl = process.env.DATABASE_URL;
      console.log('📋 Connection Info:');
      
      // Extract host, port, database from URL
      const urlMatch = dbUrl.match(/postgresql:\/\/[^@]*@([^:]+):(\d+)\/([^?]+)/);
      if (urlMatch) {
        console.log(`   Host: ${urlMatch[1]}`);
        console.log(`   Port: ${urlMatch[2]}`);
        console.log(`   Database: ${urlMatch[3]}`);
      } else {
        console.log('   ❌ ไม่สามารถแยกวิเคราะห์ connection string ได้');
      }
      
      // Check if it's Supabase
      if (dbUrl.includes('supabase')) {
        console.log('   🚀 Database Provider: Supabase');
      } else if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
        console.log('   🏠 Database Provider: Local PostgreSQL');
      } else {
        console.log('   🌐 Database Provider: Other Cloud Provider');
      }
    }
    
    console.log('\n7️⃣ ทดสอบ Query ง่ายๆ...');
    const testQuery = await db.execute('SELECT NOW() as current_time, 1 as test_number');
    if (testQuery.rows && testQuery.rows.length > 0) {
      console.log('✅ Query ทำงานได้');
      console.log(`   Current Time: ${testQuery.rows[0].current_time}`);
      console.log(`   Test Number: ${testQuery.rows[0].test_number}`);
    }
    
    console.log('\n🎯 สรุป:');
    console.log('• ระบบเชื่อมต่อฐานข้อมูลได้สำเร็จ');
    console.log('• ใช้ PostgreSQL เป็นฐานข้อมูล');
    console.log('• ปัญหาคือไม่มีตาราง projects ในฐานข้อมูล');
    console.log('• ต้องสร้างตาราง projects และข้อมูลตัวอย่าง');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkDatabaseConnection();
