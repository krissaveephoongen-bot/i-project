import postgres from 'postgres';

let sql = null;

export const getDatabase = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }

  if (!sql) {
    sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });
  }

  return sql;
};

export const closeDatabase = async () => {
  if (sql) {
    await sql.end();
    sql = null;
  }
};

export const withDatabase = async (callback) => {
  const db = getDatabase();
  try {
    return await callback(db);
  } finally {
    try {
      await db.end();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
};
