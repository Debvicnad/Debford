"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Calendar, CheckCircle2, ShieldCheck, Truck, Sparkles, AlertCircle } from "lucide-react";
import { createRentalBooking } from "@/lib/actions/rental.actions";

interface Props {
  rentalId: string;
  pricePerDay: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  currency: string;
  minDays?: number;
  deliveryAvailable: boolean;
  deliveryFee?: number;
}

const EXTRAS = [
  { id: "cdw", label: "Collision Damage Waiver", price: 15, desc: "Full coverage for accidental damage" },
  { id: "gps", label: "GPS Navigation Unit", price: 8, desc: "Portable touchscreen GPS" },
  { id: "child_seat", label: "Child / Baby Seat", price: 10, desc: "ISOFIX certified seat" },
  { id: "extra_driver", label: "Additional Authorized Driver", price: 12, desc: "Include second driver on insurance" },
];

export function RentalBookingForm({
  rentalId,
  pricePerDay,
  pricePerWeek,
  pricePerMonth,
  currency,
  deliveryAvailable,
  deliveryFee = 45,
}: Props) {
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [extras, setExtras] = useState<Record<string, boolean>>({});
  const [specialRequests, setSpecialRequests] = useState("");
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"configure" | "confirm" | "success">("configure");
  const [error, setError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const days =
    pickupDate && returnDate
      ? Math.max(1, Math.ceil((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / 86400000))
      : 0;

  const effectiveRate =
    days >= 28 && pricePerMonth
      ? pricePerMonth / 30
      : days >= 7 && pricePerWeek
      ? pricePerWeek / 7
      : pricePerDay;

  const rentalCost = days * effectiveRate;
  const selectedExtrasKeys = Object.entries(extras)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const extrasCost = selectedExtrasKeys.reduce((sum, id) => {
    const extra = EXTRAS.find((e) => e.id === id);
    return sum + (extra ? extra.price * days : 0);
  }, 0);

  const deliveryCost = delivery ? deliveryFee : 0;
  const total = rentalCost + extrasCost + deliveryCost;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency ?? "USD",
      minimumFractionDigits: 0,
    }).format(n);

  function handleBook() {
    setError(null);
    if (!pickupDate || !returnDate) {
      setError("Please select pickup and return dates.");
      return;
    }
    if (new Date(returnDate) <= new Date(pickupDate)) {
      setError("Return date must be after pickup date.");
      return;
    }
    if (delivery && !deliveryAddress.trim()) {
      setError("Please specify a delivery address.");
      return;
    }
    setStep("confirm");
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const res = await createRentalBooking({
        rentalId,
        startDate: pickupDate,
        endDate: returnDate,
        delivery,
        deliveryAddress: delivery ? deliveryAddress : undefined,
        extras: selectedExtrasKeys,
        specialRequests: specialRequests.trim() || undefined,
      });

      if (res.error) {
        setError(res.error);
        setStep("configure");
      } else {
        setConfirmedBookingId(res.bookingId ?? null);
        setStep("success");
      }
    });
  }

  if (step === "success") {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20">
          🎉
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Rental Confirmed!</h3>
          <p className="text-slate-300 text-xs">
            Reserved from <strong className="text-white">{pickupDate}</strong> to <strong className="text-white">{returnDate}</strong> ({days} days).
          </p>
          <p className="text-slate-500 text-[11px] mt-1">
            Booking ID: <code className="text-blue-400 font-mono">{confirmedBookingId?.slice(0, 8) ?? "CONFIRMED"}</code>
          </p>
        </div>

        <div className="p-3 bg-[#131b2e] rounded-2xl border border-white/5 text-left text-xs space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Total Paid/Reserved</span>
            <span className="font-bold text-white">{fmt(total)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Host Protection</span>
            <span className="text-emerald-400">Verified & Covered</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            href="/dashboard"
            className="block w-full py-3 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/20 text-center transition-all"
          >
            Go to Dashboard →
          </Link>
          <Link
            href="/messages"
            className="block w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl text-center transition-all"
          >
            Message Host for Key Handover
          </Link>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white">Review & Confirm</h3>
          <span className="text-xs font-semibold text-blue-400">{days} Days Total</span>
        </div>

        <div className="bg-[#131b2e] rounded-2xl border border-white/5 divide-y divide-white/5 text-xs">
          {[
            { label: "Pickup Date", value: pickupDate },
            { label: "Return Date", value: returnDate },
            { label: "Rental Rate", value: `${fmt(rentalCost)} (${fmt(effectiveRate)}/day)` },
            ...(extrasCost > 0 ? [{ label: "Selected Extras", value: fmt(extrasCost) }] : []),
            ...(deliveryCost > 0 ? [{ label: "Delivery to Address", value: fmt(deliveryCost) }] : []),
            { label: "Total Amount", value: fmt(total) },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-3.5 py-2.5">
              <span className="text-slate-400">{row.label}</span>
              <span className={`font-semibold ${row.label === "Total Amount" ? "font-extrabold text-blue-400 text-sm" : "text-white"}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Includes free cancellation up to 48 hours before pickup.</span>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setStep("configure")}
            className="px-4 py-3 bg-[#131b2e] hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl border border-white/10 transition-colors"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 py-3 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Confirm & Book ({fmt(total)})</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Pickers */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Pick-up Date *
          </label>
          <input
            type="date"
            min={today}
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Drop-off Date *
          </label>
          <input
            type="date"
            min={pickupDate || today}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Duration & Discount Summary */}
      {days > 0 && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {days} day{days !== 1 ? "s" : ""} × {fmt(effectiveRate)}/day
            </span>
            <span className="font-bold text-white">{fmt(rentalCost)}</span>
          </div>
          {days >= 7 && pricePerWeek && (
            <p className="text-[11px] text-emerald-400">
              ✓ Weekly discount applied (Saved {fmt((pricePerDay - effectiveRate) * days)})
            </p>
          )}
        </div>
      )}

      {/* Delivery Checkbox */}
      {deliveryAvailable && (
        <div className="bg-[#131b2e] rounded-xl p-3 border border-white/5 space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-white">Vehicle Delivery Service</span>
            </div>
            <input
              type="checkbox"
              checked={delivery}
              onChange={(e) => setDelivery(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-white/10"
            />
          </label>
          {delivery && (
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter drop-off address or airport terminal"
              className="w-full bg-[#0a0d14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          )}
        </div>
      )}

      {/* Optional Extras */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Add Protection & Equipment
        </span>
        <div className="space-y-1.5">
          {EXTRAS.map((extra) => (
            <label
              key={extra.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#131b2e]/60 hover:bg-[#131b2e] border border-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <input
                  type="checkbox"
                  checked={Boolean(extras[extra.id])}
                  onChange={(e) => setExtras({ ...extras, [extra.id]: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-200 block truncate">{extra.label}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{extra.desc}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-400 shrink-0 ml-2">+{fmt(extra.price)}/day</span>
            </label>
          ))}
        </div>
      </div>

      {/* Total summary */}
      {total > 0 && (
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Rental Estimate</span>
            <span className="text-lg font-extrabold text-white">{fmt(total)}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
            Instant Confirmation
          </span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleBook}
        disabled={!pickupDate || !returnDate}
        className="w-full py-3.5 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {days > 0 ? `Reserve Now for ${fmt(total)}` : "Select Dates to Book"}
      </button>

      <p className="text-[11px] text-slate-500 text-center">
        Free cancellation up to 48 hours before pick-up.
      </p>
    </div>
  );
}
