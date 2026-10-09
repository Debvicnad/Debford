"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { VehicleOffer, counterOffer, acceptOffer, rejectOffer, withdrawOffer } from "@/lib/actions/offer.actions";
import { createClient } from "@/lib/supabase/client";

interface OffersManagementClientProps {
  initialReceived: VehicleOffer[];
  initialSent: VehicleOffer[];
}

export function OffersManagementClient({
  initialReceived,
  initialSent,
}: OffersManagementClientProps) {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [receivedOffers, setReceivedOffers] = useState<VehicleOffer[]>(initialReceived);
  const [sentOffers, setSentOffers] = useState<VehicleOffer[]>(initialSent);

  // Modal States
  const [acceptingOffer, setAcceptingOffer] = useState<VehicleOffer | null>(null);
  const [counteringOffer, setCounteringOffer] = useState<VehicleOffer | null>(null);
  const [counterAmount, setCounterAmount] = useState<string>("");
  const [counterNotes, setCounterNotes] = useState<string>("");
  const [rejectingOffer, setRejectingOffer] = useState<VehicleOffer | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [detailsOffer, setDetailsOffer] = useState<VehicleOffer | null>(null);

  const [isPending, startTransition] = useTransition();
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Realtime Supabase listener
  useEffect(() => {
    try {
      const supabase = createClient();
      const channel = supabase
        .channel("realtime-vehicle-offers")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "vehicle_offers" },
          (payload) => {
            const updated = payload.new as any;
            if (!updated?.id) return;

            setReceivedOffers((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
            setSentOffers((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // In local mode without Supabase connection
    }
  }, []);

  function showToast(msg: string, isError = false) {
    if (isError) {
      setActionErrorMessage(msg);
      setTimeout(() => setActionErrorMessage(null), 4000);
    } else {
      setActionSuccessMessage(msg);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  }

  // Handle Accept
  function handleAcceptConfirm() {
    if (!acceptingOffer) return;
    const target = acceptingOffer;

    startTransition(async () => {
      const res = await acceptOffer(target.id);
      if (res.error) {
        showToast(res.error, true);
      } else {
        const updateState = (list: VehicleOffer[]) =>
          list.map((o) => (o.id === target.id ? { ...o, status: "accepted" as const } : o));
        setReceivedOffers(updateState);
        setSentOffers(updateState);
        showToast("Offer accepted! Escrow transfer initialized.");
        setAcceptingOffer(null);
      }
    });
  }

  // Handle Counter
  function handleCounterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!counteringOffer) return;
    const target = counteringOffer;
    const amt = Number(counterAmount);

    if (isNaN(amt) || amt <= 0) {
      showToast("Please enter a valid counter-offer amount.", true);
      return;
    }

    startTransition(async () => {
      const res = await counterOffer({
        offerId: target.id,
        counterAmount: amt,
        counterNotes: counterNotes.trim() || undefined,
      });

      if (res.error) {
        showToast(res.error, true);
      } else {
        const updateState = (list: VehicleOffer[]) =>
          list.map((o) =>
            o.id === target.id
              ? {
                  ...o,
                  status: "countered" as const,
                  counter_amount: amt,
                  counter_notes: counterNotes.trim() || null,
                }
              : o
          );
        setReceivedOffers(updateState);
        setSentOffers(updateState);
        showToast(`Counter-offer of $${amt.toLocaleString()} submitted.`);
        setCounteringOffer(null);
        setCounterAmount("");
        setCounterNotes("");
      }
    });
  }

  // Handle Reject
  function handleRejectConfirm() {
    if (!rejectingOffer) return;
    const target = rejectingOffer;

    startTransition(async () => {
      const res = await rejectOffer(target.id, rejectReason.trim() || undefined);
      if (res.error) {
        showToast(res.error, true);
      } else {
        const updateState = (list: VehicleOffer[]) =>
          list.map((o) => (o.id === target.id ? { ...o, status: "rejected" as const } : o));
        setReceivedOffers(updateState);
        setSentOffers(updateState);
        showToast("Offer declined.");
        setRejectingOffer(null);
        setRejectReason("");
      }
    });
  }

  // Handle Withdraw
  function handleWithdrawConfirm(offerId: string) {
    if (!confirm("Are you sure you wish to withdraw this offer?")) return;

    startTransition(async () => {
      const res = await withdrawOffer(offerId);
      if (res.error) {
        showToast(res.error, true);
      } else {
        const updateState = (list: VehicleOffer[]) =>
          list.map((o) => (o.id === offerId ? { ...o, status: "withdrawn" as const } : o));
        setSentOffers(updateState);
        showToast("Offer withdrawn.");
      }
    });
  }

  const currentList = activeTab === "received" ? receivedOffers : sentOffers;

  // Filtered List
  const filteredOffers = currentList.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.listing?.title.toLowerCase().includes(q);
      const makeMatch = item.listing?.vehicle?.make_name?.toLowerCase().includes(q);
      const modelMatch = item.listing?.vehicle?.model_name?.toLowerCase().includes(q);
      const buyerMatch = item.buyer?.full_name?.toLowerCase().includes(q);
      const sellerMatch = item.seller?.full_name?.toLowerCase().includes(q);
      return titleMatch || makeMatch || modelMatch || buyerMatch || sellerMatch;
    }
    return true;
  });

  // Calculate Metrics
  const activeCount = currentList.filter((o) => o.status === "pending" || o.status === "countered").length;
  const acceptedCount = currentList.filter((o) => o.status === "accepted").length;
  const totalVolume = currentList.reduce((acc, o) => acc + (o.counter_amount || o.amount), 0);

  return (
    <div className="space-y-8">
      {/* Toast Alerts */}
      {actionSuccessMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl bg-emerald-500/90 border border-emerald-400 text-white font-mono text-xs shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="text-base">✅</span>
          <span>{actionSuccessMessage}</span>
        </div>
      )}
      {actionErrorMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl bg-rose-600/90 border border-rose-400 text-white font-mono text-xs shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="text-base">⚠️</span>
          <span>{actionErrorMessage}</span>
        </div>
      )}

      {/* Telemetry Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/8 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Active Negotiations
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black font-mono text-white">
              {activeCount}
            </span>
            <span className="text-xs font-mono text-amber-400">Under Review</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/8 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Escrow Readiness
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black font-mono text-emerald-400">
              {acceptedCount}
            </span>
            <span className="text-xs font-mono text-emerald-400/80">Accepted Deals</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/8 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Negotiation Pipeline
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black font-mono text-white">
              ${(totalVolume / 1000).toFixed(0)}k
            </span>
            <span className="text-xs font-mono text-slate-400">Total Capital</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/8 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Escrow Protection
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-white font-mono">100% Insured</span>
          </div>
        </div>
      </div>

      {/* Main Filter / Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        {/* Received vs Sent Tabs */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveTab("received");
              setStatusFilter("all");
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "received"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📥 Received Offers (Seller)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white">
              {receivedOffers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("sent");
              setStatusFilter("all");
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "sent"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📤 Sent Offers (Buyer)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white">
              {sentOffers.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Search vehicle or counterparty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2 text-xs text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { label: "All Offers", value: "all" },
          { label: "Pending Review", value: "pending" },
          { label: "Counter-Offered", value: "countered" },
          { label: "Accepted / Escrow", value: "accepted" },
          { label: "Declined", value: "rejected" },
          { label: "Withdrawn", value: "withdrawn" },
        ].map((chip) => (
          <button
            key={chip.value}
            onClick={() => setStatusFilter(chip.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              statusFilter === chip.value
                ? "bg-white/15 border-white/30 text-white font-bold"
                : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Offers Cards Grid / List */}
      {filteredOffers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-white/5 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
            🏷️
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">No negotiations match criteria</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeTab === "received"
                ? "You currently have no incoming buyer offers matching this filter. Listed vehicles will populate here once inquiries arrive."
                : "You have not placed any vehicle offers matching this filter. Explore certified showrooms to initiate a direct transaction."}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/vehicles"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
            >
              Explore Vehicles →
            </Link>
            {activeTab === "received" && (
              <Link
                href="/sell"
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors"
              >
                List a Vehicle +
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            const isSeller = activeTab === "received";
            const thumbnail =
              offer.listing?.vehicle?.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1400&q=80";

            const listPrice = offer.original_price || offer.listing?.price || offer.amount;
            const effectivePrice = offer.counter_amount || offer.amount;
            const diffPct = Math.round(((effectivePrice - listPrice) / listPrice) * 100);

            const isPendingState = offer.status === "pending";
            const isCounteredState = offer.status === "countered";
            const isAcceptedState = offer.status === "accepted";
            const isConcludedState = offer.status === "rejected" || offer.status === "withdrawn";

            const counterpartyName = isSeller
              ? offer.buyer?.full_name ?? "Verified Buyer"
              : offer.seller?.full_name ?? "Showroom Dealer";

            return (
              <div
                key={offer.id}
                className={`rounded-2xl border p-5 md:p-6 transition-all backdrop-blur-md ${
                  isAcceptedState
                    ? "bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                    : isCounteredState
                    ? "bg-amber-950/20 border-amber-500/30"
                    : isConcludedState
                    ? "bg-slate-900/40 border-white/5 opacity-70"
                    : "bg-slate-900/70 border-white/10 hover:border-white/20 shadow-xl"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Vehicle Info + Image */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-28 h-20 md:w-36 md:h-24 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-950">
                      <Image
                        src={thumbnail}
                        alt={offer.listing?.title || "Vehicle"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 112px, 144px"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        {isAcceptedState && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            🛡️ Escrow Ready (Accepted)
                          </span>
                        )}
                        {isCounteredState && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            🔄 Counter-Proposed
                          </span>
                        )}
                        {isPendingState && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            ⏳ Pending Review
                          </span>
                        )}
                        {offer.status === "rejected" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            ✕ Declined
                          </span>
                        )}
                        {offer.status === "withdrawn" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">
                            ⤸ Withdrawn
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-slate-500">
                          ID: {offer.id.slice(0, 8)}
                        </span>
                      </div>

                      <Link
                        href={`/vehicles/${offer.listing_id}`}
                        className="text-base md:text-lg font-bold text-white hover:text-blue-400 transition-colors line-clamp-1 block"
                      >
                        {offer.listing?.title || "Luxury Automobile"}
                      </Link>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>
                          {isSeller ? "Buyer" : "Seller"}:{" "}
                          <strong className="text-slate-200">{counterpartyName}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          List: <strong className="text-slate-300">${listPrice.toLocaleString()}</strong>
                        </span>
                        {offer.listing?.vehicle?.city && (
                          <>
                            <span>•</span>
                            <span>📍 {offer.listing.vehicle.city}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Financial & Offer Stats */}
                  <div className="flex flex-wrap items-center gap-6 lg:border-l lg:border-r border-white/10 lg:px-6">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                        {isCounteredState ? "Counter Amount" : "Offer Amount"}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-mono text-white">
                          ${effectivePrice.toLocaleString()}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold ${
                            diffPct < 0 ? "text-amber-400" : "text-emerald-400"
                          }`}
                        >
                          {diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`}
                        </span>
                      </div>
                      {isCounteredState && (
                        <span className="text-[10px] font-mono text-slate-400 block line-through">
                          Original Offer: ${offer.amount.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {offer.notes && (
                      <div className="max-w-xs">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          Notes / Message:
                        </span>
                        <p className="text-xs text-slate-300 italic line-clamp-2 mt-0.5">
                          &ldquo;{offer.notes}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Direct Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* If Offer is Accepted */}
                    {isAcceptedState && (
                      <Link
                        href={`/checkout?type=vehicle&offer=${offer.id}`}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                      >
                        <span>🛡️ Proceed to Escrow Vault</span>
                        <span>→</span>
                      </Link>
                    )}

                    {/* If Seller Received Pending Offer */}
                    {isSeller && isPendingState && (
                      <>
                        <button
                          type="button"
                          onClick={() => setAcceptingOffer(offer)}
                          disabled={isPending}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
                        >
                          Accept Offer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCounteringOffer(offer);
                            setCounterAmount(Math.round(listPrice * 0.98).toString());
                          }}
                          disabled={isPending}
                          className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all"
                        >
                          Counter
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingOffer(offer)}
                          disabled={isPending}
                          className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-white/10 font-bold text-xs transition-all"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {/* If Buyer Sent Pending Offer */}
                    {!isSeller && isPendingState && (
                      <button
                        type="button"
                        onClick={() => handleWithdrawConfirm(offer.id)}
                        disabled={isPending}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-white/10 font-bold text-xs transition-all"
                      >
                        Withdraw Offer
                      </button>
                    )}

                    {/* If Countered */}
                    {isCounteredState && (
                      <>
                        <button
                          type="button"
                          onClick={() => setAcceptingOffer(offer)}
                          disabled={isPending}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                        >
                          Accept Counter
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCounteringOffer(offer);
                            setCounterAmount((offer.counter_amount || offer.amount).toString());
                          }}
                          disabled={isPending}
                          className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all"
                        >
                          Re-Counter
                        </button>
                      </>
                    )}

                    {/* View Details Inspect Button */}
                    <button
                      type="button"
                      onClick={() => setDetailsOffer(offer)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs transition-colors"
                      title="Inspect Offer Summary"
                    >
                      ℹ️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACCEPT MODAL */}
      {acceptingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🛡️</span>
                  <span>Confirm Agreement Acceptance</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {acceptingOffer.listing?.title}
                </p>
              </div>
              <button
                onClick={() => setAcceptingOffer(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
              <div className="text-[11px] font-mono text-slate-400">Accepted Settlement Amount:</div>
              <div className="text-3xl font-mono font-black text-emerald-400">
                $
                {(
                  acceptingOffer.counter_amount || acceptingOffer.amount
                ).toLocaleString()}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Upon accepting, an Escrow Vault transfer order will be reserved. The buyer will receive instructions to lock funds in Escrow, guaranteeing payment upon verification.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAcceptingOffer(null)}
                disabled={isPending}
                className="px-4 py-2.5 bg-white/5 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcceptConfirm}
                disabled={isPending}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isPending ? "Executing..." : "Confirm & Open Escrow →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COUNTER-OFFER MODAL */}
      {counteringOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🔄</span>
                  <span>Propose Counter-Offer</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Original Offer: ${counteringOffer.amount.toLocaleString()} • List: $
                  {(counteringOffer.original_price || counteringOffer.listing?.price || 0).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setCounteringOffer(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCounterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Proposed Counter Price (USD) *
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-base font-mono font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Clarification Note / Justification:
                </label>
                <textarea
                  rows={3}
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  placeholder="e.g. Includes factory winter wheel package and pre-delivery ceramic coating..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCounteringOffer(null)}
                  disabled={isPending}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? "Transmitting..." : "Send Counter-Offer →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>✕</span>
                  <span>Decline Offer</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Decline offer of ${rejectingOffer.amount.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setRejectingOffer(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Reason for Declining (Optional):
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Below acceptable threshold given pending private showroom offers..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingOffer(null)}
                  disabled={isPending}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                >
                  Keep Active
                </button>
                <button
                  type="button"
                  onClick={handleRejectConfirm}
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  {isPending ? "Declining..." : "Confirm Decline"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS INSPECT MODAL */}
      {detailsOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Offer & Agreement Dossier</h3>
                <p className="text-xs text-slate-400 font-mono">Reference: {detailsOffer.id}</p>
              </div>
              <button
                onClick={() => setDetailsOffer(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-white/10">
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">Vehicle</span>
                  <span className="font-bold text-white">{detailsOffer.listing?.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">List Price</span>
                  <span className="font-bold font-mono text-white">
                    ${(detailsOffer.original_price || detailsOffer.listing?.price || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">Submitted Amount</span>
                  <span className="font-bold font-mono text-emerald-400">
                    ${detailsOffer.amount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">Status</span>
                  <span className="font-bold font-mono uppercase text-blue-400">{detailsOffer.status}</span>
                </div>
              </div>

              {detailsOffer.contingencies && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Special Conditions & Contingencies:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                    {detailsOffer.contingencies}
                  </p>
                </div>
              )}

              {detailsOffer.notes && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Buyer Notes:
                  </span>
                  <p className="text-slate-300 leading-relaxed">{detailsOffer.notes}</p>
                </div>
              )}

              {detailsOffer.counter_notes && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    Counter-Offer Terms:
                  </span>
                  <p className="text-amber-200 leading-relaxed">{detailsOffer.counter_notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailsOffer(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
