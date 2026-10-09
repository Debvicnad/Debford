"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, AlertCircle } from "lucide-react";
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
  { id: "cdw", label: "Collision Damage Waiver", price: 15, desc: "Zero deductible for accidental damage" },
  { id: "gps", label: "Satellite GPS & Telemetry", price: 8, desc: "Live traffic & speed camera alerts" },
  { id: "child_seat", label: "ISOFIX Child / Baby Seat", price: 10, desc: "Certified safety seating" },
  { id: "extra_driver", label: "Additional Authorized Driver", price: 12, desc: "Secondary driver insurance coverage" },
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
      setError("Please select both pick-up and return dates.");
      return;
    }
    if (new Date(returnDate) <= new Date(pickupDate)) {
      setError("Return date must be strictly after pick-up date.");
      return;
    }
    if (delivery && !deliveryAddress.trim()) {
      setError("Please specify a valid delivery address or hotel name.");
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
      <div className="text-center py-6 space-y-5">
        <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
          🎉
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
            Dispatch Locked & Confirmed
          </span>
          <h3 className="text-xl font-bold text-white">Rental Reserved!</h3>
          <p className="text-slate-300 text-xs">
            Scheduled from <strong className="text-white font-mono">{pickupDate}</strong> to{" "}
            <strong className="text-white font-mono">{returnDate}</strong> ({days} days).
          </p>
          <p className="text-slate-400 text-xs font-mono mt-1">
            Reservation ID:{" "}
            <code className="text-cyan-400 font-bold bg-white/5 px-2 py-0.5 rounded">
              {confirmedBookingId?.slice(0, 10) ?? "RES-" + Date.now().toString().slice(-6)}
            </code>
          </p>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 text-left text-xs font-mono space-y-2">
          <div className="flex justify-between text-slate-400">
            <span>Total Payable Amount</span>
            <span className="font-bold text-white">{fmt(total)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Coverage Package</span>
            <span className="text-emerald-400 font-bold">100% Comprehensive</span>
          </div>
          {delivery && (
            <div className="flex justify-between text-slate-400">
              <span>Delivery Status</span>
              <span className="text-cyan-400">Doorstep Handover</span>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Link
            href="/dashboard"
            className="block w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold font-mono rounded-xl shadow-lg shadow-blue-600/25 text-center transition-all hover:opacity-95"
          >
            Go to Garage Dashboard →
          </Link>
          <Link
            href="/messages"
            className="block w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl text-center transition-all border border-white/10 font-mono"
          >
            Message Fleet Concierge
          </Link>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
              Final Dispatch Verification
            </div>
            <h3 className="text-base font-bold text-white">Review & Lock Reservation</h3>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
            {days} Days
          </span>
        </div>

        <div className="bg-slate-950/80 rounded-2xl border border-white/5 divide-y divide-white/5 text-xs font-mono">
          {[
            { label: "Pick-up Date", value: pickupDate },
            { label: "Return Date", value: returnDate },
            { label: "Rental Rate", value: `${fmt(rentalCost)} (${fmt(effectiveRate)}/day)` },
            ...(extrasCost > 0 ? [{ label: "Equipment & Protection", value: fmt(extrasCost) }] : []),
            ...(deliveryCost > 0 ? [{ label: "Doorstep Dispatch", value: fmt(deliveryCost) }] : []),
            { label: "Total Payable", value: fmt(total) },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-3.5 py-2.5">
              <span className="text-slate-400">{row.label}</span>
              <span
                className={`font-semibold ${
                  row.label === "Total Payable"
                    ? "font-extrabold text-cyan-400 text-sm"
                    : "text-white"
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Includes free cancellation up to 48 hours prior to handover.</span>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setStep("configure")}
            className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold font-mono rounded-xl border border-white/10 transition-colors"
          >
            ← Modify
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold font-mono rounded-xl shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-40 flex items-center justify-center gap-2 border border-emerald-400/30 cursor-pointer"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Confirm & Lock ({fmt(total)})</span>
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
          <label className="block text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Pick-up Date *
          </label>
          <input
            type="date"
            min={today}
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Return Date *
          </label>
          <input
            type="date"
            min={pickupDate || today}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Duration & Discount Summary */}
      {days > 0 && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">
              {days} day{days !== 1 ? "s" : ""} × {fmt(effectiveRate)}/day
            </span>
            <span className="font-bold text-white">{fmt(rentalCost)}</span>
          </div>
          {days >= 7 && pricePerWeek && (
            <p className="text-[11px] text-emerald-400">
              ✓ Extended term tier applied (Saved {fmt((pricePerDay - effectiveRate) * days)})
            </p>
          )}
        </div>
      )}

      {/* Doorstep Delivery Option */}
      {deliveryAvailable && (
        <div className="bg-slate-950/80 rounded-xl p-3 border border-white/8 space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-white">Doorstep Delivery Service</span>
            </div>
            <input
              type="checkbox"
              checked={delivery}
              onChange={(e) => setDelivery(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-white/10 accent-blue-500"
            />
          </label>
          {delivery && (
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Hotel name, airport gate, or private address..."
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          )}
        </div>
      )}

      {/* Optional Extras & Insurance */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
          Protection & Equipment Packages
        </span>
        <div className="space-y-1.5">
          {EXTRAS.map((extra) => (
            <label
              key={extra.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-white/5 hover:border-white/15 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <input
                  type="checkbox"
                  checked={Boolean(extras[extra.id])}
                  onChange={(e) => setExtras({ ...extras, [extra.id]: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-white/10 shrink-0 accent-blue-500"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-200 block truncate">
                    {extra.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">{extra.desc}</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 shrink-0 ml-2">
                +{fmt(extra.price)}/day
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 mb-1">
          Special Inquiries / Concierge Notes
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="e.g. Flight arrival details, preferred hand-off time..."
          rows={2}
          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Total summary */}
      {total > 0 && (
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Estimated Reservation Total
            </span>
            <span className="text-xl font-mono font-black text-white">{fmt(total)}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Instant Dispatch
          </span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleBook}
        disabled={!pickupDate || !returnDate}
        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold font-mono rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-blue-400/30"
      >
        {days > 0 ? `Lock Reservation for ${fmt(total)} →` : "Select Dates to Book"}
      </button>

      <p className="text-[11px] font-mono text-slate-500 text-center">
        Full refund available up to 48 hours prior to dispatch.
      </p>
    </div>
  );
}
