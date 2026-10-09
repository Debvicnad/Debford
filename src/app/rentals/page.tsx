import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { getRentalListings } from "@/lib/db/queries";
import { RentalsFleetClient } from "@/components/rentals/RentalsFleetClient";
import {
  MOCK_RENTAL_FLEET,
  RentalListingItem,
} from "@/lib/data/rentals.data";

export const metadata: Metadata = {
  title: "Vehicle Rentals — Debford Showroom",
  description:
    "Rent verified performance cars, luxury sports, SUVs, and commercial vehicles with instant online booking, full insurance, and doorstep delivery on Debford.",
};

export default async function RentalsPage() {
  const { rentals: dbRentals } = await getRentalListings();

  // If DB has records, map them to RentalListingItem format and combine with mock fleet
  const dbMapped: RentalListingItem[] = (dbRentals || []).map((r) => {
    const titleLower = (r.title ?? "").toLowerCase();
    let category: RentalListingItem["category"] = "sedan";
    let categoryLabel = "Sedans & Hatchbacks";

    if (
      titleLower.includes("bmw") ||
      titleLower.includes("mercedes") ||
      titleLower.includes("porsche") ||
      titleLower.includes("luxury")
    ) {
      category = "executive";
      categoryLabel = "Executive & Luxury";
    } else if (
      titleLower.includes("suv") ||
      titleLower.includes("jeep") ||
      titleLower.includes("rover") ||
      titleLower.includes("gle")
    ) {
      category = "suv";
      categoryLabel = "SUVs & Crossovers";
    } else if (
      titleLower.includes("tesla") ||
      titleLower.includes("taycan") ||
      titleLower.includes("electric") ||
      titleLower.includes("ev") ||
      titleLower.includes("hybrid")
    ) {
      category = "electric";
      categoryLabel = "Electric & Hybrids";
    } else if (
      titleLower.includes("mustang") ||
      titleLower.includes("corvette") ||
      titleLower.includes("sports") ||
      titleLower.includes("convertible") ||
      titleLower.includes("m4")
    ) {
      category = "sports";
      categoryLabel = "Sports & Convertibles";
    } else if (
      titleLower.includes("van") ||
      titleLower.includes("transit") ||
      titleLower.includes("sprinter") ||
      titleLower.includes("truck") ||
      titleLower.includes("commercial")
    ) {
      category = "vans";
      categoryLabel = "Vans & Commercial";
    }

    return {
      id: r.id,
      title: r.title,
      year: r.vehicle?.year ?? 2023,
      category,
      categoryLabel,
      pricePerDay: Number(r.price_per_day),
      pricePerWeek: r.price_per_week ? Number(r.price_per_week) : undefined,
      pricePerMonth: r.price_per_month ? Number(r.price_per_month) : undefined,
      securityDeposit: (r as any).security_deposit
        ? Number((r as any).security_deposit)
        : undefined,
      currency: r.currency ?? "USD",
      rating: Number(r.average_rating ?? 5.0),
      bookings: r.total_bookings ?? 0,
      location: r.pickup_location ?? "Available on Request",
      fuelType: r.vehicle?.fuel_type ?? "Petrol",
      transmission: r.vehicle?.transmission ?? "Auto",
      seats: r.vehicle?.seats ?? 5,
      doors: (r.vehicle as any)?.doors ?? 4,
      available: r.status === "published",
      deliveryAvailable: r.delivery_available,
      deliveryFee: (r as any).delivery_fee ? Number((r as any).delivery_fee) : 0,
      imageUrl:
        r.vehicle?.images?.find((img) => img.is_primary)?.url ??
        r.vehicle?.images?.[0]?.url ??
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    };
  });

  // Combine DB listings with MOCK_RENTAL_FLEET (avoiding duplicates if same id)
  const existingIds = new Set(dbMapped.map((x) => x.id));
  const combinedListings: RentalListingItem[] = [
    ...dbMapped,
    ...MOCK_RENTAL_FLEET.filter((m) => !existingIds.has(m.id)),
  ];

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col selection:bg-blue-500/30 selection:text-white">
      <Navbar />

      {/* Hero Header & Sanctuary Scrim */}
      <section className="relative overflow-hidden pt-28 pb-12 border-b border-white/8 bg-gradient-to-b from-slate-950 via-[#070d18] to-[#06090e]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Debford
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-semibold">Vehicle Rentals Fleet</span>
          </div>

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Certified Fleet · Instant Dispatch Ready</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Precision Engineered Vehicle Rentals
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Drive on your terms. From executive sedans and track-ready supercars to all-terrain SUVs and commercial fleets — fully insured with 24/7 roadside assistance and optional doorstep delivery.
            </p>
          </div>

          {/* Telemetry Status Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/8 backdrop-blur-sm space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Fleet Active</span>
              <span className="text-base font-mono font-black text-white">48+ Performance Vehicles</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/8 backdrop-blur-sm space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Insurance Status</span>
              <span className="text-base font-mono font-black text-emerald-400">100% Comprehensive</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/8 backdrop-blur-sm space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Doorstep Delivery</span>
              <span className="text-base font-mono font-black text-cyan-400">Available in 12 Hubs</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/8 backdrop-blur-sm space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Host Standards</span>
              <span className="text-base font-mono font-black text-amber-400">4.92 ★ Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Fleet & Search Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <RentalsFleetClient initialListings={combinedListings} />
      </main>
    </div>
  );
}
