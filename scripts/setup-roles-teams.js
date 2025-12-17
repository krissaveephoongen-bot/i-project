#!/usr/bin/env node

/**
 * Setup Script for Role-Based Management, Teams, and Project Management
 * Creates necessary database tables and structures
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runSetup() {
  try {
    console.log('🚀 Starting Role-Based Management & Teams Setup...\n');
    
    await client.connect();
    console.log('✅ Connected to database\n');

    // 1. Create teams and members tables
    console.log('📊 Creating teams and project members tables...');
    const schemaPath = path.join(__dirname, '../database/create-teams-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schemaSql);
    console.log('✅ Teams schema created\n');

    // 2. Verify auth middleware
    console.log('🔐 Verifying authentication middleware...');
    const authPath = path.join(__dirname, '../server/middleware/auth-middleware.js');
    if (fs.existsSync(authPath)) {
      console.log('✅ Auth middleware exists\n');
    } else {
      console.log('⚠️  Auth middleware not found\n');
    }

    // 3. Get user statistics
    console.log('👥 User Statistics:');
    const userStats = await client.query(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );
    
    userStats.rows.forEach(row => {
      console.log(`   ${row.role}: ${row.count}`);
    });
    console.log('');

    // 4. Check projects
    console.log('📁 Project Statistics:');
    const projectStats = await client.query(
      `SELECT status, COUNT(*) as count FROM projects WHERE is_deleted = false GROUP BY status`
    );
    
    if (projectStats.rows.length > 0) {
      projectStats.rows.forEach(row => {
        console.log(`   ${row.status}: ${row.count}`);
      });
    } else {
      console.log('   No projects found');
    }
    console.log('');

    // 5. Create sample team if needed
    console.log('👥 Creating sample teams...');
    const teamCheck = await client.query(
      `SELECT COUNT(*) as count FROM teams`
    );

    if (parseInt(teamCheck.rows[0].count) === 0) {
      const adminUser = await client.query(
        `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
      );

      if (adminUser.rows.length > 0) {
        await client.query(
          `INSERT INTO teams (name, description, lead_id, status)
           VALUES 
           ('Development Team', 'Core development team', $1, 'active'),
           ('Management Team', 'Project management team', $1, 'active'),
           ('Operations Team', 'Operations and support team', $1, 'active')`,
          [adminUser.rows[0].id]
        );
        console.log('✅ Sample teams created\n');
      }
    } else {
      console.log('✅ Teams already exist\n');
    }

    // 6. Display setup summary
    console.log('═'.repeat(60));
    console.log('✅ SETUP COMPLETE - Role-Based Management Ready');
    console.log('═'.repeat(60));
    console.log('\n📋 Next Steps:\n');
    console.log('1. Restart the server:');
    console.log('   npm start\n');
    console.log('2. Login with admin account:');
    console.log('   Email: admin@example.com\n');
    console.log('3. Create users with different roles:\n');
    console.log('   POST /api/users');
    console.log('   {\n');
    console.log('     "name": "User Name",\n');
    console.log('     "email": "user@example.com",\n');
    console.log('     "password": "SecurePassword123",\n');
    console.log('     "role": "manager" // or "employee"\n');
    console.log('   }\n');
    console.log('4. Create teams:');
    console.log('   POST /api/teams\n');
    console.log('5. Assign team members:');
    console.log('   POST /api/teams/{teamId}/members\n');
    console.log('6. Create projects with team assignments:');
    console.log('   POST /api/projects\n');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run setup
runSetup();
