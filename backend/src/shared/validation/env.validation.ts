/**
 * Environment Variable Validation
 * Validates critical configuration at application startup
 */

export interface ValidatedEnv {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL?: string;
}

/**
 * Validates JWT_SECRET and other critical environment variables
 * Throws error if validation fails - prevents insecure deployments
 */
export function validateEnvironment(): ValidatedEnv {
  const errors: string[] = [];

  // Validate JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push(
      'FATAL: JWT_SECRET is not set. This is a critical security requirement. ' +
      'Set it in your .env file: JWT_SECRET=<your-64-character-random-string>'
    );
  } else if (jwtSecret.length < 32) {
    errors.push(
      `FATAL: JWT_SECRET must be at least 32 characters (recommended 64). ` +
      `Current length: ${jwtSecret.length}. ` +
      `Generate using: openssl rand -base64 48`
    );
  } else if (
    jwtSecret === 'your-secret-key' ||
    jwtSecret === 'dev-only-secret' ||
    jwtSecret === 'change-me' ||
    /^[a-z-]+$/.test(jwtSecret) // likely a placeholder
  ) {
    errors.push(
      `FATAL: Using a default/placeholder secret is not allowed. ` +
      `Generate a unique, random secret: openssl rand -base64 48`
    );
  }

  // Validate NODE_ENV
  const nodeEnv = (process.env.NODE_ENV || 'development') as any;
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    errors.push(
      `Invalid NODE_ENV: ${nodeEnv}. ` +
      `Must be: development, production, or test`
    );
  }

  // Validate PORT
  const port = parseInt(process.env.PORT || '3001', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(
      `Invalid PORT: ${process.env.PORT}. ` +
      `Must be a number between 1 and 65535`
    );
  }

  // If there are errors, fail loudly
  if (errors.length > 0) {
    console.error('\n❌ ENVIRONMENT VALIDATION FAILED:\n');
    errors.forEach(err => console.error(`  • ${err}`));
    console.error('\n⚠️  Application cannot start with invalid configuration.\n');
    process.exit(1);
  }

  return {
    JWT_SECRET: jwtSecret!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    NODE_ENV: nodeEnv,
    PORT: port,
    DATABASE_URL: process.env.DATABASE_URL,
  };
}

/**
 * Singleton pattern - validate once at startup
 */
let cachedEnv: ValidatedEnv | null = null;

export function getValidatedEnv(): ValidatedEnv {
  if (!cachedEnv) {
    cachedEnv = validateEnvironment();
  }
  return cachedEnv;
}
