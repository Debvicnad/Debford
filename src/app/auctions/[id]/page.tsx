import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Car,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Gauge,
  Zap,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Gavel,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { LiveBiddingPanel } from "@/components/auctions/LiveBiddingPanel";
import { getAuctionById, isSupabaseConfigured } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured()) return { title: "Live Auction — Debford" };
  const { auction } = await getAuctionById(id);
  if (!auction) return { title: "Auction Not Found — Debford" };
  return {
    title: `${auction.title} — Live Bidding Arena | Debford`,
    description: `Bid live on ${auction.title}. Real-time transparent auction with Debford buyer protection and escrow.`,
  };
}

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let auctionData: any = null;
  let bidsData: any[] = [];

  if (isSupabaseConfigured()) {
    const res = await getAuctionById(id);
    if (res.auction) {
      auctionData = res.auction;
      bidsData = res.bids ?? [];
    }
  }

  // Rich demo fallback
  if (!auctionData) {
    if (id === "1" || id === "a1" || id === "demo") {
      auctionData = {
        id: "demo",
        title: "2023 Porsche 911 GT3 RS — Weissach Package",
        status: "live",
        starting_price: 180000,
        current_bid: 215000,
        bid_increment: 1000,
        bids_count: 14,
        reserve_price: 210000,
        buy_now_price: 265000,
        starts_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        ends_at: new Date(Date.now() + 4 * 3600000 + 35 * 60000).toISOString(),
        currency: "USD",
        seller_id: "demo-seller",
        vehicle: {
          id: "v-gt3",
          year: 2023,
          make_name: "Porsche",
          model_name: "911 GT3 RS",
          mileage: 3400,
          fuel_type: "Petrol",
          transmission: "PDK Dual-Clutch",
          engine_capacity: 4000,
          power_hp: 518,
          torque_nm: 465,
          top_speed_kmh: 296,
          sprint_0_100: 3.2,
          drivetrain: "RWD",
          body_type: "Coupe",
          exterior_color: "Ice Grey Metallic",
          interior_color: "Black / Guard Red Alcantara",
          condition: "Used — Mint (1 Owner)",
          city: "Miami, FL",
          vin: "WP0AF2A92PS223001",
          description:
            "Flawless 2023 Porsche 911 GT3 RS finished in exclusive Ice Grey Metallic with the full Weissach Package fitted from the factory. Optioned with ultra-lightweight Magnesium Wheels, PCCB Ceramic Composite Brakes, Front Axle Lift System, and full-spec Clubsport Pack. 1 meticulous owner from new, Porsche-serviced at all intervals with complete documentation. Full-front PPF professionally applied at delivery. A true racing machine for the road — these cars are appreciating rapidly.",
          images: [
            {
              url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1400&q=80",
              is_primary: true,
              sort_order: 0,
            },
            {
              url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
              is_primary: false,
              sort_order: 1,
            },
            {
              url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=80",
              is_primary: false,
              sort_order: 2,
            },
          ],
          features: [
            { category: "Performance", feature: "Weissach Package (Factory Fitted)" },
            { category: "Performance", feature: "PCCB Ceramic Composite Brakes" },
            { category: "Performance", feature: "Front Axle Lift System" },
            { category: "Performance", feature: "Magnesium 21\" Centerlock Wheels" },
            { category: "Performance", feature: "Clubsport Pack (Harness, Extinguisher, Prep)" },
            { category: "Interior", feature: "Full Carbon Fiber Bucket Seats" },
            { category: "Interior", feature: "Alcantara Wrapped Interior Package" },
            { category: "Exterior", feature: "Full-Front PPF (Professional Fitted)" },
            { category: "Audio", feature: "Bose Surround Sound System" },
            { category: "Tech", feature: "Porsche Track Precision App Integration" },
          ],
        },
        seller: {
          id: "demo-seller",
          full_name: "Apex Luxury Motors",
          avatar_url: null,
          average_rating: 4.95,
          sales_count: 84,
          verification_status: "verified",
          response_time: "< 2 hours",
          member_since: "2019",
        },
      };
      bidsData = [
        {
          id: "b1",
          amount: 215000,
          bidder_id: "user-8842",
          created_at: new Date(Date.now() - 3 * 60000).toISOString(),
          status: "active",
        },
        {
          id: "b2",
          amount: 214000,
          bidder_id: "user-1923",
          created_at: new Date(Date.now() - 12 * 60000).toISOString(),
          status: "lost",
        },
        {
          id: "b3",
          amount: 212000,
          bidder_id: "user-5517",
          created_at: new Date(Date.now() - 28 * 60000).toISOString(),
          status: "lost",
        },
        {
          id: "b4",
          amount: 210000,
          bidder_id: "user-4401",
          created_at: new Date(Date.now() - 40 * 60000).toISOString(),
          status: "lost",
        },
      ];
    } else {
      notFound();
    }
  }

  const v = auctionData.vehicle ?? {};
  const seller = auctionData.seller ?? {};
  const images: any[] = (v.images ?? []).sort(
    (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const primaryImage = images.find((i) => i.is_primary)?.url ?? images[0]?.url;
  const features: any[] = v.features ?? [];
  const isLive = auctionData.status === "live";

  const auctionState = {
    id: auctionData.id,
    currentBid: auctionData.current_bid ?? auctionData.starting_price,
    startingPrice: auctionData.starting_price,
    bidIncrement: auctionData.bid_increment ?? 500,
    bidsCount: auctionData.bids_count ?? bidsData.length,
    reservePrice: auctionData.reserve_price,
    buyNowPrice: auctionData.buy_now_price,
    endsAt: auctionData.ends_at,
    status: auctionData.status as "live" | "upcoming" | "ended",
    currentBidderId: auctionData.current_bidder_id,
    sellerId: auctionData.seller_id,
    requiresRegistration: Boolean(auctionData.requires_registration),
    currency: auctionData.currency ?? "USD",
  };

  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#06090e" }}>
      <Navbar />

      {/* ── Top Status Bar ── */}
      <div
        className="border-b"
        style={{ backgroundColor: "rgba(13,18,31,0.95)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="container-debford py-3 flex items-center justify-between gap-3 flex-wrap">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(148,163,184,0.25)" }} />
            <Link href="/auctions" className="hover:text-slate-300 transition-colors">Live Auctions</Link>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(148,163,184,0.25)" }} />
            <span className="text-slate-300 font-semibold truncate max-w-xs">{auctionData.title}</span>
          </div>

          {/* Live status + bid count */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
              <span>{auctionData.bids_count ?? bidsData.length} bids placed</span>
            </div>
            {isLive ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border animate-pulse"
                style={{
                  backgroundColor: "rgba(239,68,68,0.15)",
                  borderColor: "rgba(239,68,68,0.35)",
                  color: "#f87171",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                LIVE AUCTION
              </span>
            ) : (
              <span
                className="px-3 py-1 rounded-full text-[11px] font-bold capitalize"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "rgba(148,163,184,0.6)",
                }}
              >
                {auctionData.status}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container-debford py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left — Main Content ── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Gallery */}
            <div className="space-y-3">
              {/* Primary image */}
              <div
                className="relative aspect-[16/9] overflow-hidden rounded-3xl border shadow-2xl group"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
                }}
              >
                {primaryImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage}
                    alt={auctionData.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #0a0f1d, #131b2e)" }}
                  >
                    <Car className="w-24 h-24" style={{ color: "rgba(148,163,184,0.15)" }} />
                  </div>
                )}

                {/* Cinematic gradient overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(6,9,14,0.7) 0%, transparent 40%), linear-gradient(to right, rgba(6,9,14,0.3) 0%, transparent 40%)",
                  }}
                />

                {/* Status badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {isLive && (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-xl backdrop-blur-md animate-pulse"
                      style={{
                        backgroundColor: "rgba(239,68,68,0.85)",
                        color: "#fff",
                        boxShadow: "0 4px 16px rgba(239,68,68,0.4)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      LIVE
                    </span>
                  )}
                  {v.condition && (
                    <span
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl backdrop-blur-md border"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.6)",
                        borderColor: "rgba(255,255,255,0.12)",
                        color: "#e2e8f0",
                      }}
                    >
                      {v.condition}
                    </span>
                  )}
                </div>

                {/* Photo count */}
                {images.length > 0 && (
                  <div
                    className="absolute bottom-4 right-4 text-xs font-bold backdrop-blur-md px-3 py-1.5 rounded-xl border"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#e2e8f0",
                    }}
                  >
                    📷 {images.length} photos
                  </div>
                )}

                {/* Current bid overlay */}
                <div className="absolute bottom-4 left-4">
                  <div
                    className="text-[11px] font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    Current High Bid
                  </div>
                  <div
                    className="text-3xl font-black"
                    style={{
                      color: "#f8fafc",
                      textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                    }}
                  >
                    {fmt.format(auctionState.currentBid)}
                  </div>
                </div>
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="relative shrink-0 w-28 h-20 rounded-2xl overflow-hidden border cursor-pointer transition-all"
                      style={{
                        borderColor: i === 0 ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)",
                        boxShadow: i === 0 ? "0 0 0 2px rgba(99,102,241,0.3)" : "none",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title + quick stats */}
            <div>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <h1
                    className="font-black tracking-tight mb-2"
                    style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color: "#f8fafc", lineHeight: 1.1 }}
                  >
                    {auctionData.title}
                  </h1>
                  <div className="flex items-center flex-wrap gap-3 text-xs" style={{ color: "rgba(148,163,184,0.6)" }}>
                    {v.year && <span className="font-semibold">{v.year}</span>}
                    {v.mileage && <span>• {Number(v.mileage).toLocaleString()} km</span>}
                    {v.transmission && <span>• {v.transmission}</span>}
                    {v.fuel_type && <span>• {v.fuel_type}</span>}
                    {v.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {v.city}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/messages?seller=${seller.id || auctionData.seller_id}&listing=${auctionData.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all shrink-0"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "#94a3b8",
                  }}
                >
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Ask Seller
                </Link>
              </div>
            </div>

            {/* Mobile bidding panel */}
            <div className="lg:hidden">
              <LiveBiddingPanel auction={auctionState} initialBids={bidsData} />
            </div>

            {/* Telemetry Matrix */}
            <div
              className="rounded-3xl border p-6 space-y-5"
              style={{
                background: "linear-gradient(135deg, rgba(13,18,31,0.95), rgba(10,15,26,0.95))",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <h2
                className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                style={{ color: "#f8fafc" }}
              >
                <Gauge className="w-4 h-4" style={{ color: "#6366f1" }} />
                Engineering Telemetry
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { label: "Make", value: v.make_name, icon: "🏭" },
                  { label: "Model", value: v.model_name, icon: "🚗" },
                  { label: "Year", value: v.year, icon: "📅" },
                  { label: "Mileage", value: v.mileage ? `${Number(v.mileage).toLocaleString()} km` : null, icon: "📊" },
                  { label: "Transmission", value: v.transmission, icon: "⚙️" },
                  { label: "Fuel Type", value: v.fuel_type, icon: "⛽" },
                  { label: "Engine", value: v.engine_capacity ? `${v.engine_capacity} cc` : null, icon: "🔧" },
                  { label: "Power", value: v.power_hp ? `${v.power_hp} HP` : null, icon: "⚡" },
                  { label: "Torque", value: v.torque_nm ? `${v.torque_nm} Nm` : null, icon: "🌀" },
                  { label: "0–100 km/h", value: v.sprint_0_100 ? `${v.sprint_0_100}s` : null, icon: "🏁" },
                  { label: "Top Speed", value: v.top_speed_kmh ? `${v.top_speed_kmh} km/h` : null, icon: "🚀" },
                  { label: "Drivetrain", value: v.drivetrain, icon: "🔩" },
                  { label: "Exterior", value: v.exterior_color, icon: "🎨" },
                  { label: "Interior", value: v.interior_color, icon: "🪑" },
                  { label: "Location", value: v.city, icon: "📍" },
                  { label: "VIN", value: v.vin, icon: "🔍" },
                ]
                  .filter((s) => Boolean(s.value))
                  .map((spec) => (
                    <div
                      key={spec.label}
                      className="p-3.5 rounded-2xl border"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(255,255,255,0.07)",
                      }}
                    >
                      <div
                        className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"
                        style={{ color: "rgba(148,163,184,0.45)" }}
                      >
                        <span>{spec.icon}</span>
                        <span>{spec.label}</span>
                      </div>
                      <div className="text-sm font-bold text-white truncate">{spec.value}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Factory Options & Features */}
            {features.length > 0 && (
              <div
                className="rounded-3xl border p-6 space-y-5"
                style={{
                  background: "linear-gradient(135deg, rgba(13,18,31,0.95), rgba(10,15,26,0.95))",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: "#f8fafc" }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "#f59e0b" }} />
                  Factory Options &amp; Installed Equipment
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {features.map((f: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.025)",
                        borderColor: "rgba(255,255,255,0.06)",
                        color: "#cbd5e1",
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#34d399" }} />
                      <span>{f.feature ?? f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {v.description && (
              <div
                className="rounded-3xl border p-6 space-y-3"
                style={{
                  background: "linear-gradient(135deg, rgba(13,18,31,0.95), rgba(10,15,26,0.95))",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: "#f8fafc" }}
                >
                  <Car className="w-4 h-4" style={{ color: "#38bdf8" }} />
                  Vehicle Overview
                </h2>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(203,213,225,0.75)" }}>
                  {v.description}
                </p>
              </div>
            )}

            {/* Seller Card */}
            <div
              className="rounded-3xl border p-6"
              style={{
                background: "linear-gradient(135deg, rgba(13,18,31,0.95), rgba(10,15,26,0.95))",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                      boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
                    }}
                  >
                    {seller.full_name?.charAt(0)?.toUpperCase() ?? "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-black text-white">
                        {seller.full_name ?? "Verified Seller"}
                      </span>
                      {seller.verification_status === "verified" && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: "rgba(16,185,129,0.1)",
                            borderColor: "rgba(16,185,129,0.25)",
                            color: "#34d399",
                          }}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          Verified Dealer
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>
                      <span className="text-amber-400 font-bold">★ {seller.average_rating ?? "5.0"}</span>
                      <span>• {seller.sales_count ?? 12} transactions</span>
                      {seller.member_since && <span>• Member since {seller.member_since}</span>}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/messages?seller=${seller.id || auctionData.seller_id}&listing=${auctionData.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Inquiry
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Auction Terms */}
            <div
              className="rounded-3xl border p-6 space-y-4"
              style={{
                backgroundColor: "rgba(245,158,11,0.04)",
                borderColor: "rgba(245,158,11,0.2)",
              }}
            >
              <div
                className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider"
                style={{ color: "#fbbf24" }}
              >
                <AlertTriangle className="w-4 h-4" />
                Debford Auction Terms &amp; Buyer Protection
              </div>
              <ul className="space-y-3">
                {[
                  {
                    title: "Binding Bids",
                    desc: "All bids placed on Debford are legally binding. Winning bidders have 48 hours to complete vehicle payment.",
                  },
                  {
                    title: "Anti-Sniping Protection",
                    desc: "Any bid placed within the final 2 minutes automatically extends the auction clock by 2 minutes.",
                  },
                  {
                    title: "Escrow & Inspection",
                    desc: "Funds are held securely in escrow until vehicle pickup and condition sign-off by both parties.",
                  },
                  {
                    title: "Reserve Price",
                    desc: "The seller has set a reserve — the vehicle will only be sold if bidding surpasses the undisclosed reserve before the clock expires.",
                  },
                ].map((term) => (
                  <li key={term.title} className="flex items-start gap-2.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span style={{ color: "rgba(203,213,225,0.7)" }}>
                      <strong className="text-white">{term.title}:</strong> {term.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Right — Sticky Bid Panel ── */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24">
              <LiveBiddingPanel auction={auctionState} initialBids={bidsData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
