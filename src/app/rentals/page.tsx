import type { Metadata } from "next";
import Link from "next/link";
import { getRentalListings } from "@/lib/db/queries";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { RentalsFleetClient } from "@/components/rentals/RentalsFleetClient";
import {
  MOCK_RENTAL_FLEET,
  RentalListingItem,
} from "@/lib/data/rentals.data";

export const metadata: Metadata = {
  title: "Vehicle Rentals — Debford",
  description: "Rent verified cars, luxury sports, and commercial vehicles with instant online booking and full insurance on Debford.",
};

export default async function RentalsPage() {
  const { rentals: dbRentals } = await getRentalListings();

  // If DB has records, map them to RentalListingItem format and combine with mock fleet
  const dbMapped: RentalListingItem[] = (dbRentals || []).map((r) => {
    const titleLower = (r.title ?? "").toLowerCase();
    let category: RentalListingItem["category"] = "sedan";
    let categoryLabel = "Sedans & Hatchbacks";

    if (titleLower.includes("bmw") || titleLower.includes("mercedes") || titleLower.includes("porsche") || titleLower.includes("luxury")) {
      category = "executive";
      categoryLabel = "Executive & Luxury";
    } else if (titleLower.includes("suv") || titleLower.includes("jeep") || titleLower.includes("rover") || titleLower.includes("gle")) {
      category = "suv";
      categoryLabel = "SUVs & Crossovers";
    } else if (titleLower.includes("tesla") || titleLower.includes("taycan") || titleLower.includes("electric") || titleLower.includes("ev") || titleLower.includes("hybrid")) {
      category = "electric";
      categoryLabel = "Electric & Hybrids";
    } else if (titleLower.includes("mustang") || titleLower.includes("corvette") || titleLower.includes("sports") || titleLower.includes("convertible") || titleLower.includes("m4")) {
      category = "sports";
      categoryLabel = "Sports & Convertibles";
    } else if (titleLower.includes("van") || titleLower.includes("transit") || titleLower.includes("sprinter") || titleLower.includes("truck") || titleLower.includes("commercial")) {
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
      securityDeposit: (r as any).security_deposit ? Number((r as any).security_deposit) : undefined,
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
    <div className="min-h-screen surface-base">
      {/* Hero Header */}
      <div className="relative overflow-hidden surface-raised border-b border-subtle pt-8">
        <div className="absolute inset-0 gradient-hero opacity-75" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-debford py-12 relative z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-slate-300">Vehicle Rentals</span>
          </div>

          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Insurance & 24/7 Roadside Assistance Included</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
              Rent Exceptional Vehicles
            </h1>
            <p className="text-slate-400 text-base sm:text-lg">
              Drive on your terms. From daily city runarounds to luxury weekend escapes and commercial transport, booked instantly with verified hosts.
            </p>
          </div>

          {/* Interactive Client Component for Search, Categories & Fleet */}
          <RentalsFleetClient initialListings={combinedListings} />
        </div>
      </div>
    </div>
  );
}
