"use client";

import { useState } from "react";
import Link from "next/link";
import type { ServiceProviderItem, ServicePackageItem } from "@/types/service.types";
import { DirectBookingModal } from "@/components/services/DirectBookingModal";

interface ProviderDetailViewProps {
  provider: ServiceProviderItem;
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-sm ${i < Math.floor(value) ? "text-amber-400" : "text-slate-700"}`}
        >
          ★
        </span>
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
    <div className="min-h-screen surface-base pt-16">
      {/* Breadcrumbs */}
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span>›</span>
          <Link href="/services" className="hover:text-slate-300 transition-colors">
            Services
          </Link>
          <span>›</span>
          <Link href="/services/providers" className="hover:text-slate-300 transition-colors">
            Providers
          </Link>
          <span>›</span>
          <span className="text-slate-300 truncate">{p.name}</span>
        </div>
      </div>

      <div className="container-debford py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column — Profile, Services & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Hero Card */}
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
              <div className="flex items-start gap-5 flex-wrap">
                <div className="w-20 h-20 gradient-brand rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-blue-500/20">
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="text-2xl font-extrabold text-white">{p.name}</h1>
                    {p.verified && (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                        ✓ Verified Specialist
                      </span>
                    )}
                    {p.isMobileService && (
                      <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2.5 py-0.5 rounded-full">
                        🚐 Mobile Service Available
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{p.type}</p>
                  {p.tagline && (
                    <p className="text-xs text-slate-400 italic mb-3">&ldquo;{p.tagline}&rdquo;</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {p.badges.map((b) => (
                      <span
                        key={b}
                        className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/25 rounded-full"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { label: "Rating", value: `${p.rating} ★` },
                  { label: "Reviews", value: p.reviews },
                  { label: "Jobs Completed", value: p.completedJobs },
                  { label: "Avg. Response", value: p.responseTime },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="text-center p-3 surface-base rounded-xl border border-white/5"
                  >
                    <div className="text-lg font-extrabold text-white">{s.value}</div>
                    <div className="text-[11px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services Packages Menu */}
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Service Packages & Transparent Pricing
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a service package to schedule an appointment with zero upfront fee.
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">Instant Booking</span>
              </div>

              <div className="space-y-3">
                {p.services.map((svc) => (
                  <div
                    key={svc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 surface-base rounded-xl border border-white/5 hover:border-white/15 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                          {svc.name}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                          ⏱ ~{svc.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{svc.desc}</p>
                      {svc.includes && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {svc.includes.map((inc) => (
                            <span
                              key={inc}
                              className="text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded"
                            >
                              ✓ {inc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                      <div className="text-lg font-black text-emerald-400">{fmt(svc.price)}</div>
                      <button
                        type="button"
                        onClick={() => setSelectedService(svc)}
                        className="px-4 py-2 gradient-brand text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 hover:opacity-95 transition-opacity"
                      >
                        Book Appointment →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Customer Reviews
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verified feedback from vehicle owners who booked via Debford.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-base">★</span>
                  <span className="text-base font-bold text-white">{p.rating}</span>
                  <span className="text-xs text-slate-500">({p.reviews})</span>
                </div>
              </div>

              <div className="space-y-4">
                {p.reviews_data.map((rev) => (
                  <div
                    key={rev.author + rev.date}
                    className="border-b border-white/5 last:border-0 pb-4 last:pb-0 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 gradient-brand rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{rev.author}</div>
                          <div className="text-[10px] text-slate-500">{rev.date}</div>
                        </div>
                      </div>
                      <StarRating value={rev.rating} />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-10">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Quick Booking CTA Box */}
            <div className="glass rounded-2xl border border-white/10 p-5 sticky top-20 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Shop Location & Hours
              </h3>
              <div className="space-y-2.5 text-xs text-slate-400 border-b border-white/8 pb-4">
                <div className="flex items-start gap-2">
                  <span className="text-sm">📍</span>
                  <span>{p.address || p.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🗺️</span>
                  <span>Service Radius: {p.serviceRadius}</span>
                </div>
                {p.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📞</span>
                    <span>{p.phone}</span>
                  </div>
                )}
                {p.availability.map((a) => (
                  <div key={a} className="flex items-center gap-2">
                    <span className="text-sm">🕐</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedService(p.services[0])}
                  className="w-full py-3 gradient-brand text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-95 transition-opacity"
                >
                  Book Instant Appointment ({fmt(p.services[0].price)}) →
                </button>
                <Link
                  href={`/messages?provider=${p.id}`}
                  className="block w-full py-2.5 glass border border-white/10 text-slate-300 text-xs font-semibold rounded-xl hover:text-white hover:border-white/20 transition-all text-center"
                >
                  💬 Message Specialist
                </Link>
                <Link
                  href="/services#request"
                  className="block w-full py-2.5 surface-base border border-white/5 text-slate-400 text-xs font-medium rounded-xl hover:text-white transition-colors text-center"
                >
                  Submit Custom Quote Request
                </Link>
              </div>

              {/* Specialties */}
              <div className="pt-3 border-t border-white/8 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Vehicle Brand Specialties
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {p.specialties.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 text-[11px] text-slate-300 surface-base border border-white/8 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust signals */}
              <div className="pt-3 border-t border-white/8 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Debford Certified Trust
                </h4>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>Identity and business registration verified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>💵</span>
                    <span>Zero upfront payment — pay upon satisfaction</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>📁</span>
                    <span>Automatic sync to vehicle garage history</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Booking Modal */}
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
