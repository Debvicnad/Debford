import Image from "next/image";

export function VisualInterlude() {
  return (
    <section className="relative h-[65vh] sm:h-[75vh] flex items-center justify-center overflow-hidden border-t border-b border-white/10 select-none">
      {/* High-res Panoramic Backdrop */}
      <Image
        src="/images/home/automotive-journey.jpg"
        alt="Built for Every Journey — High-Performance Supercar, Sport Motorcycle, and Heavy Duty Truck on Illuminated Skyline Highway"
        fill
        sizes="100vw"
        className="object-cover object-center brightness-[0.68] filter contrast-[1.05]"
        quality={92}
      />

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-[#0a0d14]/80" />
      <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-black/80" />

      {/* Foreground Content */}
      <div className="container-debford relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-slate-300 text-xs font-mono tracking-widest uppercase mb-6 shadow-xl">
          <span>Unified Horizons</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6 drop-shadow-2xl">
          Built for Every Journey.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-amber-300">
            Driven by Passion.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-200 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
          From high-revving track straights to open desert trails and cross-country
          commercial logistics—Debford is designed for those who appreciate the
          art and engineering of mobility.
        </p>
      </div>
    </section>
  );
}
