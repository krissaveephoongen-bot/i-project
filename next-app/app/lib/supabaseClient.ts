import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined) =>
  url && url.startsWith("https://");
const isValidKey = (key: string | undefined) => key && key.length > 20;

if (
  !isValidUrl(supabaseUrl) ||
  (!isValidKey(supabaseServiceKey) && !isValidKey(supabaseAnonKey))
) {
  console.warn(
    "Supabase credentials missing or invalid. Check your .env file.",
  );
}

export const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: "public",
        },
        realtime: {
          // Disable realtime for now to avoid WebSocket connection issues
          params: {
            ws: false,
          },
        },
      })
    : (null as any);
