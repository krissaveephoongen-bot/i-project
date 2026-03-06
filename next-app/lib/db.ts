import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres connection with configuration options
// Using "require" for SSL mode is critical for Supabase in production/preview
export const sql = postgres(connectionString, {
  ssl: 'require', 
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Helper for transaction support
export async function transaction<T>(
  callback: (sql: postgres.Sql) => Promise<T>,
): Promise<T> {
  return sql.begin(callback) as Promise<T>;
}

// Export default connection
export default sql;
