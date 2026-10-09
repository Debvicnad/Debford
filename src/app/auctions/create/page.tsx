import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { AuctionCreateWizard } from "@/components/auctions/AuctionCreateWizard";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { Gavel, ChevronLeft, ShieldCheck, Zap, SlidersHorizontal, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Auction & Consignment Arena — Debford",
  description:
    "Launch a high-integrity vehicle auction with real-time bidding, participant pre-registration, anti-sniping protection, and escrow settlement.",
};

export default async function AuctionCreatePage() {
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
    <main className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-amber-500 selection:text-black">
      <Navbar userEmail={user?.email} />

      {/* ── Sub-header / Breadcrumb Bar ─────────────────────────────────────────── */}
      <div className="border-b border-white/6 bg-slate-950/70 backdrop-blur-md pt-24 pb-4">
        <div className="container-debford flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/auctions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/8 hover:border-white/15 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Auction Arena</span>
            </Link>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Operator Consignment Setup
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auctions/manage"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-white/10 hover:border-amber-500/40 transition-all shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Operator Manager Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Header Title & Highlights ────────────────────────────────────────────── */}
      <div className="relative py-12 overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#0b0f19] to-[#07090e]">
        <div className="absolute top-0 right-1/4 w-[500px] h-[260px] bg-amber-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-debford relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono uppercase tracking-widest font-semibold mb-4">
            <Gavel className="w-3.5 h-3.5" />
            <span>Digital Live Consignment Protocol</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Launch Your Vehicle Auction
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Configure reserve price thresholds, real-time bid increments, anti-sniping timer auto-extensions,
            and optional verified bidder pre-registration.
          </p>

          {/* Quick Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mt-8">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 text-left">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white">Escrow Secured</div>
                <div className="text-slate-500">Locked bidder deposits</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 text-left">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white">Anti-Sniping Engine</div>
                <div className="text-slate-500">+2 min auto extensions</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 text-left">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white">Global Reach</div>
                <div className="text-slate-500">Multi-currency bidding</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Wizard Body ──────────────────────────────────────────────────────────── */}
      <div className="container-debford py-12">
        <AuctionCreateWizard />
      </div>
    </main>
  );
}
