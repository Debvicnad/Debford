"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ServiceProviderItem, ServicePackageItem } from "@/types/service.types";
import { DirectBookingModal } from "@/components/services/DirectBookingModal";

interface ProvidersDirectoryClientProps {
  providers: ServiceProviderItem[];
  initialCategory?: string;
}

const CATEGORIES = [
  { id: "all", label: "All Specialists", icon: "🚗" },
  { id: "mechanic", label: "Mechanic & Engine", icon: "🔧" },
  { id: "diagnostic", label: "Diagnostics & Scan", icon: "🔬" },
  { id: "bodywork", label: "Body & Paint", icon: "🎨" },
  { id: "detailing", label: "Detailing & PPF", icon: "✨" },
  { id: "performance", label: "Dyno & Tuning", icon: "🏎️" },
];

export function ProvidersDirectoryClient({ providers, initialCategory }: ProvidersDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [mobileOnly, setMobileOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Direct Booking Modal state
  const [bookingTarget, setBookingTarget] = useState<{
    provider: ServiceProviderItem;
    service: ServicePackageItem;
  } | null>(null);

  // Extract unique cities
  const cities = useMemo(() => {
    const set = new Set<string>();
    providers.forEach((p) => {
      const city = p.location.split(",")[0].trim();
      if (city) set.add(city);
    });
    return Array.from(set);
  }, [providers]);

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesType = p.type.toLowerCase().includes(q);
        const matchesLocation = p.location.toLowerCase().includes(q);
        const matchesSpecialties = p.specialties.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesType && !matchesLocation && !matchesSpecialties) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== "all") {
        const hasMatchingService = p.services.some(
          (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
        const hasMatchingSpecialty = p.specialties.some((s) =>
          s.toLowerCase().includes(selectedCategory.toLowerCase())
        );
        const hasMatchingType = p.type.toLowerCase().includes(selectedCategory.toLowerCase());
        if (!hasMatchingService && !hasMatchingSpecialty && !hasMatchingType) {
          return false;
        }
      }

      // City
      if (selectedCity !== "all") {
        if (!p.location.toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // Mobile only
      if (mobileOnly && !p.isMobileService) {
        return false;
      }

      // Min rating
      if (minRating > 0 && p.rating < minRating) {
        return false;
      }

      return true;
    });
  }, [providers, searchQuery, selectedCategory, selectedCity, mobileOnly, minRating]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="glass rounded-2xl border border-white/10 p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search providers by name, brand specialty (e.g. BMW, Ceramic, Transmission)..."
              className="w-full pl-10 pr-4 py-2.5 surface-base border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* City select */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3.5 py-2.5 surface-base border border-white/10 rounded-xl text-white text-xs bg-slate-900 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Locations</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                📍 {c}
              </option>
            ))}
          </select>

          {/* Rating filter */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="px-3.5 py-2.5 surface-base border border-white/10 rounded-xl text-white text-xs bg-slate-900 focus:outline-none focus:border-blue-500"
          >
            <option value="0">Any Rating</option>
            <option value="4.5">★ 4.5 & up</option>
            <option value="4.8">★ 4.8 & up</option>
            <option value="4.9">★ 4.9 & up</option>
          </select>

          {/* Mobile service checkbox */}
          <label className="flex items-center gap-2 px-3.5 py-2.5 surface-base border border-white/10 rounded-xl cursor-pointer hover:border-white/20 select-none">
            <input
              type="checkbox"
              checked={mobileOnly}
              onChange={(e) => setMobileOnly(e.target.checked)}
              className="rounded border-white/20 text-blue-600 focus:ring-0"
            />
            <span className="text-xs font-semibold text-slate-300">🚐 Mobile Van</span>
          </label>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "gradient-brand text-white shadow-md shadow-blue-500/20"
                  : "surface-base border border-white/10 text-slate-400 hover:text-white hover:border-white/20"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <strong className="text-white">{filteredProviders.length}</strong> verified specialists
        </div>
        <Link
          href="/services#request"
          className="text-blue-400 hover:text-blue-300 font-semibold"
        >
          Can&apos;t find a specific provider? Post a custom request →
        </Link>
      </div>

      {/* Providers Grid */}
      {filteredProviders.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border border-white/10 p-8 space-y-3">
          <span className="text-4xl block">🔍</span>
          <h3 className="text-base font-bold text-white">No Specialists Match Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your search query or selecting &quot;All Locations&quot; to see available service centers.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedCity("all");
              setMobileOnly(false);
              setMinRating(0);
            }}
            className="px-4 py-2 surface-base border border-white/15 text-white font-bold text-xs rounded-xl hover:bg-white/5"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProviders.map((p) => (
            <div
              key={p.id}
              className="glass rounded-2xl border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 hover:shadow-xl hover:shadow-black/20 transition-all space-y-5"
            >
              {/* Top: Provider Overview */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20 shrink-0">
                      {p.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/services/${p.id}`}
                          className="text-base font-bold text-white hover:text-blue-400 transition-colors"
                        >
                          {p.name}
                        </Link>
                        {p.verified && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                            ✓ Verified Pro
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{p.type}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>📍 {p.location}</span>
                        {p.isMobileService && (
                          <span className="text-purple-400 font-semibold">🚐 Mobile Service</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end text-amber-400 text-sm font-bold">
                      <span>★</span>
                      <span>{p.rating}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{p.reviews} verified reviews</span>
                    <span className="text-[10px] text-slate-600 block mt-0.5">
                      {p.completedJobs} jobs completed
                    </span>
                  </div>
                </div>

                {p.tagline && (
                  <p className="text-xs text-slate-400 italic mb-4 leading-relaxed">
                    &ldquo;{p.tagline}&rdquo;
                  </p>
                )}

                {/* Specialties tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2.5 py-0.5 rounded-full surface-base border border-white/5 text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Popular Services Quick Menu */}
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Featured Services:
                  </span>
                  <div className="space-y-1.5">
                    {p.services.slice(0, 3).map((svc) => (
                      <div
                        key={svc.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-xl surface-base border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-slate-200 block truncate">
                            {svc.name}
                          </span>
                          <span className="text-[10px] text-slate-500">⏱ ~{svc.duration}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-bold text-emerald-400">{fmt(svc.price)}</span>
                          <button
                            type="button"
                            onClick={() => setBookingTarget({ provider: p, service: svc })}
                            className="px-2.5 py-1 gradient-brand text-white text-[11px] font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                          >
                            Book →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Responds in <strong className="text-slate-300">{p.responseTime}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/messages?provider=${p.id}`}
                    className="px-3 py-1.5 glass border border-white/10 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-colors"
                  >
                    💬 Chat
                  </Link>
                  <Link
                    href={`/services/${p.id}`}
                    className="px-4 py-1.5 surface-base border border-white/15 text-xs font-bold text-blue-400 hover:text-blue-300 rounded-xl transition-colors"
                  >
                    View Full Profile & Menu →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Booking Modal */}
      {bookingTarget && (
        <DirectBookingModal
          provider={bookingTarget.provider}
          service={bookingTarget.service}
          isOpen={!!bookingTarget}
          onClose={() => setBookingTarget(null)}
        />
      )}
    </div>
  );
}
