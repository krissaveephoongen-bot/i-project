import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set in .env file');
  process.exit(1);
}

// Parse the database URL
const dbConfig = {
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // For development only, use proper SSL in production
  }
};

// User data with all required fields
const users = [
  {
    email: "thanongsak.th@appworks.co.th",
    password: "$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K",
    name: "Thanongsak Thongkwid",
    role: "admin",
    position: "Vice President",
    department: "Project management",
    employeeCode: null,
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: null,
    lockedUntil: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "82df756a-4d46-4e49-b927-bb165d7dc489",
    isDeleted: false
  },
  {
    email: "pratya.fu@appworks.co.th",
    password: "$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K",
    name: "Pratya Fufueng",
    role: "manager",
    position: "Senior Project Manager",
    department: "Project management",
    employeeCode: null,
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: null,
    lockedUntil: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "cc4d0a66-5984-459f-92d8-32d4563bf9f1",
    isDeleted: false
  },
  {
    email: "sophonwith.va@appworks.co.th",
    password: "$2a$10$5LHiSUsUiJlBkLyNvlb5/.ymb.cyQfFEOMrKpdPPAxd0MOLFvOgqe",
    name: "Sophonwith Valaisathien",
    role: "manager",
    position: "Senior Project Manager",
    department: "Project management",
    employeeCode: null,
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: null,
    lockedUntil: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "b74cded6-0ae9-44e2-813f-124e5908adaa",
    isDeleted: false
  },
  {
    email: "suthat.wa@appworks.co.th",
    password: "$2a$10$CVc6OYoCpEDV9SWRN2gyYewdghP9nZLtAxZQce0qjuDLC7ImjzBDS",
    name: "Suthat Wanprom",
    role: "manager",
    position: "Project Manager",
    department: "Project management",
    employeeCode: null,
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: null,
    lockedUntil: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "914439f4-1d31-4b4c-9465-6d1df4fa3d95",
    isDeleted: false
  },
  {
    email: "napapha.ti@appworks.co.th",
    password: "$2a$10$rnh2ZABfssq8HL1p9Jn56.WrxO8RLdWqlCmUstiWatG6kVn2YUAWG",
    name: "Napapha Tipaporn",
    role: "manager",
    position: "Project Manager",
    department: "Project management",
    employeeCode: null,
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: null,
    lockedUntil: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "07695a36-cb77-4bd6-a413-dbd4ad22aac0",
    isDeleted: false
  },
  {
    email: "thapana.ch@appworks.co.th",
    password: "$2a$10$mW10t65N5C5igQH3hZx7/u6GMjx4yNMM800Y6L3cixTANs4nx1u0O",
    name: "Thapana Chatmanee",
    role: "admin",
    position: "Project Manager",
    department: "Project management",
    employeeCode: null,
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: null,
    lockedUntil: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "69965309-5683-4436-999b-fb94030e398d",
    isDeleted: false
  },
  {
    email: "jakgrits.ph@appworks.co.th",
    password: "$2a$10$yW.odM7tSqm5R2GrVPxkYuFjAfdswb2BFK5FzYUSnuvaAbjHGZIOO",
    name: "Jakgrits Phoongen",
    role: "admin",
    position: "Project Manager",
    department: "Project management",
    employeeCode: null,
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: null,
    lockedUntil: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "0dfc2e1b-0d5f-40e2-99ca-0721ea5ec8dc",
    isDeleted: false
  },
  {
    email: "pannee.sa@appworks.co.th",
    password: "$2a$10$h.H77awzLualYK3.SvS1sOwKuMG7r5ZAnywp0PXUH/FhFMXaL29fO",
    name: "Pannee Sae-Chee",
    role: "manager",
    position: "Project Manager",
    department: "Project management",
    employeeCode: null,
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: null,
    lockedUntil: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "edaa1ff1-d7bb-4e03-9510-132d607899ee",
    isDeleted: false
  },
  {
    email: "sasithon.su@appworks.co.th",
    password: "$2a$10$SIaFuy93z3BfEhKCj9.bUOR26fsl8myU9808ctt32MZXWn1SJiISW",
    name: "Sasithon Sukha",
    role: "admin",
    position: "Project Coordinator",
    department: "Sales Administration",
    employeeCode: null,
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: null,
    lockedUntil: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-15T15:36:35.482Z",
    id: "d4e57618-7358-4e95-8bec-1c3d7904a8fa",
    isDeleted: false
  },
  {
    email: "nawin.bu@appworks.co.th",
    password: "$2a$10$x5JyYGuFlCOQMpMWuEl2wONBMRVti7bmTly7zI8zkkL0wGMiV7rCC",
    name: "Nawin Bunjoputsa",
    role: "employee",
    position: "Project Manager",
    department: "Project management",
    employeeCode: "0276",
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: null,
    lockedUntil: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-16T10:35:16.155Z",
    id: "56e2d716-faee-42bb-abbb-9c0d04cfbb64",
    isDeleted: false
  },
  {
    email: "pattaraprapa.ch@appworks.co.th",
    password: "$2a$10$Odd8TQ.AISv1AOhVjEaNR.ZXtDNyD93dRnQphK4NoG6FnHaJRB9WC",
    name: "Pattaraprapa Chotipattachakorn",
    role: "manager",
    position: "Senior Project Manager",
    department: "Project management",
    employeeCode: "0222",
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: null,
    lockedUntil: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: "2025-07-15T15:36:35.482Z",
    updatedAt: "2025-07-16T11:08:06.230Z",
    id: "6aab71dd-03aa-4936-8091-a141ec3e2cf2",
    isDeleted: false
  }
];

