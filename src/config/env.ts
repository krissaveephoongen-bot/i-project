import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Supabase
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL').min(1, 'Supabase URL is required'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase Anon Key is required'),
  VITE_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase Service Role Key is required'),
  
  // Neon Database
  DATABASE_URL: z.string().url('Invalid database URL').min(1, 'Database URL is required'),
  
  // Optional with defaults
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Validate environment variables
const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

// Get typed environment variables
export const env = validateEnv();

// Supabase configuration
export const supabaseConfig = {
  url: env.VITE_SUPABASE_URL,
  anonKey: env.VITE_SUPABASE_ANON_KEY,
  serviceRoleKey: env.VITE_SUPABASE_SERVICE_ROLE_KEY,
} as const;

// Database configuration
export const dbConfig = {
  url: env.DATABASE_URL,
} as const;

// Type exports for better intellisense
export type SupabaseConfig = typeof supabaseConfig;
export type DbConfig = typeof dbConfig;

// Development mode check
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
