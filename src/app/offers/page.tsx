import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { OffersManagementClient } from "@/components/offers/OffersManagementClient";
import { getMyOffers } from "@/lib/actions/offer.actions";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight, ShieldCheck, Tag, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Vehicle Offers & Deal Negotiations — Debford",
  description:
    "Review incoming buyer bids, counter-offers, and manage private vehicle purchase agreements backed by Debford Escrow Protection.",
};

export default async function OffersPage() {
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

  const { received, sent } = await getMyOffers();

  return (
    <main className="min-h-screen bg-[#06090e] text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col">
      <Navbar userEmail={user?.email} />

      {/* ── Top Breadcrumb Bar ────────────────────────────────────────────── */}
      <div className="border-b border-white/6 bg-slate-950/70 backdrop-blur-md pt-24 pb-3.5">
        <div className="container-debford flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-300 font-medium">Offers &amp; Negotiations</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Escrow Protected Pipeline</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <div className="container-debford py-8 flex-1 space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20">
              <Tag className="w-3 h-3" />
              <span>Direct Showroom Transactions</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Vehicle Offers &amp; Negotiations
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Execute secure private treaty negotiations. Accept competitive offers, submit counter-proposals with custom terms, or unlock verified Escrow settlement vaults upon mutual agreement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/vehicles"
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors flex items-center gap-2"
            >
              <span>Explore Marketplace</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/sell"
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              List Vehicle +
            </Link>
          </div>
        </div>

        {/* Client Interactive Offers Hub */}
        <OffersManagementClient
          initialReceived={received}
          initialSent={sent}
        />
      </div>
    </main>
  );
}
