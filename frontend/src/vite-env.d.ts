/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Application
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  
  // API
  readonly VITE_API_BASE_URL: string;
  
  // Database
  readonly VITE_NEON_CONNECTION_STRING?: string;
  readonly VITE_DATABASE_URL: string;
  
  // Authentication
  readonly VITE_AUTH_ENABLED: boolean;
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: boolean;
  
  // Environment
  readonly MODE: 'development' | 'production' | 'test';
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  
  // Legacy (kept for backward compatibility)
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_ENV__: string;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
