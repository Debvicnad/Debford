"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, ArrowRight, Gauge, Fuel, Cog, MapPin, CheckCircle2 } from "lucide-react";
import type { VehicleListingRow } from "@/lib/db/queries";

interface VehicleDiscoveryProps {
  initialListings: VehicleListingRow[];
}

function formatPrice(price: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function VehicleDiscovery({ initialListings }: VehicleDiscoveryProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredListings = initialListings.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchMake = item.vehicle?.make_name?.toLowerCase().includes(q);
      const matchModel = item.vehicle?.model_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchMake && !matchModel) return false;
    }

    if (selectedType === "cars") {
      const bt = item.vehicle?.body_type?.toLowerCase() || "";
      return bt.includes("sedan") || bt.includes("suv") || bt.includes("coupe") || !bt;
    }
    if (selectedType === "motorcycles") {
      const bt = item.vehicle?.body_type?.toLowerCase() || "";
      return bt.includes("motorcycle") || bt.includes("bike");
    }
    if (selectedType === "trucks") {
      const bt = item.vehicle?.body_type?.toLowerCase() || "";
      return bt.includes("truck") || bt.includes("commercial") || bt.includes("pickup");
    }

    return true;
  });

  return (
    <section className="relative py-28 bg-[#0d111a] border-t border-white/5">
      <div className="container-debford relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-mono tracking-[0.2em] text-blue-400 uppercase mb-2">
              Curated Inventory
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Discover Your Next Machine
            </h2>
          </div>
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>View all inventory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Discovery Filter Controls */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {[
              { id: "all", label: "All Vehicles" },
              { id: "cars", label: "Cars & SUVs" },
              { id: "motorcycles", label: "Motorcycles" },
              { id: "trucks", label: "Trucks & Commercial" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedType === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search make, model, or year..."
              className="w-full pl-10 pr-4 py-2 text-xs text-white bg-slate-950/80 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 placeholder:text-slate-500 transition-colors"
            />
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.slice(0, 6).map((listing) => {
              const v = listing.vehicle;
              const primaryImage =
                v?.images?.find((img) => img.is_primary)?.url ||
                v?.images?.[0]?.url;
              const title =
                listing.title ||
                `${v?.year || ""} ${v?.make_name || ""} ${v?.model_name || ""}`.trim();

              return (
                <Link
                  key={listing.id}
                  href={`/vehicles/${listing.slug || listing.id}`}
                  className="group rounded-2xl overflow-hidden bg-slate-900/60 border border-white/10 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 flex flex-col"
                >
                  {/* Vehicle Image Container */}
                  <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        quality={85}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                        <span className="text-4xl opacity-30 group-hover:scale-110 transition-transform duration-300">
                          🚘
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
                        {v?.condition === "new" ? "BRAND NEW" : "PRE-OWNED"}
                      </span>
                    </div>

                    {listing.seller?.verification_status === "verified" && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 backdrop-blur-md text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Verified</span>
                      </div>
                    )}

                    {/* Price Tag in Image */}
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15">
                      <span className="text-base font-black text-white font-mono tracking-tight">
                        {formatPrice(listing.price, listing.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{v?.city ? `${v.city}, ${v?.country || ""}` : "Verified Dealer"}</span>
                      </div>

                      <h3 className="text-base font-bold text-white mb-4 line-clamp-1 group-hover:text-blue-300 transition-colors">
                        {title}
                      </h3>
                    </div>

                    {/* Technical Specs Ticker */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono uppercase mb-0.5">
                          Mileage
                        </div>
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {v?.mileage ? `${v.mileage.toLocaleString()} ${v.mileage_unit || "km"}` : "Brand New"}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono uppercase mb-0.5">
                          Trans.
                        </div>
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {v?.transmission || "Automatic"}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono uppercase mb-0.5">
                          Fuel
                        </div>
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {v?.fuel_type || "Petrol"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl bg-slate-900/40 border border-white/5">
            <p className="text-slate-400 text-sm mb-4">No matching listings found for this category.</p>
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              Browse all vehicles
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
