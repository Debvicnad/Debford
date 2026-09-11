import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Saved Vehicles",
  description: "Your saved and favourite vehicles on Debford.",
};

const MOCK_SAVED = [
  { id: "s1", title: "2023 Toyota Camry SE", price: 32000, location: "New York, NY", mileage: "12,000 km", savedAt: "2 days ago", status: "available", priceChange: null },
  { id: "s2", title: "2022 BMW 5 Series 530i", price: 58000, location: "Los Angeles, CA", mileage: "28,000 km", savedAt: "5 days ago", status: "available", priceChange: -3000 },
  { id: "s3", title: "2022 Mazda 6 Grand Touring", price: 31000, location: "Chicago, IL", mileage: "24,000 km", savedAt: "1 week ago", status: "available", priceChange: -3000 },
  { id: "s4", title: "2021 Ford Mustang GT", price: 44000, location: "Miami, FL", mileage: "18,000 km", savedAt: "2 weeks ago", status: "sold", priceChange: null },
];

const MOCK_SEARCHES: Array<{ id: string; name: string; filters: Record<string, string>; results: number; savedAt: string }> = [
  { id: "ss1", name: "BMW 5 Series under $65k", filters: { make: "BMW", model: "5 Series", maxPrice: "65000" }, results: 14, savedAt: "3 days ago" },
  { id: "ss2", name: "Electric SUVs NYC", filters: { fuel: "Electric", bodyType: "SUV", location: "New York" }, results: 8, savedAt: "1 week ago" },
  { id: "ss3", name: "Toyota under $40k", filters: { make: "Toyota", maxPrice: "40000" }, results: 31, savedAt: "2 weeks ago" },
];

const fmt = (n: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: 0,
}).format(n);

export default async function SavedPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  if (!isSupabaseConfigured()) redirect("/login?redirectTo=/saved");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/saved");

  const resolved = await searchParams;
  const tab = resolved?.tab ?? "vehicles";

  return (
    <div className="min-h-screen surface-base">
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <span>›</span>
            <span className="text-slate-300">Saved</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Saved Items</h1>
        </div>
      </div>

      <div className="container-debford py-8 max-w-4xl">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass rounded-xl border border-white/10 p-1 w-fit">
          {[
            { key: "vehicles", label: `Vehicles (${MOCK_SAVED.length})` },
            { key: "searches", label: `Saved Searches (${MOCK_SEARCHES.length})` },
          ].map((t) => (
            <Link
              key={t.key}
              href={`/saved?tab=${t.key}`}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? "gradient-brand text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* ── Saved Vehicles ── */}
        {tab === "vehicles" && (
          <div>
            {MOCK_SAVED.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🤍</div>
                <h2 className="text-lg font-bold text-white mb-2">No saved vehicles</h2>
                <p className="text-slate-500 text-sm mb-6">Save vehicles you like while browsing to find them here.</p>
                <Link href="/vehicles" className="px-6 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
                  Browse vehicles
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {MOCK_SAVED.map((v) => (
                  <div key={v.id} className={`glass rounded-2xl border p-5 transition-all hover:border-white/20 ${v.status === "sold" ? "border-white/5 opacity-60" : "border-white/10"}`}>
                    <div className="flex gap-5">
                      {/* Image placeholder */}
                      <div className="w-28 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-3xl opacity-20">{v.status === "sold" ? "🔒" : "🚗"}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
                          <Link href={`/vehicles/${v.id}`} className="text-sm font-bold text-white hover:text-blue-300 transition-colors">
                            {v.title}
                          </Link>
                          {v.status === "sold" && (
                            <span className="px-2.5 py-1 text-xs font-bold bg-slate-600/50 text-slate-500 rounded-full">
                              Sold
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mb-2">📍 {v.location} · {v.mileage}</p>

                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold text-blue-400">{fmt(v.price)}</span>
                            {v.priceChange && (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                v.priceChange < 0
                                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                  : "text-rose-400 bg-rose-500/10"
                              }`}>
                                {v.priceChange < 0 ? "↓" : "↑"} {fmt(Math.abs(v.priceChange))}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-600">Saved {v.savedAt}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        {v.status !== "sold" && (
                          <Link
                            href={`/vehicles/${v.id}`}
                            className="px-4 py-2 gradient-brand text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
                          >
                            View
                          </Link>
                        )}
                        <button className="px-4 py-2 glass border border-white/10 text-slate-500 text-xs rounded-xl hover:border-rose-500/30 hover:text-rose-400 transition-all">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Saved Searches ── */}
        {tab === "searches" && (
          <div>
            {MOCK_SEARCHES.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-lg font-bold text-white mb-2">No saved searches</h2>
                <p className="text-slate-500 text-sm">Save a search to get notified when new matching vehicles are listed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {MOCK_SEARCHES.map((s) => (
                  <div key={s.id} className="glass rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-white">{s.name}</span>
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25 rounded-full">
                            {s.results} matches
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {Object.entries(s.filters).map(([k, v]) => (
                            <span key={k} className="px-2 py-1 text-xs surface-base border border-white/8 text-slate-400 rounded-lg">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-600">Saved {s.savedAt}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link
                          href={`/vehicles?${new URLSearchParams(s.filters).toString()}`}
                          className="px-4 py-2 gradient-brand text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        >
                          View results
                        </Link>
                        <button className="px-3 py-2 glass border border-white/10 text-slate-500 text-xs rounded-xl hover:border-rose-500/30 hover:text-rose-400 transition-all">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="/vehicles" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                + Browse vehicles and save a new search
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
