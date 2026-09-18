import type { Metadata } from "next";
import Link from "next/link";
import { ServiceRequestWizard } from "@/components/services/ServiceRequestWizard";

export const metadata: Metadata = {
  title: "Automotive Services",
  description: "Find trusted mechanics, detailers, electricians, and specialists near you on Debford.",
};

const FEATURED_PROVIDERS = [
  {
    id: "sp1", name: "AutoCare Pro NYC", type: "General Mechanic",
    rating: 4.9, reviews: 312, price: "From $80", location: "Brooklyn, NY",
    badges: ["Verified", "Top Rated"], specialties: ["Engine", "Brakes", "Suspension", "Oil Change"],
    initials: "AC",
  },
  {
    id: "sp2", name: "EliteBody & Paint", type: "Body & Paint Specialist",
    rating: 4.8, reviews: 187, price: "From $200", location: "Queens, NY",
    badges: ["Verified", "Featured"], specialties: ["Dent Repair", "Respray", "PPF", "Ceramic Coating"],
    initials: "EB",
  },
  {
    id: "sp3", name: "TurboTech Performance", type: "Performance Tuning",
    rating: 5.0, reviews: 94, price: "From $350", location: "Manhattan, NY",
    badges: ["Verified", "Premium"], specialties: ["ECU Tune", "Exhaust", "Suspension", "Dyno"],
    initials: "TT",
  },
  {
    id: "sp4", name: "ShineDetail Studio", type: "Detailing & Valet",
    rating: 4.9, reviews: 408, price: "From $120", location: "Bronx, NY",
    badges: ["Verified"], specialties: ["Full Detail", "Ceramic", "PPF", "Window Tint"],
    initials: "SD",
  },
];

const SERVICE_CATEGORIES = [
  { icon: "🔧", label: "Mechanic", count: 142, href: "/services/providers?category=mechanic" },
  { icon: "⚡", label: "Auto Electrician", count: 67, href: "/services/providers?category=diagnostic" },
  { icon: "🔬", label: "Diagnostics", count: 89, href: "/services/providers?category=diagnostic" },
  { icon: "🚗", label: "Body & Paint", count: 54, href: "/services/providers?category=bodywork" },
  { icon: "⭕", label: "Tires", count: 78, href: "/services/providers?category=mechanic" },
  { icon: "✨", label: "Detailing", count: 203, href: "/services/providers?category=detailing" },
  { icon: "🎨", label: "Customisation", count: 31, href: "/services/providers?category=performance" },
  { icon: "🏎️", label: "Performance", count: 22, href: "/services/providers?category=performance" },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen surface-base">
      {/* Hero */}
      <div className="relative overflow-hidden surface-raised border-b border-subtle">
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl" />
        <div className="container-debford py-14 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold text-white mb-3">Automotive Services</h1>
            <p className="text-slate-400 text-lg mb-6">
              Get quotes from verified mechanics, detailers, and specialists near you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="#request" className="px-6 py-3 gradient-brand text-white font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all text-sm">
                Request a service →
              </Link>
              <Link href="/services/requests" className="px-6 py-3 glass border border-blue-500/30 text-blue-300 font-semibold rounded-xl hover:border-blue-500/50 hover:text-white transition-all text-sm flex items-center gap-1.5">
                <span>⚡</span>
                <span>Requests &amp; Quotes Hub</span>
              </Link>
              <Link href="/services/providers" className="px-6 py-3 glass border border-white/15 text-slate-200 font-medium rounded-xl hover:border-white/25 hover:text-white transition-all text-sm">
                Browse specialists
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-debford py-10 space-y-12">
        {/* Hub Callout Banner */}
        <div className="p-5 sm:p-6 rounded-2xl glass border border-blue-500/20 bg-gradient-to-r from-blue-900/20 via-slate-900/40 to-slate-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center text-white text-xl shrink-0 shadow-lg shadow-blue-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Requests &amp; Quotes Hub</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review incoming bids from verified specialists, approve itemized quotes, or manage your confirmed bookings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/services/requests"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-blue-500/20 text-center"
            >
              Open Requests Hub →
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider mb-6 text-center">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { n: "1", icon: "📝", title: "Describe your need", desc: "Tell us about your vehicle and what you need done" },
              { n: "2", icon: "📬", title: "Receive quotes", desc: "Verified providers in your area send competitive quotes" },
              { n: "3", icon: "✅", title: "Choose a provider", desc: "Compare ratings, reviews, and prices — pick who you trust" },
              { n: "4", icon: "🔧", title: "Get it done", desc: "Service is completed. Leave a review to help others" },
            ].map((s) => (
              <div key={s.n} className="glass rounded-2xl border border-white/10 p-5 text-center hover:border-white/20 transition-colors">
                <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center text-white font-extrabold text-sm mx-auto mb-3">
                  {s.n}
                </div>
                <div className="text-xl mb-2">{s.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider mb-4">Browse by Service</h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {SERVICE_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex flex-col items-center gap-2 p-3 glass rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/3 transition-all group text-center"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs text-slate-400 group-hover:text-white transition-colors font-medium">{cat.label}</span>
                <span className="text-xs text-slate-700">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured providers */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Top Providers Near You</h2>
            <Link href="/services/providers" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURED_PROVIDERS.map((p) => (
              <Link
                key={p.id}
                href={`/services/${p.id}`}
                className="group glass rounded-2xl border border-white/10 p-5 hover:border-white/20 hover:shadow-xl hover:shadow-black/10 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {p.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{p.name}</h3>
                      {p.badges.map((b) => (
                        <span key={b} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          b === "Top Rated" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                          b === "Featured" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                          b === "Premium" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                          "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                        }`}>{b}</span>
                      ))}
                    </div>
                    <div className="text-xs text-slate-500">{p.type} · 📍 {p.location}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end mb-0.5">
                      <span className="text-amber-400 text-sm">★</span>
                      <span className="text-sm font-bold text-white">{p.rating}</span>
                    </div>
                    <div className="text-xs text-slate-600">{p.reviews} reviews</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.specialties.map((s) => (
                    <span key={s} className="px-2.5 py-1 text-xs text-slate-400 surface-base border border-white/8 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-400">{p.price}</span>
                  <span className="text-xs font-semibold text-blue-400 group-hover:underline">View profile →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Request wizard */}
        <div id="request" className="scroll-mt-8">
          <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center text-xl">📝</div>
              <div>
                <h2 className="text-lg font-bold text-white">Request a Service</h2>
                <p className="text-slate-500 text-sm">Get quotes from providers in your area</p>
              </div>
            </div>
            <ServiceRequestWizard />
          </div>
        </div>
      </div>
    </div>
  );
}
