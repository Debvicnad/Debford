import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRentalListingById } from "@/lib/db/queries";
import { getRentalById } from "@/lib/data/rentals.data";
import { RentalBookingForm } from "@/components/rentals/RentalBookingForm";
import {
  Car,
  Fuel,
  Gauge,
  Calendar,
  MapPin,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  Users,
  KeyRound,
  FileText,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { rental } = await getRentalListingById(id);
  if (rental) {
    return {
      title: `${rental.title} — Debford Vehicle Rentals`,
      description: rental.description ?? "Rent this vehicle on Debford with flexible daily, weekly, and monthly rates.",
    };
  }
  const mockFound = getRentalById(id);
  if (mockFound) {
    return {
      title: `${mockFound.title} — Debford Vehicle Rentals`,
      description: mockFound.description ?? "Rent this vehicle on Debford with flexible daily, weekly, and monthly rates.",
    };
  }
  return {
    title: "Vehicle Rental — Debford",
    description: "Rent premium and everyday vehicles on Debford with flexible rates.",
  };
}

// Fallback demo rental if record is demo or not yet seeded in DB
const MOCK_RENTAL = {
  id: "demo",
  title: "2023 BMW 5 Series 530i M-Sport — Executive Rental",
  description:
    "Experience the ultimate driving machine. This immaculate 2023 BMW 530i M-Sport is offered as a premium daily and weekly rental. Perfect for executive travel, business trips, weddings, or treating yourself to high-tier German engineering. Fully insured with roadside assistance included.",
  price_per_day: 180,
  price_per_week: 1050,
  price_per_month: 3800,
  security_deposit: 1500,
  currency: "USD",
  min_age: 25,
  min_license_years: 2,
  delivery_available: true,
  delivery_fee: 45,
  pickup_location: "Manhattan, New York, NY",
  mileage_limit: "300 km/day",
  fuel_policy: "Full-to-full",
  average_rating: 4.95,
  total_bookings: 87,
  vehicle: {
    id: "v-demo",
    year: 2023,
    make_name: "BMW",
    model_name: "5 Series 530i",
    variant_name: "M-Sport Package",
    transmission: "Automatic",
    fuel_type: "Petrol",
    seats: 5,
    doors: 4,
    color: "Mineral White Metallic",
    engine_capacity: "2.0L TwinPower Turbo",
    horsepower: 248,
    images: [
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", is_primary: true },
      { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", is_primary: false },
      { url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80", is_primary: false },
    ],
    features: [
      { feature: "Apple CarPlay & Android Auto", category: "Technology" },
      { feature: "Harmon Kardon Surround Sound", category: "Audio" },
      { feature: "Heated & Ventilated Front Seats", category: "Comfort" },
      { feature: "Panoramic Sunroof", category: "Exterior" },
      { feature: "Live Traffic & Head-Up Display", category: "Safety" },
      { feature: "360° Parking Camera & Assist", category: "Safety" },
      { feature: "Adaptive Cruise Control", category: "Safety" },
      { feature: "Wireless Fast Charger", category: "Technology" },
    ],
  },
  owner: {
    id: "owner-demo",
    full_name: "Prestige Fleet NYC",
    avatar_url: null,
    average_rating: 4.98,
    verification_status: "verified",
  },
  rules: [
    "Driver must be 25+ years old with valid driving licence held for at least 2 years",
    "No smoking or vaping inside the vehicle ($250 detailing fee applies)",
    "Pets allowed with prior approval and protective seat cover",
    "Fuel policy is full-to-full (return with a full tank of premium 93+)",
    "Out-of-state travel allowed with prior host notification",
  ],
};

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { rental: dbRental } = await getRentalListingById(id);

  const mockFound = getRentalById(id);
  const r = dbRental ?? (mockFound ? {
    id: mockFound.id,
    title: mockFound.title,
    description: mockFound.description ?? "Immaculate condition, fully verified and insured with 24/7 roadside assistance.",
    price_per_day: mockFound.pricePerDay,
    price_per_week: mockFound.pricePerWeek ?? mockFound.pricePerDay * 6,
    price_per_month: mockFound.pricePerMonth ?? mockFound.pricePerDay * 22,
    security_deposit: mockFound.securityDeposit ?? 1000,
    currency: mockFound.currency ?? "USD",
    min_age: 25,
    min_license_years: 2,
    delivery_available: mockFound.deliveryAvailable,
    delivery_fee: mockFound.deliveryFee ?? 45,
    pickup_location: mockFound.location,
    mileage_limit: "300 km/day",
    fuel_policy: "Full-to-full",
    average_rating: mockFound.rating,
    total_bookings: mockFound.bookings,
    vehicle: {
      id: `v-${mockFound.id}`,
      year: mockFound.year,
      make_name: mockFound.title.split(" ")[0],
      model_name: mockFound.title.split(" ").slice(1).join(" "),
      variant_name: mockFound.categoryLabel,
      transmission: mockFound.transmission,
      fuel_type: mockFound.fuelType,
      seats: mockFound.seats,
      doors: mockFound.doors ?? 4,
      color: mockFound.color ?? "Metallic",
      engine_capacity: "Turbocharged",
      horsepower: mockFound.horsepower ?? 250,
      images: [
        { url: mockFound.imageUrl, is_primary: true },
      ],
      features: (mockFound.features ?? []).map((f) => ({ feature: f, category: "Features" })),
    },
    owner: {
      id: "owner-verified",
      full_name: "Debford Verified Fleet",
      avatar_url: null,
      average_rating: 4.98,
      verification_status: "verified",
    },
    rules: [
      "Driver must be 25+ years old with valid driving licence held for at least 2 years",
      "No smoking or vaping inside the vehicle ($250 detailing fee applies)",
      "Fuel policy is full-to-full (return with a full tank of specified fuel)",
      "Out-of-state travel allowed with prior host notification",
    ],
  } : MOCK_RENTAL);

  // Normalized vehicle data
  const v = r.vehicle ?? {
    year: 2023,
    make_name: "Premium",
    model_name: "Vehicle",
    transmission: "Automatic",
    fuel_type: "Petrol",
    seats: 5,
    doors: 4,
    color: "Dark Metallic",
    engine_capacity: "2.0L Turbo",
    horsepower: 250,
    images: [],
    features: [],
  };

  const images = (v.images && v.images.length > 0)
    ? v.images
    : [{ url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", is_primary: true }];

  const features = (v.features && v.features.length > 0)
    ? v.features.map((f: any) => (typeof f === "string" ? f : f.feature))
    : [
        "Apple CarPlay & Android Auto",
        "Heated Front Seats",
        "Panoramic Sunroof",
        "Backup & 360° Camera",
        "Adaptive Cruise Control",
        "Bluetooth & Wireless Audio",
      ];

  const rules = (r as any).rules ?? [
    `Driver must be ${r.min_age || 25}+ years old with a valid driver's license`,
    "Strictly no smoking inside the vehicle",
    "Return vehicle with the same fuel level as received (Full-to-Full)",
    "Clean vehicle interior upon return",
  ];

  const currency = r.currency ?? "USD";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(n);

  const owner = r.owner ?? {
    id: "host-default",
    full_name: "Verified Host",
    average_rating: 5.0,
    verification_status: "verified",
  };

  return (
    <div className="min-h-screen surface-base pt-16">
      {/* Breadcrumb bar */}
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <Link href="/rentals" className="hover:text-slate-300 transition-colors">Vehicle Rentals</Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-300 truncate max-w-md">{r.title}</span>
        </div>
      </div>

      <div className="container-debford py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image Header */}
            <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl overflow-hidden border border-white/10 group shadow-2xl">
              <Image
                src={images[0].url}
                alt={r.title}
                fill
                priority
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              <div className="absolute top-4 left-4 flex gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600/90 text-white rounded-full backdrop-blur-md shadow-lg">
                  ⭐ {Number(r.average_rating ?? 4.9).toFixed(1)} · {r.total_bookings ?? 0} trips
                </span>
                {r.delivery_available && (
                  <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-500/80 text-white rounded-full backdrop-blur-md shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" /> Delivery Available
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-blue-400 font-bold block mb-1">
                    {v.year} {v.make_name} {v.model_name}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{r.title}</h1>
                </div>
              </div>
            </div>

            {/* Image Gallery Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img: any, i: number) => (
                  <div
                    key={i}
                    className={`relative shrink-0 w-28 h-20 bg-slate-900 rounded-xl overflow-hidden border ${
                      i === 0 ? "border-blue-500 ring-2 ring-blue-500/30" : "border-white/10"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Quick Specs Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Pickup Location", value: r.pickup_location ?? "Available on Request", icon: MapPin },
                { label: "Minimum Age", value: `${r.min_age ?? 25}+ years old`, icon: ShieldCheck },
                { label: "Security Deposit", value: fmt(r.security_deposit ?? 500), icon: KeyRound },
                { label: "Fuel Policy", value: (r as any).fuel_policy ?? "Full-to-Full", icon: Fuel },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="glass rounded-xl border border-white/10 p-3.5">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <Icon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{item.label}</span>
                    </div>
                    <div className="text-sm font-semibold text-white truncate">{item.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Vehicle Specifications */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />
                Vehicle Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Make & Model", value: `${v.make_name ?? ""} ${v.model_name ?? ""}` },
                  { label: "Year", value: v.year ?? "N/A" },
                  { label: "Transmission", value: v.transmission ?? "Automatic" },
                  { label: "Fuel Type", value: v.fuel_type ?? "Petrol" },
                  { label: "Seats & Doors", value: `${v.seats ?? 5} Seats · ${v.doors ?? 4} Doors` },
                  { label: "Engine / Power", value: `${v.engine_capacity ?? "2.0L"} · ${v.horsepower ?? 250} HP` },
                  { label: "Exterior Color", value: v.color ?? "Standard" },
                  { label: "Mileage Allowance", value: (r as any).mileage_limit ?? "300 km/day" },
                  { label: "Instant Booking", value: r.is_instant_book !== false ? "Enabled" : "Manual Host Approval" },
                ].map((spec) => (
                  <div key={spec.label} className="p-3 bg-[#131b2e]/60 rounded-xl border border-white/5">
                    <div className="text-[11px] text-slate-500 mb-0.5">{spec.label}</div>
                    <div className="text-xs font-semibold text-white">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Included Features */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Included Amenities & Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feat: string) => (
                  <div key={feat} className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About / Description */}
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                About this Rental
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                {r.description ?? "Experience premium travel with this well-maintained rental vehicle. Serviced and sanitized before every booking."}
              </p>
            </div>

            {/* Rental Rules & Requirements */}
            <div className="glass rounded-2xl border border-amber-500/20 p-6 space-y-3 bg-amber-500/5">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Rental Requirements & Rules
              </h2>
              <ul className="space-y-2">
                {rules.map((rule: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Host Details */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Your Verified Host
              </h2>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/20">
                    {(owner.full_name ?? "Host").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{owner.full_name ?? "Verified Host"}</span>
                      {owner.verification_status === "verified" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ⭐ {Number(owner.average_rating ?? 5.0).toFixed(1)} Host Rating · Responsive & Trusted
                    </p>
                  </div>
                </div>

                <Link
                  href={`/messages?seller=${owner.id}&listing=${r.id}`}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Message Host</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Booking Form */}
          <div>
            <div className="sticky top-20 space-y-4">
              <div className="glass rounded-2xl border border-white/15 p-6 shadow-2xl backdrop-blur-xl">
                {/* Rate Header */}
                <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-white">{fmt(r.price_per_day)}</span>
                      <span className="text-slate-400 text-xs font-medium">/ day</span>
                    </div>
                    {r.price_per_week && (
                      <div className="text-[11px] text-emerald-400 mt-0.5">
                        Weekly rate: {fmt(r.price_per_week)} ({fmt(r.price_per_week / 7)}/day)
                      </div>
                    )}
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/25 rounded-xl">
                    Instant Book
                  </span>
                </div>

                {/* Booking Client Component */}
                <RentalBookingForm
                  rentalId={r.id}
                  pricePerDay={r.price_per_day}
                  pricePerWeek={r.price_per_week ?? undefined}
                  pricePerMonth={r.price_per_month ?? undefined}
                  currency={currency}
                  deliveryAvailable={r.delivery_available}
                  deliveryFee={(r as any).delivery_fee ?? 45}
                />
              </div>

              {/* Host Guarantee Badge */}
              <div className="glass rounded-2xl border border-white/5 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Debford Renter Protection</span>
                  <span className="text-slate-400 text-[11px]">24/7 Roadside Assistance & Verified Vehicle Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
