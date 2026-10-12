import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import {
  Heart,
  ChevronRight,
  TrendingDown,
  Car,
  MapPin,
  Gauge,
  Trash2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Search,
  Sliders,
  Scale,
  Bell,
  Clock,
} from "lucide-react";
import { getSavedSearches } from "@/lib/actions/savedsearch.actions";
import { SavedSearchesClient } from "@/components/saved/SavedSearchesClient";

export const metadata: Metadata = {
  title: "Saved Vehicles & Watchlist Vault — Debford",
  description: "Monitor saved luxury vehicles, track automated price drop alerts, and run saved search agents on Debford.",
};

const SAVED_VEHICLES = [
  {
    id: "v-porsche-gt3",
    title: "2023 Porsche 911 GT3 RS — Clubsport Package",
    price: 248500,
    location: "Miami, FL",
    mileage: "4,200 km",
    savedAt: "Yesterday",
    status: "available",
    priceChange: null,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    engine: "4.0L Flat-6 (518 HP)",
    transmission: "7-Speed PDK",
  },
  {
    id: "v-bmw-530i",
    title: "2022 BMW 5 Series 530i M Sport",
    price: 58000,
    location: "Los Angeles, CA",
    mileage: "28,000 km",
    savedAt: "4 days ago",
    status: "available",
    priceChange: -3000,
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    engine: "2.0L TwinPower Turbo",
    transmission: "8-Speed Steptronic",
  },
  {
    id: "v-mazda-6",
    title: "2022 Mazda 6 Grand Touring Signature",
    price: 31000,
    location: "Chicago, IL",
    mileage: "24,000 km",
    savedAt: "1 week ago",
    status: "available",
    priceChange: -3000,
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    engine: "2.5L Turbo Skyactiv-G",
    transmission: "Automatic",
  },
  {
    id: "v-mustang-gt",
    title: "2021 Ford Mustang GT Premium (Manual)",
    price: 44000,
    location: "Austin, TX",
    mileage: "18,000 km",
    savedAt: "2 weeks ago",
    status: "sold",
    priceChange: null,
    imageUrl: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80",
    engine: "5.0L Coyote V8",
    transmission: "6-Speed Manual",
  },
];

const SAVED_SEARCHES_DEMO = [
  {
    id: "ss1",
    name: "Porsche 911 GT3 & GT3 RS",
    filters: [
      { label: "Make", value: "Porsche" },
      { label: "Model", value: "911 GT3" },
      { label: "Year", value: "2020+" },
    ],
    results: 12,
    savedAt: "2 days ago",
    alertsEnabled: true,
  },
  {
    id: "ss2",
    name: "Executive Sedans under $65k",
    filters: [
      { label: "Category", value: "Executive" },
      { label: "Max Price", value: "$65,000" },
      { label: "Fuel", value: "Hybrid / Petrol" },
    ],
    results: 28,
    savedAt: "1 week ago",
    alertsEnabled: true,
  },
  {
    id: "ss3",
    name: "Exotic Rentals with Doorstep Delivery",
    filters: [
      { label: "Type", value: "Rental Fleet" },
      { label: "Delivery", value: "Doorstep Dispatch" },
      { label: "City", value: "Miami, FL" },
    ],
    results: 16,
    savedAt: "2 weeks ago",
    alertsEnabled: false,
  },
];

const TELEMETRY_CARDS = [
  { label: "Saved Machines", value: "4 Vehicles", icon: Car, color: "text-blue-400" },
  { label: "Price Drop Delta", value: "-$6,000", icon: TrendingDown, color: "text-emerald-400" },
  { label: "Active Search Agents", value: "3 Monitors", icon: Search, color: "text-purple-400" },
  { label: "Escrow Protection", value: "100% Eligible", icon: ShieldCheck, color: "text-amber-400" },
];

