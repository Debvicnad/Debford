"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Car,
  ShoppingCart,
  ShieldCheck,
  Package,
  Cpu,
  Disc,
  Zap,
  Settings2,
  Lightbulb,
  Sofa,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { PartCard } from "./PartCard";
import { ALL_PARTS } from "@/lib/data/parts.data";
import { useCart } from "@/lib/context/CartContext";

const CATEGORIES = [
  { label: "All Parts", icon: Package, count: 8, accent: "#6366f1" },
  { label: "Engine", icon: Cpu, count: 2, accent: "#ef4444" },
  { label: "Brakes", icon: Disc, count: 1, accent: "#f59e0b" },
  { label: "Electrical", icon: Zap, count: 2, accent: "#3b82f6" },
  { label: "Suspension", icon: Settings2, count: 1, accent: "#8b5cf6" },
  { label: "Body Parts", icon: Car, count: 1, accent: "#10b981" },
  { label: "Lighting", icon: Lightbulb, count: 1, accent: "#f97316" },
  { label: "Interior", icon: Sofa, count: 0, accent: "#ec4899" },
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

const CONDITIONS = [
  { value: "all", label: "All Conditions", dot: "#6b7280" },
  { value: "new", label: "Brand New", dot: "#10b981" },
  { value: "oem", label: "OEM Genuine", dot: "#8b5cf6" },
  { value: "refurbished", label: "Refurbished", dot: "#3b82f6" },
  { value: "used", label: "Used / Pre-Owned", dot: "#f59e0b" },
];

export function PartsClient() {
  const { totalItemsCount, total } = useCart();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Parts");
  const [selectedVehicle, setSelectedVehicle] = useState("All Vehicles");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "rating">("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredParts = useMemo(() => {
    return ALL_PARTS.filter((part) => {
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
      if (selectedCategory !== "All Parts" && part.category !== selectedCategory) return false;
      if (selectedCondition !== "all" && part.condition !== selectedCondition) return false;
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

  const activeFiltersCount = [
    selectedCategory !== "All Parts",
    selectedVehicle !== "All Vehicles",
    selectedCondition !== "all",
    search.trim() !== "",
  ].filter(Boolean).length;

  function clearAll() {
    setSearch("");
    setSelectedCategory("All Parts");
    setSelectedVehicle("All Vehicles");
    setSelectedCondition("all");
    setSortBy("featured");
  }

  return (
    <div className="flex gap-8 items-start">
      {/* ── Left Sidebar (Desktop) ── */}
      <aside
        className="hidden lg:flex flex-col gap-4 w-60 shrink-0 sticky top-24"
      >
        {/* Search */}
        <div
          className="rounded-2xl border p-4 space-y-3"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(148,163,184,0.5)" }} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Part name, brand, OEM #..."
              className="w-full rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            />
          </div>

          {/* Vehicle Fitment */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>
              Filter by Vehicle
            </label>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Car className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="flex-1 bg-transparent text-white text-xs font-bold focus:outline-none"
                style={{ color: "#f8fafc" }}
              >
                {POPULAR_VEHICLES.map((v) => (
                  <option key={v} value={v} style={{ backgroundColor: "#0d121f", color: "#f8fafc" }}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div
          className="rounded-2xl border p-4 space-y-1"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider mb-3" style={{ color: "rgba(148,163,184,0.5)" }}>
            Part Category
          </p>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer"
                style={{
                  backgroundColor: isActive ? `${cat.accent}18` : "transparent",
                  border: isActive ? `1px solid ${cat.accent}40` : "1px solid transparent",
                  color: isActive ? "#f8fafc" : "rgba(148,163,184,0.7)",
                }}
              >
                <Icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: isActive ? cat.accent : "rgba(148,163,184,0.4)" }}
                />
                <span className="flex-1">{cat.label}</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-lg font-black"
                  style={{
                    backgroundColor: isActive ? `${cat.accent}25` : "rgba(255,255,255,0.05)",
                    color: isActive ? cat.accent : "rgba(148,163,184,0.4)",
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Condition */}
        <div
          className="rounded-2xl border p-4 space-y-1"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider mb-3" style={{ color: "rgba(148,163,184,0.5)" }}>
            Condition
          </p>
          {CONDITIONS.map((c) => {
            const isActive = selectedCondition === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setSelectedCondition(c.value)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer"
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.07)" : "transparent",
                  color: isActive ? "#f8fafc" : "rgba(148,163,184,0.6)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.dot }}
                />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Clear filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAll}
            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171",
            }}
          >
            <X className="w-3.5 h-3.5" />
            Clear {activeFiltersCount} Filter{activeFiltersCount > 1 ? "s" : ""}
          </button>
        )}
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Top bar — sort + mobile filter toggle */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(148,163,184,0.6)" }}>
            <span className="font-black text-white text-base">{filteredParts.length}</span>
            <span>parts found</span>
            {selectedVehicle !== "All Vehicles" && (
              <span
                className="px-2 py-0.5 rounded-lg text-[11px] font-bold"
                style={{
                  backgroundColor: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  color: "#34d399",
                }}
              >
                Filtered for {selectedVehicle}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
              style={{
                backgroundColor: activeFiltersCount > 0 ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.04)",
                borderColor: activeFiltersCount > 0 ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)",
                color: activeFiltersCount > 0 ? "#a5b4fc" : "#cbd5e1",
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center" style={{ backgroundColor: "#6366f1", color: "#fff" }}>
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#cbd5e1",
              }}
            >
              <option value="featured" style={{ backgroundColor: "#0d121f" }}>Featured</option>
              <option value="price_asc" style={{ backgroundColor: "#0d121f" }}>Price: Low → High</option>
              <option value="price_desc" style={{ backgroundColor: "#0d121f" }}>Price: High → Low</option>
              <option value="rating" style={{ backgroundColor: "#0d121f" }}>Top Rated Sellers</option>
            </select>
          </div>
        </div>

        {/* Mobile filters panel */}
        {showMobileFilters && (
          <div
            className="lg:hidden rounded-2xl border p-4 space-y-4"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            {/* Mobile search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(148,163,184,0.5)" }} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search parts..."
                className="w-full rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {/* Mobile vehicle */}
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Car className="w-4 h-4 text-blue-400 shrink-0" />
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="flex-1 bg-transparent text-white text-xs font-bold focus:outline-none"
              >
                {POPULAR_VEHICLES.map((v) => (
                  <option key={v} value={v} style={{ backgroundColor: "#0d121f" }}>{v}</option>
                ))}
              </select>
            </div>

            {/* Mobile categories */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    style={{
                      backgroundColor: isActive ? `${cat.accent}20` : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isActive ? cat.accent + "40" : "rgba(255,255,255,0.08)"}`,
                      color: isActive ? "#f8fafc" : "rgba(148,163,184,0.7)",
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile condition */}
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => {
                const isActive = selectedCondition === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setSelectedCondition(c.value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    style={{
                      backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: isActive ? "#f8fafc" : "rgba(148,163,184,0.6)",
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.dot }} />
                    {c.label}
                  </button>
                );
              })}
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAll}
                className="w-full py-2 rounded-xl text-xs font-bold cursor-pointer"
                style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              >
                <X className="w-3.5 h-3.5 inline mr-1.5" />
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Vehicle fitment active banner */}
        {selectedVehicle !== "All Vehicles" && (
          <div
            className="flex items-center justify-between gap-3 p-4 rounded-2xl border text-xs"
            style={{
              backgroundColor: "rgba(16,185,129,0.06)",
              borderColor: "rgba(16,185,129,0.2)",
              color: "#6ee7b7",
            }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Showing parts for <strong className="text-white">{selectedVehicle}</strong>.
                Parts marked <strong className="text-emerald-400">✓ Fits Vehicle</strong> are 100% guaranteed compatible.
              </span>
            </div>
            <button
              onClick={() => setSelectedVehicle("All Vehicles")}
              className="text-slate-400 hover:text-white underline shrink-0 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* Parts Grid */}
        {filteredParts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredParts.map((part) => (
              <PartCard
                key={part.id}
                part={part}
                selectedVehicle={selectedVehicle !== "All Vehicles" ? selectedVehicle : undefined}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-3xl border space-y-4"
            style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              <Package className="w-7 h-7" style={{ color: "#818cf8" }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">No Parts Found</h3>
              <p className="text-xs max-w-sm mx-auto" style={{ color: "rgba(148,163,184,0.6)" }}>
                Try adjusting your search keyword, category, or clear the vehicle fitment filter to see all available inventory.
              </p>
            </div>
            <button
              onClick={clearAll}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
              style={{ background: "linear-gradient(135deg, #6366f1, #3b82f6)" }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Cart Quick-Bar */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Link
            href="/cart"
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl hover:scale-105 transition-all"
            style={{
              background: "linear-gradient(135deg, #6366f1, #3b82f6)",
              boxShadow: "0 12px 40px rgba(99,102,241,0.4)",
              color: "#fff",
            }}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                style={{
                  backgroundColor: "#ef4444",
                  border: "2px solid #06090e",
                }}
              >
                {totalItemsCount}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-blue-100 block font-medium">Review Cart</span>
              <span className="text-sm font-extrabold">${total.toLocaleString()}</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
