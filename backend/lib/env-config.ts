/**
 * Environment Configuration
 * Safely loads and validates environment variables
 */

// Server-side environment variables (never exposed to browser)
export const getServerEnv = () => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SESSION_SECRET',
  ];

  const optional = {
    NODE_ENV: 'development',
    API_PORT: '5000',
    API_HOST: 'localhost',
    LOG_LEVEL: 'info',
    REDIS_URL: '',
    REDIS_PASSWORD: '',
    REDIS_DB: '0',
  };

  const env: Record<string, string | number> = {};

  // Check required variables
  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    env[key] = value;
  }

  // Set optional variables with defaults
  for (const [key, defaultValue] of Object.entries(optional)) {
    env[key] = process.env[key] || defaultValue;
  }

  return env;
};

// Client-side environment variables (only VITE_ prefixed)
export const getClientEnv = () => {
  const env: Record<string, string> = {};

  // Only include VITE_ prefixed variables
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('VITE_') && value) {
      env[key] = value;
    }
  }

  return env;
};

// Validate environment for production
export const validateProductionEnv = () => {
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === 'production') {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'SESSION_SECRET',
      'API_PORT',
    ];

    const missing: string[] = [];
    for (const key of required) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables for production: ${missing.join(', ')}`
      );
    }

    // Validate security settings
    if (process.env.JWT_SECRET?.length! < 32) {
      console.warn('⚠️  WARNING: JWT_SECRET is shorter than recommended (32+ characters)');
    }

    if (process.env.SESSION_SECRET?.length! < 32) {
      console.warn('⚠️  WARNING: SESSION_SECRET is shorter than recommended (32+ characters)');
    }
  }
};

// Type-safe environment getter
export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable not found: ${key}`);
  }
  return value || defaultValue || '';
};

export const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable not found: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue || 0;
};

export const getEnvBoolean = (key: string, defaultValue?: boolean): boolean => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable not found: ${key}`);
  }
  return value ? ['true', '1', 'yes', 'on'].includes(value.toLowerCase()) : defaultValue || false;
};
