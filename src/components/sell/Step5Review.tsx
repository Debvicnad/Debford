"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSellStore } from "@/stores/sell.store";
import { createListing, getPhotoUploadUrl, saveVehicleImages } from "@/lib/actions/listing.actions";

interface Props { onBack: () => void }

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-slate-500 shrink-0 w-36">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  );
}

export function Step5Review({ onBack }: Props) {
  const { data, reset } = useSellStore();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ vehicleId: string; listingId: string | null } | null>(null);

  const listingType = data.listingType ?? "sale";
  const photoUrls = data.photoUrls ?? [];
  const highlights = data.highlights ?? [];
  const features = data.selectedFeatures ?? [];

  async function uploadPhotos(vehicleId: string): Promise<{ path: string; isPrimary: boolean; sortOrder: number }[]> {
    const files = data.photoFiles ?? [];
    if (files.length === 0) return [];

    const results: { path: string; isPrimary: boolean; sortOrder: number }[] = [];
    const primaryIndex = data.primaryPhotoIndex ?? 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const res = await getPhotoUploadUrl(vehicleId, file.name, file.type);
      if ("error" in res) continue;

      const uploadRes = await fetch(res.signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (uploadRes.ok) {
        results.push({
          path: res.path,
          isPrimary: i === primaryIndex,
          sortOrder: i,
        });
      }
    }

    return results;
  }

  function handlePublish() {
    setError(null);
    startTransition(async () => {
      // First create listing without photos to get vehicleId
      const result = await createListing({
        listingType: data.listingType ?? "sale",
        vehicleType: data.vehicleType ?? "car",
        make: data.make ?? "",
        model: data.model ?? "",
        year: parseInt(data.year ?? "0"),
        variant: data.variant,
        vin: data.vin,
        condition: data.condition ?? "used",
        mileage: data.mileage ? parseInt(data.mileage) : undefined,
        mileageUnit: data.mileageUnit ?? "km",
        color: data.color,
        location: data.location ?? "",
        registrationPlate: data.registrationPlate,
        fuelType: data.fuelType,
        transmission: data.transmission,
        engineSize: data.engineSize ? parseFloat(data.engineSize) : undefined,
        powerHp: data.powerHp ? parseInt(data.powerHp) : undefined,
        torqueNm: data.torqueNm ? parseInt(data.torqueNm) : undefined,
        driveType: data.driveType,
        doors: data.doors ? parseInt(data.doors) : undefined,
        seats: data.seats ? parseInt(data.seats) : undefined,
        bodyType: data.bodyType,
        interiorColor: data.interiorColor,
        selectedFeatures: data.selectedFeatures,
        description: data.description,
        currency: data.currency ?? "USD",
        price: data.price ? parseFloat(data.price) : undefined,
        isNegotiable: data.isNegotiable,
        pricePerDay: data.pricePerDay ? parseFloat(data.pricePerDay) : undefined,
        startingPrice: data.startingPrice ? parseFloat(data.startingPrice) : undefined,
        reservePrice: data.reservePrice ? parseFloat(data.reservePrice) : undefined,
        buyNowPrice: data.buyNowPrice ? parseFloat(data.buyNowPrice) : undefined,
        auctionStartDate: data.auctionStartDate,
        auctionEndDate: data.auctionEndDate,
        highlights: data.highlights,
        primaryPhotoIndex: data.primaryPhotoIndex,
        photoStoragePaths: [], // will re-update after upload
      });

      if ("error" in result && result.error) {
        setError(result.error as string);
        return;
      }

      // Upload photos if any, using the vehicleId and persist to database
      if (result.vehicleId && (data.photoFiles ?? []).length > 0) {
        const uploadedImages = await uploadPhotos(result.vehicleId);
        if (uploadedImages.length > 0) {
          await saveVehicleImages(result.vehicleId, uploadedImages);
        }
      }

      reset();
      setSuccess({ vehicleId: result.vehicleId!, listingId: result.listingId ?? null });
    });
  }

  // ── Success screen ─────────────────────────────────────────
  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 border border-emerald-500/30">
          🎉
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Listing submitted!</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">
          Your listing is under review. We typically approve listings within 1–2 hours.
          You&apos;ll receive an email once it&apos;s live.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/dashboard"
            className="px-6 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/garage"
            className="px-6 py-3 glass border border-white/15 text-slate-300 text-sm font-semibold rounded-xl hover:border-white/25 hover:text-white transition-all"
          >
            My Garage
          </Link>
        </div>
      </div>
    );
  }


  const priceDisplay = listingType === "sale"
    ? `${data.currency ?? "USD"} ${data.price ? Number(data.price).toLocaleString() : "—"}`
    : listingType === "rental"
    ? `${data.currency ?? "USD"} ${data.pricePerDay ?? "—"}/day`
    : `${data.currency ?? "USD"} ${data.startingPrice ? Number(data.startingPrice).toLocaleString() : "—"} starting`;

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Cover photo preview */}
      {photoUrls.length > 0 && (
        <div className="relative aspect-[16/7] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrls[data.primaryPhotoIndex ?? 0]}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 right-3 text-xs text-white/60 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            {photoUrls.length} photo{photoUrls.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Title + price */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-xl font-bold text-white">
            {data.year} {data.make} {data.model}
            {data.variant ? ` ${data.variant}` : ""}
          </h2>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            listingType === "sale"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : listingType === "rental"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          }`}>
            {listingType === "sale" ? "For Sale" : listingType === "rental" ? "Rental" : "Auction"}
          </span>
        </div>
        <div className="text-2xl font-extrabold text-blue-400 mb-3">{priceDisplay}</div>
        <p className="text-xs text-slate-500">📍 {data.location}</p>
      </div>

      {/* Details */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Vehicle Details</h3>
        <ReviewRow label="Condition" value={data.condition} />
        <ReviewRow label="Mileage" value={data.mileage ? `${Number(data.mileage).toLocaleString()} ${data.mileageUnit ?? "km"}` : undefined} />
        <ReviewRow label="Fuel Type" value={data.fuelType} />
        <ReviewRow label="Transmission" value={data.transmission} />
        <ReviewRow label="Engine" value={data.engineSize ? `${data.engineSize}L${data.powerHp ? ` · ${data.powerHp}hp` : ""}` : undefined} />
        <ReviewRow label="Body Type" value={data.bodyType} />
        <ReviewRow label="Doors / Seats" value={data.doors && data.seats ? `${data.doors} doors · ${data.seats} seats` : undefined} />
        <ReviewRow label="Color" value={data.color} />
        <ReviewRow label="VIN" value={data.vin} />
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="glass rounded-2xl border border-white/10 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Highlights</h3>
          <div className="flex flex-wrap gap-2">
            {highlights.map((h) => (
              <span key={h} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                ✓ {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Features count */}
      {features.length > 0 && (
        <div className="glass rounded-2xl border border-white/10 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Features</h3>
          <p className="text-sm text-slate-400">{features.length} features selected</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {features.slice(0, 8).map((f) => (
              <span key={f} className="px-2 py-1 text-xs surface-base border border-white/8 text-slate-400 rounded-lg">
                {f}
              </span>
            ))}
            {features.length > 8 && (
              <span className="px-2 py-1 text-xs text-slate-600">+{features.length - 8} more</span>
            )}
          </div>
        </div>
      )}

      {/* Terms */}
      <div className="px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-xl text-xs text-slate-500 leading-relaxed">
        By publishing, you agree to Debford&apos;s{" "}
        <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/listing-guidelines" className="text-blue-400 hover:underline">Listing Guidelines</Link>.
        Listings are reviewed before going live.
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/8">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="px-5 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending}
          className="px-8 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing…
            </>
          ) : (
            "🚀 Publish Listing"
          )}
        </button>
      </div>
    </div>
  );
}
