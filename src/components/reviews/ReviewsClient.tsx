"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Car,
  Wrench,
  ChevronRight,
  Sparkles,
  ThumbsUp,
  Clock,
  CornerDownRight,
  Send,
  Award,
  Filter,
  ArrowRight,
  X,
  MessageSquare,
  Lock,
  ExternalLink,
} from "lucide-react";

interface ReviewItem {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  listingTitle: string;
  listingUrl: string;
  listingCategory: "vehicle" | "service" | "part";
  body: string;
  type: "received" | "given";
  helpfulCount: number;
  verifiedTransaction: boolean;
  reply: {
    author: string;
    date: string;
    text: string;
  } | null;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "r1",
    author: "James Kowalski",
    avatar: "JK",
    rating: 5,
    date: "Sep 15, 2026",
    listingTitle: "2023 Porsche 911 GT3 RS — Clubsport Package",
    listingUrl: "/vehicles/porsche-gt3-rs",
    listingCategory: "vehicle",
    body: "Flawless transaction through Debford Escrow. The telemetry data and 150-point certified inspection report matched the vehicle condition to the millimeter. Delivered enclosed flatbed right to my garage bay in Miami.",
    type: "received",
    helpfulCount: 14,
    verifiedTransaction: true,
    reply: {
      author: "Debford Concierge",
      date: "Sep 16, 2026",
      text: "Thank you James! Enjoy the GT3 RS on track at Homestead. The digital glovebox title records are permanently synced to your garage.",
    },
  },
  {
    id: "r2",
    author: "Sarah Chen",
    avatar: "SC",
    rating: 5,
    date: "Sep 08, 2026",
    listingTitle: "Apex Performance Studio — Stage 2 Calibration & Dyno",
    listingUrl: "/services/p1",
    listingCategory: "service",
    body: "Marcus and the team at Apex are true engineering masters. Dyno graph showed +82 HP gains cleanly across the band. Kept me updated via the messaging terminal with real-time telemetry video logs.",
    type: "received",
    helpfulCount: 9,
    verifiedTransaction: true,
    reply: null,
  },
  {
    id: "r3",
    author: "David Miller",
    avatar: "DM",
    rating: 4,
    date: "Aug 29, 2026",
    listingTitle: "Brembo GT-R Monobloc 6-Piston Carbon Ceramic Brake Kit",
    listingUrl: "/parts",
    listingCategory: "part",
    body: "Authentic OEM spec, boxed in factory crating with titanium hardware and certificate of authenticity. Freight arrived one day behind schedule due to regional courier transit, but the part is 10/10.",
    type: "received",
    helpfulCount: 6,
    verifiedTransaction: true,
    reply: {
      author: "Debford Logistics",
      date: "Aug 30, 2026",
      text: "Appreciate the feedback, David. We have upgraded the ground logistics partner on that route to eliminate courier lag.",
    },
  },
  {
    id: "r4",
    author: "You (Buyer)",
    avatar: "ME",
    rating: 5,
    date: "Aug 14, 2026",
    listingTitle: "Mobile Precision Diagnostic & ECU Code Clearing",
    listingUrl: "/services/p2",
    listingCategory: "service",
    body: "Mobile technician van arrived equipped with full factory scan tools. Diagnosed misfire on cylinder 4 within 15 minutes and replaced coil pack on-site. Outstanding service.",
    type: "given",
    helpfulCount: 4,
    verifiedTransaction: true,
    reply: {
      author: "Precision Van Unit 4",
      date: "Aug 15, 2026",
      text: "Glad to have you back on the road safely! Your digital maintenance log has been updated.",
    },
  },
  {
    id: "r5",
    author: "You (Buyer)",
    avatar: "ME",
    rating: 5,
    date: "Jul 22, 2026",
    listingTitle: "2022 BMW M4 Competition Coupe (G82)",
    listingUrl: "/vehicles/bmw-m4-competition",
    listingCategory: "vehicle",
    body: "Seamless viewing and escrow settlement. Clear title was transferred directly into my Debford digital glovebox without DMV counter queues.",
    type: "given",
    helpfulCount: 8,
    verifiedTransaction: true,
    reply: null,
  },
];

