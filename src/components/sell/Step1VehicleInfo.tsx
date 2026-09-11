"use client";

import { useSellStore, type ListingType, type VehicleTypeSlug } from "@/stores/sell.store";

const MAKES = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW",
  "Bugatti", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge",
  "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda", "Hyundai",
  "Infiniti", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover",
  "Lexus", "Lincoln", "Maserati", "Mazda", "McLaren", "Mercedes-Benz",
  "Mini", "Mitsubishi", "Nissan", "Pagani", "Porsche", "Ram", "Rolls-Royce",
  "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo", "Other",
];

const LISTING_TYPES = [
  { value: "sale", label: "For Sale", icon: "💰", desc: "One-time sale" },
  { value: "rental", label: "For Rent", icon: "🔑", desc: "Daily / weekly" },
  { value: "auction", label: "Auction", icon: "🔨", desc: "Highest bid wins" },
] as const;

const VEHICLE_TYPES = [
  { icon: "🚗", label: "Car", value: "car" },
  { icon: "🏍️", label: "Moto", value: "motorcycle" },
  { icon: "🚛", label: "Truck", value: "truck" },
  { icon: "🚐", label: "Van", value: "van" },
  { icon: "🚌", label: "Bus", value: "bus" },
  { icon: "🚎", label: "RV", value: "rv" },
  { icon: "🚜", label: "Heavy", value: "heavy-equipment" },
  { icon: "⛵", label: "Boat", value: "boat" },
] as const;

interface Props { onNext: () => void }

export function Step1VehicleInfo({ onNext }: Props) {
  const { data, updateData, nextStep } = useSellStore();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateData({
      listingType: fd.get("listingType") as ListingType,
      vehicleType: fd.get("vehicleType") as VehicleTypeSlug,
      make: fd.get("make") as string,
      model: fd.get("model") as string,
      year: fd.get("year") as string,
      variant: fd.get("variant") as string,
      vin: fd.get("vin") as string,
      condition: fd.get("condition") as string,
      mileage: fd.get("mileage") as string,
      mileageUnit: (fd.get("mileageUnit") as "km" | "mi") ?? "km",
      color: fd.get("color") as string,
      location: fd.get("location") as string,
      registrationPlate: fd.get("registrationPlate") as string,
    });
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Listing type */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Listing type <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {LISTING_TYPES.map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input
                type="radio"
                name="listingType"
                value={opt.value}
                defaultChecked={(data.listingType ?? "sale") === opt.value}
                className="sr-only peer"
              />
              <div className="p-4 surface-base border-2 border-white/10 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all text-center">
                <div className="text-2xl mb-1">{opt.icon}</div>
                <div className="text-sm font-semibold text-white">{opt.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Vehicle type */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Vehicle type <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {VEHICLE_TYPES.map((t) => (
            <label key={t.value} className="cursor-pointer">
              <input
                type="radio"
                name="vehicleType"
                value={t.value}
                defaultChecked={(data.vehicleType ?? "car") === t.value}
                className="sr-only peer"
              />
              <div className="py-3 surface-base border-2 border-white/10 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all text-center">
                <div className="text-xl">{t.icon}</div>
                <div className="text-[10px] text-slate-500 mt-1">{t.label}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Make / Model / Year */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Make <span className="text-rose-400">*</span>
          </label>
          <select
            name="make"
            required
            defaultValue={data.make ?? ""}
            className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors bg-transparent"
          >
            <option value="">Select make…</option>
            {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Model <span className="text-rose-400">*</span>
          </label>
          <input
            name="model"
            required
            defaultValue={data.model ?? ""}
            placeholder="e.g. Camry"
            className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Year <span className="text-rose-400">*</span>
          </label>
          <input
            name="year"
            type="number"
            required
            min={1886}
            max={new Date().getFullYear() + 2}
            defaultValue={data.year ?? ""}
            placeholder="2023"
            className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Variant / VIN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Variant / Trim</label>
          <input
            name="variant"
            defaultValue={data.variant ?? ""}
            placeholder="e.g. SE 2.5L, xDrive40i"
            className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            VIN
            <span className="ml-2 text-xs text-slate-600">(boosts buyer trust)</span>
          </label>
          <input
            name="vin"
            maxLength={17}
            defaultValue={data.vin ?? ""}
            placeholder="17-character VIN"
            className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Condition / Mileage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Condition <span className="text-rose-400">*</span>
          </label>
          <select
            name="condition"
            required
            defaultValue={data.condition ?? ""}
            className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors bg-transparent"
          >
            <option value="">Select…</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="certified_pre_owned">Certified Pre-Owned</option>
            <option value="salvage">Salvage</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Mileage <span className="text-rose-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              name="mileage"
              type="number"
              required
              min={0}
              defaultValue={data.mileage ?? ""}
              placeholder="42,000"
              className="flex-1 px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <select
              name="mileageUnit"
              defaultValue={data.mileageUnit ?? "km"}
              className="w-20 px-3 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors bg-transparent"
            >
              <option value="km">km</option>
              <option value="mi">mi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Color / Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Exterior Color</label>
          <input
            name="color"
            defaultValue={data.color ?? ""}
            placeholder="e.g. Midnight Black"
            className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Location <span className="text-rose-400">*</span>
          </label>
          <input
            name="location"
            required
            defaultValue={data.location ?? ""}
            placeholder="e.g. New York, NY"
            className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Reg plate */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Registration Plate</label>
        <input
          name="registrationPlate"
          defaultValue={data.registrationPlate ?? ""}
          placeholder="ABC-1234"
          className="w-full sm:w-48 px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono"
        />
        <p className="text-xs text-slate-600 mt-1.5">Shown only to verified buyers after agreement</p>
      </div>

      <div className="flex justify-end pt-4 border-t border-white/8">
        <button
          type="submit"
          className="px-8 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
        >
          Next: Specs & Features →
        </button>
      </div>
    </form>
  );
}
