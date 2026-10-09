import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Debford Proxy (formerly middleware)
 *
 * Responsibilities:
 * 1. Refresh the Supabase auth session (keeps users logged in)
 * 2. Protect routes that require authentication
 * 3. Redirect authenticated users away from auth pages
 *
 * NOTE: Per Next.js 16 docs, always verify auth inside Server Actions too —
 * do not rely solely on proxy for security.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // 1. Check for active demo session cookie first
  let user: { id: string; email: string; role?: string } | null = null;
  const demoCookie = request.cookies.get("debford_demo_session");
  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(atob(demoCookie.value));
      user = {
        id: parsed.id || "demo-user-1",
        email: parsed.email || "demo@debford.com",
        role: parsed.role || "buyer",
      };
    } catch {
      user = null;
    }
  }

  // 2. If no demo session and Supabase is configured, check Supabase session safely
  if (
    !user &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
              cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
                request.cookies.set(name, value)
              );
              supabaseResponse = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) =>
                supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
              );
            },
          },
        }
      );

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        user = {
          id: authUser.id,
          email: authUser.email ?? "",
          role: (authUser.user_metadata?.role as string) ?? "buyer",
        };
      }
    } catch {
      user = null;
    }
  }

  const { pathname } = request.nextUrl;

  // Routes that require authentication
  const protectedPrefixes = [
    "/dashboard",
    "/garage",
    "/messages",
    "/profile",
    "/sell",
    "/membership",
    "/admin",
  ];

  // Auth routes (redirect logged-in users to dashboard)
  const authPrefixes = ["/login", "/register", "/reset-password"];

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  const isAuthRoute = authPrefixes.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
