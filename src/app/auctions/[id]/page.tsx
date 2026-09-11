import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Car,
  Clock,
  ShieldCheck,
  Award,
  Share2,
  Heart,
  MessageSquare,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { LiveBiddingPanel } from "@/components/auctions/LiveBiddingPanel";
import { getAuctionById, isSupabaseConfigured } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured()) return { title: "Live Auction | DEBFORD" };
  const { auction } = await getAuctionById(id);
  if (!auction) return { title: "Auction Not Found | DEBFORD" };
  return {
    title: `${auction.title} — Live Auction | DEBFORD`,
    description: `Live bidding on ${auction.title}. Place your bid on DEBFORD.`,
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

  // Fallback demo auction if database row is not yet created for this ID
  if (!auctionData) {
    if (id === "1" || id === "a1" || id === "demo") {
      auctionData = {
        id: "demo",
        title: "2023 Porsche 911 GT3 RS",
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
          body_type: "Coupe",
          exterior_color: "Ice Grey Metallic",
          interior_color: "Black / Guard Red Accent",
          condition: "Used (Mint)",
          city: "Miami, FL",
          description:
            "Flawless 2023 Porsche 911 GT3 RS finished in Ice Grey Metallic with Weissach Package, Magnesium Wheels, PCCB Ceramic Brakes, and Front Axle Lift. 1 owner from new with full PPF and complete service records.",
          images: [
            { url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80", is_primary: true, sort_order: 0 },
            { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", is_primary: false, sort_order: 1 },
          ],
          features: [
            { category: "Performance", feature: "Weissach Package" },
            { category: "Performance", feature: "PCCB Ceramic Brakes" },
            { category: "Performance", feature: "Front Axle Lift System" },
            { category: "Interior", feature: "Carbon Fiber Full Bucket Seats" },
            { category: "Audio", feature: "Bose Surround Sound System" },
          ],
        },
        seller: {
          id: "demo-seller",
          full_name: "Apex Luxury Motors",
          avatar_url: null,
          average_rating: 4.95,
          sales_count: 84,
          verification_status: "verified",
        },
      };
      bidsData = [
        { id: "b1", amount: 215000, bidder_id: "user-8842", created_at: new Date(Date.now() - 3 * 60000).toISOString(), status: "active" },
        { id: "b2", amount: 214000, bidder_id: "user-1923", created_at: new Date(Date.now() - 12 * 60000).toISOString(), status: "lost" },
        { id: "b3", amount: 210000, bidder_id: "user-4401", created_at: new Date(Date.now() - 40 * 60000).toISOString(), status: "lost" },
      ];
    } else {
      notFound();
    }
  }

  const v = auctionData.vehicle ?? {};
  const seller = auctionData.seller ?? {};
  const images: any[] = (v.images ?? []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const primaryImage = images.find((i) => i.is_primary)?.url ?? images[0]?.url;
  const features: any[] = v.features ?? [];

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
  };

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      {/* Breadcrumb */}
      <div className="bg-[#0d121d] border-b border-white/5">
        <div className="container-debford py-3.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/auctions" className="hover:text-slate-300 transition-colors">Auctions</Link>
            <span>›</span>
            <span className="text-slate-300 truncate font-medium">{auctionData.title}</span>
          </div>

          <div className="flex items-center gap-2">
            {auctionData.status === "live" ? (
              <span className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                LIVE AUCTION
              </span>
            ) : (
              <span className="px-3 py-1 text-[11px] font-bold bg-white/5 text-slate-400 rounded-full capitalize">
                {auctionData.status}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container-debford py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left / Main Content ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image display */}
            <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-900 to-black rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImage}
                  alt={auctionData.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="w-24 h-24 text-slate-700" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-900/40 backdrop-blur-md">
                  🔴 LIVE
                </span>
                {v.condition && (
                  <span className="px-3 py-1.5 text-xs font-semibold bg-black/60 text-slate-200 rounded-xl backdrop-blur-md border border-white/10">
                    {v.condition}
                  </span>
                )}
              </div>

              {images.length > 0 && (
                <div className="absolute bottom-4 right-4 text-xs font-semibold text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  📷 {images.length} photos
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/60 transition-all cursor-pointer bg-slate-900"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Header info */}
            <div>
              <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                    {auctionData.title}
                  </h1>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 flex-wrap">
                    {v.year && <span>{v.year}</span>}
                    {v.mileage && <span>• {Number(v.mileage).toLocaleString()} km</span>}
                    {v.transmission && <span>• {v.transmission}</span>}
                    {v.fuel_type && <span>• {v.fuel_type}</span>}
                    {v.city && <span>• 📍 {v.city}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/messages?seller=${seller.id || auctionData.seller_id}&listing=${auctionData.id}`}
                    className="px-4 py-2.5 bg-[#131b2e] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span>Ask Seller</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Bidding Panel */}
            <div className="lg:hidden">
              <LiveBiddingPanel auction={auctionState} initialBids={bidsData} />
            </div>

            {/* Vehicle Specifications */}
            <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-6 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />
                <span>Vehicle Specifications</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Make", value: v.make_name },
                  { label: "Model", value: v.model_name },
                  { label: "Year", value: v.year },
                  { label: "Mileage", value: v.mileage ? `${Number(v.mileage).toLocaleString()} km` : null },
                  { label: "Transmission", value: v.transmission },
                  { label: "Fuel Type", value: v.fuel_type },
                  { label: "Engine", value: v.engine_capacity ? `${v.engine_capacity} cc` : null },
                  { label: "Horsepower", value: v.power_hp ? `${v.power_hp} hp` : null },
                  { label: "Exterior Color", value: v.exterior_color },
                  { label: "Interior Color", value: v.interior_color },
                  { label: "Location", value: v.city },
                  { label: "Condition", value: v.condition },
                ]
                  .filter((s) => Boolean(s.value))
                  .map((spec) => (
                    <div
                      key={spec.label}
                      className="p-3.5 bg-[#131b2e]/60 rounded-2xl border border-white/5"
                    >
                      <div className="text-[11px] text-slate-500 font-medium mb-1">{spec.label}</div>
                      <div className="text-sm font-bold text-white truncate">{spec.value}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Features & Options */}
            {features.length > 0 && (
              <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-6 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Installed Features & Equipment</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {features.map((f: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span>{f.feature ?? f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {v.description && (
              <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-6 space-y-3 shadow-sm">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Vehicle Overview & Details
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {v.description}
                </p>
              </div>
            )}

            {/* Seller info card */}
            <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-6 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {seller.full_name?.charAt(0).toUpperCase() ?? "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">
                        {seller.full_name ?? "Verified Seller"}
                      </span>
                      {seller.verification_status === "verified" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="text-amber-400">★ {seller.average_rating ?? "5.0"}</span>
                      <span>• {seller.sales_count ?? 12} successful transactions</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/messages?seller=${seller.id || auctionData.seller_id}&listing=${auctionData.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20"
                >
                  Send Inquiry
                </Link>
              </div>
            </div>

            {/* Auction Terms */}
            <div className="bg-[#0d121d] rounded-3xl border border-amber-500/20 p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Debford Auction Terms & Buyer Protection</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 shrink-0">•</span>
                  <span><strong>Binding Bids:</strong> All bids placed on DEBFORD auctions are legally binding. Winning bidders have 48 hours to complete vehicle payment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 shrink-0">•</span>
                  <span><strong>Anti-Sniping Protection:</strong> Any bid placed within the final 2 minutes will automatically extend the auction clock by 2 minutes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 shrink-0">•</span>
                  <span><strong>Escrow & Inspection:</strong> Funds are held securely in escrow until vehicle pickup and verified condition sign-off.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Right / Sticky Bidding Panel ───────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <LiveBiddingPanel auction={auctionState} initialBids={bidsData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
