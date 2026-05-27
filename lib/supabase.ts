import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Anon client — for server components reading public data,
 * and for client components (browser). Subject to RLS.
 */
export function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Service role client — for server actions performing mutations.
 * Bypasses RLS. NEVER import this in a client component.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
