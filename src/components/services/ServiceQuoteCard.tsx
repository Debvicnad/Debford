"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { acceptServiceQuote, declineServiceQuote } from "@/lib/actions/service.actions";
import type { ServiceQuoteItem } from "@/types/service.types";
import {
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowRight,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";

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
      maximumFractionDigits: 0,
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
      className={`rounded-3xl border p-6 transition-all duration-300 shadow-xl ${
        isAccepted || quote.status === "accepted"
          ? "border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-900/80 to-slate-950 shadow-emerald-950/20"
          : quote.status === "rejected"
          ? "border-white/5 opacity-50 bg-slate-950/40"
          : "border-white/8 bg-slate-900/70 hover:border-blue-500/30 hover:shadow-2xl"
      }`}
    >
      {/* Header: Provider Profile & Pricing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-white/8">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl gradient-brand flex items-center justify-center text-white text-base font-extrabold shrink-0 shadow-lg shadow-blue-600/30">
            {quote.provider.initials}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Link
                href={`/services/${quote.provider.id}`}
                className="text-base font-bold text-white hover:text-blue-300 transition-colors"
              >
                {quote.provider.name}
              </Link>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{quote.provider.rating}</span>
                <span className="text-slate-500 font-normal">({quote.provider.reviews})</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-light flex-wrap">
              <span>{quote.provider.type}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{quote.provider.location}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">
            {fmt(quote.price)}
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 sm:justify-end mt-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Turnaround:</span>
            <span className="text-slate-200 font-bold">
              {quote.estimatedDays} {quote.estimatedDays === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      </div>

      {/* Quote Description / Proposal */}
      <div className="py-5 space-y-4">
        <p className="text-sm text-slate-300 leading-relaxed font-light">
          {quote.description}
        </p>

        {/* Telemetry Cost Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-950/80 rounded-2xl border border-white/5 text-xs">
          {quote.laborCost !== undefined && (
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                Labor &amp; Inspection
              </span>
              <span className="text-sm font-bold font-mono text-slate-200">
                {fmt(quote.laborCost)}
              </span>
            </div>
          )}

          {quote.partsCost !== undefined && (
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                Parts &amp; Consumables
              </span>
              <span className="text-sm font-bold font-mono text-slate-200">
                {fmt(quote.partsCost)}
              </span>
            </div>
          )}

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
              Bid Protocol
            </span>
            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isAccepted || quote.status === "accepted"
                  ? "text-emerald-400"
                  : quote.status === "rejected"
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              {isAccepted ? "ACCEPTED ✓" : quote.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/8">
        <div className="flex items-center gap-2">
          <Link
            href={`/messages?provider=${quote.provider.id}`}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/8 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>Ask Provider</span>
          </Link>

          <Link
            href={`/services/${quote.provider.id}`}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/8 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>Shop Profile</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {isPendingQuote && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDecline}
              disabled={isPending}
              className="px-4 py-2.5 border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-rose-300 rounded-xl transition-all disabled:opacity-40"
            >
              Decline
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={isPending}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <span>Accept Quote &amp; Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {(isAccepted || quote.status === "accepted") && (
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>QUOTE AUTHORIZED · BOOKING CONFIRMED</span>
          </div>
        )}
      </div>
    </div>
  );
}
