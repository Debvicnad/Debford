import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { AuctionManagerClient } from "@/components/auctions/AuctionManagerClient";
import { getMyAuctions } from "@/lib/actions/auction.actions";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import {
  Gavel,
  SlidersHorizontal,
  Plus,
  Eye,
  ChevronLeft,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Auction Operator Manager & Settlement Console — Debford",
  description:
    "Manage commercial vehicle auctions, moderate participant pre-registrations, transition bidding states, and execute final buyer settlements.",
};

export default async function AuctionManagePage() {
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

  const { auctions } = await getMyAuctions();

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
              <span>Public Auction Arena</span>
            </Link>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Operator Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auctions"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Catalog</span>
            </Link>

            <Link
              href="/auctions/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Consignment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Header Title & Overview ──────────────────────────────────────────────── */}
      <div className="relative py-10 overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#0b0f19] to-[#07090e]">
        <div className="absolute top-0 right-1/4 w-[500px] h-[220px] bg-amber-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[180px] bg-sky-600/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-debford relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono uppercase tracking-widest font-semibold mb-3">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Commercial Operator Dashboard</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
              Auction Arenas &amp; Consignment Management
            </h1>

            <p className="text-sm text-slate-400 font-light leading-relaxed">
              Supervise live bidding operations, review and approve applicant pre-registrations, transition auction lifecycle states, and execute final buyer escrow settlements.
            </p>
          </div>
        </div>
      </div>

      {/* ── Dashboard Body ───────────────────────────────────────────────────────── */}
      <div className="container-debford py-10">
        <AuctionManagerClient initialAuctions={auctions} />
      </div>
    </main>
  );
}
