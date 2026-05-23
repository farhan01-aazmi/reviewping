import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '')
  .trim().replace(/[\r\n\t]/g, '')
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '')
  .trim().replace(/[\r\n\t]/g, '')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('[ReviewPing] Missing Supabase env vars.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
