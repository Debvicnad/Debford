"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCountdown } from "@/hooks/useCountdown";
import { placeBid, registerForAuction, getParticipantStatus } from "@/lib/actions/auction.actions";
import {
  Gavel,
  TrendingUp,
  Clock,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Users,
  ChevronUp,
} from "lucide-react";

interface Bid {
  id: string;
  amount: number;
  bidder_id: string;
  created_at: string;
  status: string;
}

interface AuctionState {
  id: string;
  currentBid: number;
  startingPrice: number;
  bidIncrement: number;
  bidsCount: number;
  reservePrice?: number;
  buyNowPrice?: number;
  endsAt: string;
  status: "live" | "upcoming" | "ended";
  currentBidderId?: string;
  sellerId: string;
  requiresRegistration?: boolean;
  currency?: string;
}

interface Props {
  auction: AuctionState;
  initialBids: Bid[];
}

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

// ── Cinematic Countdown Clock ──────────────────────────────────
function CountdownClock({ endsAt, status }: { endsAt: string; status: string }) {
  const t = useCountdown(endsAt);

  if (status !== "live") {
    return (
      <div
        className="rounded-2xl p-4 text-center border"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <span className="text-sm font-semibold" style={{ color: "rgba(148,163,184,0.6)" }}>
          {status === "upcoming" ? "⏳ Auction hasn't started yet" : "🏁 Auction Concluded"}
        </span>
      </div>
    );
  }

  const isUrgent = t.total > 0 && t.total < 3_600_000;
  const isCritical = t.total > 0 && t.total < 300_000; // < 5 min

  if (t.isExpired) {
    return (
      <div className="text-center py-3">
        <span className="text-rose-400 font-bold text-sm animate-pulse">🔴 Auction Ended</span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  const urgentBg = isCritical
    ? "rgba(239,68,68,0.12)"
    : isUrgent
    ? "rgba(245,158,11,0.1)"
    : "rgba(255,255,255,0.04)";

  const urgentBorder = isCritical
    ? "rgba(239,68,68,0.3)"
    : isUrgent
    ? "rgba(245,158,11,0.25)"
    : "rgba(255,255,255,0.08)";

  const urgentText = isCritical ? "#f87171" : isUrgent ? "#fbbf24" : "#f8fafc";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.5)" }}>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{isCritical ? "⚠️ CRITICAL — Ending Soon!" : isUrgent ? "Ending Soon" : "Time Remaining"}</span>
        </div>
        {isUrgent && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse"
            style={{ backgroundColor: isCritical ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.15)", color: urgentText }}
          >
            LIVE
          </span>
        )}
      </div>

      <div className={`flex items-center justify-center gap-2 ${isCritical ? "animate-pulse" : ""}`}>
        {t.days > 0 && (
          <>
            <div
              className="flex flex-col items-center px-4 py-3 rounded-2xl border min-w-[56px]"
              style={{ backgroundColor: urgentBg, borderColor: urgentBorder }}
            >
              <span className="text-3xl font-black tabular-nums" style={{ color: urgentText }}>
                {pad(t.days)}
              </span>
              <span className="text-[10px] font-semibold mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>days</span>
            </div>
            <span className="text-2xl font-black" style={{ color: "rgba(148,163,184,0.3)" }}>:</span>
          </>
        )}
        {[
          { val: t.hours, label: "hrs" },
          { val: t.minutes, label: "min" },
          { val: t.seconds, label: "sec" },
        ].map((unit, i, arr) => (
          <div key={unit.label} className="flex items-center gap-2">
            <div
              className="flex flex-col items-center px-4 py-3 rounded-2xl border min-w-[56px]"
              style={{ backgroundColor: urgentBg, borderColor: urgentBorder }}
            >
              <span className="text-3xl font-black tabular-nums" style={{ color: urgentText }}>
                {pad(unit.val)}
              </span>
              <span className="text-[10px] font-semibold mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>{unit.label}</span>
            </div>
            {i < arr.length - 1 && (
              <span className="text-2xl font-black" style={{ color: "rgba(148,163,184,0.3)" }}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bid Feed item ──────────────────────────────────────────────
function BidItem({ bid, isLeading, rank }: { bid: Bid; isLeading: boolean; rank: number }) {
  const when = new Date(bid.created_at);
  const ago = Math.floor((Date.now() - when.getTime()) / 60000);
  const timeStr = ago < 1 ? "just now" : ago < 60 ? `${ago}m ago` : `${Math.floor(ago / 60)}h ago`;
  const initials = bid.bidder_id.slice(0, 2).toUpperCase();

  return (
    <div
      className="flex items-center gap-3 py-3 border-b last:border-0 transition-all"
      style={{
        borderColor: "rgba(255,255,255,0.05)",
        opacity: isLeading ? 1 : 0.65,
      }}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 relative"
        style={
          isLeading
            ? {
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
              }
            : {
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "rgba(148,163,184,0.6)",
              }
        }
      >
        {initials}
        {isLeading && (
          <span
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
            style={{ backgroundColor: "#f59e0b", color: "#000" }}
          >
            1
          </span>
        )}
      </div>

      {/* Bid info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-black"
            style={{ color: isLeading ? "#f8fafc" : "rgba(148,163,184,0.8)" }}
          >
            {fmt.format(bid.amount)}
          </span>
          {isLeading && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border"
              style={{
                backgroundColor: "rgba(99,102,241,0.15)",
                borderColor: "rgba(99,102,241,0.3)",
                color: "#a5b4fc",
              }}
            >
              <ChevronUp className="w-3 h-3" />
              LEADING
            </span>
          )}
        </div>
        <div className="text-[11px] font-mono mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }}>
          Bidder •••{bid.bidder_id.slice(-4)}
        </div>
      </div>

      <span className="text-[11px] shrink-0" style={{ color: "rgba(148,163,184,0.4)" }}>
        {timeStr}
      </span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function LiveBiddingPanel({ auction, initialBids }: Props) {
  const [currentBid, setCurrentBid] = useState(auction.currentBid || auction.startingPrice);
  const [bidsCount, setBidsCount] = useState(auction.bidsCount);
  const [bids, setBids] = useState<Bid[]>(initialBids);
  const [customAmount, setCustomAmount] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [reserveMet, setReserveMet] = useState(
    auction.reservePrice ? currentBid >= auction.reservePrice : true
  );
  const [lastBidFlash, setLastBidFlash] = useState(false);
  const [regStatus, setRegStatus] = useState<"loading" | "none" | "pending" | "approved" | "rejected">(
    auction.requiresRegistration ? "loading" : "approved"
  );

  const minNext = currentBid + auction.bidIncrement;

  useEffect(() => {
    if (auction.requiresRegistration) {
      getParticipantStatus(auction.id)
        .then((res) => {
          setRegStatus(res.status);
        })
        .catch(() => {
          setRegStatus("none");
        });
    }
  }, [auction.id, auction.requiresRegistration]);

  const handleRegister = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await registerForAuction(auction.id);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setRegStatus("pending");
        setMessage({
          type: "success",
          text: "Registration application received! The operator will review your bidder profile shortly.",
        });
      }
    });
  };

  // Supabase realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`auction:${auction.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "auction_bids",
          filter: `auction_id=eq.${auction.id}`,
        },
        (payload) => {
          const newBid = payload.new as Bid;
          setBids((prev) => [newBid, ...prev].slice(0, 50));
          setCurrentBid(newBid.amount);
          setBidsCount((c) => c + 1);
          setLastBidFlash(true);
          setTimeout(() => setLastBidFlash(false), 800);
          if (auction.reservePrice) setReserveMet(newBid.amount >= auction.reservePrice);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [auction.id, auction.reservePrice]);

  const handleBid = useCallback(
    (amount: number) => {
      setMessage(null);
      startTransition(async () => {
        const result = await placeBid(auction.id, amount);
        if (result.error) {
          setMessage({ type: "error", text: result.error });
        } else {
          setMessage({ type: "success", text: `Your bid of ${fmt.format(amount)} has been placed!` });
          setCustomAmount("");
        }
      });
    },
    [auction.id]
  );

  const quickBids = [minNext, minNext + auction.bidIncrement, minNext + auction.bidIncrement * 2];
  const isLive = auction.status === "live";

  return (
    <div className="space-y-4">
      {/* ── Current Bid Display ── */}
      <div
        className="rounded-3xl border p-5 space-y-4 transition-all duration-300"
        style={{
          background: lastBidFlash
            ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.1))"
            : "linear-gradient(135deg, rgba(13,18,31,0.95), rgba(10,15,26,0.95))",
          borderColor: lastBidFlash ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)",
          boxShadow: lastBidFlash ? "0 0 30px rgba(99,102,241,0.2)" : "none",
        }}
      >
        {/* Status pill */}
        <div className="flex items-center justify-between">
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
              style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.6)" }}
            >
              {auction.status}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "rgba(148,163,184,0.5)" }}>
            <Users className="w-3.5 h-3.5" />
            <span>{bidsCount} bids</span>
          </div>
        </div>

        {/* Big bid number */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.4)" }}>
            Current High Bid
          </div>
          <div
            className="text-5xl font-black tabular-nums transition-all duration-300"
            style={{
              color: lastBidFlash ? "#a5b4fc" : "#f8fafc",
              textShadow: lastBidFlash ? "0 0 30px rgba(99,102,241,0.5)" : "none",
            }}
          >
            {fmt.format(currentBid)}
          </div>
          <div className="text-[11px] mt-1 font-semibold" style={{ color: "rgba(148,163,184,0.4)" }}>
            Starting bid: {fmt.format(auction.startingPrice)} · Increment: {fmt.format(auction.bidIncrement)}
          </div>
        </div>

        {/* Reserve status */}
        {auction.reservePrice && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border"
            style={{
              backgroundColor: reserveMet ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              borderColor: reserveMet ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)",
              color: reserveMet ? "#34d399" : "#fbbf24",
            }}
          >
            {reserveMet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
            {reserveMet ? "Reserve Price Met ✓" : "Reserve Not Yet Met"}
          </div>
        )}

        {/* Buy Now */}
        {auction.buyNowPrice && isLive && (
          <div
            className="pt-4 border-t flex items-center justify-between"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div>
              <div className="text-[11px] font-semibold mb-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>
                Buy It Now — Skip the Auction
              </div>
              <div className="text-xl font-black" style={{ color: "#fbbf24" }}>
                {fmt.format(auction.buyNowPrice)}
              </div>
            </div>
            <button
              onClick={() => handleBid(auction.buyNowPrice!)}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all disabled:opacity-40 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#000",
                boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              Buy Now
            </button>
          </div>
        )}
      </div>

      {/* ── Countdown ── */}
      <div
        className="rounded-3xl border p-5"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <CountdownClock endsAt={auction.endsAt} status={auction.status} />
      </div>

      {/* ── Bid Controls ── */}
      {isLive && (
        <div
          className="rounded-3xl border p-5 space-y-4"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(13,18,31,0.95))",
            borderColor: "rgba(99,102,241,0.2)",
          }}
        >
          {auction.requiresRegistration && regStatus !== "approved" ? (
            <div className="space-y-3 py-2 text-center">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Pre-Registration Security Required
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {regStatus === "pending"
                    ? "Your bidder verification is currently pending operator review."
                    : regStatus === "rejected"
                    ? "Bidder registration request was declined for this consignment."
                    : "To ensure verified and transparent bidding, participants must register before placing bids."}
                </p>
              </div>

              {regStatus === "pending" && (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Pending Operator Review</span>
                </div>
              )}

              {regStatus === "rejected" && (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Access Declined</span>
                </div>
              )}

              {regStatus === "none" && (
                <button
                  onClick={handleRegister}
                  disabled={isPending}
                  className="w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all cursor-pointer shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isPending ? "Submitting Application…" : "Apply for Bidder Access"}</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                  >
                    Place Your Bid
                  </span>
                  {auction.requiresRegistration && regStatus === "approved" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved Bidder
                    </span>
                  )}
                </div>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  Min: <strong className="text-white">{fmt.format(minNext)}</strong>
                </span>
              </div>

            {/* Quick bid buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {quickBids.map((amount, i) => (
                <button
                  key={amount}
                  onClick={() => handleBid(amount)}
                  disabled={isPending}
                  className="py-3 rounded-xl text-xs font-extrabold transition-all border cursor-pointer group"
                  style={{
                    backgroundColor: i === 0 ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                    borderColor: i === 0 ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)",
                    color: i === 0 ? "#a5b4fc" : "rgba(148,163,184,0.7)",
                  }}
                >
                  {fmt.format(amount)}
                </button>
              ))}
            </div>

            {/* Custom bid */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  $
                </span>
                <input
                  type="number"
                  min={minNext}
                  step={auction.bidIncrement}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={minNext.toLocaleString()}
                  className="w-full pl-8 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>
              <button
                onClick={() => customAmount && handleBid(parseInt(customAmount))}
                disabled={isPending || !customAmount || parseInt(customAmount) < minNext}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                }}
              >
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    <span>Bid</span>
                  </>
                )}
              </button>
            </div>
          </div>
          )}

          {/* Feedback */}
          {message && (
            <div
              className="flex items-start gap-2.5 px-4 py-3 rounded-2xl border text-xs font-semibold"
              style={{
                backgroundColor: message.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                borderColor: message.type === "success" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)",
                color: message.type === "success" ? "#34d399" : "#f87171",
              }}
            >
              {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{message.text}</span>
            </div>
          )}

          <p className="text-[10px] text-center" style={{ color: "rgba(148,163,184,0.35)" }}>
            By bidding you agree to our auction terms. Winning bids are legally binding.
          </p>
        </div>
      )}

      {/* ── Bid History ── */}
      <div
        className="rounded-3xl border p-5"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
            style={{ color: "#f8fafc" }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: "#6366f1" }} />
            Bid Activity Feed
          </h3>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
            style={{
              backgroundColor: "rgba(99,102,241,0.1)",
              color: "#a5b4fc",
            }}
          >
            {bids.length} bids
          </span>
        </div>

        {bids.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <Gavel className="w-8 h-8 mx-auto" style={{ color: "rgba(148,163,184,0.2)" }} />
            <p className="text-xs font-semibold" style={{ color: "rgba(148,163,184,0.4)" }}>
              No bids yet — place the opening bid!
            </p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-0 pr-1" style={{ scrollbarWidth: "thin" }}>
            {bids.map((bid, i) => (
              <BidItem key={bid.id} bid={bid} isLeading={i === 0} rank={i + 1} />
            ))}
          </div>
        )}
      </div>

      {/* ── Seller Shield ── */}
      <div
        className="rounded-3xl border p-4 flex items-center gap-3"
        style={{
          backgroundColor: "rgba(16,185,129,0.05)",
          borderColor: "rgba(16,185,129,0.15)",
        }}
      >
        <ShieldCheck className="w-5 h-5 shrink-0" style={{ color: "#34d399" }} />
        <div className="text-xs" style={{ color: "rgba(148,163,184,0.7)" }}>
          <strong className="text-white">Debford Buyer Protection:</strong> Funds held in escrow until
          vehicle pickup and inspection sign-off. Zero-risk bidding.
        </div>
      </div>
    </div>
  );
}
