#!/usr/bin/env node

/**
 * Insert Test User Script
 * Inserts a test user for login testing
 */

const dotenv = require('dotenv');
const { executeQuery } = require('../database/neon-connection');

dotenv.config();

async function insertTestUser() {
  try {
    console.log('🚀 Inserting test user...');

    const email = 'thanongsak.th@appworks.co.th';
    const hashedPassword = '$2a$10$eVqTZGiPUOm22au61x9ziem09rW5YAMHR4FnQDdiR/xxF1vMrCG/K';
    const name = 'Thanongsak Test';
    const role = 'admin';
    const status = 'active';

    // Check if user already exists
    const existing = await executeQuery(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      console.log('✅ User already exists');
      return;
    }

    // Insert user
    const result = await executeQuery(
      `INSERT INTO users (name, email, password, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, role, status]
    );

    console.log('✅ Test user inserted successfully:');
    console.log(`   Name: ${result.rows[0].name}`);
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Role: ${result.rows[0].role}`);

  } catch (error) {
    console.error('❌ Error inserting test user:', error.message);
  }
}

insertTestUser();