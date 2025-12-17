import { Client } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createAdminUser() {
  const adminData = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@1234', // Change this after first login
    role: 'admin',
  };

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if admin already exists
    const checkResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [adminData.email]
    );

    if (checkResult.rows.length > 0) {
      console.log('⚠️  Admin user already exists:');
      console.log(`Email: ${adminData.email}`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create the admin user
    const result = await client.query(
      `INSERT INTO users (name, email, role, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, email, name, role`,
      [
        adminData.name,
        adminData.email,
        adminData.role
      ]
    );

    const user = result.rows[0];
    console.log('✅ Admin user created successfully!');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('\n📝 Credentials for first login:');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('\n⚠️  Please change this password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:');
    console.error((error as Error).message);
  } finally {
    await client.end();
  }
}

createAdminUser();
