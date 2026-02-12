
const { Client } = require('pg');
require('dotenv').config({ path: 'next-app/.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkUser() {
  try {
    await client.connect();
    const email = 'jakgrits.ph@appworks.co.th';
    const res = await client.query('SELECT id, email, role, "isActive", password FROM users WHERE email = $1', [email]);
    
    if (res.rows.length > 0) {
      const user = res.rows[0];
      console.log('User found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.isActive,
        password_hash_prefix: user.password ? user.password.substring(0, 10) + '...' : 'null'
      });
    } else {
      console.log('User not found:', email);
    }
    await client.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUser();
