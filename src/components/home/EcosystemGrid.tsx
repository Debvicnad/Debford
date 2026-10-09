import Link from "next/link";
import {
  Car,
  KeyRound,
  Gavel,
  Wrench,
  Cog,
  Palette,
  ArrowUpRight,
} from "lucide-react";

const ECOSYSTEM_SERVICES = [
  {
    icon: Car,
    title: "Vehicle Marketplace",
    subtitle: "BUY & SELL NATIONWIDE",
    desc: "Browse verified inventory of performance cars, motorcycles, and heavy-duty trucks from verified dealers and private sellers.",
    href: "/vehicles",
    badge: "Direct Purchase",
    gradient: "from-blue-600/20 via-slate-900 to-slate-950",
    border: "hover:border-blue-500/40",
  },
  {
    icon: KeyRound,
    title: "Vehicle Rentals",
    subtitle: "FLEXIBLE MOBILITY",
    desc: "Rent premium sports cars, utility trucks, or city commuters with flexible daily, weekly, or monthly agreements.",
    href: "/rentals",
    badge: "Instant Booking",
    gradient: "from-purple-600/20 via-slate-900 to-slate-950",
    border: "hover:border-purple-500/40",
  },
  {
    icon: Gavel,
    title: "Commercial Auctions",
    subtitle: "LIVE BIDDING ARENA",
    desc: "Participate in transparent commercial vehicle auctions with real-time bidding, detailed condition reports, and escrow security.",
    href: "/auctions",
    badge: "Live Bids",
    gradient: "from-amber-600/20 via-slate-900 to-slate-950",
    border: "hover:border-amber-500/40",
  },
  {
    icon: Wrench,
    title: "Automotive Services",
    subtitle: "CERTIFIED TECHNICIANS",
    desc: "Book accredited mechanics, detailing studios, diagnostic specialists, and emergency mobile repair technicians.",
    href: "/services",
    badge: "Quotes & Bookings",
    gradient: "from-emerald-600/20 via-slate-900 to-slate-950",
    border: "hover:border-emerald-500/40",
  },
  {
    icon: Cog,
    title: "Genuine Spare Parts",
    subtitle: "OEM & PERFORMANCE",
    desc: "Source OEM and high-performance aftermarket parts with guaranteed model and chassis compatibility matching.",
    href: "/parts",
    badge: "Parts Catalog",
    gradient: "from-rose-600/20 via-slate-900 to-slate-950",
    border: "hover:border-rose-500/40",
  },
  {
    icon: Palette,
    title: "Customization & Studio",
    subtitle: "BESPOKE UPGRADES",
    desc: "Configure bespoke aesthetic modifications, performance tuning packages, wraps, and audio system overhauls.",
    href: "/customisation",
    badge: "Studio Configurator",
    gradient: "from-cyan-600/20 via-slate-900 to-slate-950",
    border: "hover:border-cyan-500/40",
  },
];

export function EcosystemGrid() {
  return (
    <section className="relative py-28 bg-[#0d111a] border-t border-white/5">
      <div className="container-debford relative z-10">
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono tracking-[0.2em] text-blue-400 uppercase mb-3">
            More Than A Marketplace
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            The Complete Vehicle Lifecycle Engine
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 font-light">
            Every dimension of owning, trading, tuning, and maintaining vehicles
            orchestrated into a single unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ECOSYSTEM_SERVICES.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`group relative p-8 rounded-3xl bg-gradient-to-b ${item.gradient} border border-white/10 ${item.border} shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase bg-black/40 px-3 py-1 rounded-full border border-white/8">
                      {item.badge}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-1">
                    {item.subtitle}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/8 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                    Explore Experience
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-blue-600/50 group-hover:border-blue-500/50 transition-all">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
