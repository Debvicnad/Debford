import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getSaleListings,
  isSupabaseConfigured,
  type ListingFilters,
  type VehicleListingRow,
} from "@/lib/db/queries";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  Gauge,
  Fuel,
  Cog,
  PlusCircle,
  Car,
  Bike,
  Truck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Browse Vehicles | Cars, Motorcycles & Trucks | Debford",
  description:
    "Discover verified cars, performance motorcycles, and heavy-duty trucks from verified dealerships and private collectors on Debford.",
};

function formatPrice(price: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

// ── Cinematic Listing Card ──────────────────────────────────────
function ListingCard({
  listing,
}: {
  listing: VehicleListingRow;
}) {
  const v = listing.vehicle;
  const primaryImage =
    v?.images?.find((i) => i.is_primary)?.url ?? v?.images?.[0]?.url;
  const label =
    listing.title ||
    `${v?.year ?? ""} ${v?.make_name ?? ""} ${v?.model_name ?? ""}`.trim();

  return (
    <Link
      href={`/vehicles/${listing.slug || listing.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-slate-900/60 border border-white/8 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300"
    >
      {/* Visual Container */}
      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
            <span className="text-5xl opacity-20 group-hover:scale-110 transition-transform duration-300">
              🏎️
            </span>
          </div>
        )}

        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Condition Badge */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md ${
              v?.condition === "new"
                ? "bg-blue-600/80 text-white border border-blue-400/40"
                : v?.condition === "certified_pre_owned"
                ? "bg-purple-600/80 text-white border border-purple-400/40"
                : "bg-black/70 text-slate-300 border border-white/10"
            }`}
          >
            {v?.condition === "certified_pre_owned"
              ? "CPO INSPECTED"
              : (v?.condition ?? "PRE-OWNED").toUpperCase()}
          </span>
        </div>

        {/* Seller Verification Tag */}
        {listing.seller?.verification_status === "verified" && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 backdrop-blur-md text-[10px] font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Verified Seller</span>
          </div>
        )}

        {/* Price Tag with Backdrop Blur */}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15">
          <span className="text-base font-black text-white font-mono tracking-tight">
            {formatPrice(listing.price, listing.currency)}
          </span>
          {listing.is_negotiable && (
            <span className="text-[10px] font-mono text-slate-400 ml-1">OBO</span>
          )}
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{v?.city ? `${v.city}, ${v?.country || ""}` : "Verified Dealer Location"}</span>
          </div>

          <h3 className="font-bold text-white text-base mb-4 line-clamp-1 group-hover:text-blue-300 transition-colors">
            {label}
            {v?.variant_name ? ` ${v.variant_name}` : ""}
          </h3>
        </div>

        {/* Telemetry Chips */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/8 text-center">
          <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
            <div className="text-[10px] text-slate-500 font-mono uppercase mb-0.5">
              Mileage
            </div>
            <div className="text-xs font-semibold text-slate-200 truncate">
              {v?.mileage ? `${v.mileage.toLocaleString()} ${v.mileage_unit ?? "km"}` : "Brand New"}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
            <div className="text-[10px] text-slate-500 font-mono uppercase mb-0.5">
              Trans.
            </div>
            <div className="text-xs font-semibold text-slate-200 truncate">
              {v?.transmission ?? "Automatic"}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
            <div className="text-[10px] text-slate-500 font-mono uppercase mb-0.5">
              Fuel
            </div>
            <div className="text-xs font-semibold text-slate-200 truncate">
              {v?.fuel_type ?? "Petrol"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Obsidian Filter Sidebar ─────────────────────────────────────
function FilterSidebar() {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-xl sticky top-24 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Filter Vehicle Specs</h2>
          </div>
          <button className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors">
            Reset
          </button>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Price Range (USD)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
            <input
              type="number"
              placeholder="Max"
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Year Range */}
        <div className="mb-6">
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Model Year
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="From"
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
            <input
              type="number"
              placeholder="To"
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Drivetrain & Body Filters */}
        {[
          {
            label: "Fuel Configuration",
            options: ["Petrol", "Diesel", "Electric", "Hybrid"],
          },
          {
            label: "Transmission",
            options: ["Automatic", "Manual", "Dual-Clutch"],
          },
          {
            label: "Vehicle Condition",
            options: ["New", "Used", "Certified Pre-Owned"],
          },
          {
            label: "Chassis / Body",
            options: ["Sedan", "SUV", "Coupe", "Motorcycle", "Truck", "Commercial"],
          },
        ].map((group) => (
          <div key={group.label} className="mb-6">
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2.5">
              {group.label}
            </label>
            <div className="space-y-2">
              {group.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer group/cb">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 border-white/20 bg-slate-950 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-400 group-hover/cb:text-white transition-colors">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all">
          Apply Filters
        </button>
      </div>
    </aside>
  );
}

// ── Main Marketplace Page ───────────────────────────────────────
export default async function VehiclesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    search?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    fuel?: string;
    bodyType?: string;
  }>;
}) {
  const sp = await searchParams;
  const filters: ListingFilters = {
    search: sp?.search,
    sortBy: (sp?.sort as ListingFilters["sortBy"]) ?? "newest",
    page: sp?.page ? parseInt(sp.page) : 1,
    minPrice: sp?.minPrice ? parseInt(sp.minPrice) : undefined,
    maxPrice: sp?.maxPrice ? parseInt(sp.maxPrice) : undefined,
    fuelType: sp?.fuel,
    bodyType: sp?.bodyType,
  };

  let user = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch {
      user = null;
    }
  }

  const { listings, total, error } = isSupabaseConfigured()
    ? await getSaleListings(filters)
    : { listings: [], total: 0, error: null };

  const isDemoMode = !error && listings.length > 0 && (listings as any[])[0]?.id?.startsWith("demo-");
  const isEmpty = !error && listings.length === 0;

  return (
    <main className="min-h-screen bg-[#080a0f] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar userEmail={user?.email} />

      {/* ── MARKETPLACE HERO HEADER ──────────────────────── */}
      <div className="relative pt-28 pb-12 overflow-hidden border-b border-white/8 bg-[#0a0d14]">
        {/* Glows */}
        <div className="absolute top-0 right-1/3 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="container-debford relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              HOME
            </Link>
            <span>/</span>
            <span className="text-blue-400">VEHICLES INVENTORY</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-slate-300 text-[11px] font-mono tracking-widest uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Verified Automotive Marketplace</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Curated Inventory
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-xl font-light">
                Browse certified sports sedans, performance motorcycles, and commercial
                haulers with verified condition reports and transparent pricing.
              </p>
            </div>

            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Vehicle</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container-debford py-10">
        {/* ── FAST SEARCH & SORT TOOLBAR ──────────────────── */}
        <form className="flex gap-3 mb-10 flex-wrap" method="GET">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              name="search"
              type="search"
              defaultValue={sp?.search}
              placeholder="Search by make, model, chassis, or keyword…"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-lg"
            />
          </div>

          <select
            name="sort"
            defaultValue={sp?.sort ?? "newest"}
            className="px-5 py-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500 shadow-lg cursor-pointer"
          >
            <option value="newest">Sort: Newest Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="mileage_asc">Lowest Mileage</option>
          </select>

          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar />

          {/* Listings Body */}
          <div className="flex-1 min-w-0">
            {error ? (
              <div className="text-center py-20 p-8 rounded-3xl bg-slate-900/40 border border-white/5">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-lg font-bold text-white mb-2">Unable to load live listings</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Check your Supabase connectivity configuration in <code className="text-blue-400">.env.local</code>.
                </p>
              </div>
            ) : isEmpty ? (
              <div className="text-center py-24 p-8 rounded-3xl bg-slate-900/40 border border-white/5">
                <div className="text-5xl mb-4">🏎️</div>
                <h2 className="text-xl font-bold text-white mb-2">No vehicles currently match your criteria</h2>
                <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
                  {filters.search
                    ? `No listings found for "${filters.search}". Try adjusting your filters or search keywords.`
                    : "Be the first private seller or verified dealership to list a vehicle in this category."}
                </p>
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List a Vehicle on Debford</span>
                </Link>
              </div>
            ) : (
              <>
                {isDemoMode && (
                  <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300">
                    <span className="text-base">⚡</span>
                    <span>
                      <strong>Demonstration Inventory Active</strong> — Presenting curated prototype listings. Live listings will stream automatically when database credentials are connected.
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6 text-xs text-slate-400">
                  <span>
                    Showing <strong className="text-white">{listings.length}</strong> of{" "}
                    <strong className="text-white">{total.toLocaleString()}</strong> vehicles
                    {filters.search ? ` matching "${filters.search}"` : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {total > (filters.limit ?? 12) && (
                  <div className="flex items-center justify-center gap-2 mt-14">
                    {Array.from({ length: Math.ceil(total / (filters.limit ?? 12)) })
                      .slice(0, 8)
                      .map((_, i) => (
                        <Link
                          key={i}
                          href={`/vehicles?page=${i + 1}${
                            filters.search ? `&search=${filters.search}` : ""
                          }`}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-mono font-semibold transition-all ${
                            (filters.page ?? 1) === i + 1
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                              : "bg-slate-900/80 border border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                          }`}
                        >
                          {i + 1}
                        </Link>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
