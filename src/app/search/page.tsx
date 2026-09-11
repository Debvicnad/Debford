import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search Vehicles",
  description: "Full-text search across all vehicles, parts, services, and rentals on Debford.",
};

const MOCK_RESULTS = {
  vehicles: [
    { id: "v1", title: "2023 Toyota Camry SE", price: 32000, location: "New York, NY", mileage: "12,000 km", type: "Vehicle" },
    { id: "v2", title: "2022 Toyota RAV4 XLE", price: 38500, location: "Los Angeles, CA", mileage: "24,000 km", type: "Vehicle" },
    { id: "v3", title: "2024 Toyota Highlander Limited", price: 58000, location: "Chicago, IL", mileage: "3,200 km", type: "Vehicle" },
  ],
  parts: [
    { id: "p1", title: "Toyota OEM Air Filter — Camry 2018–2024", price: 38, brand: "Toyota", type: "Part" },
    { id: "p2", title: "K&N Drop-In Filter — Toyota 2.5L", price: 62, brand: "K&N", type: "Part" },
  ],
  services: [
    { id: "s1", title: "Toyota Specialist — Full Service", price: 180, location: "Brooklyn, NY", type: "Service" },
  ],
};

const fmt = (n: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: 0,
}).format(n);

const TOTAL = Object.values(MOCK_RESULTS).flat().length;

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; type?: string }>;
}) {
  const resolved = await searchParams;
  const query = resolved?.q ?? "";
  const type = resolved?.type ?? "all";
  const hasQuery = query.length > 0;

  return (
    <div className="min-h-screen surface-base">
      {/* Sticky search bar */}
      <div className="surface-raised border-b border-subtle sticky top-0 z-40">
        <div className="container-debford py-4">
          <form className="flex gap-3" method="GET">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                name="q"
                type="search"
                defaultValue={query}
                autoFocus
                placeholder="Search vehicles, parts, services, rentals…"
                className="w-full pl-12 pr-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              {hasQuery && (
                <Link href="/search" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">✕</Link>
              )}
            </div>
            <button type="submit" className="px-6 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shrink-0">
              Search
            </button>
          </form>

          {/* Type filters */}
          {hasQuery && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {[
                { key: "all", label: `All (${TOTAL})` },
                { key: "vehicles", label: `Vehicles (${MOCK_RESULTS.vehicles.length})` },
                { key: "parts", label: `Parts (${MOCK_RESULTS.parts.length})` },
                { key: "services", label: `Services (${MOCK_RESULTS.services.length})` },
                { key: "rentals", label: "Rentals (0)" },
                { key: "auctions", label: "Auctions (0)" },
              ].map((t) => (
                <Link
                  key={t.key}
                  href={`/search?q=${encodeURIComponent(query)}&type=${t.key}`}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    type === t.key
                      ? "gradient-brand text-white"
                      : "glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container-debford py-8">
        {!hasQuery ? (
          /* Empty state — no query */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-5xl mb-4 opacity-40">🔍</div>
              <h1 className="text-2xl font-bold text-white mb-2">Search Debford</h1>
              <p className="text-slate-500 text-sm">Find vehicles, parts, services, and more</p>
            </div>

            {/* Trending searches */}
            <div className="glass rounded-2xl border border-white/10 p-6 mb-6">
              <h2 className="text-sm font-semibold text-white mb-4">🔥 Trending searches</h2>
              <div className="flex flex-wrap gap-2">
                {["Toyota Camry", "BMW 5 Series", "Tesla Model 3", "Ford F-150", "Mercedes GLE", "Honda Accord", "Porsche 911", "Electric cars"].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="px-3 py-2 glass border border-white/10 text-slate-400 text-sm rounded-xl hover:border-blue-500/30 hover:text-blue-300 transition-all"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { href: "/vehicles", icon: "🚗", label: "Browse all vehicles" },
                { href: "/parts", icon: "🔧", label: "Browse parts" },
                { href: "/services", icon: "⚙️", label: "Find a service" },
                { href: "/rentals", icon: "🔑", label: "Rent a vehicle" },
                { href: "/auctions", icon: "🔨", label: "Live auctions" },
                { href: "/compare", icon: "⚖️", label: "Compare vehicles" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-4 glass rounded-xl border border-white/10 hover:border-white/20 hover:text-white transition-all group"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Results */
          <div>
            <p className="text-sm text-slate-500 mb-6">
              {TOTAL} result{TOTAL !== 1 ? "s" : ""} for{" "}
              <span className="text-white font-semibold">&ldquo;{query}&rdquo;</span>
            </p>

            <div className="space-y-8">
              {/* Vehicles */}
              {(type === "all" || type === "vehicles") && MOCK_RESULTS.vehicles.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Vehicles</h2>
                    <Link href={`/vehicles?search=${encodeURIComponent(query)}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MOCK_RESULTS.vehicles.map((v) => (
                      <Link key={v.id} href={`/vehicles/${v.id}`} className="group glass rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 hover:shadow-xl hover:shadow-black/10 transition-all">
                        <div className="aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <span className="text-5xl opacity-20">🚗</span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">{v.title}</h3>
                          <p className="text-xs text-slate-500 mb-2">📍 {v.location} · {v.mileage}</p>
                          <div className="text-lg font-bold text-blue-400">{fmt(v.price)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Parts */}
              {(type === "all" || type === "parts") && MOCK_RESULTS.parts.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Parts & Accessories</h2>
                    <Link href={`/parts?search=${encodeURIComponent(query)}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MOCK_RESULTS.parts.map((p) => (
                      <Link key={p.id} href={`/parts/${p.id}`} className="group glass rounded-xl border border-white/10 p-4 flex items-center gap-4 hover:border-white/20 transition-all">
                        <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-2xl shrink-0">🔧</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1">{p.title}</h3>
                          <p className="text-xs text-slate-500 mb-1">{p.brand}</p>
                          <div className="text-base font-bold text-blue-400">{fmt(p.price)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Services */}
              {(type === "all" || type === "services") && MOCK_RESULTS.services.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Services</h2>
                    <Link href={`/services?search=${encodeURIComponent(query)}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MOCK_RESULTS.services.map((s) => (
                      <Link key={s.id} href={`/services/${s.id}`} className="group glass rounded-xl border border-white/10 p-4 flex items-center gap-4 hover:border-white/20 transition-all">
                        <div className="w-14 h-14 gradient-brand rounded-xl flex items-center justify-center text-2xl shrink-0">⚙️</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{s.title}</h3>
                          <p className="text-xs text-slate-500 mb-1">📍 {s.location}</p>
                          <div className="text-sm font-bold text-blue-400">From {fmt(s.price)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
