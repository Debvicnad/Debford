"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Car,
  MapPin,
  Sparkles,
  Star,
  Search,
  RotateCcw,
} from "lucide-react";
import {
  RentalListingItem,
  RENTAL_CATEGORIES,
  RentalCategoryId,
} from "@/lib/data/rentals.data";

interface Props {
  initialListings: RentalListingItem[];
}

export function RentalsFleetClient({ initialListings }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<RentalCategoryId>("all");
  const [locationSearch, setLocationSearch] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [activeFilterQuery, setActiveFilterQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recommended" | "price_asc" | "price_desc" | "rating" | "trips">("recommended");

  // Category counts calculated dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: initialListings.length,
      sedan: 0,
      executive: 0,
      suv: 0,
      electric: 0,
      sports: 0,
      vans: 0,
    };
    initialListings.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });
    return counts;
  }, [initialListings]);

  // Filtered & sorted fleet
  const filteredListings = useMemo(() => {
    return initialListings
      .filter((item) => {
        // Category filter
        if (selectedCategory !== "all" && item.category !== selectedCategory) {
          return false;
        }

        // Location / Title search filter
        const query = (activeFilterQuery || locationSearch).trim().toLowerCase();
        if (query) {
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchLocation = item.location.toLowerCase().includes(query);
          const matchCategory = item.categoryLabel.toLowerCase().includes(query);
          if (!matchTitle && !matchLocation && !matchCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.pricePerDay - b.pricePerDay;
        if (sortBy === "price_desc") return b.pricePerDay - a.pricePerDay;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "trips") return b.bookings - a.bookings;
        return 0;
      });
  }, [initialListings, selectedCategory, activeFilterQuery, locationSearch, sortBy]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveFilterQuery(locationSearch);
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setLocationSearch("");
    setActiveFilterQuery("");
    setPickupDate("");
    setDropoffDate("");
    setSortBy("recommended");
  };

  const activeCategoryObj = RENTAL_CATEGORIES.find((c) => c.id === selectedCategory);
  const activeCategoryLabel = activeCategoryObj ? activeCategoryObj.label : "All Vehicles";

  return (
    <div className="space-y-8">
      {/* Search Console */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-slate-900/80 rounded-2xl md:rounded-3xl border border-white/10 p-3.5 sm:p-5 flex flex-col md:flex-row items-center gap-3 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex-1 w-full flex items-center gap-3 px-4 py-2.5 bg-slate-950/80 rounded-xl border border-white/8 focus-within:border-blue-500/50 transition-colors">
          <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-bold">
              Pick-up Location / City
            </label>
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              placeholder="e.g. New York, Miami, Los Angeles, Porsche, Tesla..."
              className="w-full bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none"
            />
          </div>
          {locationSearch && (
            <button
              type="button"
              onClick={() => {
                setLocationSearch("");
                setActiveFilterQuery("");
              }}
              className="text-slate-500 hover:text-slate-300 text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        <div className="w-full md:w-44 flex items-center gap-2.5 px-4 py-2.5 bg-slate-950/80 rounded-xl border border-white/8">
          <div className="flex-1 min-w-0">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-bold">
              Start Date
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-transparent text-white text-xs font-mono focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="w-full md:w-44 flex items-center gap-2.5 px-4 py-2.5 bg-slate-950/80 rounded-xl border border-white/8">
          <div className="flex-1 min-w-0">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-bold">
              Return Date
            </label>
            <input
              type="date"
              value={dropoffDate}
              onChange={(e) => setDropoffDate(e.target.value)}
              className="w-full bg-transparent text-white text-xs font-mono focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        <button
          type="submit"
          id="rental-search-btn"
          className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 shrink-0 border border-blue-400/30 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Search Fleet</span>
        </button>
      </form>

      {/* Category Navigation Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {RENTAL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40"
                  : "bg-slate-900/60 border border-white/8 text-slate-400 hover:text-white hover:border-white/20 backdrop-blur-sm"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-colors ${
                  isSelected ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Header Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/8 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <span>Available Performance Fleet</span>
            {selectedCategory !== "all" && (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                {activeCategoryLabel}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Displaying {filteredListings.length} verified machines with active dispatch & full insurance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(selectedCategory !== "all" || activeFilterQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | "recommended"
                    | "price_asc"
                    | "price_desc"
                    | "rating"
                    | "trips"
                )
              }
              className="px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs font-mono font-semibold text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="recommended">Featured Fleet</option>
              <option value="price_asc">Rate: Low to High</option>
              <option value="price_desc">Rate: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="trips">Most Trips Booked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-slate-900/40 rounded-3xl border border-white/8 p-12 text-center max-w-lg mx-auto my-8 space-y-4 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto opacity-70">
            🚗
          </div>
          <h3 className="text-lg font-bold text-white">No vehicles found in this category</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We couldn&apos;t find any rental vehicles matching your filter criteria in &quot;{activeCategoryLabel}&quot;. Try resetting your filters to explore the entire fleet.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Show All Fleet Vehicles ({initialListings.length})</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((rental) => (
            <RentalFleetCard key={rental.id} rental={rental} />
          ))}
        </div>
      )}
    </div>
  );
}

function RentalFleetCard({ rental }: { rental: RentalListingItem }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: rental.currency ?? "USD",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-white/8 overflow-hidden hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group flex flex-col backdrop-blur-sm">
      {/* Image Stage */}
      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={rental.imageUrl}
          alt={rental.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none opacity-80" />

        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {rental.available ? (
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full backdrop-blur-md">
              ✓ Available
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-700/80 text-slate-300 rounded-full backdrop-blur-md">
              Booked
            </span>
          )}
          {rental.deliveryAvailable && (
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Doorstep
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 px-3 py-1 text-sm font-mono font-black text-white bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
          {fmt(rental.pricePerDay)}
          <span className="text-xs font-normal text-slate-400 font-sans"> / day</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors line-clamp-1">
              {rental.year ? `${rental.year} ` : ""}{rental.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 text-xs font-mono">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white">{rental.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-500">({rental.bookings})</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate font-mono">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{rental.location}</span>
          </div>

          {/* Specs Chips */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center py-1.5 bg-slate-950/60 rounded-xl border border-white/5">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Fuel</div>
              <div className="text-xs font-semibold text-slate-200 truncate px-1">
                {rental.fuelType ?? "Petrol"}
              </div>
            </div>
            <div className="text-center py-1.5 bg-slate-950/60 rounded-xl border border-white/5">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Gearbox</div>
              <div className="text-xs font-semibold text-slate-200 truncate px-1">
                {rental.transmission ?? "Auto"}
              </div>
            </div>
            <div className="text-center py-1.5 bg-slate-950/60 rounded-xl border border-white/5">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Seats</div>
              <div className="text-xs font-semibold text-slate-200 truncate px-1">
                {rental.seats ?? 5} Seats
              </div>
            </div>
          </div>
        </div>

        <Link
          href={`/rentals/${rental.id}`}
          className={`block w-full py-2.5 text-center text-xs font-bold font-mono rounded-xl transition-all ${
            rental.available
              ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-600/20 border border-blue-400/30"
              : "bg-slate-950 border border-white/5 text-slate-500 cursor-not-allowed"
          }`}
        >
          {rental.available ? "Configure & Book →" : "Currently Unavailable"}
        </Link>
      </div>
    </div>
  );
}
