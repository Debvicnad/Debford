"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth.actions";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await signUp(formData);
      if (result?.error) setError(result.error);
      if (result?.success) setSuccess(result.success);
    });
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-slate-400 text-sm">{success}</p>
        <Link href="/login" className="mt-6 inline-block text-blue-400 text-sm hover:text-blue-300 transition-colors">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" action={handleSubmit}>
      {error && (
        <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">I want to</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "buyer", label: "Buy / Rent" },
            { value: "seller", label: "Sell" },
            { value: "dealer", label: "Dealership" },
          ].map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input type="radio" name="role" value={opt.value} defaultChecked={opt.value === "buyer"} className="sr-only peer" />
              <div className="py-2.5 text-center text-xs font-medium text-slate-400 surface-raised border border-white/10 rounded-lg peer-checked:border-blue-500 peer-checked:text-blue-400 peer-checked:bg-blue-500/10 transition-all">
                {opt.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Full name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">Full name</label>
        <input
          id="fullName" name="fullName" type="text" autoComplete="name" required
          placeholder="John Doe" disabled={isPending}
          className="w-full px-4 py-3 surface-raised border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
        <input
          id="email" name="email" type="email" autoComplete="email" required
          placeholder="you@example.com" disabled={isPending}
          className="w-full px-4 py-3 surface-raised border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
        <input
          id="password" name="password" type="password" autoComplete="new-password"
          required minLength={8} placeholder="Minimum 8 characters" disabled={isPending}
          className="w-full px-4 py-3 surface-raised border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input id="terms" name="terms" type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-white/20 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 shrink-0" />
        <span className="text-xs text-slate-500 leading-relaxed">
          I agree to the{" "}
          <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</Link>
        </span>
      </label>

      {/* Submit */}
      <button
        id="register-submit" type="submit" disabled={isPending}
        className="w-full py-3 px-4 gradient-brand text-white font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating account…
          </>
        ) : (
          "Create free account"
        )}
      </button>
    </form>
  );
}
