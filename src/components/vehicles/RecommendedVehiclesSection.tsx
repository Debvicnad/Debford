"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Scale, CheckCircle2, Zap, TrendingDown } from "lucide-react";
import type { RecommendationMatch } from "@/lib/actions/recommendation.actions";

interface Props {
  matches: RecommendationMatch[];
  title?: string;
  subtitle?: string;
}

export function RecommendedVehiclesSection({
  matches,
  title = "AI Recommends: Similar Vehicles & Segment Rivals",
  subtitle = "Dynamic multi-vector matching based on powertrain, price band, and verified inspection tier.",
}: Props) {
  const [filter, setFilter] = useState<string>("all");

  if (!matches || matches.length === 0) return null;

  const filtered = matches.filter((m) => {
    if (filter === "all") return true;
    return m.category === filter;
  });

  const displayList = filtered.length > 0 ? filtered : matches;

  return (
    <section className="mt-16 pt-12 border-t border-white/8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Debford AI Recommendation Engine</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          {[
            { id: "all", label: "All Matches" },
            { id: "direct_alternative", label: "Direct Peers" },
            { id: "value_pick", label: "Value Picks" },
            { id: "performance_rival", label: "Performance Rivals" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filter === cat.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/5 hover:border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Recommended Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayList.map(({ listing, score, reasons, category }) => {
          const v = listing.vehicle || {};
          const img =
            v.images?.find((i: any) => i.is_primary)?.url ||
            v.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80";

          const categoryBadge =
            category === "value_pick"
              ? { text: "Value Pick", bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" }
              : category === "performance_rival"
              ? { text: "Performance Rival", bg: "bg-purple-500/10 border-purple-500/20 text-purple-400" }
              : { text: "Segment Match", bg: "bg-blue-500/10 border-blue-500/20 text-blue-400" };

          const fmt = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: listing.currency ?? "USD",
            minimumFractionDigits: 0,
          });

          return (
            <div
              key={listing.id}
              className="group bg-[#080d16]/90 rounded-2xl border border-white/8 hover:border-blue-500/30 transition-all flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div>
                {/* Image & Match Overlay */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d16] via-transparent to-transparent opacity-80" />

                  {/* AI Match Score Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold text-white flex items-center gap-1.5 shadow-lg">
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{score}% Match</span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md ${categoryBadge.bg}`}>
                      {categoryBadge.text}
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="text-sm font-black font-mono text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-md border border-white/10">
                      {fmt.format(listing.price)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded backdrop-blur-md">
                      {v.year} {v.fuel_type || "Gasoline"}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <Link href={`/vehicles/${listing.slug || listing.id}`}>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {listing.title}
                    </h4>
                  </Link>

                  {/* Match Reason Bullets */}
                  <div className="space-y-1">
                    {reasons.slice(0, 2).map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-4 pb-4 pt-1 flex items-center gap-2 border-t border-white/5">
                <Link
                  href={`/vehicles/${listing.slug || listing.id}`}
                  className="flex-1 py-2 text-center rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-semibold transition-all border border-blue-500/20 hover:border-blue-500"
                >
                  View Spec
                </Link>
                <Link
                  href={`/compare?id=${listing.id}`}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/8 transition-colors"
                  title="Compare with current vehicle"
                >
                  <Scale className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
