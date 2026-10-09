"use client";

import { useState } from "react";
import Link from "next/link";
import { createOffer } from "@/lib/actions/offer.actions";

interface SellerData {
  id?: string;
  full_name?: string;
  avatar_url?: string;
  average_rating?: number;
  reviews_count?: number;
  sales_count?: number;
  verification_status?: string;
  response_time?: string;
  city?: string;
}

interface VehiclePurchaseSidebarProps {
  listingId: string;
  title: string;
  price: number;
  currency?: string;
  isNegotiable?: boolean;
  location?: string;
  viewsCount?: number;
  savesCount?: number;
  inquiriesCount?: number;
  seller?: SellerData;
}

export function VehiclePurchaseSidebar({
  listingId,
  title,
  price,
  currency = "USD",
  isNegotiable = false,
  location = "Location Not Set",
  viewsCount = 342,
  savesCount = 18,
  inquiriesCount = 7,
  seller,
}: VehiclePurchaseSidebarProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [viewingModalOpen, setViewingModalOpen] = useState(false);
  const [viewingDate, setViewingDate] = useState("2026-09-24");
  const [viewingTime, setViewingTime] = useState("14:00");
  const [viewingSuccess, setViewingSuccess] = useState(false);

  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState(Math.round(price * 0.95).toString());
  const [offerMessage, setOfferMessage] = useState("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offerSuccess, setOfferSuccess] = useState(false);

  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }

  function handleScheduleViewing(e: React.FormEvent) {
    e.preventDefault();
    setViewingSuccess(true);
    setTimeout(() => {
      setViewingSuccess(false);
      setViewingModalOpen(false);
    }, 1800);
  }

  async function handleSubmitOffer(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingOffer(true);
    setOfferError(null);
    try {
      const res = await createOffer({
        listingId,
        amount: Number(offerAmount),
        notes: offerMessage.trim() || undefined,
      });

      if (res?.error) {
        setOfferError(res.error);
        setIsSubmittingOffer(false);
      } else {
        setOfferSuccess(true);
        setIsSubmittingOffer(false);
        setTimeout(() => {
          setOfferSuccess(false);
          setOfferModalOpen(false);
        }, 2200);
      }
    } catch (err: any) {
      setOfferError(err?.message || "Failed to dispatch offer. Please try again.");
      setIsSubmittingOffer(false);
    }
  }

  const sellerName = seller?.full_name ?? "Premier Verified Dealer";
  const sellerInitial = sellerName.charAt(0).toUpperCase();

  return (
    <div className="space-y-4">
      {/* Sticky Main Transaction Card */}
      <div className="bg-slate-900/80 rounded-2xl md:rounded-3xl border border-white/10 p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] sticky top-24 space-y-6">
        {/* Title & Location for mobile / sidebar */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-1">
            Certified Showroom Listing
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white leading-snug tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
            <span>📍</span>
            <span>{location}</span>
          </p>
        </div>

        {/* Price & Guarantee */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/8 space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-mono font-black text-white tracking-tight">
              {fmt}
            </div>
            {isNegotiable && (
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Negotiable
              </span>
            )}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Escrow Protected Purchase Guarantee</span>
          </div>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="space-y-2.5">
          <Link
            href={`/checkout?type=vehicle&id=${listingId}`}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 border border-emerald-400/40 transition-all flex items-center justify-center gap-2 group"
          >
            <span>🛡️ Reserve with Escrow Protection</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOfferModalOpen(true)}
              className="py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>🏷️ Make Offer</span>
            </button>
            <button
              type="button"
              onClick={() => setViewingModalOpen(true)}
              className="py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>📅 Test Drive</span>
            </button>
          </div>

          <Link
            href={`/messages?seller=${seller?.id || "dealer"}&listing=${listingId}`}
            className="w-full py-3 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-white/10 hover:border-white/25 transition-all flex items-center justify-center gap-2"
          >
            <span>💬 Message Seller / Dealer</span>
          </Link>
        </div>

        {/* Seller Info Card */}
        <div className="border-t border-white/8 pt-5 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Listing Verified Dealer
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-black text-base shadow-md shrink-0 border border-blue-400/30">
              {sellerInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{sellerName}</div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="text-amber-400">★ {seller?.average_rating?.toFixed(1) ?? "4.9"}</span>
                <span>·</span>
                <span className="text-emerald-400 font-mono font-semibold">✓ Verified</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-white/5">
            <div>
              <span className="text-slate-500 block">Response Time</span>
              <span className="text-slate-200 font-bold">{seller?.response_time ?? "< 15 mins"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Sales Volume</span>
              <span className="text-slate-200 font-bold">{seller?.sales_count ?? 85}+ Verified</span>
            </div>
          </div>
        </div>

        {/* Engagement Stats & Quick Actions */}
        <div className="border-t border-white/8 pt-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-white font-bold">{viewsCount}</div>
              <div className="text-[10px] text-slate-500">Views</div>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-white font-bold">{savesCount}</div>
              <div className="text-[10px] text-slate-500">Saves</div>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-white font-bold">{inquiriesCount}</div>
              <div className="text-[10px] text-slate-500">Offers</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className={`flex-1 py-2 rounded-xl border text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
                isSaved
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-white/5 text-slate-400 hover:text-white border-white/10"
              }`}
            >
              <span>{isSaved ? "❤️ Saved" : "🤍 Save"}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5"
            >
              <span>{isCopied ? "✓ Link Copied" : "↗ Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SCHEDULE TEST DRIVE MODAL */}
      {viewingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Schedule Private Viewing</h3>
                <p className="text-xs text-slate-400 mt-0.5">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {viewingSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2">
                <span className="text-3xl block">✓</span>
                <div className="text-sm font-bold text-emerald-300">Appointment Requested!</div>
                <p className="text-xs text-slate-300">
                  The dealer has received your viewing request for {viewingDate} at {viewingTime}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleScheduleViewing} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Select Date:</label>
                  <input
                    type="date"
                    required
                    value={viewingDate}
                    onChange={(e) => setViewingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Preferred Time Slot:</label>
                  <select
                    value={viewingTime}
                    onChange={(e) => setViewingTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                  >
                    <option value="10:00">10:00 AM - Morning Slot</option>
                    <option value="12:00">12:00 PM - Midday Slot</option>
                    <option value="14:00">02:00 PM - Afternoon Slot</option>
                    <option value="16:30">04:30 PM - Sunset Slot</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-slate-300 leading-relaxed">
                  📍 Test drive will take place at dealer premises in {location}. Valid driver&apos;s license required upon arrival.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setViewingModalOpen(false)}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
                  >
                    Confirm Appointment →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MAKE AN OFFER MODAL */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Make a Formal Offer</h3>
                <p className="text-xs text-slate-400 mt-0.5">List Price: {fmt}</p>
              </div>
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {offerSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-3">
                <span className="text-4xl block animate-bounce">🏷️</span>
                <div className="text-base font-bold text-emerald-300">Offer Dispatched!</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your formal offer of <span className="font-mono font-bold text-white">${Number(offerAmount).toLocaleString()}</span> has been dispatched to {sellerName}.
                </p>
                <div className="pt-2">
                  <Link
                    href="/offers"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Track in Offers Console →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitOffer} className="space-y-4">
                {offerError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                    <span className="text-sm">⚠️</span>
                    <span>{offerError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Offer Amount (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    disabled={isSubmittingOffer}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-base font-mono font-bold focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                    Suggested range: ~${Math.round(price * 0.9).toLocaleString()} to {fmt}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Note to Dealer / Contingencies:
                  </label>
                  <textarea
                    rows={3}
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    disabled={isSubmittingOffer}
                    placeholder="e.g. Ready for immediate wire transfer upon escrow verification..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:border-blue-500 focus:outline-none resize-none disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOfferError(null);
                      setOfferModalOpen(false);
                    }}
                    disabled={isSubmittingOffer}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white rounded-xl disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOffer}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingOffer ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Transmitting Offer...</span>
                      </>
                    ) : (
                      <span>Send Offer to Dealer →</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
