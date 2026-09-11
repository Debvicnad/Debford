import type { Metadata } from "next";
import Link from "next/link";
import { getAuctions, isSupabaseConfigured, type AuctionRow } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Live Auctions",
  description: "Bid on cars, motorcycles, and more in live and upcoming auctions on Debford.",
};

function timeLabel(endsAt: string, status: string): string {
  if (status === "ended") return "Ended";
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Ending…";
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m left`;
  }
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}

function AuctionCard({ auction }: { auction: AuctionRow }) {
  const v = auction.vehicle as any;
  const primaryImage = v?.images?.find((i: any) => i.is_primary)?.url ?? v?.images?.[0]?.url;
  const currentBid = auction.current_bid ?? auction.starting_price;
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency", currency: auction.currency ?? "USD", minimumFractionDigits: 0,
  });
  const isLive = auction.status === "live";
  const isUrgent = isLive && (new Date(auction.ends_at).getTime() - Date.now()) < 3600000;

  return (
    <Link
      href={`/auctions/${auction.id}`}
      className="group block glass rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 hover:shadow-xl hover:shadow-black/10 transition-all duration-200"
    >
      <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900">
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={primaryImage} alt={auction.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl opacity-15 group-hover:opacity-25 transition-opacity">🏎️</span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {isLive ? (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${isUrgent ? "bg-rose-600 text-white animate-pulse" : "bg-rose-500/90 text-white backdrop-blur-sm"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              LIVE
            </span>
          ) : auction.status === "upcoming" ? (
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full backdrop-blur-sm">
              Upcoming
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-bold bg-slate-600/80 text-slate-400 rounded-full">
              Ended
            </span>
          )}
        </div>
        {/* Time */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${isUrgent ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-black/50 text-slate-400"}`}>
            {timeLabel(auction.ends_at, auction.status)}
          </span>
        </div>
        {/* Buy now */}
        {auction.buy_now_price && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-500/20 border border-amber-500/30 rounded-full backdrop-blur-sm">
            Buy now: {fmt.format(auction.buy_now_price)}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1 group-hover:text-blue-300 transition-colors">
          {auction.title}
        </h3>
        <p className="text-xs text-slate-500 mb-3">📍 {v?.city ?? "Location not set"}</p>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-slate-600 mb-0.5">
              {auction.current_bid ? "Current bid" : "Starting at"}
            </div>
            <div className="text-lg font-extrabold text-blue-400">
              {fmt.format(currentBid)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600 mb-0.5">Bids</div>
            <div className="text-sm font-bold text-slate-300">{auction.bids_count}</div>
          </div>
        </div>
        {auction.reserve_price && currentBid >= auction.reserve_price && (
          <div className="text-xs text-emerald-400 mb-2">✓ Reserve met</div>
        )}
        <div className={`w-full py-2 text-center text-sm font-semibold rounded-xl transition-all ${
          isLive
            ? "gradient-brand text-white group-hover:opacity-90 group-hover:shadow-lg group-hover:shadow-blue-500/20"
            : "glass border border-white/10 text-slate-400"
        }`}>
          {isLive ? "Place Bid →" : auction.status === "upcoming" ? "Watch Auction" : "View Results"}
        </div>
      </div>
    </Link>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="col-span-full text-center py-16">
      <div className="text-5xl mb-4">🔨</div>
      <h3 className="text-lg font-bold text-white mb-2">No {label} auctions</h3>
      <p className="text-slate-500 text-sm">Check back soon — new auctions are added daily.</p>
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

  const empty = { auctions: [] as AuctionRow[], error: null };
  const [liveRes, upcomingRes, endedRes] = isSupabaseConfigured()
    ? await Promise.all([
        getAuctions("live"),
        getAuctions("upcoming"),
        getAuctions("ended"),
      ])
    : [empty, empty, empty];

  const allAuctions = { live: liveRes.auctions, upcoming: upcomingRes.auctions, ended: endedRes.auctions };
  const current = allAuctions[tab];

  return (
    <div className="min-h-screen surface-base">
      {/* Hero */}
      <div className="relative overflow-hidden surface-raised border-b border-subtle">
        <div className="absolute inset-0 gradient-hero opacity-70" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/8 rounded-full blur-3xl" />
        <div className="container-debford py-10 relative z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>›</span>
            <span className="text-slate-300">Auctions</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Vehicle Auctions</h1>
          <p className="text-slate-400 text-lg mb-0 max-w-lg">
            Live bidding, real-time updates, and exclusive vehicles.
          </p>
        </div>
      </div>

      <div className="container-debford py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Live now", value: allAuctions.live.length, color: "text-rose-400" },
            { label: "Upcoming", value: allAuctions.upcoming.length, color: "text-amber-400" },
            { label: "Ended today", value: allAuctions.ended.length, color: "text-slate-400" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl border border-white/10 p-4 text-center">
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass rounded-xl border border-white/10 p-1 w-fit">
          {(["live", "upcoming", "ended"] as const).map((t) => (
            <Link
              key={t}
              href={`/auctions?tab=${t}`}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t
                  ? "gradient-brand text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
              {t === "live" && allAuctions.live.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full">
                  {allAuctions.live.length}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {current.length === 0 ? (
            <EmptyTab label={tab} />
          ) : (
            current.map((auction) => <AuctionCard key={auction.id} auction={auction} />)
          )}
        </div>

        {/* Sell CTA */}
        <div className="mt-12 glass rounded-2xl border border-white/10 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Want to auction your vehicle?</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Reach thousands of serious buyers. Set your reserve, choose your dates, and go live.
          </p>
          <Link href="/sell" className="px-6 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
            List for Auction →
          </Link>
        </div>
      </div>
    </div>
  );
}
