const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// User data to migrate
const usersData = [
  {
    email: "thanongsak.th@appworks.co.th",
    password: "$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K",
    name: "Thanongsak Thongkwid",
    role: "ADMIN",
    isActive: true,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "82df756a-4d46-4e49-b927-bb165d7dc489",
    position: "Vice President",
    department: "Project management"
  },
  {
    email: "pratya.fu@appworks.co.th",
    password: "$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K",
    name: "Pratya Fufueng",
    role: "MANAGER",
    isActive: true,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "cc4d0a66-5984-459f-92d8-32d4563bf9f1",
    position: "Senior Project Manager",
    department: "Project management"
  },
  {
    email: "sophonwith.va@appworks.co.th",
    password: "$2a$10$5LHiSUsUiJlBkLyNvlb5/.ymb.cyQfFEOMrKpdPPAxd0MOLFvOgqe",
    name: "Sophonwith Valaisathien",
    role: "MANAGER",
    isActive: true,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "b74cded6-0ae9-44e2-813f-124e5908adaa",
    position: "Senior Project Manager",
    department: "Project management"
  },
  {
    email: "suthat.wa@appworks.co.th",
    password: "$2a$10$CVc6OYoCpEDV9SWRN2gyYewdghP9nZLtAxZQce0qjuDLC7ImjzBDS",
    name: "Suthat Wanprom",
    role: "MANAGER",
    isActive: true,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "914439f4-1d31-4b4c-9465-6d1df4fa3d95",
    position: "Project Manager",
    department: "Project management"
  },
  {
    email: "napapha.ti@appworks.co.th",
    password: "$2a$10$rnh2ZABfssq8HL1p9Jn56.WrxO8RLdWqlCmUstiWatG6kVn2YUAWG",
    name: "Napapha Tipaporn",
    role: "MANAGER",
    isActive: true,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "07695a36-cb77-4bd6-a413-dbd4ad22aac0",
    position: "Project Manager",
    department: "Project management"
  },
  {
    email: "thapana.ch@appworks.co.th",
    password: "$2a$10$mW10t65N5C5igQH3hZx7/u6GMjx4yNMM800Y6L3cixTANs4nx1u0O",
    name: "Thapana Chatmanee",
    role: "ADMIN",
    isActive: true,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "69965309-5683-4436-999b-fb94030e398d",
    position: "Project Manager",
    department: "Project management"
  },
  {
    email: "jakgrits.ph@appworks.co.th",
    password: "$2a$10$yW.odM7tSqm5R2GrVPxkYuFjAfdswb2BFK5FzYUSnuvaAbjHGZIOO",
    name: "Jakgrits Phoongen",
    role: "ADMIN",
    isActive: true,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "0dfc2e1b-0d5f-40e2-99ca-0721ea5ec8dc",
    position: "Project Manager",
    department: "Project management"
  },
  {
    email: "pannee.sa@appworks.co.th",
    password: "$2a$10$h.H77awzLualYK3.SvS1sOwKuMG7r5ZAnywp0PXUH/FhFMXaL29fO",
    name: "Pannee Sae-Chee",
    role: "MANAGER",
    isActive: true,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "edaa1ff1-d7bb-4e03-9510-132d607899ee",
    position: "Project Manager",
    department: "Project management"
  },
  {
    email: "sasithon.su@appworks.co.th",
    password: "$2a$10$SIaFuy93z3BfEhKCj9.bUOR26fsl8myU9808ctt32MZXWn1SJiISW",
    name: "Sasithon Sukha",
    role: "ADMIN",
    isActive: true,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "d4e57618-7358-4e95-8bec-1c3d7904a8fa",
    position: "Project Coordinator",
    department: "Sales Administration"
  },
  {
    email: "nawin.bu@appworks.co.th",
    password: "$2a$10$x5JyYGuFlCOQMpMWuEl2wONBMRVti7bmTly7zI8zkkL0wGMiV7rCC",
    name: "Nawin Bunjoputsa",
    role: "USER",
    isActive: true,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-16T10:35:16.155Z",
    id: "56e2d716-faee-42bb-abbb-9c0d04cfbb64",
    position: "Project Manager",
    department: "Project management"
  },
  {
    email: "pattaraprapa.ch@appworks.co.th",
    password: "$2a$10$Odd8TQ.AISv1AOhVjEaNR.ZXtDNyD93dRnQphK4NoG6FnHaJRB9WC",
    name: "Pattaraprapa Chotipattachakorn",
    role: "MANAGER",
    isActive: true,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-16T11:08:06.230Z",
    id: "6aab71dd-03aa-4936-8091-a141ec3e2cf2",
    position: "Senior Project Manager",
    department: "Project management"
  }
];

// Map role from source to Prisma schema
function mapRole(role) {
  const roleMap = {
    'ADMIN': 'ADMIN',
    'MANAGER': 'PROJECT_MANAGER',
    'USER': 'USER'
  };
  return roleMap[role] || 'USER';
}

// Map status from source to Prisma schema
function mapStatus(isActive) {
  return isActive ? 'active' : 'inactive';
}

async function migrateUsers() {
  try {
    console.log(`Starting migration of ${usersData.length} users...`);

    // Delete existing users to start fresh (optional - comment out to keep existing users)
    // await prisma.user.deleteMany({});
    // console.log('Cleared existing users');

    let created = 0;
    let skipped = 0;

    for (const user of usersData) {
      try {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (existing) {
          console.log(`⊘ Skipped: ${user.email} (already exists with ID: ${existing.id})`);
          skipped++;
          continue;
        }

        // Create user with mapped fields
        const createdUser = await prisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: mapRole(user.role),
            position: user.position || null,
            department: user.department || null,
            status: mapStatus(user.isActive),
            timezone: 'Asia/Bangkok',
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
            lastLogin: null,
            resetToken: null,
            resetTokenExpires: null
          }
        });

        console.log(`✓ Created: ${user.email} (${mapRole(user.role)})`);
        created++;
      } catch (error) {
        console.error(`✗ Error creating ${user.email}:`, error.message);
      }
    }

    console.log(`\n═══════════════════════════════`);
    console.log(`Migration completed:`);
    console.log(`  • Created: ${created}`);
    console.log(`  • Skipped: ${skipped}`);
    console.log(`═══════════════════════════════`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateUsers();
