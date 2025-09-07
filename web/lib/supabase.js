// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

// Admin (service role) client — use only on server (do not expose this key to browser)
export function supabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

// Public (anon) client — safe to use in browser
export function supabasePublic() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}
