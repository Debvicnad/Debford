import type { Metadata } from "next";
import Link from "next/link";
import { getSaleListings, isSupabaseConfigured, type ListingFilters } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Browse Vehicles",
  description: "Search thousands of cars, motorcycles, and trucks for sale on Debford.",
};

// ── Helpers ───────────────────────────────────────────────────
function formatPrice(price: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency, minimumFractionDigits: 0,
  }).format(price);
}

// ── Listing Card ──────────────────────────────────────────────
function ListingCard({ listing }: { listing: Awaited<ReturnType<typeof getSaleListings>>["listings"][number] }) {
  const v = listing.vehicle;
  const primaryImage = v?.images?.find((i) => i.is_primary)?.url ?? v?.images?.[0]?.url;
  const label = `${v?.year ?? ""} ${v?.make_name ?? ""} ${v?.model_name ?? ""}`.trim();

  return (
    <Link
      href={`/vehicles/${listing.slug}`}
      className="group block glass rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 hover:shadow-xl hover:shadow-black/10 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={primaryImage} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-15 group-hover:opacity-20 transition-opacity">🚗</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            v?.condition === "new"
              ? "bg-blue-500/25 text-blue-300 border border-blue-500/30"
              : v?.condition === "certified_pre_owned"
              ? "bg-purple-500/25 text-purple-300 border border-purple-500/30"
              : "bg-slate-700/80 text-slate-300"
          }`}>
            {v?.condition === "certified_pre_owned" ? "CPO" : (v?.condition ?? "Used")}
          </span>
        </div>
        {listing.seller?.verification_status === "verified" && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
              ✓ Verified
            </span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 text-sm font-extrabold text-white bg-black/60 backdrop-blur-sm rounded-xl">
          {formatPrice(listing.price, listing.currency)}
          {listing.is_negotiable && <span className="text-xs text-slate-400 ml-1">(OBO)</span>}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-0.5 line-clamp-1 group-hover:text-blue-300 transition-colors">
          {label}{v?.variant_name ? ` ${v.variant_name}` : ""}
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          📍 {v?.city ?? "Location not set"}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            v?.mileage ? `${v.mileage.toLocaleString()} ${v.mileage_unit ?? "km"}` : "—",
            v?.fuel_type ?? "—",
            v?.transmission ?? "—",
          ].map((val, i) => (
            <div key={i} className="text-center py-1 bg-slate-800/60 rounded-lg">
              <div className="text-xs font-medium text-slate-400">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ── Filter Sidebar ────────────────────────────────────────────
function FilterSidebar() {
  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="glass rounded-2xl border border-white/10 p-5 sticky top-20">
        <h2 className="text-sm font-bold text-white mb-4">Filters</h2>

        {/* Price range */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Price</label>
          <div className="flex gap-2">
            <input type="number" placeholder="Min" className="w-full px-3 py-2 surface-base border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" />
            <input type="number" placeholder="Max" className="w-full px-3 py-2 surface-base border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        {/* Year */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Year</label>
          <div className="flex gap-2">
            <input type="number" placeholder="From" className="w-full px-3 py-2 surface-base border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" />
            <input type="number" placeholder="To" className="w-full px-3 py-2 surface-base border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        {/* Filters */}
        {[
          {
            label: "Fuel Type",
            options: ["Petrol", "Diesel", "Electric", "Hybrid", "LPG"],
          },
          {
            label: "Transmission",
            options: ["Automatic", "Manual", "Semi-Auto", "CVT"],
          },
          {
            label: "Condition",
            options: ["New", "Used", "Certified Pre-Owned"],
          },
          {
            label: "Body Type",
            options: ["Sedan", "SUV", "Coupe", "Hatchback", "Truck", "Convertible", "Wagon"],
          },
        ].map((group) => (
          <div key={group.label} className="mb-5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {group.label}
            </label>
            <div className="space-y-1.5">
              {group.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer group/cb">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-500 border-white/20 bg-slate-800" />
                  <span className="text-sm text-slate-400 group-hover/cb:text-slate-200 transition-colors">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button className="w-full py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
          Apply Filters
        </button>
        <button className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-2">
          Reset all
        </button>
      </div>
    </aside>
  );
}

// ── Page ──────────────────────────────────────────────────────
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
  };

  const { listings, total, error } = isSupabaseConfigured()
    ? await getSaleListings(filters)
    : { listings: [], total: 0, error: null };

  // Fall back to empty state messaging
  const isEmpty = !error && listings.length === 0;

  return (
    <div className="min-h-screen surface-base">
      {/* Header */}
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>›</span>
            <span className="text-slate-300">Vehicles</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Browse Vehicles</h1>
              <p className="text-slate-400 text-sm mt-1">
                {total > 0 ? `${total.toLocaleString()} vehicles listed` : "Vehicles marketplace"}
              </p>
            </div>
            <Link href="/sell" className="px-5 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
              + List your vehicle
            </Link>
          </div>
        </div>
      </div>

      <div className="container-debford py-8">
        {/* Search bar */}
        <form className="flex gap-3 mb-8 flex-wrap" method="GET">
          <div className="flex-1 min-w-60 relative">
            <input
              name="search"
              type="search"
              defaultValue={sp?.search}
              placeholder="Search by make, model, or keyword…"
              className="w-full pl-10 pr-4 py-3 surface-raised border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            name="sort"
            defaultValue={sp?.sort ?? "newest"}
            className="px-4 py-3 surface-raised border border-white/10 rounded-xl text-sm text-slate-300 bg-transparent focus:outline-none focus:border-blue-500"
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="mileage_asc">Lowest mileage</option>
          </select>
          <button type="submit" className="px-6 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
            Search
          </button>
        </form>

        <div className="flex gap-8">
          <FilterSidebar />

          <div className="flex-1 min-w-0">
            {error ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-lg font-bold text-white mb-2">Unable to load listings</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Connect your Supabase project in <code className="text-blue-400">.env.local</code> to see live listings.
                </p>
                <div className="glass rounded-xl border border-white/10 p-4 text-left max-w-md mx-auto">
                  <p className="text-xs font-mono text-slate-400 leading-relaxed">
                    NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co<br/>
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
                  </p>
                </div>
              </div>
            ) : isEmpty ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🚗</div>
                <h2 className="text-lg font-bold text-white mb-2">No listings yet</h2>
                <p className="text-slate-500 text-sm mb-6">
                  {filters.search
                    ? `No results for "${filters.search}" — try a different search.`
                    : "Be the first to list a vehicle on Debford."}
                </p>
                <Link href="/sell" className="px-6 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
                  List a Vehicle
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-5">
                  {total.toLocaleString()} result{total !== 1 ? "s" : ""}
                  {filters.search ? ` for "${filters.search}"` : ""}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {total > (filters.limit ?? 12) && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: Math.ceil(total / (filters.limit ?? 12)) }).slice(0, 8).map((_, i) => (
                      <Link
                        key={i}
                        href={`/vehicles?page=${i + 1}${filters.search ? `&search=${filters.search}` : ""}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                          (filters.page ?? 1) === i + 1
                            ? "gradient-brand text-white"
                            : "glass border border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
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
    </div>
  );
}
