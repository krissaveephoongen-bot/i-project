import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const { Client } = pg;

// User data to migrate
const usersData = [
  {
    email: "thanongsak.th@appworks.co.th",
    password: "$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K",
    name: "Thanongsak Thongkwid",
    role: "ADMIN",
    position: "Vice President",
    department: "Project management",
    id: "82df756a-4d46-4e49-b927-bb165d7dc489",
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z"
  },
  {
    email: "pratya.fu@appworks.co.th",
    password: "$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K",
    name: "Pratya Fufueng",
    role: "PROJECT_MANAGER",
    position: "Senior Project Manager",
    department: "Project management",
    id: "cc4d0a66-5984-459f-92d8-32d4563bf9f1",
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z"
  },
  {
    email: "sophonwith.va@appworks.co.th",
    password: "$2a$10$5LHiSUsUiJlBkLyNvlb5/.ymb.cyQfFEOMrKpdPPAxd0MOLFvOgqe",
    name: "Sophonwith Valaisathien",
    role: "PROJECT_MANAGER",
    position: "Senior Project Manager",
    department: "Project management",
    id: "b74cded6-0ae9-44e2-813f-124e5908adaa",
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z"
  },
  {
    email: "suthat.wa@appworks.co.th",
    password: "$2a$10$CVc6OYoCpEDV9SWRN2gyYewdghP9nZLtAxZQce0qjuDLC7ImjzBDS",
    name: "Suthat Wanprom",
    role: "PROJECT_MANAGER",
    position: "Project Manager",
    department: "Project management",
    id: "914439f4-1d31-4b4c-9465-6d1df4fa3d95",
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z"
  },
  {
    email: "napapha.ti@appworks.co.th",
    password: "$2a$10$rnh2ZABfssq8HL1p9Jn56.WrxO8RLdWqlCmUstiWatG6kVn2YUAWG",
    name: "Napapha Tipaporn",
    role: "PROJECT_MANAGER",
    position: "Project Manager",
    department: "Project management",
    id: "07695a36-cb77-4bd6-a413-dbd4ad22aac0",
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z"
  },
  {
    email: "thapana.ch@appworks.co.th",
    password: "$2a$10$mW10t65N5C5igQH3hZx7/u6GMjx4yNMM800Y6L3cixTANs4nx1u0O",
    name: "Thapana Chatmanee",
    role: "ADMIN",
    position: "Project Manager",
    department: "Project management",
    id: "69965309-5683-4436-999b-fb94030e398d",
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z"
  },
  {
    email: "jakgrits.ph@appworks.co.th",
    password: "$2a$10$yW.odM7tSqm5R2GrVPxkYuFjAfdswb2BFK5FzYUSnuvaAbjHGZIOO",
    name: "Jakgrits Phoongen",
    role: "ADMIN",
    position: "Project Manager",
    department: "Project management",
    id: "0dfc2e1b-0d5f-40e2-99ca-0721ea5ec8dc",
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z"
  },
  {
    email: "pannee.sa@appworks.co.th",
    password: "$2a$10$h.H77awzLualYK3.SvS1sOwKuMG7r5ZAnywp0PXUH/FhFMXaL29fO",
    name: "Pannee Sae-Chee",
    role: "PROJECT_MANAGER",
    position: "Project Manager",
    department: "Project management",
    id: "edaa1ff1-d7bb-4e03-9510-132d607899ee",
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z"
  },
  {
    email: "sasithon.su@appworks.co.th",
    password: "$2a$10$SIaFuy93z3BfEhKCj9.bUOR26fsl8myU9808ctt32MZXWn1SJiISW",
    name: "Sasithon Sukha",
    role: "ADMIN",
    position: "Project Coordinator",
    department: "Sales Administration",
    id: "d4e57618-7358-4e95-8bec-1c3d7904a8fa",
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z"
  },
  {
    email: "nawin.bu@appworks.co.th",
    password: "$2a$10$x5JyYGuFlCOQMpMWuEl2wONBMRVti7bmTly7zI8zkkL0wGMiV7rCC",
    name: "Nawin Bunjoputsa",
    role: "USER",
    position: "Project Manager",
    department: "Project management",
    id: "56e2d716-faee-42bb-abbb-9c0d04cfbb64",
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-16T10:35:16.155Z"
  },
  {
    email: "pattaraprapa.ch@appworks.co.th",
    password: "$2a$10$Odd8TQ.AISv1AOhVjEaNR.ZXtDNyD93dRnQphK4NoG6FnHaJRB9WC",
    name: "Pattaraprapa Chotipattachakorn",
    role: "PROJECT_MANAGER",
    position: "Senior Project Manager",
    department: "Project management",
    id: "6aab71dd-03aa-4936-8091-a141ec3e2cf2",
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-16T11:08:06.230Z"
  }
];

async function migrateUsers() {
  // Get DATABASE_URL from environment or read from .env file
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    // Try reading from .env file
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/DATABASE_URL=(.+)/);
      if (match) {
        databaseUrl = match[1].trim().replace(/['"]/g, '');
      }
    }
  }

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment or .env file');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected to database\n');

    console.log(`Starting migration of ${usersData.length} users...\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of usersData) {
      try {
        // Check if user already exists
        const checkResult = await client.query(
          'SELECT id FROM "User" WHERE email = $1',
          [user.email]
        );

        if (checkResult.rows.length > 0) {
          console.log(`⊘ Skipped: ${user.email} (already exists)`);
          skipped++;
          continue;
        }

        // Insert user
        const insertResult = await client.query(
          `INSERT INTO "User" (
            id, name, email, password, role, position, department, 
            status, timezone, "createdAt", "updatedAt", "lastLogin", 
            "resetToken", "resetTokenExpires"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          ) RETURNING id`,
          [
            user.id,
            user.name,
            user.email,
            user.password,
            user.role,
            user.position || null,
            user.department || null,
            'active',
            'Asia/Bangkok',
            new Date(user.createdAt),
            new Date(user.updatedAt),
            null,
            null,
            null
          ]
        );

        if (insertResult.rows.length > 0) {
          console.log(`✓ Created: ${user.email} (${user.role})`);
          created++;
        }
      } catch (error: any) {
        console.error(`✗ Error creating ${user.email}:`, error.message);
        errors++;
      }
    }

    console.log(`\n═══════════════════════════════`);
    console.log(`Migration completed:`);
    console.log(`  • Created: ${created}`);
    console.log(`  • Skipped: ${skipped}`);
    console.log(`  • Errors:  ${errors}`);
    console.log(`═══════════════════════════════`);

  } catch (error: any) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrateUsers();
