"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import { useSellStore, type ListingType, type VehicleTypeSlug } from "@/stores/sell.store";
import { Loader2, CheckCircle2, AlertCircle, Zap } from "lucide-react";

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
  { icon: "🚗", label: "Car",       value: "car" },
  { icon: "🏍️", label: "Moto",      value: "motorcycle" },
  { icon: "🚛", label: "Truck",     value: "truck" },
  { icon: "🚐", label: "Van",       value: "van" },
  { icon: "🚌", label: "Bus",       value: "bus" },
  { icon: "🚎", label: "RV",        value: "rv" },
  { icon: "🚜", label: "Heavy",     value: "heavy-equipment" },
  { icon: "⛵", label: "Boat",      value: "boat" },
] as const;

/** Maps NHTSA result variable names to our form field names */
const NHTSA_MAP: Record<string, string> = {
  Make:                   "make",
  Model:                  "model",
  "Model Year":           "year",
  "Body Class":           "bodyType",
  "Fuel Type - Primary":  "fuelType",
  "Transmission Style":   "transmission",
  "Engine Displacement (L)": "engineSize",
  "Drive Type":           "driveType",
  "Number of Doors":      "doors",
  "Engine Number of Cylinders": "engineCylinders",
};

interface DecodedField {
  field: string;
  label: string;
  value: string;
}

interface Props { onNext: () => void }

