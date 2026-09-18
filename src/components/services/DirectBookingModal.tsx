"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createDirectBooking } from "@/lib/actions/service.actions";
import type { ServicePackageItem, ServiceProviderItem } from "@/types/service.types";

interface DirectBookingModalProps {
  provider: ServiceProviderItem;
  service: ServicePackageItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bookingId: string) => void;
}

const TIME_SLOTS = [
  "08:30 AM",
  "10:00 AM",
  "11:30 AM",
  "01:30 PM",
  "03:00 PM",
  "04:30 PM",
];

export function DirectBookingModal({
  provider,
  service,
  isOpen,
  onClose,
  onSuccess,
}: DirectBookingModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);

  // Form State
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [scheduledTime, setScheduledTime] = useState("10:00 AM");
  const [vehicleDescription, setVehicleDescription] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [serviceAddress, setServiceAddress] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleDescription.trim()) {
      setError("Please specify your vehicle make, model, and year.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const res = await createDirectBooking({
        providerId: provider.id,
        serviceName: service.name,
        scheduledDate,
        scheduledTime,
        vehicleDescription,
        serviceAddress: isMobile ? serviceAddress : provider.address,
        isMobileService: isMobile,
        totalAmount: service.price,
        notes,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.bookingId) {
        setBookingSuccessId(res.bookingId);
        if (onSuccess) onSuccess(res.bookingId);
      }
    });
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-slate-800/40 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-lg shadow-blue-500/20 shrink-0">
              {provider.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white leading-tight">{service.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-semibold">
                  Instant Booking
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                with <span className="text-slate-200 font-semibold">{provider.name}</span> · 📍 {provider.location}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Success View */}
        {bookingSuccessId ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl flex items-center justify-center mx-auto">
              ✓
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Service Booked Successfully!</h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Your appointment for <span className="text-white font-semibold">{service.name}</span> is confirmed with{" "}
                <span className="text-white font-semibold">{provider.name}</span> on{" "}
                <span className="text-emerald-400 font-semibold">{scheduledDate}</span> at{" "}
                <span className="text-emerald-400 font-semibold">{scheduledTime}</span>.
              </p>
              <div className="mt-4 p-4 surface-base rounded-2xl border border-white/10 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Booking Reference:</span>
                  <span className="font-mono text-white font-bold">{bookingSuccessId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Total:</span>
                  <span className="text-emerald-400 font-bold">{fmt(service.price)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payment terms:</span>
                  <span className="text-slate-200">Pay directly after service</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/services/requests"
                onClick={onClose}
                className="px-6 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-95 transition-opacity"
              >
                View My Appointments →
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 glass border border-white/15 text-slate-300 text-sm font-medium rounded-xl hover:bg-white/10 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Service Summary Banner */}
            <div className="p-4 rounded-2xl surface-base border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Service Fee (Standard)</p>
                <div className="text-2xl font-black text-white">{fmt(service.price)}</div>
                <span className="text-[11px] text-slate-500">Duration: ~{service.duration}</span>
              </div>
              {service.includes && (
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Includes
                  </span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                    {service.includes.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date and Time Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Select Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2.5 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Preferred Time Slot <span className="text-rose-400">*</span>
                </label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-2.5 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors bg-slate-900"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vehicle Information */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Vehicle Details <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={vehicleDescription}
                onChange={(e) => setVehicleDescription(e.target.value)}
                placeholder="e.g. 2022 BMW M340i xDrive, ~34,000 km"
                className="w-full px-4 py-2.5 surface-base border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Provide year, make, model and trim to ensure parts compatibility.
              </p>
            </div>

            {/* Mobile Service Option */}
            {provider.isMobileService && (
              <div className="p-3.5 rounded-xl surface-base border border-white/10 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMobile}
                    onChange={(e) => setIsMobile(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Request Mobile Van Service 🚐</span>
                    <span className="text-[11px] text-slate-400">
                      The specialist will bring diagnostic and repair gear directly to your driveway or office.
                    </span>
                  </div>
                </label>
                {isMobile && (
                  <div>
                    <input
                      type="text"
                      required={isMobile}
                      value={serviceAddress}
                      onChange={(e) => setServiceAddress(e.target.value)}
                      placeholder="Enter your street address & zip code"
                      className="w-full px-3.5 py-2 bg-black/40 border border-white/15 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Notes or Symptoms <span className="text-slate-500 normal-case">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention any specific symptoms, dashboard lights, or parts preferences..."
                className="w-full px-4 py-2.5 surface-base border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Trust Footnote */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 leading-relaxed">
              🛡️ <strong>Debford Service Guarantee:</strong> No upfront payment required. You only pay after inspecting the completed job. Free cancellation up to 4 hours before the appointment.
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 glass border border-white/10 text-slate-300 text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-3 gradient-brand text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Booking Appointment...</span>
                  </>
                ) : (
                  <span>Confirm Appointment ({fmt(service.price)}) →</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
