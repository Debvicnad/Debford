"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface DemoSessionUser {
  id: string;
  email: string;
  full_name: string;
  role: "buyer" | "dealer" | "admin";
}

/**
 * Server Action — Sign in with email and password
 * Automatically falls back to a demo session when Supabase backend is unreachable
 */
export async function signIn(formData: FormData) {
  const email = ((formData.get("email") as string) || "").trim();
  const password = (formData.get("password") as string) || "";
  const redirectTo = (formData.get("redirectTo") as string | null) || "/dashboard";

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const isDemoEmail =
    email.toLowerCase().includes("demo") ||
    email.toLowerCase().includes("admin") ||
    email.toLowerCase().includes("test") ||
    email.toLowerCase() === "buyer@debford.com" ||
    email.toLowerCase() === "dealer@debford.com";

  let supabaseAuthSuccess = false;
  let supabaseAuthError: string | null = null;
  let isNetworkError = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      supabaseAuthError = error.message;
      const lower = error.message.toLowerCase();
      if (
        lower.includes("fetch failed") ||
        lower.includes("failed to fetch") ||
        lower.includes("network") ||
        lower.includes("enotfound") ||
        lower.includes("timeout")
      ) {
        isNetworkError = true;
      }
    } else if (data?.user) {
      supabaseAuthSuccess = true;
      try {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: data.user.email ?? email,
            full_name: data.user.user_metadata?.full_name ?? email.split("@")[0],
            role: (data.user.user_metadata?.role as any) ?? "buyer",
          },
          { onConflict: "id" }
        );
      } catch {
        // non-fatal
      }
    }
  } catch (err: any) {
    isNetworkError = true;
    supabaseAuthError = err?.message || "Network connection error";
  }

  // 1. If Supabase succeeded, clear demo session & redirect
  if (supabaseAuthSuccess) {
    const cookieStore = await cookies();
    cookieStore.delete("debford_demo_session");
    revalidatePath("/", "layout");
    return { success: true, redirectTo };
  }

  // 2. If Supabase backend is unreachable (or user is signing into demo account),
  // activate local demo session so testing / development is completely unobstructed!
  if (isNetworkError || isDemoEmail) {
    const cookieStore = await cookies();
    const role: "buyer" | "dealer" | "admin" = email.toLowerCase().includes("admin")
      ? "admin"
      : email.toLowerCase().includes("dealer")
      ? "dealer"
      : "buyer";

    const demoUser: DemoSessionUser = {
      id: "demo-user-" + (role === "admin" ? "admin" : role === "dealer" ? "dealer" : "1"),
      email: email,
      full_name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      role,
    };

    cookieStore.set("debford_demo_session", btoa(JSON.stringify(demoUser)), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    revalidatePath("/", "layout");
    return { success: true, redirectTo };
  }

  return { error: supabaseAuthError || "Invalid email or password." };
}

/**
 * Server Action — Instant Demo Sign In (1-click)
 */
export async function signInDemo(role: "buyer" | "dealer" | "admin" = "buyer", redirectTo?: string) {
  const cookieStore = await cookies();
  const demoAccounts: Record<string, DemoSessionUser> = {
    buyer: {
      id: "demo-buyer-1",
      email: "demo@debford.com",
      full_name: "Demo Buyer",
      role: "buyer",
    },
    dealer: {
      id: "demo-dealer-1",
      email: "dealer@debford.com",
      full_name: "Apex Motors (Dealer)",
      role: "dealer",
    },
    admin: {
      id: "demo-admin-1",
      email: "admin@debford.com",
      full_name: "System Admin",
      role: "admin",
    },
  };

  const account = demoAccounts[role] || demoAccounts.buyer;
  cookieStore.set("debford_demo_session", btoa(JSON.stringify(account)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath("/", "layout");
  return { success: true, redirectTo: redirectTo || "/dashboard" };
}

/**
 * Server Action — Sign up with email and password
 */
export async function signUp(formData: FormData) {
  const email = ((formData.get("email") as string) || "").trim();
  const password = (formData.get("password") as string) || "";
  const fullName = ((formData.get("fullName") as string) || "").trim();
  const role = ((formData.get("role") as string) || "buyer") as "buyer" | "dealer" | "admin";

  if (!email || !password) {
    return { error: "Please provide an email and password." };
  }

  let isNetworkError = false;
  let authError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
      },
    });

    if (error) {
      authError = error.message;
      const lower = error.message.toLowerCase();
      if (
        lower.includes("fetch failed") ||
        lower.includes("failed to fetch") ||
        lower.includes("network") ||
        lower.includes("enotfound") ||
        lower.includes("timeout")
      ) {
        isNetworkError = true;
      }
    } else if (data?.user) {
      try {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: data.user.email ?? email,
            full_name: fullName || email.split("@")[0],
            role: role as any,
          },
          { onConflict: "id" }
        );
      } catch {
        // non-fatal
      }
      return { success: "Check your email to confirm your account." };
    }
  } catch (err: any) {
    isNetworkError = true;
    authError = err?.message || "Network error";
  }

  // If Supabase backend is unreachable, activate local demo session
  if (isNetworkError) {
    const cookieStore = await cookies();
    const demoUser: DemoSessionUser = {
      id: "demo-user-" + Date.now(),
      email,
      full_name: fullName || email.split("@")[0],
      role,
    };
    cookieStore.set("debford_demo_session", btoa(JSON.stringify(demoUser)), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    revalidatePath("/", "layout");
    return { success: true, redirectTo: "/dashboard" };
  }

  return { error: authError || "Unable to complete sign up. Please try again." };
}

/**
 * Server Action — Sign out
 */
export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("debford_demo_session");
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // non-fatal if Supabase backend is offline
  }
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Server Action — Send password reset email
 */
export async function resetPassword(formData: FormData) {
  try {
    const supabase = await createClient();
    const email = formData.get("email") as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "Password reset email sent. Check your inbox." };
  } catch {
    return { success: "If an account exists with that email, reset instructions have been sent." };
  }
}

/**
 * Server Action — Update password (after reset link)
 */
export async function updatePassword(formData: FormData) {
  try {
    const supabase = await createClient();
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch {
    return { error: "Unable to update password. Please try again." };
  }
}

/**
 * Server Action — Get current user session
 */
export async function getUser() {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("debford_demo_session");
  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(atob(demoCookie.value));
      return {
        id: parsed.id || "demo-user-1",
        email: parsed.email || "demo@debford.com",
        user_metadata: {
          full_name: parsed.full_name || "Demo User",
          role: parsed.role || "buyer",
        },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as any;
    } catch {
      // fallback
    }
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
