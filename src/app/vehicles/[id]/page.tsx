import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSaleListingBySlug, isSupabaseConfigured } from "@/lib/db/queries";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured()) return { title: "Vehicle Details" };
  const { listing } = await getSaleListingBySlug(id);
  if (!listing) return { title: "Vehicle Not Found" };
  return {
    title: listing.title,
    description: listing.meta_description ?? `${listing.title} for sale on Debford. ${listing.vehicle?.city ?? ""}`,
  };
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

  const { listing, error } = await getSaleListingBySlug(id);

  if (error || !listing) notFound();

  const v = listing.vehicle as any;
  const seller = listing.seller as any;
  const images: any[] = (v?.images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const primaryImage = images.find((i) => i.is_primary)?.url ?? images[0]?.url;
  const features: any[] = v?.features ?? [];

  // Group features by category
  const featuresByCategory = features.reduce((acc: Record<string, string[]>, f: any) => {
    const cat = f.category ?? "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f.feature);
    return acc;
  }, {});

  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency", currency: listing.currency ?? "USD", minimumFractionDigits: 0,
  });

  const highlights: string[] = (listing as any).highlights ?? [];

  return (
    <div className="min-h-screen surface-base">
      {/* Breadcrumb */}
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/vehicles" className="hover:text-slate-300 transition-colors">Vehicles</Link>
            <span>›</span>
            <span className="text-slate-300 truncate">{listing.title}</span>
          </div>
        </div>
      </div>

      <div className="container-debford py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — images + details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main image */}
            <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-white/8">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={primaryImage} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-9xl opacity-15">🚗</span>
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg">Featured</span>
                <span className="px-3 py-1.5 text-xs font-medium bg-slate-700/80 text-slate-300 rounded-lg backdrop-blur-sm capitalize">
                  {v?.condition ?? "Used"}
                </span>
              </div>
              <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                {images.length > 0 ? `1 / ${images.length} photos` : "No photos"}
              </div>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.slice(0, 8).map((img, i) => (
                  <div key={i} className={`shrink-0 w-20 h-14 rounded-lg border overflow-hidden ${i === 0 ? "border-blue-500" : "border-white/8"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {images.length > 8 && (
                  <div className="shrink-0 w-20 h-14 bg-slate-800 rounded-lg border border-white/8 flex items-center justify-center">
                    <span className="text-xs text-slate-500">+{images.length - 8}</span>
                  </div>
                )}
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="glass rounded-2xl border border-white/10 p-5">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Highlights</h2>
                <div className="flex flex-wrap gap-2">
                  {highlights.map((h) => (
                    <span key={h} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <span className="text-emerald-400">✓</span> {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Year", value: v?.year },
                  { label: "Mileage", value: v?.mileage ? `${v.mileage.toLocaleString()} ${v.mileage_unit ?? "km"}` : null },
                  { label: "Fuel Type", value: v?.fuel_type },
                  { label: "Transmission", value: v?.transmission },
                  { label: "Engine", value: v?.engine_size ? `${v.engine_size}L${v.power_hp ? ` · ${v.power_hp}hp` : ""}` : null },
                  { label: "Drive Type", value: v?.drive_type?.toUpperCase() },
                  { label: "Doors", value: v?.doors },
                  { label: "Seats", value: v?.seats },
                  { label: "Color", value: v?.color },
                ].filter((s) => s.value).map((spec) => (
                  <div key={spec.label} className="p-3 surface-base rounded-xl border border-white/5">
                    <div className="text-xs text-slate-600 mb-1">{spec.label}</div>
                    <div className="text-sm font-semibold text-white capitalize">{String(spec.value)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {Object.keys(featuresByCategory).length > 0 && (
              <div className="glass rounded-2xl border border-white/10 p-5">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Features & Equipment</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Object.entries(featuresByCategory).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{category}</h3>
                      <ul className="space-y-1.5">
                        {(items as string[]).map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {(listing as any).description && (
              <div className="glass rounded-2xl border border-white/10 p-5">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Description</h2>
                <p className="text-sm text-slate-400 leading-relaxed">{(listing as any).description}</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="glass rounded-2xl border border-white/10 p-5 sticky top-20">
              <h1 className="hidden lg:block text-lg font-bold text-white mb-1">{listing.title}</h1>
              <div className="text-3xl font-extrabold text-blue-400 mb-1">
                {fmt.format(listing.price)}
                {listing.is_negotiable && <span className="text-sm text-slate-500 font-normal ml-2">(Negotiable)</span>}
              </div>
              <p className="text-sm text-slate-500 mb-5">📍 {v?.city ?? "Location not set"}</p>

              <div className="space-y-3 mb-5">
                <Link
                  href={`/checkout?type=vehicle&id=${listing.id}`}
                  className="block w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm text-center flex items-center justify-center gap-2"
                >
                  <span>🛡️ Buy with Escrow / Reserve</span>
                </Link>
                <Link
                  href={`/messages?seller=${seller?.id || (listing as any).user_id}&listing=${listing.id}`}
                  className="block w-full py-3 gradient-brand text-white font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all text-sm text-center"
                >
                  💬 Contact Seller
                </Link>
                <Link
                  href={`/messages?seller=${seller?.id || (listing as any).user_id}&listing=${listing.id}&offer=1`}
                  className="block w-full py-3 glass border border-white/15 text-slate-200 font-semibold rounded-xl hover:border-white/25 hover:text-white transition-all text-sm text-center"
                >
                  🏷️ Make an Offer
                </Link>
                <Link
                  href={`/messages?seller=${seller?.id || (listing as any).user_id}&listing=${listing.id}&viewing=1`}
                  className="block w-full py-3 surface-base border border-white/10 text-slate-300 font-medium rounded-xl hover:border-white/20 hover:text-white transition-all text-sm text-center"
                >
                  📅 Schedule Viewing
                </Link>
              </div>

              {/* Seller */}
              {seller && (
                <div className="border-t border-white/8 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {seller.full_name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{seller.full_name ?? "Seller"}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-amber-400">★</span>
                        <span className="text-slate-300">{seller.average_rating?.toFixed(1) ?? "New"}</span>
                        {seller.verification_status === "verified" && (
                          <span className="ml-1 text-emerald-400">✓ Verified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="glass rounded-2xl border border-white/10 p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Views", value: listing.views_count ?? 0 },
                  { label: "Saved", value: listing.saves_count ?? 0 },
                  { label: "Inquiries", value: (listing as any).inquiries_count ?? 0 },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-lg font-bold text-white">{s.value}</div>
                    <div className="text-xs text-slate-600">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-2.5 glass border border-white/10 text-slate-400 text-sm rounded-xl hover:text-white hover:border-white/20 transition-all">
                🤍 Save
              </button>
              <button className="flex-1 py-2.5 glass border border-white/10 text-slate-400 text-sm rounded-xl hover:text-white hover:border-white/20 transition-all">
                ↗ Share
              </button>
              <button className="py-2.5 px-3 glass border border-white/10 text-slate-500 text-sm rounded-xl hover:text-white hover:border-white/20 transition-all">
                🚩
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
