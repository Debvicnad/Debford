"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const CATEGORIES = [
  {
    id: "cars",
    title: "Performance & Luxury Cars",
    eyebrow: "01 / PASSENGER & SPORT",
    description: "From everyday drives to extraordinary machines.",
    href: "/vehicles?bodyType=Sedan",
    cta: "Explore Cars",
    image: "/images/home/category-cars.jpg",
    accent: "from-blue-600/30 to-blue-900/10",
    badge: "Sports · Sedans · EVs",
    count: "8,400+ Available",
  },
  {
    id: "motorcycles",
    title: "Precision Motorcycles",
    eyebrow: "02 / TWO-WHEEL FREEDOM",
    description: "Experience freedom on two wheels.",
    href: "/vehicles?bodyType=Motorcycle",
    cta: "Explore Motorcycles",
    image: "/images/home/category-motorcycles.jpg",
    accent: "from-amber-600/30 to-amber-900/10",
    badge: "Superbikes · Cruisers · Adventure",
    count: "1,200+ Available",
  },
  {
    id: "trucks",
    title: "Capability & Heavy Duty",
    eyebrow: "03 / COMMERCIAL & POWER",
    description: "Built for capability. Ready for anything.",
    href: "/vehicles?bodyType=Truck",
    cta: "Explore Trucks",
    image: "/images/home/category-trucks.jpg",
    accent: "from-emerald-600/30 to-emerald-900/10",
    badge: "Pickups · Haulers · Commercial",
    count: "600+ Available",
  },
];

export function CategoryShowcase() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <section className="relative py-28 bg-[#0a0d14] overflow-hidden border-t border-white/5">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-debford relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] text-blue-400 uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Three Worlds. One Destination.</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Engineered for Every Passion and Purpose.
            </h2>
          </div>
          <p className="text-slate-400 text-sm sm:text-base max-w-md font-light leading-relaxed">
            Whether carving canyon roads, conquering rugged terrain, or commanding
            commercial fleets, Debford brings every vehicle category together.
          </p>
        </div>

        {/* 3-Column Editorial Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const isHovered = activeCategory === cat.id;

            return (
              <Link
                key={cat.id}
                href={cat.href}
                onMouseEnter={() => setActiveCategory(cat.id)}
                onMouseLeave={() => setActiveCategory(null)}
                className="group relative h-[480px] sm:h-[520px] rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 bg-slate-900/60 shadow-2xl transition-all duration-500 flex flex-col justify-between p-8"
              >
                {/* Background Image with Zoom on Hover */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-center brightness-[0.72] group-hover:brightness-[0.88] group-hover:scale-105 transition-all duration-700 ease-out"
                    quality={90}
                  />
                  {/* Subtle Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14]/60 via-transparent to-transparent" />
                </div>

                {/* Top Badge & Metric */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[11px] font-mono tracking-widest text-slate-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 uppercase">
                    {cat.eyebrow}
                  </span>
                  <span className="text-xs font-semibold text-white/90 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    {cat.count}
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 pt-8">
                  <div className="inline-block text-[11px] font-medium text-amber-300 tracking-wider uppercase mb-2">
                    {cat.badge}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-200 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
                    <span>{cat.cta}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-200" />
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
