import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  await params;
  return {
    title: "Service Provider Profile",
    description: "View this provider's services, reviews, and availability on Debford.",
  };
}

const MOCK_PROVIDER = {
  id: "sp1",
  name: "AutoCare Pro NYC",
  type: "General Mechanic & Diagnostics",
  tagline: "Fast, honest, and reliable. 10+ years serving the NYC metro area.",
  location: "Brooklyn, New York, NY",
  serviceRadius: "25 km",
  rating: 4.9,
  reviews: 312,
  completedJobs: 847,
  responseTime: "< 1 hour",
  memberSince: "January 2024",
  verified: true,
  badges: ["Top Rated", "Fast Response", "Verified ID"],
  initials: "AC",
  services: [
    { name: "Full Engine Service", desc: "Includes oil change, filters, spark plugs, and inspection", price: 180, duration: "3–4 hours" },
    { name: "Brake Service", desc: "Pads, rotors, and brake fluid flush", price: 250, duration: "2–3 hours" },
    { name: "Diagnostic Scan", desc: "Full OBD-II scan and fault code analysis", price: 80, duration: "1 hour" },
    { name: "Suspension Check", desc: "Inspect and replace shocks, struts, bushings", price: 150, duration: "2 hours" },
    { name: "Tyre Rotation", desc: "Balance and rotate all four tyres", price: 60, duration: "45 min" },
    { name: "AC Service", desc: "Recharge, leak test, and cabin filter", price: 120, duration: "1.5 hours" },
  ],
  reviews_data: [
    { author: "James K.", rating: 5, date: "Sep 2026", text: "Diagnosed and fixed my engine misfire in under 2 hours. Honest pricing, no upselling. Will definitely return." },
    { author: "Sarah M.", rating: 5, date: "Aug 2026", text: "Excellent service! Fixed my brakes same day. Very professional and kept me updated throughout." },
    { author: "Mike T.", rating: 4, date: "Aug 2026", text: "Great mechanic. Slight delay on parts but communicated well. Would recommend." },
  ],
  specialties: ["German Cars", "Toyota/Lexus", "BMW", "Mercedes", "Honda/Acura", "EV Diagnosis"],
  availability: ["Monday–Friday: 8am–6pm", "Saturday: 9am–4pm", "Mobile service available"],
};

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < value ? "text-amber-400" : "text-slate-700"}`}>★</span>
      ))}
    </div>
  );
}

export default async function ServiceProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = MOCK_PROVIDER;
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen surface-base pt-16">
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <span>›</span>
          <Link href="/services" className="hover:text-slate-300 transition-colors">Services</Link>
          <span>›</span>
          <span className="text-slate-300 truncate">{p.name}</span>
        </div>
      </div>

      <div className="container-debford py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile hero */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <div className="flex items-start gap-5 flex-wrap">
                <div className="w-20 h-20 gradient-brand rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="text-xl font-bold text-white">{p.name}</h1>
                    {p.verified && <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">✓ Verified</span>}
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{p.type}</p>
                  <p className="text-sm text-slate-500 italic mb-3">&ldquo;{p.tagline}&rdquo;</p>
                  <div className="flex flex-wrap gap-2">
                    {p.badges.map((b) => (
                      <span key={b} className="px-2.5 py-1 text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/25 rounded-full">{b}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {[
                  { label: "Rating", value: `${p.rating} ★` },
                  { label: "Reviews", value: p.reviews },
                  { label: "Jobs done", value: p.completedJobs },
                  { label: "Response", value: p.responseTime },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 surface-base rounded-xl border border-white/5">
                    <div className="text-lg font-bold text-white">{s.value}</div>
                    <div className="text-xs text-slate-600">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Services Offered</h2>
              <div className="space-y-3">
                {p.services.map((svc) => (
                  <div key={svc.name} className="flex items-start justify-between gap-4 p-4 surface-base rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors mb-0.5">{svc.name}</h3>
                      <p className="text-xs text-slate-500">{svc.desc}</p>
                      <span className="text-xs text-slate-600 mt-1 block">⏱ {svc.duration}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-blue-400">{fmt(svc.price)}</div>
                      <button className="mt-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">Book →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Reviews</h2>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">★</span>
                  <span className="text-sm font-bold text-white">{p.rating}</span>
                  <span className="text-xs text-slate-600">({p.reviews})</span>
                </div>
              </div>
              <div className="space-y-4">
                {p.reviews_data.map((rev) => (
                  <div key={rev.author} className="border-b border-white/5 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 gradient-brand rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{rev.author}</div>
                          <div className="text-xs text-slate-600">{rev.date}</div>
                        </div>
                      </div>
                      <StarRating value={rev.rating} />
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* CTA */}
            <div className="glass rounded-2xl border border-white/10 p-5 sticky top-20">
              <h3 className="text-sm font-bold text-white mb-4">Get a quote</h3>
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>📍</span>
                  <span>{p.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>🗺️</span>
                  <span>Service radius: {p.serviceRadius}</span>
                </div>
                {p.availability.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-xs text-slate-500">
                    <span>🕐</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
              <Link href={`/messages?provider=${p.id}`} className="block w-full py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all text-center mb-2">
                Request a Quote →
              </Link>
              <Link href="/services#request" className="block w-full py-2.5 glass border border-white/10 text-slate-300 text-sm font-medium rounded-xl hover:border-white/20 hover:text-white transition-all text-center">
                Book via Service Request
              </Link>
            </div>

            {/* Specialties */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Vehicle Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {p.specialties.map((s) => (
                  <span key={s} className="px-2.5 py-1.5 text-xs text-slate-400 surface-base border border-white/8 rounded-full">{s}</span>
                ))}
              </div>
            </div>

            {/* Trust signals */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Trust & Safety</h3>
              <div className="space-y-2">
                {[
                  { icon: "🪪", label: "Identity verified" },
                  { icon: "🏢", label: `Member since ${p.memberSince}` },
                  { icon: "🔒", label: "Secure payment via Debford" },
                  { icon: "⚖️", label: "Dispute resolution available" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
