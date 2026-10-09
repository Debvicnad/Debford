import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { getMyVerificationStatus } from "@/lib/actions/verification.actions";
import { VerificationClient } from "@/components/verification/VerificationClient";
import { Navbar } from "@/components/layout/Navbar";
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  FileCheck,
  Fingerprint,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Identity & Trust Verification — Debford",
  description:
    "Verify your identity, residential address, and dealer credentials on Debford to unlock full marketplace access and trusted seller status.",
};

export default async function VerificationPage() {
  if (!isSupabaseConfigured()) redirect("/login?redirectTo=/verification");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/verification");

  const { data } = await getMyVerificationStatus();

  const fallbackData = {
    verification_status: "unverified" as const,
    email: user.email ?? "",
    phone: user.phone ?? "",
    full_name: user.user_metadata?.full_name ?? "",
    city: "",
    country: "US",
    role: "buyer",
    documents: [],
  };

  return (
    <main className="min-h-screen bg-[#06090e] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar userEmail={user?.email} />

      {/* ── CINEMATIC VERIFICATION HEADER ─────────────────── */}
      <div className="relative pt-28 pb-12 overflow-hidden border-b border-white/8 bg-[#080d16]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[320px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[280px] bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none" />

        {/* Technical Grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-6 tracking-wide">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/profile" className="hover:text-white transition-colors">
              Profile
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-blue-400 font-semibold">Verification Centre</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Shield Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-0.5 shadow-2xl shadow-blue-500/25 shrink-0">
              <div className="w-full h-full bg-[#080d16] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-blue-400" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium tracking-wide mb-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Compliance & Trust Protocol</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Identity & Trust Verification
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Complete your verification to unlock full marketplace access, seller status, and Debford&apos;s
                trusted guild network.
              </p>
            </div>
          </div>

          {/* Verification Benefits Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/8">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Trusted Seller Badge</p>
                <p className="text-[11px] text-slate-400 mt-1">Marketplace Priority</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <FileCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Escrow Access</p>
                <p className="text-[11px] text-slate-400 mt-1">Secure Transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Fingerprint className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Identity Vault</p>
                <p className="text-[11px] text-slate-400 mt-1">256-Bit Encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Dealer Accreditation</p>
                <p className="text-[11px] text-slate-400 mt-1">Fleet Registration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── VERIFICATION CONTENT ─────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <VerificationClient initialData={data || fallbackData} />
      </div>
    </main>
  );
}

