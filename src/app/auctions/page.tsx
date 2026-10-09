import type { Metadata } from "next";
import Link from "next/link";
import { getAuctions, isSupabaseConfigured, type AuctionRow } from "@/lib/db/queries";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import {
  Gavel,
  Flame,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Live Commercial & Collector Auctions | Debford",
  description:
    "Bid on verified sports cars, rare motorcycles, and commercial vehicle fleets in live transparent auctions on Debford.",
};

function timeLabel(endsAt: string, status: string): string {
  if (status === "ended") return "AUCTION CONCLUDED";
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "ENDING MOMENTARILY…";
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) {
    const mins = Math.floor(diff / 60000);
    return `${mins}M REMAINING`;
  }
  if (hours < 24) return `${hours}H REMAINING`;
  return `${Math.floor(hours / 24)}D REMAINING`;
}

function AuctionCard({ auction }: { auction: AuctionRow }) {
  const v = auction.vehicle as any;
  const primaryImage =
    v?.images?.find((i: any) => i.is_primary)?.url ?? v?.images?.[0]?.url;
  const currentBid = auction.current_bid ?? auction.starting_price;
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: auction.currency ?? "USD",
    maximumFractionDigits: 0,
  });
  const isLive = auction.status === "live";
  const isUrgent =
    isLive && new Date(auction.ends_at).getTime() - Date.now() < 3600000;

  return (
    <Link
      href={`/auctions/${auction.id}`}
      className="group flex flex-col rounded-3xl overflow-hidden bg-slate-900/60 border border-white/8 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-950/20 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
            <span className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-300">
              🏎️
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Live Status Badge */}
        <div className="absolute top-3.5 left-3.5">
          {isLive ? (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider backdrop-blur-md ${
                isUrgent
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-rose-600/90 text-white shadow-lg shadow-rose-600/30"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE BIDDING</span>
            </span>
          ) : auction.status === "registration" ? (
            <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-full backdrop-blur-md">
              REGISTRATION OPEN
            </span>
          ) : auction.status === "upcoming" ? (
            <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full backdrop-blur-md">
              CATALOG PREVIEW
            </span>
          ) : (
            <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-wider bg-slate-800 text-slate-400 rounded-full">
              CONCLUDED
            </span>
          )}
        </div>

        {/* Time Badge */}
        <div className="absolute top-3.5 right-3.5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-black/75 text-slate-300 border border-white/10 backdrop-blur-md">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{timeLabel(auction.ends_at, auction.status)}</span>
          </span>
        </div>

        {/* Buy Now Option */}
        {auction.buy_now_price && (
          <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-xl text-xs font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 backdrop-blur-md shadow-lg">
            Buy Now: {fmt.format(auction.buy_now_price)}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs text-slate-400 font-light mb-1.5 flex items-center gap-1.5">
            <span>📍 {v?.city ?? "Direct Consignment"}</span>
          </div>

          <h3 className="font-bold text-white text-base mb-4 line-clamp-1 group-hover:text-amber-300 transition-colors">
            {auction.title}
          </h3>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                {auction.current_bid ? "Current High Bid" : "Opening Bid"}
              </div>
              <div className="text-xl font-black font-mono text-white tracking-tight">
                {fmt.format(currentBid)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                Total Bids
              </div>
              <div className="text-sm font-bold text-slate-300 font-mono">
                {auction.bids_count} bids
              </div>
            </div>
          </div>

          {auction.reserve_price && currentBid >= auction.reserve_price && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reserve Price Reached</span>
            </div>
          )}
        </div>

        <div
          className={`w-full py-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
            isLive
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25"
              : "bg-slate-900 border border-white/10 text-slate-400"
          }`}
        >
          {isLive
            ? "Enter Bidding Room →"
            : auction.status === "upcoming"
            ? "Register to Watch"
            : "View Completed Results"}
        </div>
      </div>
    </Link>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="col-span-full text-center py-20 p-8 rounded-3xl bg-slate-900/40 border border-white/5">
      <div className="text-5xl mb-4">🔨</div>
      <h3 className="text-lg font-bold text-white mb-2">No {label} auctions</h3>
      <p className="text-slate-400 text-sm max-w-md mx-auto">
        New live auctions are scheduled every week. Check the upcoming catalog or submit your vehicle for consignment.
      </p>
    </div>
  );
}

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolved = await searchParams;
  const tab = (resolved?.tab ?? "live") as "live" | "upcoming" | "ended";

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

  const empty = { auctions: [] as AuctionRow[], error: null };
  const [liveRes, upcomingRes, endedRes] = isSupabaseConfigured()
    ? await Promise.all([
        getAuctions("live"),
        getAuctions("upcoming"),
        getAuctions("ended"),
      ])
    : [empty, empty, empty];

  const allAuctions = {
    live: liveRes.auctions,
    upcoming: upcomingRes.auctions,
    ended: endedRes.auctions,
  };
  const current = allAuctions[tab];

  return (
    <main className="min-h-screen bg-[#080a0f] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar userEmail={user?.email} />

      {/* ── CINEMATIC AUCTIONS HERO ───────────────────────── */}
      <div className="relative pt-28 pb-14 overflow-hidden border-b border-white/8 bg-[#0a0d14]">
        {/* Amber & Flame Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[300px] bg-rose-600/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-debford relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/12 backdrop-blur-md mb-4 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest text-slate-300 uppercase font-semibold">
                DEBFORD COMMERCIAL &amp; ENTHUSIAST AUCTION ARENA
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.05] mb-4">
              Live Bidding.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-300 to-indigo-300">
                Verified Integrity.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mb-6">
              Transparent digital auctions for collector machines, sports cars, and commercial
              fleet disposals. Real-time incremental bidding, escrow security, and comprehensive
              vehicle inspection histories.
            </p>

            {/* Operator & Consignment CTAs */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <Link
                href="/auctions/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all"
              >
                <Gavel className="w-4 h-4" />
                <span>Launch Consignment Auction</span>
              </Link>
              <Link
                href="/auctions/manage"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 hover:border-amber-500/30 transition-all"
              >
                <span>Operator Dashboard &amp; Settlement</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 max-w-xl">
              {[
                { label: "Live Auctions Now", value: allAuctions.live.length, color: "text-rose-400", dot: "bg-rose-500" },
                { label: "Upcoming Catalog", value: allAuctions.upcoming.length, color: "text-amber-400", dot: "bg-amber-500" },
                { label: "Completed Disposals", value: allAuctions.ended.length, color: "text-slate-400", dot: "bg-slate-500" },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-2xl bg-black/50 border border-white/8 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    <span className="text-[10px] font-mono uppercase text-slate-500">{s.label}</span>
                  </div>
                  <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-debford py-10">
        {/* ── TAB SELECTOR ─────────────────────────────────── */}
        <div className="flex gap-2 mb-8 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 w-fit backdrop-blur-md">
          {(["live", "upcoming", "ended"] as const).map((t) => (
            <Link
              key={t}
              href={`/auctions?tab=${t}`}
              className={`px-6 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all ${
                tab === t
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t === "live" ? "Live Arenas" : t === "upcoming" ? "Upcoming Catalog" : "Past Results"}
              {t === "live" && allAuctions.live.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-rose-600 text-white rounded-full">
                  {allAuctions.live.length}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* ── AUCTIONS GRID ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {current.length === 0 ? (
            <EmptyTab label={tab} />
          ) : (
            current.map((auction) => <AuctionCard key={auction.id} auction={auction} />)
          )}
        </div>

        {/* ── CONSIGNMENT CALLOUT ──────────────────────────── */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-950 border border-amber-500/20 text-center shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
            Consign Your Vehicle to the Debford Live Arena
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8 font-light leading-relaxed">
            Gain exposure to thousands of verified buyers worldwide. Establish reserve thresholds,
            receive concierge vehicle inspection, and broadcast to serious bidders.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auctions/create"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all"
            >
              <Gavel className="w-4 h-4" />
              <span>Consign for Auction</span>
            </Link>
            <Link
              href="/auctions/manage"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all"
            >
              <span>Operator Console</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
