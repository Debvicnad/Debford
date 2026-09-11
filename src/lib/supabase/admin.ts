import { createClient } from "@supabase/supabase-js";

/**
 * Creates an admin Supabase client with the service_role secret key.
 * This client bypasses all Row Level Security (RLS) policies.
 * ONLY use this in Server Actions or Route Handlers, NEVER on the client.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