export function Step1VehicleInfo({ onNext }: Props) {
  const { data, updateData } = useSellStore();
  const formRef = useRef<HTMLFormElement>(null);

  const [vinInput, setVinInput] = useState(data.vin ?? "");
  const [isDecoding, startDecoding] = useTransition();
  const [decodedFields, setDecodedFields] = useState<DecodedField[]>([]);
  const [decodeStatus, setDecodeStatus] = useState<"idle" | "success" | "error">("idle");
  const [decodeError, setDecodeError] = useState("");
  // Track which form fields were populated by the decoder so we can highlight them
  const [decodedKeys, setDecodedKeys] = useState<Set<string>>(new Set());

  const handleDecodeVin = useCallback(() => {
    const vin = vinInput.trim().toUpperCase();
    if (vin.length !== 17) {
      setDecodeError("Please enter a valid 17-character VIN number.");
      setDecodeStatus("error");
      return;
    }

    setDecodeStatus("idle");
    setDecodeError("");

    startDecoding(async () => {
      try {
        const res = await fetch(
          `https://vpic.api.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
        );
        if (!res.ok) throw new Error("API unavailable");
        const json = await res.json();

        const results: Array<{ Variable: string; Value: string | null }> =
          json.Results ?? [];

        const filled: DecodedField[] = [];
        const patch: Record<string, string> = {};
        const keys = new Set<string>();

        for (const result of results) {
          const ourKey = NHTSA_MAP[result.Variable];
          if (ourKey && result.Value && result.Value !== "Not Applicable" && result.Value.trim()) {
            let val = result.Value.trim();
            // Normalise transmission
            if (ourKey === "transmission") {
              val = val.toLowerCase().includes("auto") ? "Automatic" : "Manual";
            }
            // Normalise fuel type
            if (ourKey === "fuelType") {
              if (val.toLowerCase().includes("electric")) val = "Electric";
              else if (val.toLowerCase().includes("hybrid")) val = "Hybrid";
              else if (val.toLowerCase().includes("diesel")) val = "Diesel";
              else val = "Petrol";
            }
            patch[ourKey] = val;
            keys.add(ourKey);
            filled.push({
              field: ourKey,
              label: result.Variable,
              value: val,
            });
          }
        }

        if (filled.length === 0) {
          setDecodeError("VIN decoded but no standard vehicle data was found. It may be a non-US spec or pre-1981 vehicle.");
          setDecodeStatus("error");
          return;
        }

        // Apply decoded data to the store and update form inputs
        patch.vin = vin;
        patch.vinDecoded = true as any;
        updateData(patch as any);
        setDecodedFields(filled);
        setDecodedKeys(keys);
        setDecodeStatus("success");

        // Sync visible form fields in the DOM
        if (formRef.current) {
          const form = formRef.current;
          for (const [key, val] of Object.entries(patch)) {
            const el = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | null;
            if (el) el.value = val;
          }
        }
      } catch {
        setDecodeError("Could not reach the VIN lookup service. Please check your internet connection.");
        setDecodeStatus("error");
      }
    });
  }, [vinInput, updateData]);

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

  function fieldClass(name: string) {
    const base =
      "w-full px-4 py-3 surface-base border rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none transition-colors";
    const highlighted = decodedKeys.has(name)
      ? "border-emerald-500/50 bg-emerald-500/5 focus:border-emerald-400"
      : "border-white/10 focus:border-blue-500";
    return `${base} ${highlighted}`;
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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

      {/* VIN with decoder */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          VIN
          <span className="ml-2 text-xs text-slate-500">(17 characters — auto-fills make, model, specs)</span>
        </label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              name="vin"
              maxLength={17}
              value={vinInput}
              onChange={(e) => {
                setVinInput(e.target.value.toUpperCase());
                setDecodeStatus("idle");
              }}
              placeholder="e.g. 1HGBH41JXMN109186"
              className={`${fieldClass("vin")} font-mono pr-10`}
            />
            {vinInput.length > 0 && (
              <span
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${
                  vinInput.length === 17 ? "text-emerald-400" : "text-slate-600"
                }`}
              >
                {vinInput.length}/17
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleDecodeVin}
            disabled={isDecoding || vinInput.trim().length !== 17}
            className="px-4 py-3 rounded-xl gradient-brand text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {isDecoding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{isDecoding ? "Decoding…" : "Decode VIN"}</span>
          </button>
        </div>

        {/* Decode success banner */}
        {decodeStatus === "success" && decodedFields.length > 0 && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>VIN decoded — {decodedFields.length} fields auto-populated below</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {decodedFields.map((f) => (
                <span
                  key={f.field}
                  className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium"
                >
                  {f.label}: {f.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Decode error */}
        {decodeStatus === "error" && (
          <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{decodeError}</span>
          </div>
        )}
      </div>

      {/* Make / Model / Year */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Make <span className="text-rose-400">*</span>
            {decodedKeys.has("make") && <span className="ml-1.5 text-[10px] text-emerald-400 font-bold">✓ Auto-filled</span>}
          </label>
          <select
            name="make"
            required
            defaultValue={data.make ?? ""}
            className={`${fieldClass("make")} bg-transparent`}
          >
            <option value="">Select make…</option>
            {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Model <span className="text-rose-400">*</span>
            {decodedKeys.has("model") && <span className="ml-1.5 text-[10px] text-emerald-400 font-bold">✓ Auto-filled</span>}
          </label>
          <input
            name="model"
            required
            defaultValue={data.model ?? ""}
            placeholder="e.g. Camry"
            className={fieldClass("model")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Year <span className="text-rose-400">*</span>
            {decodedKeys.has("year") && <span className="ml-1.5 text-[10px] text-emerald-400 font-bold">✓ Auto-filled</span>}
          </label>
          <input
            name="year"
            type="number"
            required
            min={1886}
            max={new Date().getFullYear() + 2}
            defaultValue={data.year ?? ""}
            placeholder="2023"
            className={fieldClass("year")}
          />
        </div>
      </div>

      {/* Variant */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Variant / Trim</label>
        <input
          name="variant"
          defaultValue={data.variant ?? ""}
          placeholder="e.g. SE 2.5L, xDrive40i"
          className={fieldClass("variant")}
        />
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
            className={`${fieldClass("condition")} bg-transparent`}
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
              className={`${fieldClass("mileage")} flex-1`}
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
            className={fieldClass("color")}
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
            className={fieldClass("location")}
          />
        </div>
      </div>

      {/* Registration plate */}
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
