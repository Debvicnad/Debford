"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  CheckCircle2,
  Car,
  ShoppingCart,
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  Package,
  Wrench,
  SlidersHorizontal,
} from "lucide-react";
import { PartCard } from "./PartCard";
import { ALL_PARTS, PartItem } from "@/lib/data/parts.data";
import { useCart } from "@/lib/context/CartContext";

const CATEGORIES = [
  { label: "All Parts", count: 8 },
  { label: "Engine", count: 2 },
  { label: "Brakes", count: 1 },
  { label: "Electrical", count: 2 },
  { label: "Suspension", count: 1 },
  { label: "Body Parts", count: 1 },
  { label: "Lighting", count: 1 },
];

const POPULAR_VEHICLES = [
  "All Vehicles",
  "BMW 3 Series",
  "Toyota Camry",
  "Honda Accord",
  "Tesla Model 3",
  "Ford F-150",
  "Porsche 911",
];

export function PartsClient() {
  const { totalItemsCount, total } = useCart();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Parts");
  const [selectedVehicle, setSelectedVehicle] = useState("All Vehicles");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "rating">("featured");

  const filteredParts = useMemo(() => {
    return ALL_PARTS.filter((part) => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = part.title.toLowerCase().includes(q);
        const matchesBrand = part.brand.toLowerCase().includes(q);
        const matchesPartNo = part.partNumber?.toLowerCase().includes(q);
        const matchesCompat = part.compatibility.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesPartNo && !matchesCompat) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "All Parts" && part.category !== selectedCategory) {
        return false;
      }

      // Condition filter
      if (selectedCondition !== "all" && part.condition !== selectedCondition) {
        return false;
      }

      // Vehicle fitment filter
      if (selectedVehicle !== "All Vehicles") {
        const matches = part.compatibleModels.some((m) =>
          m.toLowerCase().includes(selectedVehicle.toLowerCase())
        );
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return (b.sellerRating ?? 0) - (a.sellerRating ?? 0);
      return 0;
    });
  }, [search, selectedCategory, selectedCondition, selectedVehicle, sortBy]);

  return (
    <div className="space-y-8">
      {/* Search & Fitment Filter Banner */}
      <div className="glass rounded-3xl border border-white/15 p-6 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by part title, brand, or OEM part number (e.g., Bosch, 34116794915)..."
              className="w-full bg-[#131b2e] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Vehicle Fitment Filter */}
          <div className="w-full md:w-64 flex items-center gap-2 bg-[#131b2e] border border-white/10 rounded-2xl px-3 py-2.5">
            <Car className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">
                Guaranteed Fitment
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full bg-transparent text-white text-xs font-bold focus:outline-none truncate"
              >
                {POPULAR_VEHICLES.map((v) => (
                  <option key={v} value={v} className="bg-[#131b2e] text-white">
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-white/5">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.label
                    ? "gradient-brand text-white shadow-lg shadow-blue-500/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Condition and Sort Dropdowns */}
          <div className="flex items-center gap-2.5">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="bg-[#131b2e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Conditions</option>
              <option value="new">Brand New</option>
              <option value="oem">OEM Genuine</option>
              <option value="refurbished">Refurbished</option>
              <option value="used">Used / Pre-Owned</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#131b2e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated Sellers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selected Vehicle Fitment Banner */}
      {selectedVehicle !== "All Vehicles" && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Filtering for <strong className="text-white">{selectedVehicle}</strong>. Parts marked with &quot;✓ Fits Vehicle&quot; are 100% guaranteed compatible.
            </span>
          </div>
          <button
            onClick={() => setSelectedVehicle("All Vehicles")}
            className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Parts Grid */}
      {filteredParts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredParts.map((part) => (
            <PartCard
              key={part.id}
              part={part}
              selectedVehicle={selectedVehicle !== "All Vehicles" ? selectedVehicle : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass rounded-3xl border border-white/10 space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Parts Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keyword, category, or clear the vehicle fitment filter.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All Parts");
              setSelectedVehicle("All Vehicles");
              setSelectedCondition("all");
            }}
            className="px-4 py-2 gradient-brand text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Floating Cart Quick-Bar (if items present) */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-slideUp">
          <Link
            href="/cart"
            className="flex items-center gap-3 px-5 py-3.5 gradient-brand text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:scale-105 transition-all group"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-white" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-[#0a0d14]">
                {totalItemsCount}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-blue-100 block font-medium">Review Cart</span>
              <span className="text-sm font-extrabold text-white">${total.toLocaleString()}</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
