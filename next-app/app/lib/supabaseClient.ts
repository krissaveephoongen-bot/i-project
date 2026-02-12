import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isValidUrl = (url: string | undefined) => url && url.startsWith('https://');
const isValidKey = (key: string | undefined) => key && key.length > 20;

if (!isValidUrl(supabaseUrl) || (!isValidKey(supabaseServiceKey) && !isValidKey(publishableKey) && !isValidKey(supabaseAnonKey))) {
    console.warn('Supabase credentials missing or invalid. Check your .env file.');
}

export const supabase = (supabaseUrl && (supabaseServiceKey || publishableKey || supabaseAnonKey))
  ? createClient(supabaseUrl, (supabaseServiceKey || publishableKey || supabaseAnonKey!), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      // Disable realtime if keys might be invalid to avoid WS errors in logs? 
      // But we want realtime if it works. 
      // We can try to catch connection errors? No easy way in config.
    })
  : null as any;
