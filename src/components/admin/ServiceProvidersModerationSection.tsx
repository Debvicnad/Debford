"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, ShieldAlert, Wrench, Phone, Mail, Star, MapPin, Check, X, Badge } from "lucide-react";
import type { ServiceProviderModerationItem } from "@/types/admin.types";
import { reviewServiceProvider } from "@/lib/actions/admin.actions";

interface Props {
  initialProviders: ServiceProviderModerationItem[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-white">{rating.toFixed(1)}</span>
    </span>
  );
}

export function ServiceProvidersModerationSection({ initialProviders }: Props) {
  const [providers, setProviders] = useState<ServiceProviderModerationItem[]>(initialProviders);
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending" | "rejected">("all");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filtered = providers.filter(
    (p) => filterStatus === "all" || p.verificationStatus === filterStatus
  );

  const pendingCount = providers.filter((p) => p.verificationStatus === "pending").length;
  const verifiedCount = providers.filter((p) => p.verificationStatus === "verified").length;

  function handleToggleBadge(provider: ServiceProviderModerationItem) {
    const isVerified = provider.verificationStatus === "verified";
    const action = isVerified ? "reject" : "approve";
    setActiveId(provider.id);

    startTransition(async () => {
      const res = await reviewServiceProvider(provider.id, action);
      if (res?.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setProviders((prev) =>
          prev.map((p) =>
            p.id === provider.id
              ? { ...p, verificationStatus: isVerified ? "rejected" : "verified" }
              : p
          )
        );
        setMessage({
          text: isVerified
            ? `Verified badge revoked from "${provider.name}".`
            : `"${provider.name}" is now a Verified Workshop!`,
          type: "success",
        });
      }
      setActiveId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Providers", count: providers.length, icon: "🔧", color: "blue" },
          { label: "Verified", count: verifiedCount, icon: "✓", color: "emerald" },
          { label: "Pending Review", count: pendingCount, icon: "⏳", color: "amber" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`p-3.5 glass rounded-2xl border border-${stat.color}-500/20 text-center`}
          >
            <div className={`text-xl font-extrabold text-${stat.color}-400`}>{stat.count}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "verified", "pending", "rejected"] as const).map((s) => {
          const count =
            s === "all" ? providers.length : providers.filter((p) => p.verificationStatus === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-all ${
                filterStatus === s
                  ? "gradient-brand text-white shadow"
                  : "glass text-slate-400 border border-white/10 hover:text-white"
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
          }`}
        >
          <span>{message.text}</span>
        </div>
      )}

      {/* Provider Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 glass rounded-2xl border border-white/5">
            <p className="text-sm font-semibold text-slate-300">No providers in this category.</p>
          </div>
        ) : (
          filtered.map((provider) => {
            const isVerified = provider.verificationStatus === "verified";
            const isPendingReview = provider.verificationStatus === "pending";
            const isActing = activeId === provider.id && isPending;

            return (
              <div
                key={provider.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isVerified
                    ? "border-emerald-500/20 bg-[#0d121d]"
                    : isPendingReview
                    ? "border-amber-500/20 bg-[#0d121d]"
                    : "border-white/5 bg-[#0d121d]"
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center font-black text-lg ${
                        isVerified
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {provider.name.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-bold text-white truncate">{provider.name}</span>
                        {isVerified && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" /> Verified Workshop
                          </span>
                        )}
                        {isPendingReview && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                            ⏳ Pending Review
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 truncate">{provider.category}</p>

                      <div className="flex items-center gap-3 mt-1 flex-wrap text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {provider.city}
                        </span>
                        {provider.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {provider.phone}
                          </span>
                        )}
                        {provider.isMobileService && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-md font-medium">
                            📍 Mobile Service
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5">
                        <StarRating rating={provider.rating} />
                        <span className="text-[10px] text-slate-500 ml-1">
                          ({provider.reviewsCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badge Toggle Action */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleToggleBadge(provider)}
                      disabled={isActing}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer ${
                        isVerified
                          ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10 bg-transparent"
                          : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                      }`}
                    >
                      {isVerified ? (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{isActing ? "Revoking..." : "Revoke Badge"}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{isActing ? "Verifying..." : "Grant Verified Badge"}</span>
                        </>
                      )}
                    </button>

                    <span className="text-[10px] text-slate-500">
                      Member since {provider.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
