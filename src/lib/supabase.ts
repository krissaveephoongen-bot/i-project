import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/config/env';

// Initialize the Supabase client
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Helper function to get the service role client (server-side only)
export const getServiceRoleClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Service role client should only be used on the server side');
  }
  
  return createClient(
    supabaseConfig.url,
    supabaseConfig.serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};

// Auth state change handler
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
