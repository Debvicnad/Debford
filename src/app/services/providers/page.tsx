import type { Metadata } from "next";
import Link from "next/link";
import { ALL_PROVIDERS } from "@/lib/data/services.data";
import { ProvidersDirectoryClient } from "@/components/services/ProvidersDirectoryClient";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";
import {
  Wrench,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronRight,
  Plus,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Automotive Specialists & Service Directory — Debford",
  description:
    "Browse vetted mechanics, mobile diagnostic vans, certified body shops, dyno tuners, and detailing studios. Direct appointment booking with zero upfront deposit.",
};

export default async function ServiceProvidersPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; city?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};

  let user = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch {
      user = null;
    }
  }

  return (
    <main className="min-h-screen bg-[#06090e] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar userEmail={user?.email} />

      {/* ── CINEMATIC DIRECTORY HEADER ─────────────────── */}
      <div className="relative pt-28 pb-12 overflow-hidden border-b border-white/8 bg-[#080d16]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[320px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[280px] bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[350px] h-[200px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Technical Grid Accent */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-6 tracking-wide">
            <Link href="/" className="hover:text-white transition-colors">
              Debford
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/services" className="hover:text-white transition-colors">
              Services
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-blue-400 font-semibold">Specialist Directory</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium tracking-wide mb-3">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Verified Automotive Guild</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Specialist Showroom & Directory
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mt-2 leading-relaxed">
                Connect directly with certified master mechanics, mobile diagnostic units, bespoke
                coachbuilders, and dyno tuning laboratories across the network.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/services/requests"
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-medium hover:border-white/20 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span>My Requests &amp; Quotes</span>
              </Link>
              <Link
                href="/services#request"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 group"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>Broadcast Custom Request</span>
              </Link>
            </div>
          </div>

          {/* ── TELEMETRY TRUST RIBBON ─────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/8">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">100% Vetted Guild</p>
                <p className="text-[11px] text-slate-400 mt-1">ASE &amp; OEM Certified</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Mobile Van Units</p>
                <p className="text-[11px] text-slate-400 mt-1">On-Site Diagnostics</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">$0 Upfront Deposit</p>
                <p className="text-[11px] text-slate-400 mt-1">Pay Upon Road Test</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Digital Garage Sync</p>
                <p className="text-[11px] text-slate-400 mt-1">Immutable Log Stamps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN DIRECTORY CONTENT ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProvidersDirectoryClient
          providers={ALL_PROVIDERS}
          initialCategory={resolvedParams.category}
        />
      </div>
    </main>
  );
}
