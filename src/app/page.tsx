import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// HOMEPAGE — Debford
// ============================================================

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const initial = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <main className="min-h-screen surface-base">
      {/* ── NAVIGATION ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-subtle">
        <div className="container-debford">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-300">
                <span className="text-white font-extrabold text-sm">D</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                DEBFORD
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: "Vehicles", href: "/vehicles" },
                { label: "Rentals", href: "/rentals" },
                { label: "Auctions", href: "/auctions" },
                { label: "Services", href: "/services" },
                { label: "Parts", href: "/parts" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-150"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth CTAs */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/sell"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 gradient-brand text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    + List vehicle
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-1.5 surface-raised border border-white/10 hover:border-white/20 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <div className="w-6 h-6 gradient-brand rounded-full flex items-center justify-center text-[11px] font-bold">
                      {initial}
                    </div>
                    <span>Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-semibold text-white gradient-brand rounded-lg shadow-lg hover:shadow-blue-500/25 hover:opacity-90 transition-all duration-150"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden pt-16">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-debford relative z-10 py-24">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-2 mb-8 border border-white/10">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300 font-medium">
                Your Automotive World, All in One Place
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-display text-white mb-6">
              Drive Every
              <br />
              <span className="text-gradient">Possibility</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Discover, buy, sell, rent, and auction vehicles. Find trusted
              automotive professionals, source parts, and manage your entire
              vehicle ownership lifecycle — all in one platform.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/vehicles"
                className="px-8 py-4 text-base font-semibold text-white gradient-brand rounded-xl shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200"
              >
                Browse Vehicles
              </Link>
              <Link
                href="/sell"
                className="px-8 py-4 text-base font-semibold text-slate-200 glass rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200"
              >
                List Your Vehicle
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {[
                { value: "10K+", label: "Vehicles Listed" },
                { value: "500+", label: "Dealers" },
                { value: "200+", label: "Service Pros" },
                { value: "50+", label: "Live Auctions" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-extrabold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-white" />
        </div>
      </section>

      {/* ── LIFECYCLE SECTION ──────────────────────────────── */}
      <section className="py-24 surface-raised border-t border-subtle">
        <div className="container-debford">
          <div className="text-center mb-16">
            <h2 className="text-hero text-white mb-4">
              The Complete Vehicle Lifecycle
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Debford supports you at every stage of vehicle ownership — from
              discovery to resale and everything in between.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              "Discover",
              "Compare",
              "Buy",
              "Rent",
              "Bid",
              "Auction",
              "Own",
              "Maintain",
              "Repair",
              "Upgrade",
              "Sell",
              "Repeat",
            ].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-3">
                <div className="px-4 py-2 glass rounded-full border border-white/10 text-sm font-medium text-slate-200 hover:border-blue-500/40 hover:text-white transition-all duration-150">
                  {step}
                </div>
                {i < arr.length - 1 && (
                  <span className="text-slate-600 text-lg">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKETPLACE SECTIONS ───────────────────────────── */}
      <section className="py-24 surface-base">
        <div className="container-debford">
          <div className="text-center mb-16">
            <h2 className="text-hero text-white mb-4">
              Everything Automotive
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              One platform. Every automotive need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🚗",
                title: "Vehicle Marketplace",
                desc: "Browse thousands of cars, motorcycles, and trucks from verified dealers and private sellers.",
                href: "/vehicles",
                cta: "Browse Vehicles",
                accent: "from-blue-600/20 to-blue-800/10",
                border: "border-blue-500/20",
              },
              {
                icon: "🔑",
                title: "Vehicle Rentals",
                desc: "Find the perfect rental vehicle for any occasion. Flexible terms, verified providers.",
                href: "/rentals",
                cta: "Find Rentals",
                accent: "from-purple-600/20 to-purple-800/10",
                border: "border-purple-500/20",
              },
              {
                icon: "🔨",
                title: "Commercial Auctions",
                desc: "Participate in transparent commercial vehicle auctions with live bidding and full audit trails.",
                href: "/auctions",
                cta: "View Auctions",
                accent: "from-amber-600/20 to-amber-800/10",
                border: "border-amber-500/20",
              },
              {
                icon: "🔧",
                title: "Automotive Services",
                desc: "Connect with trusted mechanics, body shops, detailers, and automotive specialists.",
                href: "/services",
                cta: "Find Services",
                accent: "from-emerald-600/20 to-emerald-800/10",
                border: "border-emerald-500/20",
              },
              {
                icon: "⚙️",
                title: "Spare Parts",
                desc: "Source genuine and aftermarket parts with full vehicle compatibility filters.",
                href: "/parts",
                cta: "Shop Parts",
                accent: "from-rose-600/20 to-rose-800/10",
                border: "border-rose-500/20",
              },
              {
                icon: "🏠",
                title: "My Garage",
                desc: "Manage your vehicles, track service history, set maintenance reminders, and store documents.",
                href: "/garage",
                cta: "Open Garage",
                accent: "from-cyan-600/20 to-cyan-800/10",
                border: "border-cyan-500/20",
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group relative p-6 surface-raised rounded-2xl border ${card.border} bg-gradient-to-br ${card.accent} hover:scale-[1.02] hover:shadow-xl transition-all duration-200`}
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  {card.desc}
                </p>
                <span className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                  {card.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── VEHICLE TYPES ──────────────────────────────────── */}
      <section className="py-24 surface-raised border-t border-subtle">
        <div className="container-debford">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              Browse by Vehicle Type
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: "🚗", label: "Cars", count: "8,400+", href: "/vehicles/cars" },
              { icon: "🏍️", label: "Motorcycles", count: "1,200+", href: "/vehicles/motorcycles" },
              { icon: "🚛", label: "Trucks", count: "600+", href: "/vehicles/trucks" },
            ].map((type) => (
              <Link
                key={type.label}
                href={type.href}
                className="group flex flex-col items-center p-8 glass rounded-2xl border border-white/10 hover:border-blue-500/30 hover:bg-white/5 transition-all duration-200"
              >
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {type.icon}
                </span>
                <span className="text-lg font-bold text-white mb-1">
                  {type.label}
                </span>
                <span className="text-sm text-slate-500">{type.count} listings</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SELL CTA ───────────────────────────────────────── */}
      <section className="py-24 surface-base border-t border-subtle">
        <div className="container-debford">
          <div className="relative overflow-hidden gradient-brand rounded-3xl p-12 text-center">
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, white 0%, transparent 50%),
                                  radial-gradient(circle at 80% 50%, white 0%, transparent 50%)`
              }}
            />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to Sell Your Vehicle?
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                List your vehicle in minutes and reach thousands of verified buyers.
                Private sellers and dealers welcome.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sell"
                  className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors duration-150"
                >
                  List Your Vehicle
                </Link>
                <Link
                  href="/register?role=dealer"
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors duration-150"
                >
                  Register as Dealer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="surface-raised border-t border-subtle py-16">
        <div className="container-debford">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">D</span>
                </div>
                <span className="text-white font-bold text-xl">DEBFORD</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                A complete digital ecosystem for the vehicle lifecycle. Discover, buy, sell, rent, and more.
              </p>
            </div>

            {[
              {
                heading: "Marketplace",
                links: [
                  { label: "Browse Vehicles", href: "/vehicles" },
                  { label: "Rentals", href: "/rentals" },
                  { label: "Auctions", href: "/auctions" },
                  { label: "Parts", href: "/parts" },
                ],
              },
              {
                heading: "Services",
                links: [
                  { label: "Find a Mechanic", href: "/services" },
                  { label: "Body & Paint", href: "/services/body" },
                  { label: "Tire Services", href: "/services/tires" },
                  { label: "Customization", href: "/services/custom" },
                ],
              },
              {
                heading: "Account",
                links: [
                  { label: "My Garage", href: "/garage" },
                  { label: "Messages", href: "/messages" },
                  { label: "Membership", href: "/membership" },
                  { label: "Sell a Vehicle", href: "/sell" },
                ],
              },
            ].map((col) => (
              <div key={col.heading}>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {col.heading}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-subtle pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              © 2026 Debford. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-sm text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
