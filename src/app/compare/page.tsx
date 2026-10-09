import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import {
  Scale,
  ChevronRight,
  ShieldCheck,
  Zap,
  Gauge,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  Trophy,
  Fuel,
  Settings,
  Car,
  DollarSign,
  Star,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Side-by-Side Engineering Matrix — Debford",
  description: "Direct mechanical telemetry comparison of performance sports cars, supercars, and luxury transports on Debford.",
};

interface CompareVehicle {
  id: string;
  title: string;
  badge: string;
  price: number;
  currency: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  specs: {
    // Powertrain & Performance
    "Horsepower": { value: string; num: number; unit: "hp" };
    "Torque": { value: string; num: number; unit: "Nm" };
    "0-100 km/h Sprint": { value: string; num: number; unit: "s"; lowerIsBetter: boolean };
    "Top Speed": { value: string; num: number; unit: "km/h" };
    "Engine Architecture": { value: string };
    "Displacement": { value: string };
    "Transmission": { value: string };
    "Drivetrain Layout": { value: string };

    // Chassis & Economics
    "Curb Weight": { value: string; num: number; unit: "kg"; lowerIsBetter: boolean };
    "Odometer Mileage": { value: string };
    "Fuel Economy": { value: string };
    "Inspection Certification": { value: string };
    "Escrow Protection": { value: string };
    "Warranty Remaining": { value: string };
  };
  features: string[];
}

const COMPARISON_DATA: CompareVehicle[] = [
  {
    id: "porsche-gt3-rs",
    title: "2023 Porsche 911 GT3 RS",
    badge: "Track Benchmark",
    price: 248500,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    reviews: 142,
    specs: {
      "Horsepower": { value: "518 hp", num: 518, unit: "hp" },
      "Torque": { value: "465 Nm", num: 465, unit: "Nm" },
      "0-100 km/h Sprint": { value: "3.2 sec", num: 3.2, unit: "s", lowerIsBetter: true },
      "Top Speed": { value: "296 km/h", num: 296, unit: "km/h" },
      "Engine Architecture": { value: "Naturally Aspirated Boxer-6" },
      "Displacement": { value: "4.0 Liters" },
      "Transmission": { value: "7-Speed Dual-Clutch PDK" },
      "Drivetrain Layout": { value: "Rear-Engine, RWD" },
      "Curb Weight": { value: "1,450 kg", num: 1450, unit: "kg", lowerIsBetter: true },
      "Odometer Mileage": { value: "4,200 km" },
      "Fuel Economy": { value: "13.4 L / 100 km" },
      "Inspection Certification": { value: "99/100 (Grade A+)" },
      "Escrow Protection": { value: "Full Depository Custody" },
      "Warranty Remaining": { value: "24 Months Factory" },
    },
    features: [
      "Carbon Ceramic Brakes (PCCB)",
      "Active Aerodynamic Drag Reduction (DRS)",
      "Front Axle Lift System",
      "Full Carbon Bucket Seats",
      "Sport Chrono Package with Lap Trigger",
      "Titanium Roll Cage",
      "Apple CarPlay & PCM Navigation",
      "Bose Surround Audio",
    ],
  },
  {
    id: "bmw-m4-competition",
    title: "2022 BMW M4 Competition (G82)",
    badge: "Twin-Turbo Weapon",
    price: 78900,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 218,
    specs: {
      "Horsepower": { value: "503 hp", num: 503, unit: "hp" },
      "Torque": { value: "650 Nm", num: 650, unit: "Nm" },
      "0-100 km/h Sprint": { value: "3.8 sec", num: 3.8, unit: "s", lowerIsBetter: true },
      "Top Speed": { value: "290 km/h", num: 290, unit: "km/h" },
      "Engine Architecture": { value: "3.0L Twin-Turbo Inline-6 (S58)" },
      "Displacement": { value: "3.0 Liters" },
      "Transmission": { value: "8-Speed M Steptronic" },
      "Drivetrain Layout": { value: "Front-Mid, RWD" },
      "Curb Weight": { value: "1,725 kg", num: 1725, unit: "kg", lowerIsBetter: true },
      "Odometer Mileage": { value: "18,400 km" },
      "Fuel Economy": { value: "10.2 L / 100 km" },
      "Inspection Certification": { value: "97/100 (Grade A)" },
      "Escrow Protection": { value: "Full Depository Custody" },
      "Warranty Remaining": { value: "12 Months Certified Pre-Owned" },
    },
    features: [
      "M Carbon Ceramic Brakes",
      "M Drive Professional with Drift Analyser",
      "Adaptive M Suspension",
      "Carbon Fiber Roof",
      "Head-Up Display with Track Mode",
      "Harman Kardon Premium Sound",
      "Apple CarPlay & Android Auto",
      "Laserlight Headlamps",
    ],
  },
  {
    id: "amg-gt-black-series",
    title: "2023 Mercedes-AMG GT Black Series",
    badge: "Affalterbach Flagship",
    price: 325000,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 89,
    specs: {
      "Horsepower": { value: "720 hp", num: 720, unit: "hp" },
      "Torque": { value: "800 Nm", num: 800, unit: "Nm" },
      "0-100 km/h Sprint": { value: "3.1 sec", num: 3.1, unit: "s", lowerIsBetter: true },
      "Top Speed": { value: "325 km/h", num: 325, unit: "km/h" },
      "Engine Architecture": { value: "4.0L Flat-Plane Crank V8 Biturbo" },
      "Displacement": { value: "4.0 Liters" },
      "Transmission": { value: "7-Speed AMG SPEEDSHIFT DCT" },
      "Drivetrain Layout": { value: "Front-Mid, Transaxle RWD" },
      "Curb Weight": { value: "1,540 kg", num: 1540, unit: "kg", lowerIsBetter: true },
      "Odometer Mileage": { value: "1,800 km" },
      "Fuel Economy": { value: "12.8 L / 100 km" },
      "Inspection Certification": { value: "99/100 (Grade A+)" },
      "Escrow Protection": { value: "Full Depository Custody" },
      "Warranty Remaining": { value: "36 Months Factory" },
    },
    features: [
      "AMG High-Performance Ceramic Composite",
      "Two-Stage Adjustable Carbon Rear Aerofoil",
      "AMG RIDE CONTROL Coilover Suspension",
      "Carbon Fiber Bucket Racing Seats",
      "AMG Track Pace Telemetry Logger",
      "Carbon Fiber Torque Tube",
      "Burmester High-End 3D Surround Sound",
      "Full Carbon Aero Underbody Diffuser",
    ],
  },
];

