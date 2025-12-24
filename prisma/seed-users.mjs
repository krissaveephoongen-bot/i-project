import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const users = [
  {
    email: 'jakgrits.ph@appworks.co.th',
    password: '$2a$10$yW.odM7tSqm5R2GrVPxkYuFjAfdswb2BFK5FzYUSnuvaAbjHGZIOO', // Hashed password
    name: 'Jakgrits Phoongen',
    role: 'ADMIN',
    position: 'Project Manager',
    department: 'Project management'
  }
  // Add other users here if needed
];

async function main() {
  console.log('Starting user migration...');
  
  // Clean up existing users (optional, be careful with this in production)
  // await prisma.user.deleteMany({});
  
  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`Updating existing user: ${userData.email}`);
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            name: userData.name,
            role: userData.role,
            position: userData.position,
            department: userData.department,
            status: 'active'
          }
        });
      } else {
        console.log(`Creating new user: ${userData.email}`);
        await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            password: userData.password, // Already hashed
            role: userData.role,
            position: userData.position,
            department: userData.department,
            status: 'active',
            timezone: 'Asia/Bangkok'
          }
        });
      }
      console.log(`✅ User processed: ${userData.email}`);
    } catch (error) {
      console.error(`❌ Error processing user ${userData.email}:`, error);
    }
  }
  
  console.log('✅ User migration completed!');
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
