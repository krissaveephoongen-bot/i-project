import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

console.log('Supabase Admin URL:', supabaseUrl?.substring(0, 20) + '...')
console.log('Supabase Service Key exists:', !!serviceRoleKey)

export const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: 'public' },
    })
  : null as any

