import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import {
  Search,
  ChevronRight,
  Car,
  Gavel,
  Package,
  Wrench,
  Key,
  ShieldCheck,
  Star,
  MapPin,
  Gauge,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Universal Global Discovery Engine — Debford",
  description: "Search across 14,800+ verified vehicles, collector auctions, genuine OEM parts, and certified automotive specialists on Debford.",
};

const SEARCH_DATABASE = {
  vehicles: [
    {
      id: "porsche-gt3-rs",
      title: "2023 Porsche 911 GT3 RS — Clubsport Package",
      price: 248500,
      currency: "USD",
      location: "Miami, FL",
      mileage: "4,200 km",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      specs: "4.0L Flat-6 · 518 HP · PDK",
      status: "Available",
      link: "/vehicles/porsche-gt3-rs",
      badge: "Verified Dealer",
    },
    {
      id: "bmw-m4-competition",
      title: "2022 BMW M4 Competition Coupe (G82)",
      price: 78900,
      currency: "USD",
      location: "New York, NY",
      mileage: "18,400 km",
      imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
      specs: "3.0L Twin-Turbo · 503 HP · RWD",
      status: "Available",
      link: "/vehicles/bmw-m4-competition",
      badge: "Escrow Ready",
    },
    {
      id: "amg-gt-black",
      title: "2023 Mercedes-AMG GT Black Series",
      price: 325000,
      currency: "USD",
      location: "Los Angeles, CA",
      mileage: "1,800 km",
      imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
      specs: "4.0L Flat-Plane V8 · 720 HP · DCT",
      status: "Available",
      link: "/vehicles/amg-gt-black",
      badge: "Certified A+",
    },
    {
      id: "tesla-plaid",
      title: "2023 Tesla Model S Plaid (Tri-Motor)",
      price: 89500,
      currency: "USD",
      location: "San Francisco, CA",
      mileage: "12,100 km",
      imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
      specs: "Tri-Motor AWD · 1,020 HP · 0-100: 2.1s",
      status: "Available",
      link: "/vehicles/tesla-plaid",
      badge: "Electric Elite",
    },
  ],
  auctions: [
    {
      id: "a1",
      title: "2021 Aston Martin Vantage V8 Coupe",
      currentBid: 142000,
      bidsCount: 28,
      timeLeft: "3h 42m",
      imageUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80",
      link: "/auctions/a1",
    },
    {
      id: "a2",
      title: "1994 Nissan Skyline GT-R V-Spec (R32)",
      currentBid: 88500,
      bidsCount: 41,
      timeLeft: "1d 12h",
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
      link: "/auctions/a2",
    },
  ],
  parts: [
    {
      id: "part-brembo-carbon",
      title: "Brembo Carbon-Ceramic 6-Piston Brake Kit",
      price: 8450,
      brand: "Brembo Racing",
      partNumber: "BR-992-PCCB",
      link: "/parts",
      fitment: "Porsche 911 (992)",
    },
    {
      id: "part-akrapovic-exhaust",
      title: "Akrapovič Evolution Titanium Exhaust System",
      price: 6200,
      brand: "Akrapovič",
      partNumber: "AK-M4-EVO",
      link: "/parts",
      fitment: "BMW M3 / M4 (G80/G82)",
    },
  ],
  services: [
    {
      id: "spec-stuttgart",
      name: "Stuttgart Heritage Specialist Centre",
      category: "Porsche Classic & Motorsport",
      rating: 5.0,
      reviews: 142,
      location: "Miami, FL",
      link: "/services/providers",
    },
    {
      id: "spec-apex",
      name: "Apex Precision Dynamics & Dyno Lab",
      category: "ECU Calibration & Track Setup",
      rating: 4.9,
      reviews: 98,
      location: "Austin, TX",
      link: "/services/providers",
    },
  ],
};

const TELEMETRY_METRICS = [
  { label: "Global Catalog", value: "14,800+ Items", icon: Search, color: "text-blue-400" },
  { label: "Verified Sellers", value: "340+ Merchants", icon: ShieldCheck, color: "text-emerald-400" },
  { label: "Fitment Guarantee", value: "100% Verified", icon: CheckCircle2, color: "text-purple-400" },
  { label: "Escrow Protection", value: "Vault Secured", icon: Zap, color: "text-amber-400" },
];

const TRENDING_SEARCHES = [
  "Porsche 911 GT3 RS",
  "BMW M4 Competition",
  "Mercedes-AMG GT",
  "Brembo Carbon Ceramic",
  "Akrapovič Exhaust",
  "Exotic Rentals Miami",
  "Tesla Model S Plaid",
  "150-Point Mobile Inspection",
];

