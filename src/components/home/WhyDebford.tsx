import {
  Layers,
  ShieldCheck,
  Cpu,
  History,
  Scale,
  Sparkles,
} from "lucide-react";

const VALUE_PILLARS = [
  {
    icon: Layers,
    title: "One Connected Ecosystem",
    desc: "Seamlessly transition between purchasing a vehicle, booking certified routine maintenance, sourcing rare parts, and monitoring depreciation.",
  },
  {
    icon: Scale,
    title: "Multi-Category Native",
    desc: "Engineered specifically for the nuances of performance sports cars, sport and cruiser motorcycles, and commercial heavy-duty trucks.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Identity & Sellers",
    desc: "Rigorous dealer vetting, verification badges, and secure audit trails ensure peace of mind for both buyers and private sellers.",
  },
  {
    icon: History,
    title: "Complete Lifecycle Tracking",
    desc: "Debford Garage gives every vehicle a immutable digital record: service logs, ownership transfers, inspection receipts, and warranty details.",
  },
  {
    icon: Cpu,
    title: "Technical Discovery Engine",
    desc: "Filter by exact transmission types, displacement, fuel configurations, drivetrain specifications, and localized availability.",
  },
  {
    icon: Sparkles,
    title: "Transparent Direct Transactions",
    desc: "No hidden dealership markups, obfuscated auction fees, or uncertain service rates. Clear terms and direct dealer communication.",
  },
];

export function WhyDebford() {
  return (
    <section className="relative py-28 bg-[#0a0d14] border-t border-white/5">
      <div className="container-debford relative z-10">
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono tracking-[0.2em] text-blue-400 uppercase mb-3">
            Engineered Excellence
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Why Enthusiasts and Fleets Choose Debford
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 font-light">
            Built from the ground up to solve fragmented marketplaces, separated
            service directories, and scattered vehicle paperwork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUE_PILLARS.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-8 rounded-3xl bg-slate-900/40 border border-white/8 hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                  <IconComponent className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
