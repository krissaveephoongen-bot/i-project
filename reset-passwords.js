const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function resetPasswords() {
  try {
    await client.connect();
    console.log('Connected to database\n');

    const newPassword = 'AppWorks@123!'; // New password for all users
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update all users with new password
    const result = await client.query(`
      UPDATE "User"
      SET password = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE status = 'active'
      RETURNING id, name, email, role
    `, [hashedPassword]);

    console.log(`✓ Password reset for ${result.rows.length} users\n`);
    console.log('Updated Users:');
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('NEW PASSWORD FOR ALL USERS:');
    console.log('='.repeat(60));
    console.log(`Password: ${newPassword}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

resetPasswords();
