
const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: 'next-app/.env' });

const email = 'jakgrits.ph@appworks.co.th';
const newPassword = 'AppWorks@123!';

async function resetPassword() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Generate new hash
    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword, saltRounds);
    
    console.log(`Resetting password for ${email}...`);
    
    // Update password, reset failed attempts and lock status
    const res = await client.query(
      `UPDATE users 
       SET password = $1, 
           "failedLoginAttempts" = 0, 
           "lockedUntil" = NULL, 
           "isActive" = true,
           "updatedAt" = NOW()
       WHERE email = $2
       RETURNING id, email, "isActive"`,
      [hash, email]
    );

    if (res.rows.length > 0) {
      console.log('Password reset successfully for:', res.rows[0]);
    } else {
      console.log('User not found!');
    }
  } catch (err) {
    console.error('Error resetting password:', err);
  } finally {
    await client.end();
  }
}

resetPassword();
