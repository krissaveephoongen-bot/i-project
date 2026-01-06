import postgres from 'postgres';
import bcrypt from 'bcrypt';

const DATABASE_URL = process.env.DATABASE_URL;
const EMAIL = (process.env.UPDATE_EMAIL || '').trim().toLowerCase();
const NEW_PASSWORD = process.env.NEW_PASSWORD;
const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
const CONFIRM = (process.env.CONFIRM_UPDATE || '').toUpperCase() === 'YES';

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}
if (!EMAIL || !NEW_PASSWORD) {
  console.error('UPDATE_EMAIL and NEW_PASSWORD are required');
  process.exit(1);
}
if (!CONFIRM) {
  console.error('Set CONFIRM_UPDATE=YES to proceed');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 });

async function run() {
  try {
    const user = await sql`
      select id, email, name, role, is_active, failed_login_attempts, locked_until
      from users
      where lower(trim(email)) = ${EMAIL}
      limit 1
    `;
    if (user.length === 0) {
      console.error('User not found for email:', EMAIL);
      process.exit(1);
    }

    const hash = await bcrypt.hash(NEW_PASSWORD, ROUNDS);

    const updated = await sql`
      update users
      set password = ${hash},
          failed_login_attempts = 0,
          locked_until = null,
          is_active = true,
          updated_at = now()
      where lower(trim(email)) = ${EMAIL}
      returning id, email, is_active, failed_login_attempts, locked_until
    `;

    console.log('Updated user:', updated[0]);
    console.log('Password updated successfully.');
  } finally {
    await sql.end({ timeout: 2 });
  }
}

run().catch((e) => {
  console.error('DB update error:', e.message);
  process.exit(1);
});
