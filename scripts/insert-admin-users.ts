// scripts/insert-admin-users.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/lib/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// User data with only the fields that exist in the schema
const users = [
  {
    email: "thanongsak.th@appworks.co.th",
    password: "$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K",
    name: "Thanongsak Thongkwid",
    role: "admin" as const,
    position: "Vice President",
    department: "Project Management"
  },
  {
    email: "pratya.fu@appworks.co.th",
    password: "$2a$10$putjQ/EZ8TTEgpCA11yVS.7ut62ikfsVgfB8wAMRdz5Ry/Yt4Bs7K",
    name: "Pratya Fufueng",
    role: "manager" as const,
    position: "Senior Project Manager",
    department: "Project Management"
  },
  {
    email: "sophonwith.va@appworks.co.th",
    password: "$2a$10$5LHiSUsUiJlBkLyNvlb5/.ymb.cyQfFEOMrKpdPPAxd0MOLFvOgqe",
    name: "Sophonwith Valaisathien",
    role: "manager" as const,
    position: "Senior Project Manager",
    department: "Project Management"
  },
  {
    email: "suthat.wa@appworks.co.th",
    password: "$2a$10$CVc6OYoCpEDV9SWRN2gyYewdghP9nZLtAxZQce0qjuDLC7ImjzBDS",
    name: "Suthat Wanprom",
    role: "manager" as const,
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "napapha.ti@appworks.co.th",
    password: "$2a$10$rnh2ZABfssq8HL1p9Jn56.WrxO8RLdWqlCmUstiWatG6kVn2YUAWG",
    name: "Napapha Tipaporn",
    role: "manager" as const,
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "thapana.ch@appworks.co.th",
    password: "$2a$10$mW10t65N5C5igQH3hZx7/u6GMjx4yNMM800Y6L3cixTANs4nx1u0O",
    name: "Thapana Chatmanee",
    role: "admin" as const,
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "jakgrits.ph@appworks.co.th",
    password: "$2a$10$yW.odM7tSqm5R2GrVPxkYuFjAfdswb2BFK5FzYUSnuvaAbjHGZIOO",
    name: "Jakgrits Phoongen",
    role: "admin" as const,
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "pannee.sa@appworks.co.th",
    password: "$2a$10$h.H77awzLualYK3.SvS1sOwKuMG7r5ZAnywp0PXUH/FhFMXaL29fO",
    name: "Pannee Sae-Chee",
    role: "manager" as const,
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "sasithon.su@appworks.co.th",
    password: "$2a$10$SIaFuy93z3BfEhKCj9.bUOR26fsl8myU9808ctt32MZXWn1SJiISW",
    name: "Sasithon Sukha",
    role: "admin" as const,
    position: "Project Coordinator",
    department: "Sales Administration"
  },
  {
    email: "nawin.bu@appworks.co.th",
    password: "$2a$10$x5JyYGuFlCOQMpMWuEl2wONBMRVti7bmTly7zI8zkkL0wGMiV7rCC",
    name: "Nawin Bunjoputsa",
    role: "employee" as const,
    position: "Project Manager",
    department: "Project Management"
  },
  {
    email: "pattaraprapa.ch@appworks.co.th",
    password: "$2a$10$Odd8TQ.AISv1AOhVjEaNR.ZXtDNyD93dRnQphK4NoG6FnHaJRB9WC",
    name: "Pattaraprapa Chotipattachakorn",
    role: "manager" as const,
    position: "Senior Project Manager",
    department: "Project Management"
  }
];

async function insertUsers() {
  const connectionString = process.env.DATABASE_URL || 
    'postgres://user:password@localhost:5432/project_management';

  console.log('🔌 Connecting to database...');
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(pool, { schema });

  try {
    console.log('🔄 Starting user insertion...');
    
    // First, run the migration to add missing columns if they don't exist
    console.log('🔁 Checking for schema updates...');
    
    // First, create the user_role enum if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        -- Create the user_role enum if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          DROP TYPE IF EXISTS user_role;
          CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
        END IF;
      END $$;
    `);

    // Add columns if they don't exist
    await pool.query(`
      DO $$
      BEGIN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'object_id') THEN
          ALTER TABLE users ADD COLUMN object_id TEXT UNIQUE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN
          ALTER TABLE users ADD COLUMN password TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'department') THEN
          ALTER TABLE users ADD COLUMN department TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'position') THEN
          ALTER TABLE users ADD COLUMN position TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'hourly_rate') THEN
          ALTER TABLE users ADD COLUMN hourly_rate DECIMAL(10,2) DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
          ALTER TABLE users ADD COLUMN phone TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
          ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_deleted') THEN
          ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `);

    // Handle role column type conversion separately
    try {
      const roleTypeResult = await pool.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role';
      `);
      
      if (roleTypeResult.rows.length > 0 && roleTypeResult.rows[0].data_type !== 'USER-DEFINED') {
        console.log('⚠️  Converting role column to user_role type...');
        await pool.query(`
          DO $$
          BEGIN
            -- First, update any invalid role values
            UPDATE users SET role = 'employee' 
            WHERE role IS NULL OR role NOT IN ('admin', 'manager', 'employee', 'user');
            
            -- Convert 'user' to 'employee'
            UPDATE users SET role = 'employee' WHERE role = 'user';
            
            -- Now alter the column type
            ALTER TABLE users 
            ALTER COLUMN role TYPE user_role 
            USING role::user_role;
            
            -- Set a default value
            ALTER TABLE users 
            ALTER COLUMN role SET DEFAULT 'employee';
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error converting role column: %', SQLERRM;
          END $$;
        `);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️  Could not convert role column type:', errorMessage);
      console.warn('⚠️  Continuing with text role column...');
    }
    
    for (const user of users) {
      try {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, user.email)
        });

        if (existingUser) {
          console.log(`ℹ️  User ${user.email} already exists, updating...`);
          await db
            .update(schema.users)
            .set({
              name: user.name,
              role: user.role,
              position: user.position,
              department: user.department,
              password: user.password,
              status: 'active',
              isDeleted: false,
              updatedAt: new Date()
            })
            .where(eq(schema.users.email, user.email));
          console.log(`✅ Updated user: ${user.email}`);
        } else {
          // Insert new user
          await db.insert(schema.users).values({
            id: uuidv4(),
            email: user.email.toLowerCase(),
            name: user.name,
            password: user.password, // Already hashed
            role: user.role,
            position: user.position,
            department: user.department,
            status: 'active',
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`✅ Created user: ${user.email}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error processing user ${user.email}:`, errorMessage);
      }
    }

    console.log('🎉 All users have been processed successfully!');
  } catch (error) {
    console.error('❌ Error inserting users:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

insertUsers().catch(console.error);
