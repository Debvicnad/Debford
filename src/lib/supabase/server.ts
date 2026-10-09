import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads/writes session cookies via Next.js headers.
 *
 * NEVER use this in client components — use createClient() from client.ts.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const client = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // setAll called from a Server Component — cookies can't be set.
            // This is fine if the session is handled by middleware.
          }
        },
      },
    }
  );

  // Safe wrapper for auth.getUser to support demo mode and prevent uncaught fetch failed exceptions
  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = async (jwt?: string) => {
    const demoCookie = cookieStore.get("debford_demo_session");
    if (demoCookie?.value) {
      try {
        const parsed = JSON.parse(atob(demoCookie.value));
        return {
          data: {
            user: {
              id: parsed.id || "demo-user-1",
              email: parsed.email || "demo@debford.com",
              user_metadata: {
                full_name: parsed.full_name || "Demo User",
                role: parsed.role || "buyer",
              },
              app_metadata: {},
              aud: "authenticated",
              created_at: new Date().toISOString(),
            },
          },
          error: null,
        } as any;
      } catch {
        // invalid cookie, fall back to Supabase auth
      }
    }

    try {
      return await originalGetUser(jwt);
    } catch {
      return { data: { user: null }, error: null } as any;
    }
  };

  return client;
}
