const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client with the database URL
const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://neondb_owner:npg_6FSH4YyQIoeb@ep-muddy-cherry-ah612m1a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&connection_limit=1',
  log: ['query', 'info', 'warn', 'error']
});

async function countUsers() {
  try {
    console.log('🔄 กำลังเชื่อมต่อกับฐานข้อมูล...');
    
    // Test the connection
    await prisma.$connect();
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');
    
    // Count users
    const count = await prisma.user.count();
    console.log(`\n📊 จำนวนผู้ใช้ทั้งหมดในระบบ: ${count} คน`);
    
    if (count > 0) {
      // Get all users with their details
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log('\n📝 รายชื่อผู้ใช้ทั้งหมด:');
      console.log(''.padEnd(120, '-'));
      console.log('ID'.padEnd(38) + ' | ' + 'ชื่อ-นามสกุล'.padEnd(20) + ' | ' + 'อีเมล'.padEnd(25) + ' | ' + 'สิทธิ์'.padEnd(8) + ' | วันที่สมัคร');
      console.log(''.padEnd(120, '-'));
      
      users.forEach(user => {
        const formattedDate = user.createdAt.toLocaleString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        console.log(
          `${user.id} | ${String(user.name || '').padEnd(20)} | ${String(user.email || '').padEnd(25)} | ${String(user.role || '').padEnd(8)} | ${formattedDate}`
        );
      });
      
      console.log(''.padEnd(120, '-') + '\n');
    } else {
      console.log('\n❌ ไม่พบผู้ใช้ในระบบ\n');
    }
  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:');
    console.error(error);
    
    // More detailed error information
    if (error.code) {
      console.error(`\nรหัสข้อผิดพลาด: ${error.code}`);
    }
    
    if (error.meta) {
      console.error('ข้อมูลเพิ่มเติม:', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('❌ เกิดข้อผิดพลาดในการปิดการเชื่อมต่อ:', e);
    }
    process.exit(1);
  }
}

// Run the function
countUsers();
