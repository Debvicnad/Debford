import Link from "next/link";
import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your free Debford account.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const defaultRole = role || "buyer";

  return (
    <div className="min-h-screen surface-base flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-60" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-extrabold text-lg">D</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              DEBFORD
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-2">
            Create your account
          </h1>
          <p className="text-slate-400 text-sm">
            Join thousands of buyers, sellers, and dealers
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl border border-white/10 p-8">
          <RegisterForm />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
