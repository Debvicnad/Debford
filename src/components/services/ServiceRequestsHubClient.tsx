"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type {
  ServiceRequestItem,
  ServiceBookingItem,
  ServiceBookingStatus,
} from "@/types/service.types";
import { ALL_PROVIDERS } from "@/lib/data/services.data";
import { ServiceQuoteCard } from "@/components/services/ServiceQuoteCard";
import { submitServiceQuote, updateBookingStatus } from "@/lib/actions/service.actions";

interface ServiceRequestsHubClientProps {
  initialRequests: ServiceRequestItem[];
  initialBookings: ServiceBookingItem[];
}

export function ServiceRequestsHubClient({
  initialRequests,
  initialBookings,
}: ServiceRequestsHubClientProps) {
  const [activeTab, setActiveTab] = useState<"requests" | "quotes" | "bookings" | "provider-leads">("requests");
  const [requests, setRequests] = useState<ServiceRequestItem[]>(initialRequests);
  const [bookings, setBookings] = useState<ServiceBookingItem[]>(initialBookings);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(
    initialRequests[0]?.id || null
  );

  // Quote submission modal state for provider leads
  const [quoteModalReq, setQuoteModalReq] = useState<ServiceRequestItem | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState(ALL_PROVIDERS[0].id);
  const [quotePrice, setQuotePrice] = useState("250");
  const [quoteParts, setQuoteParts] = useState("100");
  const [quoteLabor, setQuoteLabor] = useState("150");
  const [quoteTurnaround, setQuoteTurnaround] = useState("1");
  const [quoteDesc, setQuoteDesc] = useState("");
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isPendingQuote, startTransitionQuote] = useTransition();

  // Booking status update transition
  const [isPendingBooking, startTransitionBooking] = useTransition();

  // Aggregate stats
  const totalQuotesCount = requests.reduce((acc, r) => acc + (r.quotes?.length || 0), 0);
  const confirmedBookingsCount = bookings.filter((b) => b.status === "confirmed" || b.status === "in_progress").length;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  function handleQuoteAccepted(requestId: string, _bookingId: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" as const } : r))
    );
    // Switch to bookings tab after brief delay
    setTimeout(() => {
      setActiveTab("bookings");
    }, 600);
  }

  function handleStatusUpdate(bookingId: string, nextStatus: ServiceBookingStatus) {
    startTransitionBooking(async () => {
      const res = await updateBookingStatus(bookingId, nextStatus);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: nextStatus,
                  completedAt: nextStatus === "completed" ? new Date().toISOString() : b.completedAt,
                }
              : b
          )
        );
      }
    });
  }

  function handleSubmitProviderQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!quoteModalReq) return;
    setQuoteError(null);

    const priceNum = parseFloat(quotePrice) || 0;
    const partsNum = parseFloat(quoteParts) || 0;
    const laborNum = parseFloat(quoteLabor) || 0;
    const turnaroundNum = parseInt(quoteTurnaround, 10) || 1;

    if (priceNum <= 0) {
      setQuoteError("Please specify a valid total quote price.");
      return;
    }

    startTransitionQuote(async () => {
      const res = await submitServiceQuote({
        requestId: quoteModalReq.id,
        providerId: selectedProviderId,
        price: priceNum,
        partsCost: partsNum,
        laborCost: laborNum,
        estimatedDays: turnaroundNum,
        description: quoteDesc || "Standard verified technician service with parts guarantee.",
      });

      if (res.error) {
        setQuoteError(res.error);
      } else {
        // Update local request quotes
        const prov = ALL_PROVIDERS.find((p) => p.id === selectedProviderId) || ALL_PROVIDERS[0];
        setRequests((prev) =>
          prev.map((r) => {
            if (r.id === quoteModalReq.id) {
              const newQuote = {
                id: res.quoteId || "q-" + Date.now(),
                requestId: r.id,
                providerId: prov.id,
                customerId: r.customerId,
                price: priceNum,
                partsCost: partsNum,
                laborCost: laborNum,
                currency: "USD",
                description: quoteDesc || "Technician quote proposal.",
                estimatedDays: turnaroundNum,
                status: "pending" as const,
                createdAt: new Date().toISOString(),
                provider: {
                  id: prov.id,
                  name: prov.name,
                  type: prov.type,
                  rating: prov.rating,
                  reviews: prov.reviews,
                  location: prov.location,
                  badges: prov.badges,
                  initials: prov.initials,
                },
              };
              return {
                ...r,
                status: "quoted" as const,
                quotesCount: (r.quotes?.length || 0) + 1,
                quotes: [newQuote, ...(r.quotes || [])],
              };
            }
            return r;
          })
        );
        setQuoteModalReq(null);
        setQuoteDesc("");
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/8 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === "requests"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40"
                : "bg-slate-900/60 border border-white/8 text-slate-400 hover:text-white hover:border-white/20 backdrop-blur-sm"
            }`}
          >
            <span>📝 My Requests</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeTab === "requests" ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
              }`}
            >
              {requests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quotes")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === "quotes"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40"
                : "bg-slate-900/60 border border-white/8 text-slate-400 hover:text-white hover:border-white/20 backdrop-blur-sm"
            }`}
          >
            <span>📬 Received Quotes</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeTab === "quotes" ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
              }`}
            >
              {totalQuotesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === "bookings"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40"
                : "bg-slate-900/60 border border-white/8 text-slate-400 hover:text-white hover:border-white/20 backdrop-blur-sm"
            }`}
          >
            <span>📅 Scheduled Bookings</span>
            {confirmedBookingsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 text-[11px] font-mono font-bold border border-emerald-500/30">
                {confirmedBookingsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("provider-leads")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === "provider-leads"
                ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/30 border border-amber-400/40"
                : "bg-slate-900/60 border border-white/8 text-slate-400 hover:text-white hover:border-white/20 backdrop-blur-sm"
            }`}
          >
            <span>🔧 Provider Lead Board</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-500/30">
              Pro Simulator
            </span>
          </button>
        </div>

        <Link
          href="/services#request"
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5 ml-auto border border-blue-400/30"
        >
          <span>+ Post New Request</span>
        </Link>
      </div>

      {/* TAB 1: MY REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {requests.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/8 p-8 backdrop-blur-sm">
              <span className="text-4xl block mb-3 opacity-60">📋</span>
              <h3 className="text-lg font-bold text-white mb-1">No Active Service Requests</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                Submit an inquiry detailing your vehicle needs, and accredited mechanics and technicians across the Debford network will respond with itemized quotes.
              </p>
              <Link
                href="/services#request"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm rounded-xl inline-block shadow-lg shadow-blue-600/25 border border-blue-400/30 transition-all"
              >
                Submit a Request Now →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const isExpanded = expandedRequestId === req.id;
                const quotesList = req.quotes || [];

                return (
                  <div
                    key={req.id}
                    className="bg-slate-900/60 rounded-2xl border border-white/8 hover:border-white/15 overflow-hidden transition-all backdrop-blur-sm"
                  >
                    {/* Summary Row */}
                    <div
                      onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                      className="p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                req.status === "accepted"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : req.status === "quoted"
                                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {req.status}
                            </span>
                            <span className="text-xs text-slate-400 capitalize flex items-center gap-1">
                              <span className="text-slate-500">Service:</span>
                              <strong className="text-slate-200">{req.serviceType}</strong>
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-md ${
                                req.urgency === "urgent"
                                  ? "bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30"
                                  : "text-slate-400 bg-white/5"
                              }`}
                            >
                              {req.urgency === "urgent" ? "🚨 Priority Urgent" : "⏱️ Standard Priority"}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">📍 {req.location}</span>
                          </div>

                          <h3 className="text-lg font-bold text-white leading-snug">{req.title}</h3>
                          <div className="flex items-center gap-2 text-xs font-medium text-cyan-400">
                            <span>🚘</span>
                            <span>{req.vehicleDescription}</span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{req.description}</p>
                        </div>

                        {/* Right side stats & toggle */}
                        <div className="flex items-center md:flex-col md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                          <div className="text-left md:text-right">
                            <div className="text-base font-extrabold text-white flex items-center gap-2 md:justify-end">
                              <span className="text-blue-400 font-mono text-xl">{quotesList.length}</span>
                              <span className="text-xs font-medium text-slate-400">quotes received</span>
                            </div>
                            {req.budgetMax && (
                              <span className="text-xs font-mono text-slate-400 block mt-0.5">
                                Target: ~{fmt(req.budgetMax)}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedRequestId(isExpanded ? null : req.id);
                            }}
                            className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-200 hover:text-white rounded-xl transition-all flex items-center gap-1.5"
                          >
                            <span>{isExpanded ? "Collapse Quotes ▲" : "View & Compare Quotes ▼"}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Quotes Drawer */}
                    {isExpanded && (
                      <div className="p-6 border-t border-white/8 bg-slate-950/60 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                              Verified Technician Quotes ({quotesList.length})
                            </h4>
                          </div>
                          <span className="text-xs text-slate-500">
                            Transparent labor & parts comparison with instant booking
                          </span>
                        </div>

                        {quotesList.length === 0 ? (
                          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
                            <p className="text-xs text-slate-400">
                              Your request is live to verified service professionals in the <span className="text-slate-200 font-semibold">{req.location}</span> area.
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Quotes typically arrive within 2–24 hours. Check back soon or switch to the{" "}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab("provider-leads");
                                  setQuoteModalReq(req);
                                }}
                                className="text-blue-400 font-bold hover:underline"
                              >
                                Provider Lead Board
                              </button>{" "}
                              to test quote proposals in trade simulator mode.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quotesList.map((quote) => (
                              <ServiceQuoteCard
                                key={quote.id}
                                quote={quote}
                                requestId={req.id}
                                isAccepted={req.acceptedQuoteId === quote.id}
                                onAccepted={(bookingId) => handleQuoteAccepted(req.id, bookingId)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING QUOTES SUMMARY */}
      {activeTab === "quotes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Aggregated Quotes Stream</h3>
              <p className="text-xs text-slate-400">All proposals received across your open service requests</p>
            </div>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              {totalQuotesCount} total quotes
            </span>
          </div>

          {totalQuotesCount === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-white/8 p-8 backdrop-blur-sm">
              <span className="text-3xl block mb-2 opacity-60">📬</span>
              <h4 className="text-sm font-bold text-white mb-1">No Quotes Received Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Once certified workshops and mobile vans review your open requests, their competitive price offers will appear here for comparison.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.flatMap((req) =>
                (req.quotes || []).map((quote) => (
                  <div key={quote.id} className="space-y-2">
                    <div className="text-xs text-slate-400 flex items-center justify-between px-1">
                      <span>
                        For: <strong className="text-white">{req.title}</strong>
                      </span>
                      <span className="text-cyan-400 font-mono text-[11px] truncate max-w-[180px]">
                        {req.vehicleDescription}
                      </span>
                    </div>
                    <ServiceQuoteCard
                      quote={quote}
                      requestId={req.id}
                      isAccepted={req.acceptedQuoteId === quote.id}
                      onAccepted={(bookingId) => handleQuoteAccepted(req.id, bookingId)}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY APPOINTMENTS & BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Service Appointments & Completed Work</h3>
              <p className="text-xs text-slate-400">
                Track active workshop appointments, mobile service dispatches, and permanent service logs.
              </p>
            </div>
            <Link
              href="/garage"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <span>Digital Garage Records</span>
              <span>→</span>
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-white/8 p-8 backdrop-blur-sm">
              <span className="text-4xl block mb-2 opacity-60">📅</span>
              <h4 className="text-base font-bold text-white mb-1">No Appointments Scheduled</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
                Accept a quote from your open requests, or book directly from any verified workshop profile.
              </p>
              <Link
                href="/services"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs rounded-xl inline-block shadow-lg shadow-blue-600/25 border border-blue-400/30"
              >
                Browse Service Directory →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-slate-900/70 rounded-2xl border border-white/8 p-6 space-y-4 hover:border-white/15 transition-all backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            booking.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : booking.status === "in_progress"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : booking.status === "cancelled"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {booking.status.replace("_", " ")}
                        </span>
                        {booking.isMobileService && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            🚐 Mobile Dispatch
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-white leading-snug">{booking.serviceName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Workshop: <strong className="text-slate-200">{booking.provider.name}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-emerald-400">
                        {fmt(booking.totalAmount)}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Payable</span>
                    </div>
                  </div>

                  {/* Booking details */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Scheduled Time:</span>
                      <span className="font-semibold text-white">
                        📆 {booking.scheduledDate} {booking.scheduledTime && `at ${booking.scheduledTime}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location / Facility:</span>
                      <span className="font-medium text-slate-300 truncate max-w-[220px]">
                        📍 {booking.serviceAddress}
                      </span>
                    </div>
                    {booking.vehicleSummary && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Registered Vehicle:</span>
                        <span className="font-medium text-cyan-400">{booking.vehicleSummary}</span>
                      </div>
                    )}
                    {booking.completionNotes && (
                      <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Technician Log:</strong> {booking.completionNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions & Lifecycle status */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <Link
                      href={`/services/${booking.provider.id}`}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Facility Profile →
                    </Link>

                    <div className="flex items-center gap-2">
                      {booking.status === "confirmed" && (
                        <button
                          type="button"
                          disabled={isPendingBooking}
                          onClick={() => handleStatusUpdate(booking.id, "in_progress")}
                          className="px-3.5 py-1.5 bg-amber-500/15 border border-amber-500/30 hover:border-amber-500/60 text-xs font-semibold text-amber-300 rounded-lg transition-colors"
                        >
                          Start Service
                        </button>
                      )}

                      {booking.status === "in_progress" && (
                        <button
                          type="button"
                          disabled={isPendingBooking}
                          onClick={() => handleStatusUpdate(booking.id, "completed")}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white rounded-lg shadow-md hover:opacity-95 transition-opacity border border-emerald-400/30"
                        >
                          Mark Completed & Add to Garage ✓
                        </button>
                      )}

                      {booking.status === "completed" && (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                          <span>✓ Synced to Vehicle Vault</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROVIDER LEAD BOARD (PRO MODE) */}
      {activeTab === "provider-leads" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start justify-between gap-4 backdrop-blur-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                  Verified Trade Portal
                </span>
              </div>
              <h4 className="text-base font-bold text-amber-300 mb-1">
                Provider Lead & Quote Simulator
              </h4>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                As a verified automotive service professional, review customer inquiries in your area and dispatch itemized quotes with parts, labor breakdown, and guaranteed turnaround times.
              </p>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold shrink-0 border border-amber-500/30">
              Active Trade Leads
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900/70 rounded-2xl border border-white/8 p-6 space-y-4 hover:border-white/15 transition-all flex flex-col justify-between backdrop-blur-sm"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 uppercase font-mono font-bold text-[10px]">
                      {req.serviceType}
                    </span>
                    <span className="text-slate-400 font-mono">📍 {req.location}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{req.title}</h4>
                  <p className="text-xs text-cyan-400 font-medium">🚘 {req.vehicleDescription}</p>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {req.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/8 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Customer Target Budget:</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {req.budgetMax ? `Up to ${fmt(req.budgetMax)}` : "Open to quotes"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuoteModalReq(req)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all border border-blue-400/30"
                  >
                    Send Quote →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMIT QUOTE MODAL */}
      {quoteModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900/95 border border-white/15 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 space-y-5 my-8 backdrop-blur-xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-0.5">
                  Automotive Trade Dispatch
                </div>
                <h3 className="text-lg font-bold text-white">Submit Provider Quote</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Replying to: <span className="text-slate-200 font-semibold">{quoteModalReq.title}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuoteModalReq(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>

            {quoteError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                ⚠️ {quoteError}
              </div>
            )}

            <form onSubmit={handleSubmitProviderQuote} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  Send As Certified Facility:
                </label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {ALL_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    Total Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm font-mono font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Parts ($)</label>
                  <input
                    type="number"
                    value={quoteParts}
                    onChange={(e) => setQuoteParts(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Labor ($)</label>
                  <input
                    type="number"
                    value={quoteLabor}
                    onChange={(e) => setQuoteLabor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  Guaranteed Turnaround (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={quoteTurnaround}
                  onChange={(e) => setQuoteTurnaround(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  Scope of Work & Warranty Guarantee
                </label>
                <textarea
                  rows={3}
                  value={quoteDesc}
                  onChange={(e) => setQuoteDesc(e.target.value)}
                  placeholder="e.g. Includes OEM brake pads, rotor machining, system fluid flush, and 12-month parts warranty..."
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setQuoteModalReq(null)}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPendingQuote}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 border border-blue-400/30"
                >
                  {isPendingQuote ? "Submitting Quote..." : "Send Formal Quote →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
