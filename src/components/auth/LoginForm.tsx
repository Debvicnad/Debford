"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn, signInDemo } from "@/lib/actions/auth.actions";
import { Zap, UserCheck, Store, ShieldCheck } from "lucide-react";

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [demoRoleLoading, setDemoRoleLoading] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    if (redirectTo) formData.set("redirectTo", redirectTo);
    setError(null);
    startTransition(async () => {
      try {
        const result = await signIn(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          window.location.href = result.redirectTo || redirectTo || "/dashboard";
        }
      } catch (e: any) {
        if (e?.message === "NEXT_REDIRECT" || e?.digest?.includes("NEXT_REDIRECT")) {
          return;
        }
        setError(e?.message || "Sign in failed. Please try a demo account below.");
      }
    });
  }

  function handleQuickDemo(role: "buyer" | "dealer" | "admin") {
    setError(null);
    setDemoRoleLoading(role);
    startTransition(async () => {
      try {
        const result = await signInDemo(role, redirectTo) as { success?: boolean; redirectTo?: string; error?: string };
        if (result?.error) {
          setError(result.error);
          setDemoRoleLoading(null);
        } else if (result?.success) {
          window.location.href = result.redirectTo || redirectTo || "/dashboard";
        }
      } catch (e: any) {
        if (e?.message === "NEXT_REDIRECT" || e?.digest?.includes("NEXT_REDIRECT")) {
          return;
        }
        setError(e?.message || "Demo sign in failed.");
        setDemoRoleLoading(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* 1-Click Quick Demo Sign In */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
            Quick 1-Click Demo Login
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Sign in instantly without entering credentials:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleQuickDemo("buyer")}
            className="px-2 py-2.5 rounded-lg bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-xs font-medium text-slate-200 hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>Buyer</span>
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleQuickDemo("dealer")}
            className="px-2 py-2.5 rounded-lg bg-white/5 hover:bg-emerald-600/20 border border-white/10 hover:border-emerald-500/40 text-xs font-medium text-slate-200 hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Dealer</span>
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleQuickDemo("admin")}
            className="px-2 py-2.5 rounded-lg bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/40 text-xs font-medium text-slate-200 hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs text-slate-500 uppercase tracking-wider">
          <span className="px-3 surface-raised">or with email & password</span>
        </div>
      </div>

      <form className="space-y-5" action={handleSubmit}>
        {error && (
          <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com (or demo@debford.com)"
            disabled={isPending}
            className="w-full px-4 py-3 surface-raised border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <Link href="/reset-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            disabled={isPending}
            className="w-full px-4 py-3 surface-raised border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 gradient-brand text-white font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-150 text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {demoRoleLoading ? `Signing in as ${demoRoleLoading}…` : "Signing in…"}
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </div>
  );
}
