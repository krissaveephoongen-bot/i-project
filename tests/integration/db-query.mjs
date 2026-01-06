import postgres from 'postgres';
import bcrypt from 'bcrypt';

const DATABASE_URL = process.env.DATABASE_URL;
const LOOKUP_EMAIL = (process.env.LOOKUP_EMAIL || 'jakgrits.ph@appworks.co.th').trim().toLowerCase();
const PASSWORD_TO_CHECK = process.env.TEST_USER_PASSWORD; // optional

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
});

async function run() {
  try {
    const version = await sql`select version()`;
    console.log('version:', version[0].version);

    const now = await sql`select now()`;
    console.log('now:', now[0].now);

    const tables = await sql`
      select table_name
      from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by 1
    `;
    console.log('tables:', tables.map(t => t.table_name));

    const userCols = await sql`
      select column_name, data_type
      from information_schema.columns
      where table_schema = 'public' and table_name = 'users'
      order by ordinal_position
    `;
    if (userCols.length === 0) {
      console.log('users.columns: not found');
    } else {
      console.log('users.columns:', userCols);
    }

    try {
      const usersCount = await sql`select count(*)::int as count from users`;
      console.log('users.count:', usersCount[0].count);
    } catch (e) {
      console.log('users.count: table not found or inaccessible');
    }

    try {
      const sample = await sql`select id, email, name, role from users order by created_at nulls last limit 5`;
      console.log('users.sample:', sample);
    } catch (e) {
      try {
        const sampleAlt = await sql`select id, email, name, role from users limit 5`;
        console.log('users.sample:', sampleAlt);
      } catch (e2) {
        console.log('users.sample: query failed');
      }
    }

    // Robust lookup by email using normalization (trim & lower)
    try {
      const exactNorm = await sql`
        select id, email, name, role, is_active, failed_login_attempts, locked_until, last_login, password
        from users
        where lower(trim(email)) = ${LOOKUP_EMAIL}
        limit 1
      `;

      if (exactNorm.length > 0) {
        const { password, ...safe } = exactNorm[0];
        console.log('user.byEmail.normalized:', safe);
        if (PASSWORD_TO_CHECK) {
          const isValid = await bcrypt.compare(PASSWORD_TO_CHECK, exactNorm[0].password);
          console.log('password_valid:', isValid);
        } else {
          console.log('password_valid: skipped (TEST_USER_PASSWORD not set)');
        }
      } else {
        const fuzzy = await sql`
          select id, email, name, role, is_active
          from users
          where lower(email) like ${'%' + LOOKUP_EMAIL + '%'}
          order by email
          limit 5
        `;
        if (fuzzy.length > 0) {
          console.log('user.byEmail.fuzzy:', fuzzy);
        } else {
          console.log('user.byEmail: not found');
        }
      }
    } catch (e) {
      console.log('user.byEmail: query failed');
    }
  } finally {
    await sql.end({ timeout: 2 });
  }
}

run().catch((e) => {
  console.error('DB query error:', e.message);
  process.exit(1);
});
