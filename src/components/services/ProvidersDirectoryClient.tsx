"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ServiceProviderItem, ServicePackageItem } from "@/types/service.types";
import { DirectBookingModal } from "@/components/services/DirectBookingModal";
import {
  Search,
  X,
  MapPin,
  Star,
  Truck,
  Wrench,
  ShieldCheck,
  Clock,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Gauge,
  Cpu,
  Paintbrush,
  Car,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

interface ProvidersDirectoryClientProps {
  providers: ServiceProviderItem[];
  initialCategory?: string;
}

const CATEGORIES = [
  { id: "all", label: "All Specialists", icon: Car },
  { id: "mechanic", label: "Mechanic & Engine", icon: Wrench },
  { id: "diagnostic", label: "Diagnostics & Telemetry", icon: Cpu },
  { id: "bodywork", label: "Body & Coachwork", icon: Paintbrush },
  { id: "detailing", label: "Detailing & PPF", icon: Sparkles },
  { id: "performance", label: "Dyno & ECU Tuning", icon: Gauge },
];

export function ProvidersDirectoryClient({
  providers,
  initialCategory,
}: ProvidersDirectoryClientProps) {
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
      {/* ── SEARCH & FILTER CONSOLE ─────────────────── */}
      <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search input */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specialists by name, brand specialty (e.g. Porsche, Ceramic, AMG)..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#070b12] border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* City select */}
          <div className="relative md:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#070b12] border border-white/10 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500/70 appearance-none cursor-pointer"
            >
              <option value="all">📍 All Locations / Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  📍 {c}
                </option>
              ))}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-xs">
              ▼
            </span>
          </div>

          {/* Rating filter */}
          <div className="relative md:col-span-3">
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#070b12] border border-white/10 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500/70 appearance-none cursor-pointer"
            >
              <option value="0">★ Any Specialist Rating</option>
              <option value="4.5">★ 4.5 &amp; up (High Rating)</option>
              <option value="4.8">★ 4.8 &amp; up (Master Tier)</option>
              <option value="4.9">★ 4.9 &amp; up (Elite Guild)</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-xs">
              ▼
            </span>
          </div>
        </div>

        {/* Secondary Filter Row: Categories + Mobile Checkbox */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/6">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30"
                      : "bg-[#070b12] border border-white/8 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile service checkbox toggle */}
          <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#070b12] border border-white/8 hover:border-white/20 cursor-pointer select-none shrink-0 transition-all">
            <input
              type="checkbox"
              checked={mobileOnly}
              onChange={(e) => setMobileOnly(e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-purple-600 focus:ring-0 focus:ring-offset-0"
            />
            <Truck className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-semibold text-slate-300">Mobile Van Units Only</span>
          </label>
        </div>
      </div>

      {/* ── RESULTS HEADER BAR ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>Active Specialists:</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
            {filteredProviders.length} Verified
          </span>
        </div>
        <Link
          href="/services#request"
          className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 group"
        >
          <span>Need a tailored diagnostic or custom quote? Broadcast a request</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* ── SPECIALISTS GRID ───────────────────────── */}
      {filteredProviders.length === 0 ? (
        <div className="text-center py-20 bg-[#0d1322]/60 backdrop-blur-xl rounded-2xl border border-white/8 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Specialists Match Your Criteria</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            We couldn&apos;t find any service centers matching your active filters. Try clearing your
            search query or broadening your location settings.
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] border border-white/12 text-white font-bold text-xs rounded-xl hover:bg-white/[0.1] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProviders.map((p) => (
            <div
              key={p.id}
              className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-6 flex flex-col justify-between hover:border-white/16 hover:shadow-2xl hover:shadow-blue-950/20 transition-all duration-300 space-y-5 group"
            >
              {/* Top: Specialist Profile Header */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3.5">
                    {/* Specialist Avatar / Initials */}
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
                      <div className="w-full h-full bg-[#080d16] rounded-[14px] flex items-center justify-center text-white font-extrabold text-sm tracking-wider">
                        {p.initials}
                      </div>
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
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Verified Specialist</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mt-0.5">{p.type}</p>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{p.location}</span>
                        </span>
                        {p.isMobileService && (
                          <span className="flex items-center gap-1 text-purple-400 font-medium">
                            <Truck className="w-3 h-3 text-purple-400" />
                            <span>Mobile Unit Available</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating & Jobs Telemetry */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end text-amber-400 text-sm font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{p.rating}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {p.reviews} verified reviews
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      {p.completedJobs} jobs fulfilled
                    </span>
                  </div>
                </div>

                {p.tagline && (
                  <p className="text-xs text-slate-400 italic mb-4 leading-relaxed border-l-2 border-blue-500/30 pl-3">
                    &ldquo;{p.tagline}&rdquo;
                  </p>
                )}

                {/* Specialties Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#070b12] border border-white/6 text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Featured Service Packages Matrix */}
                <div className="space-y-2 border-t border-white/6 pt-3.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Popular Service Packages</span>
                    <span className="text-slate-500 font-mono text-[10px]">Zero Upfront</span>
                  </div>

                  <div className="space-y-1.5">
                    {p.services.slice(0, 3).map((svc) => (
                      <div
                        key={svc.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#070b12] border border-white/6 hover:border-white/12 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-slate-200 block truncate">
                            {svc.name}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>~{svc.duration}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {fmt(svc.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setBookingTarget({ provider: p, service: svc })}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg shadow-sm transition-colors"
                          >
                            Book →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions Footer */}
              <div className="pt-3.5 border-t border-white/8 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    Responds in <strong className="text-slate-200">{p.responseTime}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/messages?provider=${p.id}`}
                    className="px-3 py-1.5 bg-white/[0.04] border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all inline-flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>Chat</span>
                  </Link>
                  <Link
                    href={`/services/${p.id}`}
                    className="px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/25 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-xl transition-all inline-flex items-center gap-1.5"
                  >
                    <span>Full Showroom</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DIRECT BOOKING MODAL ───────────────────── */}
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
