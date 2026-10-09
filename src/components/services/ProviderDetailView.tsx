"use client";

import { useState } from "react";
import Link from "next/link";
import type { ServiceProviderItem, ServicePackageItem } from "@/types/service.types";
import { DirectBookingModal } from "@/components/services/DirectBookingModal";
import {
  Star,
  ShieldCheck,
  Truck,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Award,
  Sparkles,
  Calendar,
  Wrench,
  Navigation,
} from "lucide-react";

interface ProviderDetailViewProps {
  provider: ServiceProviderItem;
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.floor(value)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-700"
          }`}
        />
      ))}
    </div>
  );
}

export function ProviderDetailView({ provider: p }: ProviderDetailViewProps) {
  const [selectedService, setSelectedService] = useState<ServicePackageItem | null>(null);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-8 pb-20">
      {/* ── CINEMATIC HERO HEADER ─────────────────── */}
      <div className="relative pt-28 pb-12 overflow-hidden border-b border-white/8 bg-[#080d16]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[320px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[280px] bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none" />

        {/* Technical Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-6 tracking-wide">
            <Link href="/" className="hover:text-white transition-colors">
              Debford
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/services" className="hover:text-white transition-colors">
              Services
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/services/providers" className="hover:text-white transition-colors">
              Specialist Directory
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-blue-400 font-semibold truncate max-w-[200px] sm:max-w-none">
              {p.name}
            </span>
          </nav>

          {/* Specialist Header Card */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-6">
              {/* Grand Specialist Initials Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-0.5 shadow-2xl shadow-blue-500/25 shrink-0">
                <div className="w-full h-full bg-[#080d16] rounded-[14px] flex items-center justify-center text-white font-black text-2xl sm:text-3xl tracking-wider">
                  {p.initials}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    {p.name}
                  </h1>
                  {p.verified && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Pro Specialist</span>
                    </span>
                  )}
                  {p.isMobileService && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/25 px-3 py-1 rounded-full">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Mobile Van Dispatch Available</span>
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 mb-2 font-medium">{p.type}</p>

                {p.tagline && (
                  <p className="text-xs sm:text-sm text-slate-400 italic mb-3 max-w-2xl border-l-2 border-blue-500/40 pl-3">
                    &ldquo;{p.tagline}&rdquo;
                  </p>
                )}

                {/* Accreditations Badges */}
                <div className="flex flex-wrap gap-2">
                  {p.badges.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full"
                    >
                      <Award className="w-3 h-3" />
                      <span>{b}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons (Header level) */}
            <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
              <Link
                href={`/messages?provider=${p.id}`}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-medium hover:border-white/20 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Message Shop</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedService(p.services[0])}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <span>Book First Available Package</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Telemetry Stat Cards Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/8">
            <div className="p-3.5 rounded-xl bg-[#0d1322]/80 border border-white/6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white flex items-center gap-1">
                  <span>{p.rating}</span>
                  <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                </div>
                <div className="text-[11px] text-slate-400">{p.reviews} verified reviews</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0d1322]/80 border border-white/6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{p.completedJobs}</div>
                <div className="text-[11px] text-slate-400">Jobs Fulfilled</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0d1322]/80 border border-white/6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{p.responseTime}</div>
                <div className="text-[11px] text-slate-400">Avg. Response Latency</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0d1322]/80 border border-white/6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{p.memberSince}</div>
                <div className="text-[11px] text-slate-400">Guild Member Since</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ───────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column — Packages, Accreditations & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services & Packages Menu */}
            <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-6 sm:p-7 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/6">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    <span>Certified Service Packages</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Itemized transparent pricing. Reserve an appointment slot with $0 upfront fee.
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 shrink-0">
                  ✓ Instant Schedule Sync
                </span>
              </div>

              <div className="space-y-4">
                {p.services.map((svc) => (
                  <div
                    key={svc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 bg-[#070b12] rounded-xl border border-white/6 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                          {svc.name}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>~{svc.duration}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{svc.desc}</p>
                      {svc.includes && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {svc.includes.map((inc) => (
                            <span
                              key={inc}
                              className="text-[10px] text-slate-300 bg-white/[0.04] border border-white/6 px-2 py-0.5 rounded-md flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              <span>{inc}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/6">
                      <div className="text-xl font-black text-emerald-400 font-mono">
                        {fmt(svc.price)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedService(svc)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                      >
                        <span>Book Slot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accreditations & Workshop Standards */}
            <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-6 shadow-2xl space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Shop Standards &amp; Warranties</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#070b12] border border-white/6 space-y-1.5">
                  <div className="text-xs font-bold text-slate-200">12 Mo / 12,000 Mi Warranty</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    All parts installed and labor performed carry guaranteed network-wide warranty coverage.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#070b12] border border-white/6 space-y-1.5">
                  <div className="text-xs font-bold text-slate-200">OEM &amp; Tier-1 Components</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Strict adherence to manufacturer component tolerances and genuine factory fluids.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#070b12] border border-white/6 space-y-1.5">
                  <div className="text-xs font-bold text-slate-200">Digital Vehicle Pass</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Every service record automatically records to your digital Debford garage telemetry history.
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Reviews & Feedback */}
            <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-6 sm:p-7 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/6">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    Customer Reviews
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Verified feedback from vehicle owners who booked via Debford.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-[#070b12] px-3 py-1.5 rounded-xl border border-white/6">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-white font-mono">{p.rating}</span>
                  <span className="text-xs text-slate-400">({p.reviews})</span>
                </div>
              </div>

              <div className="space-y-4">
                {p.reviews_data.map((rev) => (
                  <div
                    key={rev.author + rev.date}
                    className="p-4 rounded-xl bg-[#070b12] border border-white/6 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{rev.author}</span>
                            <span className="text-[10px] text-emerald-400 font-normal">
                              ✓ Verified Customer
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{rev.date}</div>
                        </div>
                      </div>
                      <StarRating value={rev.rating} />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-11">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar — Sticky Booking Console */}
          <div className="space-y-6">
            <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-6 sticky top-24 shadow-2xl space-y-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-400" />
                <span>Shop Coordinates &amp; Hours</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-300 border-b border-white/8 pb-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>{p.address || p.location}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Service Radius: <strong className="text-slate-200">{p.serviceRadius}</strong></span>
                </div>
                {p.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-mono">{p.phone}</span>
                  </div>
                )}
                {p.availability.map((a) => (
                  <div key={a} className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedService(p.services[0])}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Book Instant Appointment ({fmt(p.services[0].price)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href={`/messages?provider=${p.id}`}
                  className="w-full py-2.5 bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-semibold rounded-xl hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all text-center flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Message Specialist</span>
                </Link>
                <Link
                  href="/services#request"
                  className="w-full py-2.5 bg-[#070b12] border border-white/6 text-slate-400 text-xs font-medium rounded-xl hover:text-white hover:border-white/15 transition-all text-center block"
                >
                  Broadcast Custom Quote Request
                </Link>
              </div>

              {/* Brand Specialties */}
              <div className="pt-3.5 border-t border-white/8 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Vehicle Brand Specialties
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {p.specialties.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 text-[11px] text-slate-300 bg-[#070b12] border border-white/6 rounded-lg font-mono"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust Assurances */}
              <div className="pt-3.5 border-t border-white/8 space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Debford Certified Trust
                </h4>
                <div className="space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Identity and master technician credentials verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>$0 upfront deposit — pay upon road test satisfaction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Automatic sync to vehicle garage service log</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DIRECT BOOKING MODAL ───────────────────── */}
      {selectedService && (
        <DirectBookingModal
          provider={p}
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