export default async function SavedPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolved = await searchParams;
  const activeTab = resolved?.tab ?? "vehicles";

  // Load real saved searches from DB (falls back to empty array)
  const savedSearches = await getSavedSearches();
  // Use demo searches if no DB searches yet
  const searchesForDisplay =
    savedSearches.length > 0
      ? savedSearches
      : SAVED_SEARCHES_DEMO.map((ss) => ({
          id: ss.id,
          name: ss.name,
          filters: Object.fromEntries(ss.filters.map((f) => [f.label, f.value])),
          alertsEnabled: ss.alertsEnabled,
          createdAt: ss.savedAt,
        }));

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ backgroundColor: "#06090e" }}>
      <Navbar />

      {/* Top Breadcrumb Scrim */}
      <div
        className="border-b relative"
        style={{
          borderColor: "rgba(255, 255, 255, 0.06)",
          backgroundColor: "#080c14",
        }}
      >
        <div className="container-debford py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-300 font-medium">Saved Items & Watchlist</span>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {SAVED_VEHICLES.length} Vehicles Tracked
          </span>
        </div>
      </div>

      {/* Telemetry Status Ribbon */}
      <div
        className="border-b"
        style={{
          borderColor: "rgba(255, 255, 255, 0.05)",
          backgroundColor: "rgba(8, 12, 20, 0.6)",
        }}
      >
        <div className="container-debford py-3.5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TELEMETRY_CARDS.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">{m.value}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{m.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="container-debford py-8 flex-1 max-w-5xl mx-auto w-full">
        {/* Header Title */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
              <Heart className="w-3.5 h-3.5" />
              <span>Personal Watchlist & Price Drop Radar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Saved Vehicles & Search Agents
            </h1>
          </div>

          <Link
            href="/vehicles"
            className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Discover More Vehicles</span>
          </Link>
        </div>

        {/* 2 Tabs Navigator */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: "vehicles", label: `Saved Vehicles (${SAVED_VEHICLES.length})` },
            { key: "searches", label: `Search Agents & Alerts (${searchesForDisplay.length})` },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/saved?tab=${tab.key}`}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "text-white shadow-lg border border-blue-500/40"
                    : "text-slate-400 hover:text-white border border-white/5 bg-white/[0.02]"
                }`}
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                    : undefined,
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* ── Tab 1: Saved Vehicles ─────────────────────────────── */}
        {activeTab === "vehicles" && (
          <div className="space-y-4">
            {SAVED_VEHICLES.map((v) => (
              <div
                key={v.id}
                className={`rounded-3xl border p-5 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 group ${
                  v.status === "sold"
                    ? "bg-[#080c14]/60 border-white/5 opacity-60"
                    : "bg-[#080c14]/85 border-white/10 hover:border-white/20 shadow-xl"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 w-full lg:w-auto">
                  {/* Photo Stage */}
                  <div className="relative w-full sm:w-44 h-28 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                    <Image
                      src={v.imageUrl}
                      alt={v.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {v.priceChange && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500/90 backdrop-blur-md text-[10px] font-black text-white flex items-center gap-1 shadow-lg">
                        <TrendingDown className="w-3 h-3" />
                        <span>{fmt(Math.abs(v.priceChange))} Drop</span>
                      </div>
                    )}
                    {v.status === "sold" && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-xs font-black uppercase text-slate-300 tracking-wider">
                        Listing Concluded
                      </div>
                    )}
                  </div>

                  {/* Vehicle Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                        Verified Spec
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[10px] text-slate-500 font-mono">Saved {v.savedAt}</span>
                    </div>

                    <Link href={`/vehicles/${v.id}`}>
                      <h3 className="text-base font-extrabold text-white hover:text-blue-400 transition-colors truncate max-w-lg">
                        {v.title}
                      </h3>
                    </Link>

                    {/* Chips */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Gauge className="w-3.5 h-3.5 text-blue-400" />
                        <span>{v.mileage}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{v.location}</span>
                      </span>
                      <span>·</span>
                      <span className="text-[11px] text-slate-300 font-medium">
                        {v.engine}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-5 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  <div className="text-left lg:text-right">
                    <div className="text-xl font-black text-white font-mono">
                      {fmt(v.price)}
                    </div>
                    {v.priceChange && (
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                        Was {fmt(v.price - v.priceChange)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/checkout?type=vehicle&id=${v.id}`}
                      className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        boxShadow: "0 4px 12px -2px rgba(37, 99, 235, 0.4)",
                      }}
                    >
                      <span>Reserve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/compare?id=${v.id}`}
                      className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Compare with another vehicle"
                    >
                      <Scale className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove from saved watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab 2: Saved Searches ───────────────────────────────── */}
        {activeTab === "searches" && (
          <SavedSearchesClient initialSearches={searchesForDisplay} />
        )}
      </div>
    </div>
  );
}