function StarRating({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.floor(value)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-700"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewsClient({ userEmail }: { userEmail?: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [activeTab, setActiveTab] = useState<"received" | "given">("received");
  const [starFilter, setStarFilter] = useState<number | "all">("all");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  const receivedReviews = reviews.filter((r) => r.type === "received");
  const givenReviews = reviews.filter((r) => r.type === "given");
  const currentList = activeTab === "received" ? receivedReviews : givenReviews;

  const filteredReviews = currentList.filter((r) => {
    if (starFilter === "all") return true;
    return r.rating === starFilter;
  });

  const avgRating =
    receivedReviews.length > 0
      ? (receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length).toFixed(1)
      : "5.0";

  const toggleLike = (id: string) => {
    setLikedReviews((prev) => {
      const isLiked = prev[id];
      const nextLiked = !isLiked;
      setReviews((all) =>
        all.map((item) =>
          item.id === id
            ? { ...item, helpfulCount: item.helpfulCount + (nextLiked ? 1 : -1) }
            : item
        )
      );
      return { ...prev, [id]: nextLiked };
    });
  };

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setReviews((all) =>
      all.map((item) =>
        item.id === reviewId
          ? {
              ...item,
              reply: {
                author: userEmail ? userEmail.split("@")[0] : "Verified Seller",
                date: "Just now",
                text: replyText.trim(),
              },
            }
          : item
      )
    );
    setReplyText("");
    setReplyingToId(null);
  };

  return (
    <div className="pb-24">
      {/* ── CINEMATIC HEADER ────────────────────────────────── */}
      <div className="relative pt-28 pb-12 overflow-hidden border-b border-white/8 bg-[#080d16]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[320px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[280px] bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />

        {/* Technical Grid Scanlines */}
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
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-blue-400 font-semibold">Reputation & Reviews</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono tracking-wider uppercase mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Trust Telemetry · Escrow Protected</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Peer Ratings & Testimonials
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                Immutable feedback from verified buyers, consignors, and automotive specialists
                backed by Debford&apos;s escrow audit trails.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/verification"
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-semibold hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-blue-400" />
                <span>Verification Badges</span>
              </Link>
              <Link
                href="/dealership"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <Car className="w-4 h-4" />
                <span>Fleet Command</span>
              </Link>
            </div>
          </div>

          {/* ── TELEMETRY TRUST RIBBON ───────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/8">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Reputation Score
                </span>
              </div>
              <div className="text-2xl font-black text-white">{avgRating} <span className="text-sm text-slate-500 font-normal">/ 5.0</span></div>
              <p className="text-[11px] text-slate-400 mt-0.5">Top 2% of marketplace sellers</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Escrow Audited
                </span>
              </div>
              <div className="text-2xl font-black text-white">100%</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero escrow dispute claims</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Response Latency
                </span>
              </div>
              <div className="text-2xl font-black text-white">&lt; 38 min</div>
              <p className="text-[11px] text-slate-400 mt-0.5">99.1% direct inquiry reply rate</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Guild Accreditation
                </span>
              </div>
              <div className="text-2xl font-black text-white">Tier-1</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Verified Identity & Business KYC</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: REPUTATION BREAKDOWN MATRIX */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0d121d] border border-white/8 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Rating Breakdown</span>
              </h2>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/6">
                <div className="text-center">
                  <div className="text-5xl font-black text-white">{avgRating}</div>
                  <StarRating value={parseFloat(avgRating)} size="md" />
                  <div className="text-xs text-slate-500 mt-1 font-mono">
                    {receivedReviews.length} total reviews
                  </div>
                </div>

                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = receivedReviews.filter((r) => r.rating === stars).length;
                    const pct = receivedReviews.length
                      ? Math.round((count / receivedReviews.length) * 100)
                      : 0;
                    return (
                      <button
                        key={stars}
                        onClick={() => setStarFilter(starFilter === stars ? "all" : stars)}
                        className={`w-full flex items-center gap-2 text-xs group transition-colors ${
                          starFilter === stars ? "text-amber-300 font-bold" : "text-slate-400"
                        }`}
                      >
                        <span className="w-3 text-right font-mono">{stars}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        <div className="flex-1 h-2 bg-[#131b2e] rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-right font-mono text-[11px] text-slate-500">
                          {pct}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trust Indicators */}
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                Audited Performance Pillars
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/6">
                  <span className="text-slate-300">Listing Accuracy</span>
                  <span className="font-mono text-emerald-400 font-bold">100% · Verified</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/6">
                  <span className="text-slate-300">Escrow Security</span>
                  <span className="font-mono text-emerald-400 font-bold">Grade A+ Protected</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/6">
                  <span className="text-slate-300">Delivery Fulfillment</span>
                  <span className="font-mono text-emerald-400 font-bold">4.9 / 5.0</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/6">
                  <span className="text-slate-300">Mechanical Condition</span>
                  <span className="font-mono text-emerald-400 font-bold">150-Pt Inspected</span>
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-950/40 via-[#0d121d] to-[#080d16] border border-blue-500/20 shadow-lg">
              <div className="flex items-center gap-3 mb-2 text-blue-400">
                <Lock className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">Debford Escrow Guarantee</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reviews on Debford are strictly gated to completed escrow transactions. No anonymous
                reviews or unverified accounts are permitted into the rating algorithm.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: REVIEWS FEED & INTERACTIVE SUITE */}
          <div className="lg:col-span-2 space-y-6">
            {/* TABS & FILTER BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl bg-[#0d121d] border border-white/8">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080d16] border border-white/5">
                <button
                  onClick={() => {
                    setActiveTab("received");
                    setStarFilter("all");
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "received"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Reviews Received</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === "received"
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {receivedReviews.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("given");
                    setStarFilter("all");
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "given"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>Reviews Given</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === "given"
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {givenReviews.length}
                  </span>
                </button>
              </div>

              {/* Star Filter Pill */}
              <div className="flex items-center gap-2 px-2">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  <span>Filter:</span>
                </span>
                <select
                  value={starFilter}
                  onChange={(e) =>
                    setStarFilter(
                      e.target.value === "all" ? "all" : parseInt(e.target.value, 10)
                    )
                  }
                  className="bg-[#131b2e] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Stars</option>
                  <option value="5">5 Stars only</option>
                  <option value="4">4 Stars only</option>
                  <option value="3">3 Stars only</option>
                </select>
                {starFilter !== "all" && (
                  <button
                    onClick={() => setStarFilter("all")}
                    className="p-1 rounded-md text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* REVIEWS LIST */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="p-12 rounded-3xl bg-[#0d121d] border border-white/6 text-center">
                  <Star className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-white mb-1">No reviews match criteria</h4>
                  <p className="text-xs text-slate-400">
                    Try adjusting the star rating filter to display testimonials.
                  </p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-3xl bg-[#0d121d] border border-white/8 p-6 shadow-xl hover:border-white/15 transition-all space-y-4"
                  >
                    {/* Header: Author, Rating, Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/6">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800 p-0.5 shrink-0 shadow-md">
                          <div className="w-full h-full bg-[#080d16] rounded-[14px] flex items-center justify-center text-white text-xs font-black tracking-wider">
                            {review.avatar}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{review.author}</h3>
                            {review.verifiedTransaction && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Verified Transaction</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">
                            {review.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <StarRating value={review.rating} size="sm" />
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {review.rating}.0
                        </span>
                      </div>
                    </div>

                    {/* Listing Reference Banner */}
                    <Link
                      href={review.listingUrl}
                      className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/6 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {review.listingCategory === "vehicle" && (
                          <Car className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                        {review.listingCategory === "service" && (
                          <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {review.listingCategory === "part" && (
                          <Award className="w-4 h-4 text-purple-400 shrink-0" />
                        )}
                        <span className="font-medium text-slate-300 group-hover:text-white truncate">
                          {review.listingTitle}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0 ml-2" />
                    </Link>

                    {/* Review Body */}
                    <p className="text-sm text-slate-300 leading-relaxed">{review.body}</p>

                    {/* Existing Reply */}
                    {review.reply && (
                      <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-1.5 ml-4 sm:ml-8">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-blue-400">
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>{review.reply.author}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {review.reply.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {review.reply.text}
                        </p>
                      </div>
                    )}

                    {/* Footer Actions: Helpful button & Reply Trigger */}
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <button
                        onClick={() => toggleLike(review.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                          likedReviews[review.id]
                            ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                            : "bg-white/[0.02] border-white/6 text-slate-400 hover:text-white hover:border-white/15"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Helpful ({review.helpfulCount})</span>
                      </button>

                      {activeTab === "received" && !review.reply && (
                        <div>
                          {replyingToId === review.id ? (
                            <button
                              onClick={() => setReplyingToId(null)}
                              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              onClick={() => setReplyingToId(review.id)}
                              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                              <span>+ Post Response</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inline Reply Form */}
                    {replyingToId === review.id && (
                      <div className="pt-3 border-t border-white/6 space-y-2">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a professional seller response..."
                          className="w-full bg-[#080d16] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setReplyingToId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendReply(review.id)}
                            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                          >
                            <Send className="w-3 h-3" />
                            <span>Publish Response</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
