"use client";

import { useSellStore } from "@/stores/sell.store";

const FEATURES_BY_CATEGORY: Record<string, string[]> = {
  Safety: [
    "Lane Departure Warning", "Blind Spot Monitor", "Pre-Collision System",
    "Rear Cross Traffic Alert", "Adaptive Cruise Control", "Automatic Emergency Braking",
    "360° Camera", "Parking Sensors",
  ],
  Comfort: [
    "Heated Front Seats", "Heated Rear Seats", "Ventilated Seats",
    "Dual Zone Climate Control", "Tri-Zone Climate Control", "Power Moonroof",
    "Panoramic Roof", "Power Tailgate", "Heated Steering Wheel",
  ],
  Technology: [
    "Apple CarPlay", "Android Auto", "Built-in Navigation",
    "Head-Up Display", "Wi-Fi Hotspot", "Premium Audio",
    "Wireless Charging", "Digital Instrument Cluster",
  ],
  Exterior: [
    "LED Headlights", "Adaptive Headlights", "Alloy Wheels",
    "Running Boards", "Roof Rails", "Tow Package", "Rear Spoiler",
  ],
  Performance: [
    "Sport Mode", "Launch Control", "Air Suspension",
    "Limited Slip Differential", "Performance Brakes", "Turbo / Supercharged",
  ],
};

interface Props { onNext: () => void; onBack: () => void }

export function Step2Specs({ onNext, onBack }: Props) {
  const { data, updateData, toggleFeature } = useSellStore();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateData({
      fuelType: fd.get("fuelType") as string,
      transmission: fd.get("transmission") as string,
      engineSize: fd.get("engineSize") as string,
      engineCylinders: fd.get("engineCylinders") as string,
      powerHp: fd.get("powerHp") as string,
      torqueNm: fd.get("torqueNm") as string,
      driveType: fd.get("driveType") as string,
      doors: fd.get("doors") as string,
      seats: fd.get("seats") as string,
      bodyType: fd.get("bodyType") as string,
      interiorColor: fd.get("interiorColor") as string,
      description: fd.get("description") as string,
    });
    onNext();
  }

  const selected = data.selectedFeatures ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Powertrain */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Powertrain
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Fuel Type</label>
            <select
              name="fuelType"
              defaultValue={data.fuelType ?? ""}
              className="w-full px-3 py-2.5 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 bg-transparent"
            >
              <option value="">Select…</option>
              {["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid", "LPG", "CNG", "Hydrogen"].map(
                (o) => <option key={o} value={o.toLowerCase()}>{o}</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Transmission</label>
            <select
              name="transmission"
              defaultValue={data.transmission ?? ""}
              className="w-full px-3 py-2.5 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 bg-transparent"
            >
              <option value="">Select…</option>
              {["Automatic", "Manual", "Semi-Automatic", "CVT", "DCT"].map(
                (o) => <option key={o} value={o.toLowerCase().replace(/\s/g, "_")}>{o}</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Drive Type</label>
            <select
              name="driveType"
              defaultValue={data.driveType ?? ""}
              className="w-full px-3 py-2.5 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 bg-transparent"
            >
              <option value="">Select…</option>
              {["FWD", "RWD", "AWD", "4WD"].map(
                (o) => <option key={o} value={o.toLowerCase()}>{o}</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Engine Size (L)</label>
            <input
              name="engineSize"
              type="number"
              step="0.1"
              min="0"
              max="20"
              defaultValue={data.engineSize ?? ""}
              placeholder="e.g. 2.5"
              className="w-full px-3 py-2.5 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Power (hp)</label>
            <input
              name="powerHp"
              type="number"
              min="0"
              defaultValue={data.powerHp ?? ""}
              placeholder="e.g. 203"
              className="w-full px-3 py-2.5 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Torque (Nm)</label>
            <input
              name="torqueNm"
              type="number"
              min="0"
              defaultValue={data.torqueNm ?? ""}
              placeholder="e.g. 350"
              className="w-full px-3 py-2.5 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Body
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Body Type</label>
            <select
              name="bodyType"
              defaultValue={data.bodyType ?? ""}
              className="w-full px-3 py-2.5 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 bg-transparent"
            >
              <option value="">Select…</option>
              {["Sedan", "SUV", "Coupe", "Hatchback", "Pickup Truck", "Convertible", "Wagon", "Minivan", "Crossover"].map(
                (o) => <option key={o} value={o.toLowerCase().replace(/\s/g, "_")}>{o}</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Doors</label>
            <select
              name="doors"
              defaultValue={data.doors ?? ""}
              className="w-full px-3 py-2.5 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 bg-transparent"
            >
              <option value="">—</option>
              {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Seats</label>
            <select
              name="seats"
              defaultValue={data.seats ?? ""}
              className="w-full px-3 py-2.5 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 bg-transparent"
            >
              <option value="">—</option>
              {[2, 4, 5, 6, 7, 8, 9, 12, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Interior Color</label>
            <input
              name="interiorColor"
              defaultValue={data.interiorColor ?? ""}
              placeholder="e.g. Black"
              className="w-full px-3 py-2.5 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Features & Equipment
        </h3>
        <p className="text-xs text-slate-600 mb-4">Select all that apply</p>
        <div className="space-y-5">
          {Object.entries(FEATURES_BY_CATEGORY).map(([category, features]) => (
            <div key={category}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {category}
              </div>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => {
                  const isOn = selected.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                        isOn
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                          : "surface-base border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300"
                      }`}
                    >
                      {isOn && <span className="mr-1">✓</span>}
                      {feature}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {selected.length > 0 && (
          <p className="text-xs text-blue-400 mt-3">
            {selected.length} feature{selected.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
          <span className="ml-2 text-xs text-slate-600">(recommended — increases inquiries)</span>
        </label>
        <textarea
          name="description"
          rows={5}
          defaultValue={data.description ?? ""}
          placeholder="Describe the vehicle's condition, history, unique features, and any recent work done..."
          className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
        />
        <p className="text-xs text-slate-600 mt-1.5">
          Listings with detailed descriptions receive 2× more inquiries
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/8">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="px-8 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
        >
          Next: Photos →
        </button>
      </div>
    </form>
  );
}