const TELEMETRY_RIBBON = [
  { label: "Engineering Telemetry", value: "20-Point Matrix", icon: Settings, color: "text-blue-400" },
  { label: "Real-Time Deltas", value: "Performance Highlighting", icon: Zap, color: "text-amber-400" },
  { label: "Escrow Compatibility", value: "100% Guaranteed", icon: ShieldCheck, color: "text-emerald-400" },
  { label: "Inspection Vault", value: "Verified Diagnostic Sync", icon: Trophy, color: "text-purple-400" },
];

const ALL_FEATURES_CHECKLIST = [
  "Carbon Ceramic Brakes",
  "Active Aerodynamic Drag Reduction / Wing",
  "Front Axle Lift System",
  "Carbon Fiber Bucket Racing Seats",
  "Track Telemetry & Lap Timer Package",
  "Adaptive Dynamic Suspension",
  "Head-Up Display with Track Mode",
  "Premium High-End Audio (Bose / Burmester / Harman)",
  "Apple CarPlay & Wireless Smartphone Sync",
];

export default function ComparePage() {
  const vehicles = COMPARISON_DATA;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ backgroundColor: "#06090e" }}>
      <Navbar />

      {/* Top Breadcrumb Scrim */}
      <div
        className="border-b relative"
        style={{
          borderColor: "rgba(255, 255, 255, 0.06)",
          backgroundColor: "#080c14",
        }}
      >
        <div className="container-debford py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/vehicles" className="hover:text-slate-300 transition-colors">Vehicles</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-300 font-medium">Side-by-Side Engineering Matrix</span>
          </div>

          <span className="text-xs text-blue-400 font-mono font-bold bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
            {vehicles.length} Machines Active
          </span>
        </div>
      </div>

      {/* Telemetry Status Ribbon */}
      <div
        className="border-b"
        style={{
          borderColor: "rgba(255, 255, 255, 0.05)",
          backgroundColor: "rgba(8, 12, 20, 0.6)",
        }}
      >
        <div className="container-debford py-3.5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TELEMETRY_RIBBON.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">{m.value}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{m.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="container-debford py-8 flex-1 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Multi-Machine Precision Benchmark</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Vehicle Engineering Matrix
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Direct telemetry comparison of horsepower, torque, sprint speed, curb weight, and factory equipment.
            </p>
          </div>

          <Link
            href="/vehicles"
            className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
          >
            <Car className="w-3.5 h-3.5 text-blue-400" />
            <span>Select Different Machines</span>
          </Link>
        </div>

        {/* ── Top Vehicle Showroom Header Stage ── */}
        <div className="overflow-x-auto pb-4 mb-8 scrollbar-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-w-[700px]">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-3xl border p-5 transition-all relative group overflow-hidden"
                style={{
                  backgroundColor: "rgba(13, 18, 31, 0.8)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* 16:9 Photography */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-4 border border-white/10">
                  <Image
                    src={v.imageUrl}
                    alt={v.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                    {v.badge}
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-amber-400">★</span>
                    <strong className="text-white font-bold">{v.rating}</strong>
                    <span>({v.reviews} owner verified reviews)</span>
                  </div>
                  <h3 className="text-base font-black text-white truncate">
                    {v.title}
                  </h3>
                  <div className="text-2xl font-black text-blue-400 font-mono pt-0.5">
                    {fmt(v.price)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <Link
                    href={`/checkout?type=vehicle&id=${v.id}`}
                    className="py-2.5 text-center text-white text-xs font-bold rounded-xl shadow-md transition-all hover:opacity-95 flex items-center justify-center gap-1"
                    style={{
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    }}
                  >
                    <span>Reserve Vault</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/vehicles/${v.id}`}
                    className="py-2.5 text-center text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                  >
                    Showroom
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 20-Point Mechanical Specs Matrix ── */}
        <div
          className="rounded-3xl border overflow-hidden mb-8 shadow-2xl"
          style={{
            backgroundColor: "rgba(13, 18, 31, 0.75)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-400" />
              1. Powertrain & Engineering Telemetry
            </h2>
            <span className="text-[11px] text-emerald-400 font-mono font-semibold">
              Peak Metrics Highlighted
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px] divide-y divide-white/5">
              {[
                "Horsepower",
                "Torque",
                "0-100 km/h Sprint",
                "Top Speed",
                "Engine Architecture",
                "Displacement",
                "Transmission",
                "Drivetrain Layout",
                "Curb Weight",
                "Odometer Mileage",
                "Fuel Economy",
                "Inspection Certification",
                "Escrow Protection",
                "Warranty Remaining",
              ].map((specKey, sIdx) => {
                // Calculate winning metric if numerical
                const numValues = vehicles
                  .map((v) => (v.specs as any)[specKey]?.num)
                  .filter((n) => typeof n === "number");

                const lowerIsBetter = (vehicles[0].specs as any)[specKey]?.lowerIsBetter ?? false;
                const bestNum = numValues.length === vehicles.length
                  ? lowerIsBetter ? Math.min(...numValues) : Math.max(...numValues)
                  : null;

                return (
                  <div
                    key={specKey}
                    className={`grid grid-cols-4 items-center px-6 py-3.5 text-xs transition-colors ${
                      sIdx % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                    } hover:bg-white/[0.02]`}
                  >
                    <div className="font-semibold text-slate-400 text-xs flex items-center gap-1.5">
                      <span>{specKey}</span>
                    </div>

                    {vehicles.map((v) => {
                      const sp = (v.specs as any)[specKey];
                      const isBest = bestNum !== null && sp?.num === bestNum;

                      return (
                        <div key={v.id} className="pr-4">
                          <span
                            className={`font-mono text-xs ${
                              isBest
                                ? "text-emerald-400 font-black flex items-center gap-1"
                                : "text-slate-200 font-medium"
                            }`}
                          >
                            {sp?.value ?? "—"}
                            {isBest && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Best
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Factory Options & Equipment Checklist ── */}
        <div
          className="rounded-3xl border overflow-hidden shadow-2xl"
          style={{
            backgroundColor: "rgba(13, 18, 31, 0.75)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              2. Factory Options & Installed Packages
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Direct OE Build Sheet Match
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px] divide-y divide-white/5">
              {ALL_FEATURES_CHECKLIST.map((feat, fIdx) => (
                <div
                  key={feat}
                  className={`grid grid-cols-4 items-center px-6 py-3.5 text-xs transition-colors ${
                    fIdx % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                  } hover:bg-white/[0.02]`}
                >
                  <div className="font-semibold text-slate-400 text-xs">
                    {feat}
                  </div>

                  {vehicles.map((v) => {
                    const has = v.features.some((f) =>
                      f.toLowerCase().includes(feat.split(" ")[0].toLowerCase()) ||
                      feat.toLowerCase().includes(f.split(" ")[0].toLowerCase())
                    );

                    return (
                      <div key={v.id} className="pr-4">
                        {has ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Installed</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono text-sm">
                            —
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
