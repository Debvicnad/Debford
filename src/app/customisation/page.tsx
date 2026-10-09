import type { Metadata } from "next";
import Link from "next/link";
import { CustomisationStudio } from "@/components/customisation/CustomisationStudio";
import {
  Sparkles,
  ChevronRight,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Vehicle Customisation & Performance Studio — Debford",
  description: "Design custom vehicle specs with our interactive visualizer. Explore bespoke wraps, forged wheels, aero kits, titanium exhausts, and connect with certified performance tuners.",
};

const CATEGORIES = [
  { icon: "🏎️", label: "Performance & ECU", items: ["Stage 1/2 ECU Tune", "Titanium Exhausts", "Cold Air Intakes", "Coilovers", "Big Brake Kits", "Intercoolers"], providers: 22 },
  { icon: "🎨", label: "Aesthetics & Wraps", items: ["Satin & Matte Wraps", "Chameleon Vinyl", "Dry Carbon Trim", "Window Tint", "LED Headlights", "Ambient Lighting"], providers: 34 },
  { icon: "⭕", label: "Forged Wheels & Tyres", items: ["Monoblock Forged", "3-Piece Mesh Wheels", "Track Slicks", "Wheel Spacers", "Centerlock Replicas", "TPMS Sensors"], providers: 28 },
  { icon: "🛡️", label: "Surface Protection", items: ["Self-Healing PPF", "9H Ceramic Coating", "Underbody Sealant", "Windshield Film", "Leather Guard"], providers: 19 },
  { icon: "🎵", label: "Acoustic Audio & Tech", items: ["High-End DSP Amplifiers", "Component Speakers", "Subwoofer Enclosures", "Apple CarPlay Retrofit", "Dashcams"], providers: 41 },
  { icon: "🪑", label: "Bespoke Interior", items: ["Custom Alcantara Reupholstery", "Carbon Steering Wheels", "Billet Pedals", "Starlight Headliner"], providers: 17 },
];

const FEATURED_BUILDS = [
  {
    id: "b1",
    title: "Stage 2 Performance Build — BMW M3 G80",
    mods: ["Full Titanium Catback", "Eventuri Cold Air Intake", "ECU Stage 2 Tune", "KW V3 Coilovers", "20\" Forged Monoblock Wheels"],
    cost: 12400,
    hp: "+87 HP",
    provider: "TurboTech Performance",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "b2",
    title: "Satin Wrap & Carbon Aero — Porsche 911 GT3",
    mods: ["Satin Chalk White Wrap", "Full Carbon Splitter & Wing", "Ceramic Coating", "20% Ceramic Tint", "Forged Bronze Rims"],
    cost: 14800,
    hp: "+22 HP",
    provider: "WrapKing Studio",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "b3",
    title: "Overland Expedition Rig — Land Cruiser 300",
    mods: ["Old Man Emu +2.5\" Lift", "Method 17\" Beadlocks", "BFG KO2 All-Terrains", "Baja Designs Lighting", "Dual Battery System"],
    cost: 9600,
    hp: "+35 HP",
    provider: "Apex 4x4 Outfitters",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
  },
];

export default function CustomisationPage() {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="min-h-screen surface-base">
      {/* Hero Header */}
      <div className="relative overflow-hidden surface-raised border-b border-subtle pt-10 pb-12">
        <div className="absolute inset-0 gradient-hero opacity-75" />
        <div className="absolute top-0 right-1/3 w-[550px] h-[350px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-debford relative z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-slate-300">Customisation Studio</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive 2D/3D Vehicle Spec Configurator & Quote Engine</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
              Design Your Dream Build
            </h1>
            <p className="text-slate-400 text-base sm:text-lg">
              Visualise exotic wraps, custom forged wheels, suspension drops, and carbon aerodynamics in real time — then connect with Debford certified tuners for turnkey installation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Studio Section */}
      <div className="container-debford py-10 space-y-16">
        {/* Visualizer Studio */}
        <section>
          <CustomisationStudio />
        </section>

        {/* Upgrade Categories */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Specialist Upgrade Categories
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Explore over 160+ certified tuning shops, wrap studios, and fabrication specialists</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href="/services?type=customization"
                className="glass rounded-2xl border border-white/10 p-5 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-[#131b2e] rounded-xl flex items-center justify-center text-2xl border border-white/5">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {cat.label}
                    </h3>
                    <span className="text-[11px] text-slate-500">{cat.providers} verified shops</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-400 bg-white/5 border border-white/5 rounded-lg group-hover:border-white/10 transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Community Builds */}
        <section className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Featured Community Builds
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real projects completed through the Debford Certified Specialist network</p>
            </div>
            <Link
              href="/garage"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Explore Digital Garage Showcase</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {FEATURED_BUILDS.map((build) => (
              <div
                key={build.id}
                className="glass rounded-2xl border border-white/10 overflow-hidden hover:border-white/25 transition-all group flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {build.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 bg-white/5 px-2 py-0.5 rounded-lg">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-white">{build.rating}</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5">
                    {build.mods.map((mod) => (
                      <li key={mod} className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span>{mod}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 bg-[#131b2e]/60 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-white">{fmt(build.cost)}</div>
                    <div className="text-[11px] text-emerald-400 font-bold">{build.hp} output</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-300">{build.provider}</div>
                    <span className="text-[10px] text-slate-500">Verified Tuner</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Consultation CTA */}
        <section className="glass rounded-3xl border border-white/10 p-8 sm:p-10 text-center relative overflow-hidden bg-gradient-to-b from-[#131b2e] to-[#0a0d14]">
          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-xl shadow-blue-500/20">
              🛠️
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Have a Bespoke Vision in Mind?</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Connect directly with verified engine builders, widebody fabricators, and master wrap technicians for dedicated one-on-one build consultations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/services?type=customization"
                className="px-6 py-3.5 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/25 transition-all"
              >
                Find Certified Specialists →
              </Link>
              <Link
                href="/services/request"
                className="px-6 py-3.5 glass border border-white/15 text-slate-200 text-xs font-bold rounded-xl hover:border-white/25 hover:text-white transition-all"
              >
                Request Custom Project Quote
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
