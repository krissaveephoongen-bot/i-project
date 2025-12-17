import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/schema.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/project_management',
  },
  migrations: {
    table: '__drizzle_migrations__',
    schema: 'drizzle',
  },
  introspect: {
    casing: 'snake_case',
  },
});
