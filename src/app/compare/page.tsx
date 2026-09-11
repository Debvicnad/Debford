import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Compare Vehicles",
  description: "Compare up to 3 vehicles side-by-side on Debford.",
};

const MOCK_VEHICLES = [
  {
    id: "v1", title: "2023 Toyota Camry SE", price: 32000, currency: "USD",
    specs: {
      Year: "2023", Make: "Toyota", Model: "Camry SE", Mileage: "12,000 km",
      Fuel: "Petrol", Transmission: "Automatic", Engine: "2.5L 4-Cylinder",
      Power: "203 hp", Torque: "252 Nm", "Drive Type": "FWD",
      Doors: "4", Seats: "5", Color: "Midnight Black", Condition: "Used",
    },
    features: ["Apple CarPlay", "Android Auto", "Lane Departure Warning", "Adaptive Cruise Control", "Heated Seats", "Dual Zone Climate Control", "LED Headlights"],
    rating: 4.8, reviews: 412,
  },
  {
    id: "v2", title: "2023 Honda Accord Sport", price: 34500, currency: "USD",
    specs: {
      Year: "2023", Make: "Honda", Model: "Accord Sport", Mileage: "8,400 km",
      Fuel: "Petrol", Transmission: "CVT", Engine: "1.5L Turbo 4-Cylinder",
      Power: "192 hp", Torque: "260 Nm", "Drive Type": "FWD",
      Doors: "4", Seats: "5", Color: "Sonic Gray Pearl", Condition: "Used",
    },
    features: ["Apple CarPlay", "Android Auto", "Collision Mitigation", "Lane Keeping Assist", "Remote Start", "Wireless Charging", "Sunroof"],
    rating: 4.7, reviews: 318,
  },
  {
    id: "v3", title: "2022 Mazda 6 Grand Touring", price: 31000, currency: "USD",
    specs: {
      Year: "2022", Make: "Mazda", Model: "6 Grand Touring", Mileage: "24,000 km",
      Fuel: "Petrol", Transmission: "Automatic", Engine: "2.5L Turbo 4-Cylinder",
      Power: "227 hp", Torque: "420 Nm", "Drive Type": "FWD",
      Doors: "4", Seats: "5", Color: "Machine Gray", Condition: "Used",
    },
    features: ["Apple CarPlay", "Android Auto", "Smart Brake Support", "Radar Cruise Control", "Heated Seats", "Head-Up Display", "Bose Audio"],
    rating: 4.9, reviews: 197,
  },
];

const ALL_FEATURES = [
  "Apple CarPlay", "Android Auto", "Heated Seats", "Sunroof", "Wireless Charging",
  "Head-Up Display", "Bose Audio / Premium Audio", "Remote Start", "Lane Assist",
  "Adaptive Cruise Control", "Collision System", "LED Headlights", "Dual Zone Climate",
];

const ALL_SPECS = ["Year", "Make", "Model", "Mileage", "Fuel", "Transmission", "Engine", "Power", "Torque", "Drive Type", "Doors", "Seats", "Color", "Condition"];

type Highlight = "best" | "worst" | "equal";

function getPriceHighlight(prices: number[], i: number): Highlight {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (prices[i] === min) return "best";
  if (prices[i] === max) return "worst";
  return "equal";
}

export default function ComparePage() {
  const vehicles = MOCK_VEHICLES;
  const fmt = (price: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price);
  const prices = vehicles.map((v) => v.price);

  return (
    <div className="min-h-screen surface-base">
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-5">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/vehicles" className="hover:text-slate-300 transition-colors">Vehicles</Link>
            <span>›</span>
            <span className="text-slate-300">Compare</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Compare Vehicles</h1>
          <p className="text-slate-400 text-sm mt-1">Side-by-side comparison of specs, features, and pricing</p>
        </div>
      </div>

      <div className="container-debford py-8 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Vehicle header row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="hidden sm:block" />
            {vehicles.map((v) => (
              <div key={v.id} className="glass rounded-2xl border border-white/10 p-4 text-center">
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl mb-3 flex items-center justify-center">
                  <span className="text-5xl opacity-20">🚗</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">{v.title}</h3>
                <div className={`text-lg font-extrabold mb-1 ${
                  getPriceHighlight(prices, vehicles.indexOf(v)) === "best" ? "text-emerald-400" :
                  getPriceHighlight(prices, vehicles.indexOf(v)) === "worst" ? "text-slate-400" : "text-blue-400"
                }`}>
                  {fmt(v.price)}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-3">
                  <span className="text-amber-400">★</span>
                  <span>{v.rating}</span>
                  <span className="text-slate-700">({v.reviews})</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/vehicles/${v.id}`} className="flex-1 py-2 text-xs font-semibold gradient-brand text-white rounded-xl hover:opacity-90 transition-opacity text-center">
                    View
                  </Link>
                  <button className="flex-1 py-2 text-xs font-medium glass border border-white/10 text-slate-400 rounded-xl hover:border-white/20 hover:text-white transition-all">
                    ✕ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Specs section */}
          <div className="glass rounded-2xl border border-white/10 mb-4 overflow-hidden">
            <div className="px-5 py-3 bg-white/5 border-b border-white/8">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Specifications</h2>
            </div>
            {ALL_SPECS.map((spec, si) => (
              <div key={spec} className={`grid grid-cols-4 gap-4 px-5 py-3 border-b border-white/5 last:border-0 ${si % 2 === 0 ? "" : "bg-white/2"}`}>
                <div className="text-xs text-slate-500">{spec}</div>
                {vehicles.map((v) => (
                  <div key={v.id} className="text-xs text-slate-300">{v.specs[spec as keyof typeof v.specs] ?? "—"}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Features section */}
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-3 bg-white/5 border-b border-white/8">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Features & Equipment</h2>
            </div>
            {ALL_FEATURES.map((feature, fi) => (
              <div key={feature} className={`grid grid-cols-4 gap-4 px-5 py-3 border-b border-white/5 last:border-0 ${fi % 2 === 0 ? "" : "bg-white/2"}`}>
                <div className="text-xs text-slate-500">{feature}</div>
                {vehicles.map((v) => {
                  const has = v.features.some((f) => f.toLowerCase().includes(feature.split("/")[0].trim().toLowerCase()) || feature.toLowerCase().includes(f.toLowerCase().split(" ")[0]));
                  return (
                    <div key={v.id} className={`text-xs font-bold ${has ? "text-emerald-400" : "text-slate-700"}`}>
                      {has ? "✓" : "—"}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add vehicle */}
      {vehicles.length < 3 && (
        <div className="container-debford pb-8">
          <Link
            href="/vehicles"
            className="flex items-center justify-center gap-2 w-full py-4 glass rounded-2xl border-2 border-dashed border-white/10 text-slate-500 hover:border-blue-500/30 hover:text-blue-400 transition-all text-sm font-medium"
          >
            <span className="text-xl">+</span>
            Add another vehicle to compare
          </Link>
        </div>
      )}
    </div>
  );
}
