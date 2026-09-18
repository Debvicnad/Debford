"use client";

import { useState } from "react";
import Link from "next/link";
import type { ServiceRequestItem } from "@/types/service.types";
import { ServiceQuoteCard } from "@/components/services/ServiceQuoteCard";

interface ServiceRequestDetailViewProps {
  initialRequest: ServiceRequestItem;
}

export function ServiceRequestDetailView({ initialRequest }: ServiceRequestDetailViewProps) {
  const [request, setRequest] = useState<ServiceRequestItem>(initialRequest);
  const [acceptedBookingId, setAcceptedBookingId] = useState<string | null>(null);

  function handleQuoteAccepted(bookingId: string) {
    setAcceptedBookingId(bookingId);
    setRequest((prev) => ({
      ...prev,
      status: "accepted",
    }));
  }

  const urgencyColors: Record<string, string> = {
    low: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    high: "bg-red-500/15 text-red-400 border-red-500/30",
    flexible: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    this_week: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    urgent: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  const statusColors: Record<string, string> = {
    open: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    quoted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    accepted: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    in_progress: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    completed: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    cancelled: "bg-slate-600/15 text-slate-400 border-slate-600/30",
  };

  const quotes = request.quotes || [];
  const activeQuote = quotes.find((q) => q.status === "accepted");
  const vehicleName = request.vehicle || request.vehicleDescription;

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-subtle">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/services" className="hover:text-white transition-colors">
              Services
            </Link>
            <span>/</span>
            <Link href="/services/requests" className="hover:text-white transition-colors">
              Requests
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{vehicleName}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {vehicleName}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                statusColors[request.status] || statusColors.open
              }`}
            >
              {request.status.replace("_", " ")}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${
                urgencyColors[request.urgency] || urgencyColors.medium
              }`}
            >
              ⚡ {request.urgency} urgency
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Request #{request.id} · Submitted on {new Date(request.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/services/requests"
            className="px-4 py-2 rounded-xl glass border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:border-white/25 transition-all"
          >
            ← Back to Hub
          </Link>
          <Link
            href="/services#request"
            className="px-4 py-2 rounded-xl gradient-brand text-xs font-semibold text-white hover:opacity-90 transition-all shadow-md shadow-blue-500/20"
          >
            + New Request
          </Link>
        </div>
      </div>

      {/* Accepted Quote Banner if any */}
      {(acceptedBookingId || activeQuote) && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
              ✓
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-300">Quote Accepted &amp; Appointment Scheduled</h3>
              <p className="text-xs text-slate-300">
                You have confirmed the quote. View details in your bookings or coordinate with your specialist.
              </p>
            </div>
          </div>
          <Link
            href="/services/requests"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shrink-0 text-center"
          >
            View Bookings Tab →
          </Link>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Request & Vehicle Details */}
        <div className="space-y-6">
          {/* Issue Summary Card */}
          <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Service Details
              </h2>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-400 text-xs font-semibold capitalize">
                {request.serviceType}
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Reported Problem / Desired Service
              </label>
              <p className="text-sm text-slate-200 leading-relaxed bg-white/3 p-3.5 rounded-xl border border-white/5 whitespace-pre-wrap">
                {request.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl surface-raised border border-white/5">
                <span className="text-xs text-slate-500 block mb-0.5">Location</span>
                <span className="text-xs font-semibold text-slate-200">
                  📍 {request.location || "Flexible"}
                </span>
              </div>
              <div className="p-3 rounded-xl surface-raised border border-white/5">
                <span className="text-xs text-slate-500 block mb-0.5">Service Method</span>
                <span className="text-xs font-semibold text-slate-200">
                  {request.mobileService ? "🚐 Mobile On-site" : "🏢 Workshop Drop-off"}
                </span>
              </div>
              <div className="p-3 rounded-xl surface-raised border border-white/5">
                <span className="text-xs text-slate-500 block mb-0.5">Preferred Timing</span>
                <span className="text-xs font-semibold text-slate-200">
                  📅 {request.preferredTiming || request.preferredDate || request.preferredTime || "Flexible"}
                </span>
              </div>
              <div className="p-3 rounded-xl surface-raised border border-white/5">
                <span className="text-xs text-slate-500 block mb-0.5">Estimated Budget</span>
                <span className="text-xs font-semibold text-emerald-400">
                  {request.budget ? `$${request.budget}` : request.budgetMax ? `$${request.budgetMax}` : "Best Quote"}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Info Card */}
          <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-subtle">
              Vehicle Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-400">Make &amp; Model</span>
                <span className="text-white font-semibold">{vehicleName}</span>
              </div>
              {request.mileage && (
                <div className="flex items-center justify-between text-xs py-1 border-t border-white/5">
                  <span className="text-slate-400">Recorded Mileage</span>
                  <span className="text-white font-semibold">{request.mileage.toLocaleString()} mi</span>
                </div>
              )}
              {request.garageVehicleId && (
                <div className="flex items-center justify-between text-xs py-1 border-t border-white/5">
                  <span className="text-slate-400">Garage Vehicle Sync</span>
                  <Link
                    href={`/garage/${request.garageVehicleId}`}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    View in Garage →
                  </Link>
                </div>
              )}
              <div className="flex items-center justify-between text-xs py-1 border-t border-white/5">
                <span className="text-slate-400">Customer Contact</span>
                <span className="text-slate-300 font-mono">{request.customerEmail || request.customerName || "Private"}</span>
              </div>
            </div>
          </div>

          {/* Guarantee Card */}
          <div className="rounded-2xl surface-raised border border-white/10 p-5 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="text-emerald-400">🛡️</span>
              <span>Debford Service Guarantee</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>No upfront deposit:</strong> You only pay upon job completion and satisfaction.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Verified specialists:</strong> Mechanics and shops are background &amp; credential checked.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Automatic history sync:</strong> Work performed logs directly to your vehicle&apos;s digital garage logbook.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Quotes List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Itemized Provider Quotes ({quotes.length})
              </h2>
              <p className="text-xs text-slate-400">
                Review breakdown of labor, parts, estimated turnaround, and select the best offer.
              </p>
            </div>
          </div>

          {quotes.length === 0 ? (
            <div className="glass rounded-2xl border border-white/10 p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-4 text-blue-400">
                ⏳
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Awaiting Provider Quotes
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                Your request has been broadcasted to verified specialists in your area. Providers typically respond within 1 to 3 hours with itemized estimates.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/services/providers"
                  className="px-5 py-2.5 rounded-xl gradient-brand text-xs font-bold text-white hover:opacity-90 transition-all shadow-md shadow-blue-500/20"
                >
                  Browse Specialist Directory
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <ServiceQuoteCard
                  key={quote.id}
                  quote={quote}
                  requestId={request.id}
                  isAccepted={quote.status === "accepted" || request.status === "accepted"}
                  onAccepted={handleQuoteAccepted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
