"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCountdown } from "@/hooks/useCountdown";
import { placeBid } from "@/lib/actions/auction.actions";

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
}

interface Props {
  auction: AuctionState;
  initialBids: Bid[];
}

// ── Countdown display ─────────────────────────────────────────
function CountdownClock({ endsAt, status }: { endsAt: string; status: string }) {
  const t = useCountdown(endsAt);

  if (status !== "live") {
    return (
      <div className="text-center py-4">
        <span className="text-slate-500 text-sm">
          {status === "upcoming" ? "Auction hasn't started yet" : "Auction has ended"}
        </span>
      </div>
    );
  }

  const isUrgent = t.total > 0 && t.total < 3600_000; // < 1 hour

  if (t.isExpired) {
    return (
      <div className="text-center py-4">
        <span className="text-rose-400 font-semibold text-sm animate-pulse">
          🔴 Auction ended
        </span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className={`text-center ${isUrgent ? "animate-pulse" : ""}`}>
      <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">
        {isUrgent ? "⚠️ Ending soon!" : "Time remaining"}
      </p>
      <div className="flex items-center justify-center gap-2">
        {t.days > 0 && (
          <>
            <div className={`flex flex-col items-center px-3 py-2 rounded-xl ${isUrgent ? "bg-rose-500/20 border border-rose-500/30" : "surface-base border border-white/10"}`}>
              <span className={`text-2xl font-extrabold tabular-nums ${isUrgent ? "text-rose-400" : "text-white"}`}>
                {pad(t.days)}
              </span>
              <span className="text-xs text-slate-600">days</span>
            </div>
            <span className="text-slate-600 text-xl font-bold">:</span>
          </>
        )}
        {[
          { val: t.hours, label: "hrs" },
          { val: t.minutes, label: "min" },
          { val: t.seconds, label: "sec" },
        ].map((unit, i, arr) => (
          <div key={unit.label} className="flex items-center gap-2">
            <div className={`flex flex-col items-center px-3 py-2 rounded-xl ${isUrgent ? "bg-rose-500/20 border border-rose-500/30" : "surface-base border border-white/10"}`}>
              <span className={`text-2xl font-extrabold tabular-nums ${isUrgent ? "text-rose-400" : "text-white"}`}>
                {pad(unit.val)}
              </span>
              <span className="text-xs text-slate-600">{unit.label}</span>
            </div>
            {i < arr.length - 1 && (
              <span className={`text-xl font-bold ${isUrgent ? "text-rose-600" : "text-slate-600"}`}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bid Feed item ─────────────────────────────────────────────
function BidItem({ bid, isLeading }: { bid: Bid; isLeading: boolean }) {
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0,
  });
  const when = new Date(bid.created_at);
  const ago = Math.floor((Date.now() - when.getTime()) / 60000);
  const timeStr = ago < 1 ? "just now" : ago < 60 ? `${ago}m ago` : `${Math.floor(ago / 60)}h ago`;
  const initials = bid.bidder_id.slice(0, 2).toUpperCase();

  return (
    <div className={`flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 transition-all ${isLeading ? "opacity-100" : "opacity-70"}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${isLeading ? "gradient-brand text-white" : "surface-raised text-slate-400"}`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${isLeading ? "text-white" : "text-slate-400"}`}>
            {fmt.format(bid.amount)}
          </span>
          {isLeading && (
            <span className="px-1.5 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
              Leading
            </span>
          )}
        </div>
        <div className="text-xs text-slate-600">Bidder •••{bid.bidder_id.slice(-4)}</div>
      </div>
      <span className="text-xs text-slate-600 shrink-0">{timeStr}</span>
    </div>
  );
}

// ── Main LiveBidding Component ────────────────────────────────
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

  const minNext = currentBid + auction.bidIncrement;
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0,
  });

  // ── Supabase Realtime subscription ───────────────────────────
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
          if (auction.reservePrice) {
            setReserveMet(newBid.amount >= auction.reservePrice);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    [auction.id, fmt]
  );

  const quickBids = [minNext, minNext + auction.bidIncrement, minNext + auction.bidIncrement * 2];

  return (
    <div className="space-y-4">
      {/* Current bid */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current bid</div>
            <div className="text-4xl font-extrabold text-white">
              {fmt.format(currentBid)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">Bids</div>
            <div className="text-2xl font-bold text-slate-300">{bidsCount}</div>
          </div>
        </div>

        {/* Reserve status */}
        {auction.reservePrice && (
          <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${reserveMet ? "text-emerald-400" : "text-amber-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${reserveMet ? "bg-emerald-400" : "bg-amber-400"}`} />
            {reserveMet ? "Reserve price met" : "Reserve not yet met"}
          </div>
        )}

        {/* Buy now */}
        {auction.buyNowPrice && auction.status === "live" && (
          <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Buy it now</div>
              <div className="text-lg font-bold text-amber-400">{fmt.format(auction.buyNowPrice)}</div>
            </div>
            <button
              onClick={() => handleBid(auction.buyNowPrice!)}
              disabled={isPending || auction.status !== "live"}
              className="px-4 py-2 bg-amber-500 text-amber-950 text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>

      {/* Countdown */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <CountdownClock endsAt={auction.endsAt} status={auction.status} />
      </div>

      {/* Bid controls */}
      {auction.status === "live" && (
        <div className="glass rounded-2xl border border-white/10 p-5 space-y-4">
          <div>
            <div className="text-xs text-slate-500 mb-3">
              Min bid: <span className="font-semibold text-white">{fmt.format(minNext)}</span>
            </div>

            {/* Quick bid buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {quickBids.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleBid(amount)}
                  disabled={isPending}
                  className="py-2.5 text-xs font-bold surface-base border border-white/10 text-slate-300 rounded-xl hover:border-blue-500/40 hover:text-blue-300 hover:bg-blue-500/10 transition-all disabled:opacity-50"
                >
                  {fmt.format(amount)}
                </button>
              ))}
            </div>

            {/* Custom bid */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">$</span>
                <input
                  type="number"
                  min={minNext}
                  step={auction.bidIncrement}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={minNext.toLocaleString()}
                  className="w-full pl-7 pr-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => customAmount && handleBid(parseInt(customAmount))}
                disabled={isPending || !customAmount || parseInt(customAmount) < minNext}
                className="px-5 py-3 gradient-brand text-white text-sm font-bold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Bid"}
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {message && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/25 text-rose-400"
            }`}>
              {message.type === "success" ? "✓ " : "⚠ "}{message.text}
            </div>
          )}

          <p className="text-xs text-slate-600 text-center">
            By bidding you agree to our auction terms. Winning bids are binding.
          </p>
        </div>
      )}

      {/* Bid history */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Bid History</h3>
          <span className="text-xs text-slate-600">{bids.length} bids</span>
        </div>
        {bids.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-4">No bids yet. Be the first!</p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {bids.map((bid, i) => (
              <BidItem key={bid.id} bid={bid} isLeading={i === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
