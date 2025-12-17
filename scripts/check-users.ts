import prisma from '../prisma/prisma-client';

async function checkUsers() {
  try {
    // Count total users
    const userCount = await prisma.user.count();
    console.log(`\n📊 จำนวนผู้ใช้ทั้งหมดในระบบ: ${userCount} คน\n`);

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

    if (users.length > 0) {
      console.log('📝 รายชื่อผู้ใช้ทั้งหมด:');
      console.log('----------------------------------------');
      console.log('ID                                  | ชื่อ-นามสกุล        | อีเมล                     | สิทธิ์     | วันที่สมัคร');
      console.log('----------------------------------------');
      
      users.forEach(user => {
        console.log(
          `${user.id} | ${user.name.padEnd(20)} | ${user.email.padEnd(25)} | ${user.role.padEnd(8)} | ${user.createdAt.toLocaleString('th-TH')}`
        );
      });
      
      console.log('----------------------------------------\n');
    } else {
      console.log('❌ ไม่พบผู้ใช้ในระบบ');
    }
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
checkUsers();
