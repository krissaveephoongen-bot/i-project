import { seedUsers } from './users';
// Import other seed functions as they are created

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Run all seed functions
    await seedUsers();
    // Add other seed function calls here
    
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close the Prisma client
    const prisma = (await import('../config/prisma')).default;
    await prisma.$disconnect();
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Fatal error during seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      const prisma = (await import('../config/prisma')).default;
      await prisma.$disconnect();
    });
}

export { seedUsers };
// Export other seed functions as they are created