async function insertUsers() {
  const pool = new Pool(dbConfig);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Check if the users table exists
    const tableExists = await client.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )`
    );

    if (!tableExists.rows[0].exists) {
      console.error('❌ Users table does not exist in the database');
      return;
    }

    console.log('🔄 Starting user insertion...');
    
    for (const user of users) {
      try {
        // Check if user already exists
        const existingUser = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [user.email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
          console.log(`ℹ️  User ${user.email} already exists, updating...`);
          
          // Update existing user
          await client.query(
            `UPDATE users SET 
              name = $1,
              role = $2,
              position = $3,
              department = $4,
              updated_at = NOW()
            WHERE email = $5`,
            [
              user.name,
              user.role,
              user.position,
              user.department,
              user.email.toLowerCase()
            ]
          );
          console.log(`✅ Updated user: ${user.email}`);
        } else {
          // Insert new user
          await client.query(
            `INSERT INTO users (
              id,
              email,
              password,
              name,
              role,
              position,
              department,
              employee_code,
              status,
              is_active,
              is_deleted,
              failed_login_attempts,
              last_login,
              locked_until,
              reset_token,
              reset_token_expiry,
              created_at,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
            [
              user.id,
              user.email.toLowerCase(),
              user.password,
              user.name,
              user.role,
              user.position,
              user.department,
              user.employeeCode,
              user.isActive,
              user.isDeleted,
              user.failedLoginAttempts,
              user.lastLogin,
              user.lockedUntil,
              user.resetToken,
              user.resetTokenExpiry,
              user.createdAt,
              user.updatedAt
            ]
          );
          console.log(`✅ Created user: ${user.email}`);
        }
      } catch (error: any) {
        console.error(`❌ Error processing user ${user.email}:`, error.message);
      }
    }

    await client.query('COMMIT');
    console.log('🎉 All users have been processed successfully!');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Install required packages and run the script
async function main() {
  try {
    // Install pg package if not already installed
    await installPackage('pg');
    await installPackage('@types/pg');
    
    // Run the user insertion
    await insertUsers();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Helper function to install npm packages
async function installPackage(pkg: string) {
  try {
    // Try to require the package
    require.resolve(pkg);
  } catch (e) {
    console.log(`Installing ${pkg}...`);
    const { execSync } = require('child_process');
    execSync(`npm install ${pkg}`, { stdio: 'inherit' });
  }
}

// Run the main function
main();
