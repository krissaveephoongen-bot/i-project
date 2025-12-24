import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Map the input role to Prisma Role enum
function mapRole(role: string): Role {
  switch (role) {
    case 'ADMIN':
      return Role.ADMIN;
    case 'MANAGER':
      return Role.PROJECT_MANAGER;
    case 'USER':
    default:
      return Role.USER;
  }
}

async function main() {
  // Clean up existing users to avoid duplicates
  console.log('Cleaning up existing users...');
  await prisma.user.deleteMany({});
  console.log('✅ Existing users deleted');

  const users = [
    {
      "email": "thanongsak.th@appworks.co.th",
      "password": "$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K",
      "name": "Thanongsak Thongkwid",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2025-07-15T15:36:35.482Z",
      "updatedAt": "2025-07-15T15:36:35.482Z",
      "id": "82df756a-4d46-4e49-b927-bb165d7dc489",
      "failedLoginAttempts": 0,
      "isDeleted": false,
      "lastLogin": null,
      "lockedUntil": null,
      "resetToken": null,
      "resetTokenExpiry": null,
      "position": "Vice President",
      "department": "Project management"
    },
    // ... [other user objects remain the same]
    {
      "email": "pattaraprapa.ch@appworks.co.th",
      "password": "$2a$10$Odd8TQ.AISv1AOhVjEaNR.ZXtDNyD93dRnQphK4NoG6FnHaJRB9WC",
      "name": "Pattaraprapa Chotipattachakorn",
      "role": "MANAGER",
      "isActive": true,
      "createdAt": "2025-07-15T15:36:35.482Z",
      "updatedAt": "2025-07-16T11:08:06.230Z",
      "id": "6aab71dd-03aa-4936-8091-a141ec3e2cf2",
      "failedLoginAttempts": 0,
      "isDeleted": false,
      "lastLogin": null,
      "lockedUntil": null,
      "resetToken": null,
      "resetTokenExpiry": null,
      "position": "Senior Project Manager",
      "department": "Project management"
    }
  ];

  console.log('Starting user migration...');
  
  // Process each user
  console.log('Starting to import users...');
  for (const userData of users) {
    try {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          role: mapRole(userData.role),
          position: userData.position || null,
          department: userData.department || null,
          status: userData.isActive ? 'active' : 'inactive',
          lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : null,
          resetToken: userData.resetToken || null,
          resetTokenExpires: userData.resetTokenExpiry ? new Date(userData.resetTokenExpiry) : null,
          updatedAt: new Date(userData.updatedAt),
        },
        create: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          password: userData.password,
          role: mapRole(userData.role),
          position: userData.position || null,
          department: userData.department || null,
          status: userData.isActive ? 'active' : 'inactive',
          lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : null,
          resetToken: userData.resetToken || null,
          resetTokenExpires: userData.resetTokenExpiry ? new Date(userData.resetTokenExpiry) : null,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt),
        },
      });
      console.log(`✅ User processed: ${user.email} (${user.id})`);
    } catch (error) {
      console.error(`❌ Error processing user ${userData.email}:`, error);
    }
  }

  console.log('✅ User migration completed!');
}

main()
  .catch((e) => {
    console.error('❌ Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
