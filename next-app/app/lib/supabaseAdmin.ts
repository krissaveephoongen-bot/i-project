// ============================================================
// app/lib/supabaseAdmin.ts
// ============================================================
// Backward-compatibility re-export.
//
// The canonical Supabase admin client now lives at:
//   lib/supabaseAdminClient.ts
//
// This file simply re-exports from there so that all existing
// imports of "@/app/lib/supabaseAdmin" continue to work without
// any changes, while ensuring there is only ONE client instance
// in the process.
//
// DO NOT create a second `createClient(...)` call here.
// DO NOT import from this file in new code — use "@/lib/supabaseAdminClient" directly.
// ============================================================

export { supabaseAdmin } from "@/lib/supabaseAdminClient";
