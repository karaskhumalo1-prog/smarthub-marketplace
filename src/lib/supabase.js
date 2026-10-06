import { createClient } from '@supabase/supabase-js'

// SECURITY: this file must NEVER reference the Supabase service_role key.
// Only the public anon key belongs in frontend code - Row-Level Security
// policies (see supabase/migrations.sql) enforce what each role can do.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project credentials.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Public site URL for the QR code footer.
// Falls back to window.location.origin so it always works, even if
// VITE_SITE_URL isn't set on a given deploy (e.g. Netlify deploy previews).
export function getSiteUrl() {
  return import.meta.env.VITE_SITE_URL || window.location.origin
}
