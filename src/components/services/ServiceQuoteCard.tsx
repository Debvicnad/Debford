"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { acceptServiceQuote, declineServiceQuote } from "@/lib/actions/service.actions";
import type { ServiceQuoteItem } from "@/types/service.types";

interface ServiceQuoteCardProps {
  quote: ServiceQuoteItem;
  requestId: string;
  isAccepted?: boolean;
  onAccepted?: (bookingId: string) => void;
  onDeclined?: () => void;
}

export function ServiceQuoteCard({
  quote,
  requestId,
  isAccepted,
  onAccepted,
  onDeclined,
}: ServiceQuoteCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: quote.currency || "USD",
      minimumFractionDigits: 0,
    }).format(n);

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const res = await acceptServiceQuote(quote.id, requestId);
      if (res.error) {
        setError(res.error);
      } else if (res.bookingId && onAccepted) {
        onAccepted(res.bookingId);
      }
    });
  }

  function handleDecline() {
    setError(null);
    startTransition(async () => {
      const res = await declineServiceQuote(quote.id, requestId);
      if (res.error) {
        setError(res.error);
      } else if (onDeclined) {
        onDeclined();
      }
    });
  }

  const isPendingQuote = quote.status === "pending" && !isAccepted;

  return (
    <div
      className={`glass rounded-2xl border p-5 transition-all ${
        isAccepted || quote.status === "accepted"
          ? "border-emerald-500/40 bg-emerald-500/5 shadow-xl shadow-emerald-500/5"
          : quote.status === "rejected"
          ? "border-white/5 opacity-50 bg-white/2"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* Header: Provider profile & Total Quote Price */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center text-white text-base font-bold shrink-0 shadow-md shadow-blue-500/20">
            {quote.provider.initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/services/${quote.provider.id}`}
                className="text-base font-bold text-white hover:text-blue-400 transition-colors"
              >
                {quote.provider.name}
              </Link>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                <span>★</span>
                <span>{quote.provider.rating}</span>
                <span className="text-slate-500">({quote.provider.reviews})</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {quote.provider.type} · 📍 {quote.provider.location}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-2xl font-extrabold text-emerald-400">{fmt(quote.price)}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1 sm:justify-end mt-0.5">
            <span>⏱ Turnaround:</span>
            <span className="text-slate-200 font-semibold">
              {quote.estimatedDays} {quote.estimatedDays === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      </div>

      {/* Quote description / proposal */}
      <div className="py-4 space-y-3">
        <p className="text-sm text-slate-300 leading-relaxed">{quote.description}</p>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 surface-base rounded-xl border border-white/5 text-xs">
          {quote.laborCost !== undefined && (
            <div>
              <span className="text-slate-500 block">Labor & Diagnostic:</span>
              <span className="text-slate-200 font-semibold">{fmt(quote.laborCost)}</span>
            </div>
          )}
          {quote.partsCost !== undefined && (
            <div>
              <span className="text-slate-500 block">Parts & Consumables:</span>
              <span className="text-slate-200 font-semibold">{fmt(quote.partsCost)}</span>
            </div>
          )}
          <div>
            <span className="text-slate-500 block">Quote Status:</span>
            <span
              className={`font-semibold capitalize ${
                isAccepted || quote.status === "accepted"
                  ? "text-emerald-400"
                  : quote.status === "rejected"
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              {isAccepted ? "Accepted ✓" : quote.status}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 bg-rose-500/15 border border-rose-500/25 rounded-lg text-xs text-rose-300">
          ⚠️ {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/8">
        <div className="flex items-center gap-2">
          <Link
            href={`/messages?provider=${quote.provider.id}`}
            className="px-3.5 py-2 glass border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>💬</span>
            <span>Ask Provider</span>
          </Link>
          <Link
            href={`/services/${quote.provider.id}`}
            className="px-3.5 py-2 glass border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            View Shop Profile
          </Link>
        </div>

        {isPendingQuote && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecline}
              disabled={isPending}
              className="px-4 py-2 border border-white/10 text-xs font-medium text-slate-400 hover:text-rose-400 hover:border-rose-500/30 rounded-xl transition-colors disabled:opacity-50"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={isPending}
              className="px-5 py-2 gradient-brand text-xs font-bold text-white rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Accepting...</span>
                </>
              ) : (
                <>
                  <span>Accept Quote & Book</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        )}

        {(isAccepted || quote.status === "accepted") && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
            <span>✓ Quote Accepted</span>
            <span className="text-slate-400 font-normal">· Booking Confirmed</span>
          </div>
        )}
      </div>
    </div>
  );
}