const FILTER_TABS = [
  { key: "all", label: "All Results", icon: Sparkles },
  { key: "vehicles", label: "Showroom Vehicles", icon: Car },
  { key: "auctions", label: "Live Auctions", icon: Gavel },
  { key: "parts", label: "OEM Parts Vault", icon: Package },
  { key: "services", label: "Specialist Care", icon: Wrench },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; type?: string }>;
}) {
  const resolved = await searchParams;
  const rawQuery = resolved?.q ?? "";
  const q = rawQuery.trim().toLowerCase();
  const activeType = resolved?.type ?? "all";
  const hasQuery = q.length > 0;

  // Search filtering
  const filteredVehicles = hasQuery
    ? SEARCH_DATABASE.vehicles.filter((v) =>
        v.title.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.specs.toLowerCase().includes(q)
      )
    : SEARCH_DATABASE.vehicles;

  const filteredAuctions = hasQuery
    ? SEARCH_DATABASE.auctions.filter((a) => a.title.toLowerCase().includes(q))
    : SEARCH_DATABASE.auctions;

  const filteredParts = hasQuery
    ? SEARCH_DATABASE.parts.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.fitment.toLowerCase().includes(q)
      )
    : SEARCH_DATABASE.parts;

  const filteredServices = hasQuery
    ? SEARCH_DATABASE.services.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
      )
    : SEARCH_DATABASE.services;

  const totalResults =
    filteredVehicles.length +
    filteredAuctions.length +
    filteredParts.length +
    filteredServices.length;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ backgroundColor: "#06090e" }}>
      <Navbar />

      {/* Sticky Search Command Bar Header */}
      <div
        className="border-b sticky top-0 z-40"
        style={{
          borderColor: "rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(8, 12, 20, 0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="container-debford py-4">
          <form method="GET" action="/search" className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                name="q"
                type="search"
                defaultValue={rawQuery}
                placeholder="Search by make, model, VIN, part number, auction, or specialist workshop..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all font-medium"
                style={{
                  backgroundColor: "rgba(13, 18, 31, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              />
              {hasQuery && (
                <Link
                  href="/search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3.5 text-white text-xs font-bold rounded-2xl shadow-xl transition-all hover:opacity-95 shrink-0 flex items-center gap-2 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 4px 16px -2px rgba(37, 99, 235, 0.4)",
              }}
            >
              <Search className="w-4 h-4" />
              <span>Search Ecosystem</span>
            </button>
          </form>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {FILTER_TABS.map((tab) => {
              const isActive = activeType === tab.key;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.key}
                  href={`/search?q=${encodeURIComponent(rawQuery)}&type=${tab.key}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "text-white shadow-md border border-blue-500/40"
                      : "text-slate-400 hover:text-white border border-white/5 bg-white/[0.02]"
                  }`}
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                      : undefined,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
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
            {TELEMETRY_METRICS.map((m, idx) => {
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

      {/* Main Workspace */}
      <div className="container-debford py-8 flex-1 max-w-6xl mx-auto w-full">
        {!hasQuery ? (
          /* Empty Search State: Discovery Landing */
          <div className="space-y-10">
            {/* Hero callout */}
            <div className="text-center max-w-xl mx-auto space-y-3 pt-6">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-3xl mx-auto shadow-inner">
                <Search className="w-7 h-7 text-blue-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Search the Debford Ecosystem
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Discover performance vehicles, participate in live digital auctions, order genuine OEM replacement parts, or book certified master technicians.
              </p>
            </div>

            {/* Trending Searches Grid */}
            <div
              className="rounded-3xl border p-6 space-y-4 max-w-3xl mx-auto"
              style={{
                backgroundColor: "rgba(13, 18, 31, 0.75)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Trending Search Queries
                </h2>
                <span className="text-[10px] text-slate-500 font-mono">1-Click Telemetry</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-blue-500/40 transition-all flex items-center gap-1.5 group"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                  >
                    <Search className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <span>{term}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 6 Quick Ecosystem Gateways */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
              {[
                { label: "Vehicles", desc: "Showroom Inventory", href: "/vehicles", icon: Car, color: "text-blue-400" },
                { label: "Auctions", desc: "Live Bidding Arena", href: "/auctions", icon: Gavel, color: "text-amber-400" },
                { label: "Rentals", desc: "Exotic Fleet", href: "/rentals", icon: Key, color: "text-emerald-400" },
                { label: "OEM Parts", desc: "Guaranteed Fitment", href: "/parts", icon: Package, color: "text-purple-400" },
                { label: "Specialists", desc: "Diagnostics & Care", href: "/services", icon: Wrench, color: "text-rose-400" },
                { label: "Benchmark", desc: "Compare Matrix", href: "/compare", icon: SlidersHorizontal, color: "text-cyan-400" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className="rounded-2xl border border-white/10 hover:border-white/20 p-4 flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02] group"
                    style={{ backgroundColor: "rgba(13, 18, 31, 0.6)" }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">{item.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">{item.desc}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Results State */
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                  Query Results
                </span>
                <h2 className="text-xl font-black text-white mt-0.5">
                  {totalResults} Match{totalResults !== 1 ? "es" : ""} found for &ldquo;{rawQuery}&rdquo;
                </h2>
              </div>

              <Link
                href="/search"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear Search
              </Link>
            </div>

            {totalResults === 0 ? (
              <div
                className="text-center py-20 rounded-3xl border max-w-md mx-auto space-y-4"
                style={{
                  backgroundColor: "rgba(13, 18, 31, 0.75)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto text-slate-500">
                  🔍
                </div>
                <h3 className="text-base font-bold text-white">No Direct Matches Found</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Try checking your spelling or searching for a broader term like &quot;Porsche&quot;, &quot;BMW&quot;, or &quot;Brakes&quot;.
                </p>
                <div className="pt-2">
                  <Link
                    href="/vehicles"
                    className="inline-block px-4 py-2 text-xs font-bold text-blue-400 hover:text-blue-300"
                  >
                    Browse Complete Showroom →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 1. Vehicles Section */}
                {(activeType === "all" || activeType === "vehicles") && filteredVehicles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Car className="w-4 h-4 text-blue-400" />
                        Showroom Vehicles ({filteredVehicles.length})
                      </h3>
                      <Link href="/vehicles" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                        View all showroom →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredVehicles.map((v) => (
                        <div
                          key={v.id}
                          className="rounded-3xl border border-white/10 hover:border-white/20 p-4 transition-all flex gap-4 group"
                          style={{ backgroundColor: "rgba(13, 18, 31, 0.75)" }}
                        >
                          <div className="relative w-36 h-28 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                            <Image src={v.imageUrl} alt={v.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[9px] font-black uppercase tracking-wider">
                              {v.badge}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] text-blue-400 font-mono font-bold block mb-0.5">
                                {v.specs}
                              </span>
                              <Link href={v.link}>
                                <h4 className="font-extrabold text-white text-xs sm:text-sm hover:text-blue-300 transition-colors truncate">
                                  {v.title}
                                </h4>
                              </Link>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                                <span>{v.mileage}</span>
                                <span>·</span>
                                <span>{v.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <span className="text-base font-black text-white font-mono">
                                {fmt(v.price)}
                              </span>
                              <Link
                                href={`/checkout?type=vehicle&id=${v.id}`}
                                className="px-3 py-1.5 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:opacity-95"
                                style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
                              >
                                Reserve
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Auctions Section */}
                {(activeType === "all" || activeType === "auctions") && filteredAuctions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-amber-400" />
                        Live Collector Auctions ({filteredAuctions.length})
                      </h3>
                      <Link href="/auctions" className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                        View live arena →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredAuctions.map((a) => (
                        <div
                          key={a.id}
                          className="rounded-3xl border border-white/10 hover:border-white/20 p-4 transition-all flex gap-4 group"
                          style={{ backgroundColor: "rgba(13, 18, 31, 0.75)" }}
                        >
                          <div className="relative w-36 h-28 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                            <Image src={a.imageUrl} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                              LIVE
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <Link href={a.link}>
                                <h4 className="font-extrabold text-white text-xs sm:text-sm hover:text-amber-300 transition-colors truncate">
                                  {a.title}
                                </h4>
                              </Link>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                                <span>{a.bidsCount} verified bids</span>
                                <span>·</span>
                                <span className="text-amber-400 font-bold">{a.timeLeft} left</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <div>
                                <span className="text-[10px] text-slate-500 block">Current High Bid</span>
                                <span className="text-base font-black text-amber-400 font-mono">
                                  {fmt(a.currentBid)}
                                </span>
                              </div>
                              <Link
                                href={a.link}
                                className="px-3 py-1.5 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all hover:opacity-95"
                                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                              >
                                Enter Bidding
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Parts Section */}
                {(activeType === "all" || activeType === "parts") && filteredParts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-400" />
                        OEM & Performance Parts ({filteredParts.length})
                      </h3>
                      <Link href="/parts" className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                        View parts catalog →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredParts.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-3xl border border-white/10 hover:border-white/20 p-4 transition-all flex items-center justify-between gap-4"
                          style={{ backgroundColor: "rgba(13, 18, 31, 0.75)" }}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {p.brand}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">#{p.partNumber}</span>
                            </div>
                            <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                              {p.title}
                            </h4>
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                              <CheckCircle2 className="w-3 h-3" /> Fitment: {p.fitment}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-base font-black text-white font-mono mb-1">
                              {fmt(p.price)}
                            </div>
                            <Link
                              href="/cart"
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold inline-block"
                            >
                              Add to Cart
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Specialist Care Section */}
                {(activeType === "all" || activeType === "services") && filteredServices.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-rose-400" />
                        Verified Automotive Specialists ({filteredServices.length})
                      </h3>
                      <Link href="/services/providers" className="text-xs text-rose-400 hover:text-rose-300 font-medium">
                        View directory →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredServices.map((s) => (
                        <div
                          key={s.id}
                          className="rounded-3xl border border-white/10 hover:border-white/20 p-4 transition-all flex items-center justify-between gap-4"
                          style={{ backgroundColor: "rgba(13, 18, 31, 0.75)" }}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mb-1">
                              <span>★</span>
                              <strong className="text-white">{s.rating}</strong>
                              <span className="text-slate-500">({s.reviews} reviews)</span>
                            </div>
                            <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                              {s.name}
                            </h4>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {s.category} · {s.location}
                            </span>
                          </div>

                          <Link
                            href={s.link}
                            className="px-3.5 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:opacity-95 shrink-0"
                            style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
                          >
                            Book Bay
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
