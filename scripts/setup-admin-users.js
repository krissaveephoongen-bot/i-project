#!/usr/bin/env node

/**
 * Admin User Setup Script
 * Creates initial admin users and saves to database
 * Usage: node scripts/setup-admin-users.js
 */

const dotenv = require('dotenv');
const AdminUserService = require('../server/admin-user-service');

dotenv.config();

const userService = new AdminUserService();

// Sample admin users to create
const adminUsers = [
  {
    email: 'admin@painai.com',
    name: 'System Administrator',
    password: 'admin@2025',
    department: 'IT',
    position: 'System Administrator',
    phone: '02-123-4567'
  },
  {
    email: 'jakgrits.ph@appworks.co.th',
    name: 'Project Manager',
    password: 'manager@2025',
    department: 'Project Management',
    position: 'Senior Project Manager',
    phone: '02-456-7890'
  },
  {
    email: 'manager@painai.com',
    name: 'Team Manager',
    password: 'manager123',
    department: 'Operations',
    position: 'Operations Manager',
    phone: '02-789-0123'
  },
  {
    email: 'somying@painai.com',
    name: 'Somying Employee',
    password: 'employee@2025',
    department: 'Development',
    position: 'Software Developer',
    phone: '02-987-6543'
  }
];

async function setupAdminUsers() {
  try {
    console.log('🚀 Starting Admin User Setup...\n');

    // Step 1: Initialize database table
    console.log('📦 Step 1: Initializing database table...');
    try {
      await userService.initializeTable();
      console.log('✅ Database table initialized\n');
    } catch (error) {
      console.log('⚠️  Table already exists or already initialized\n');
    }

    // Step 2: Create admin users
    console.log('👤 Step 2: Creating admin users...');
    const bulkResult = await userService.createBulkAdminUsers(adminUsers);

    console.log(`\n✅ Successfully created ${bulkResult.successful.length} admin users:`);
    bulkResult.successful.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    if (bulkResult.failed.length > 0) {
      console.log(`\n⚠️  Failed to create ${bulkResult.failed.length} users:`);
      bulkResult.failed.forEach((failure) => {
        console.log(`   ❌ ${failure.email}: ${failure.error}`);
      });
    }

    // Step 3: Get user statistics
    console.log('\n📊 Step 3: Fetching user statistics...');
    const stats = await userService.getUserStatistics();
    console.log('\n📈 User Statistics:');
    console.log(`   Total Users: ${stats.data.total_users}`);
    console.log(`   - Admin: ${stats.data.admin_count}`);
    console.log(`   - Manager: ${stats.data.manager_count}`);
    console.log(`   - User: ${stats.data.user_count}`);
    console.log(`   Active Users: ${stats.data.active_users}`);
    console.log(`   New Users (30 days): ${stats.data.new_users_this_month}`);

    // Step 4: List all admin users
    console.log('\n📋 Step 4: Listing all admin users...');
    const allUsers = await userService.getAllAdminUsers({ role: 'admin' });
    console.log(`\nAdmin Users (Total: ${allUsers.count}):`);
    allUsers.data.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Department: ${user.department || 'N/A'}`);
      console.log(`      Position: ${user.position || 'N/A'}`);
      console.log(`      Status: ${user.is_active ? '✅ Active' : '❌ Inactive'}`);
      console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log('');
    });

    console.log('\n✅ Admin User Setup Completed Successfully!');
    console.log('\n📝 Admin Users Credentials:');
    console.log('─'.repeat(60));
    bulkResult.successful.forEach((user) => {
      const adminUser = adminUsers.find(u => u.email === user.email);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${adminUser.password}`);
      console.log(`Role: ${user.role}`);
      console.log('─'.repeat(60));
    });

    console.log('\n🔐 Important:');
    console.log('   • Change passwords immediately after first login');
    console.log('   • Keep admin credentials secure');
    console.log('   • Use strong passwords in production');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run setup
setupAdminUsers();
