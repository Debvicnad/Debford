"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Palette,
  Disc,
  Layers,
  Wrench,
  Sparkles,
  AlertCircle,
  Share2,
  ShieldCheck,
  Gauge,
  Flame,
  ArrowRight,
  Check,
} from "lucide-react";
import { submitCustomBuildQuote } from "@/lib/actions/customisation.actions";

type VehicleType = "coupe" | "sedan" | "supercar" | "suv";
type FinishType = "metallic" | "satin" | "gloss" | "chameleon" | "matte";

interface PaintColor {
  name: string;
  hex: string;
  finish: FinishType;
  price: number;
}

interface WheelOption {
  id: string;
  name: string;
  style: string;
  price: number;
}

interface AeroOption {
  id: string;
  name: string;
  desc: string;
  price: number;
  hpGain?: number;
  weightDelta?: number;
}

const VEHICLE_TYPES: { id: VehicleType; name: string; icon: string; baseModel: string }[] = [
  { id: "coupe", name: "Sports Coupe", icon: "🏎️", baseModel: "BMW M4 Competition" },
  { id: "supercar", name: "GT Supercar", icon: "🚀", baseModel: "Porsche 911 GT3 RS" },
  { id: "sedan", name: "Executive Sedan", icon: "🚘", baseModel: "Mercedes-AMG E63 S" },
  { id: "suv", name: "Performance SUV", icon: "🚙", baseModel: "Lamborghini Urus S" },
];

const PAINTS: PaintColor[] = [
  { name: "Midnight Stealth", hex: "#0c0e12", finish: "satin", price: 2800 },
  { name: "Nardo Battleship", hex: "#565a5e", finish: "gloss", price: 2200 },
  { name: "Sapphire Metallic", hex: "#0e3a75", finish: "metallic", price: 2400 },
  { name: "Guards Apex Red", hex: "#ba131a", finish: "metallic", price: 2500 },
  { name: "Alpine Pearl White", hex: "#f0f4f8", finish: "metallic", price: 2200 },
  { name: "Cyber Purple / Gold", hex: "#4b1e6d", finish: "chameleon", price: 4200 },
  { name: "Toxic Acid Green", hex: "#43b929", finish: "gloss", price: 3100 },
  { name: "Liquid Champagne Gold", hex: "#a48046", finish: "metallic", price: 3400 },
  { name: "Frozen Carbon Grey", hex: "#22272e", finish: "satin", price: 3200 },
  { name: "Miami Speed Turquoise", hex: "#008b8b", finish: "gloss", price: 2700 },
];

const WHEELS: WheelOption[] = [
  { id: "w1", name: "20\" Forged Monoblock", style: "Split 5-Spoke", price: 3800 },
  { id: "w2", name: "21\" Deep Dish Mesh", style: "Multi-Piece Step Lip", price: 4600 },
  { id: "w3", name: "19\" Aero Track Blades", style: "Carbon Inset Turbine", price: 3200 },
  { id: "w4", name: "20\" Satin GT Ultra-Light", style: "Centerlock Replica", price: 4200 },
  { id: "w5", name: "22\" Diamond Concave", style: "Executive Turbine", price: 4900 },
];

const WHEEL_FINISHES = [
  { name: "Gloss Black", hex: "#111111", price: 0 },
  { name: "Brushed Champagne Bronze", hex: "#9b784e", price: 400 },
  { name: "Liquid Chrome Silver", hex: "#dcdde1", price: 300 },
  { name: "Frozen Anthracite", hex: "#353b48", price: 250 },
];

const CALIPERS = [
  { name: "Brembo Racing Red", hex: "#e84118", price: 600 },
  { name: "Acid Ceramic Yellow", hex: "#fbc531", price: 600 },
  { name: "M Performance Cyan", hex: "#00a8ff", price: 600 },
  { name: "Toxic Lime Green", hex: "#4cd137", price: 600 },
  { name: "Stealth Gloss Black", hex: "#2f3640", price: 400 },
];

const TINTS = [
  { name: "Clear Glass (100%)", opacity: 0.1, price: 0 },
  { name: "Light Smoke (50%)", opacity: 0.4, price: 250 },
  { name: "Medium Privacy (35%)", opacity: 0.65, price: 350 },
  { name: "Dark Executive (20%)", opacity: 0.8, price: 450 },
  { name: "Limo Ceramic (5%)", opacity: 0.95, price: 600 },
];

const STANCES = [
  { name: "Track Slammed (-35mm)", offset: 12, price: 1800, desc: "KW V3 Full Coilover Kit" },
  { name: "Sport Drop (-18mm)", offset: 6, price: 850, desc: "H&R Progressive Lowering Springs" },
  { name: "OEM Factory Spec", offset: 0, price: 0, desc: "Stock Ride Height" },
  { name: "Lifted Overland (+25mm)", offset: -8, price: 1200, desc: "All-Terrain Rally Lift Kit" },
];

const AERO_KITS: AeroOption[] = [
  { id: "aero_oem", name: "Stock OEM Exterior", desc: "Factory aerodynamic trim", price: 0, hpGain: 0, weightDelta: 0 },
  { id: "aero_carbon", name: "M-Carbon Aero Package", desc: "Front Splitter, Side Skirts & Rear Diffuser", price: 3400, hpGain: 0, weightDelta: -12 },
  { id: "aero_gt", name: "GT Widebody & Ducktail", desc: "Flared Arch Extensions & Integrated Carbon Ducktail", price: 6200, hpGain: 0, weightDelta: 8 },
  { id: "aero_track", name: "RS Track Competition Wing", desc: "High-Downforce Carbon Wing & Vented Hood", price: 4800, hpGain: 0, weightDelta: -18 },
];

const EXHAUSTS = [
  { name: "Stock OEM Exhaust", desc: "Factory sound and emissions", price: 0, hp: 0 },
  { name: "Akrapovič Titanium Catback", desc: "Ultra-lightweight titanium with carbon tips", price: 5400, hp: 18 },
  { name: "Valvetronic Sport Exhaust", desc: "Electronically adjustable sound modes", price: 3200, hp: 12 },
];

const UNDERGLOWS = [
  { name: "None", hex: "transparent", price: 0 },
  { name: "Cyber Cyan Neon", hex: "#00d2d3", price: 450 },
  { name: "Hyper Purple Glow", hex: "#a29bfe", price: 450 },
  { name: "Acid Green Pulse", hex: "#55efc4", price: 450 },
  { name: "Warm Amber Halo", hex: "#ffeaa7", price: 450 },
];

const PRESETS = [
  {
    name: "Midnight Assassin",
    archetype: "coupe" as VehicleType,
    paint: PAINTS[0],
    wheel: WHEELS[0],
    wheelFinish: WHEEL_FINISHES[1],
    caliper: CALIPERS[1],
    tint: TINTS[4],
    stance: STANCES[0],
    aero: AERO_KITS[1],
    exhaust: EXHAUSTS[1],
    underglow: UNDERGLOWS[0],
  },
  {
    name: "Apex Track Weapon",
    archetype: "supercar" as VehicleType,
    paint: PAINTS[3],
    wheel: WHEELS[2],
    wheelFinish: WHEEL_FINISHES[0],
    caliper: CALIPERS[1],
    tint: TINTS[3],
    stance: STANCES[0],
    aero: AERO_KITS[3],
    exhaust: EXHAUSTS[1],
    underglow: UNDERGLOWS[0],
  },
  {
    name: "Cyberpunk Edition",
    archetype: "coupe" as VehicleType,
    paint: PAINTS[5],
    wheel: WHEELS[1],
    wheelFinish: WHEEL_FINISHES[2],
    caliper: CALIPERS[3],
    tint: TINTS[3],
    stance: STANCES[1],
    aero: AERO_KITS[2],
    exhaust: EXHAUSTS[2],
    underglow: UNDERGLOWS[1],
  },
  {
    name: "Executive Nardo VIP",
    archetype: "sedan" as VehicleType,
    paint: PAINTS[1],
    wheel: WHEELS[4],
    wheelFinish: WHEEL_FINISHES[0],
    caliper: CALIPERS[4],
    tint: TINTS[3],
    stance: STANCES[1],
    aero: AERO_KITS[1],
    exhaust: EXHAUSTS[2],
    underglow: UNDERGLOWS[0],
  },
];

export function CustomisationStudio() {
  const [vehicle, setVehicle] = useState<VehicleType>("coupe");
  const [activeTab, setActiveTab] = useState<"paint" | "wheels" | "aero" | "performance">("paint");
  const [paint, setPaint] = useState<PaintColor>(PAINTS[0]);
  const [wheel, setWheel] = useState<WheelOption>(WHEELS[0]);
  const [wheelFinish, setWheelFinish] = useState(WHEEL_FINISHES[1]);
  const [caliper, setCaliper] = useState(CALIPERS[1]);
  const [tint, setTint] = useState(TINTS[3]);
  const [stance, setStance] = useState(STANCES[0]);
  const [aero, setAero] = useState<AeroOption>(AERO_KITS[1]);
  const [exhaust, setExhaust] = useState(EXHAUSTS[1]);
  const [underglow, setUnderglow] = useState(UNDERGLOWS[0]);

  const [notes, setNotes] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Current vehicle archetype info
  const currentVehicleInfo = VEHICLE_TYPES.find((v) => v.id === vehicle) ?? VEHICLE_TYPES[0];

  // Calculate live total price
  const totalBuildPrice = useMemo(() => {
    return (
      paint.price +
      wheel.price +
      wheelFinish.price +
      caliper.price +
      tint.price +
      stance.price +
      aero.price +
      exhaust.price +
      underglow.price
    );
  }, [paint, wheel, wheelFinish, caliper, tint, stance, aero, exhaust, underglow]);

  const totalHpGain = exhaust.hp + (aero.hpGain ?? 0);
  const totalWeightDelta = aero.weightDelta ?? 0;

  function loadPreset(preset: (typeof PRESETS)[0]) {
    setVehicle(preset.archetype);
    setPaint(preset.paint);
    setWheel(preset.wheel);
    setWheelFinish(preset.wheelFinish);
    setCaliper(preset.caliper);
    setTint(preset.tint);
    setStance(preset.stance);
    setAero(preset.aero);
    setExhaust(preset.exhaust);
    setUnderglow(preset.underglow);
  }

  function handleShareBuild() {
    const summary = `${currentVehicleInfo.baseModel} — Custom Build ($${totalBuildPrice.toLocaleString()}): ${paint.name} on ${wheel.name}`;
    navigator.clipboard.writeText(`${summary} — ${window.location.href}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function handleSubmitQuote() {
    setQuoteError(null);
    startTransition(async () => {
      const res = await submitCustomBuildQuote({
        vehicleModel: currentVehicleInfo.baseModel,
        vehicleArchetype: currentVehicleInfo.name,
        paintColor: paint.name,
        paintFinish: paint.finish,
        wheelStyle: wheel.name,
        wheelFinish: wheelFinish.name,
        windowTint: tint.name,
        suspension: stance.name,
        aeroKit: aero.name,
        caliperColor: caliper.name,
        underglow: underglow.name,
        estimatedTotal: totalBuildPrice,
        customerNotes: notes.trim() || undefined,
      });

      if (res.error) {
        setQuoteError(res.error);
      } else {
        setQuoteSuccess(true);
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Archetype & Preset Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glass rounded-2xl border border-white/10 p-4">
        {/* Vehicle Archetype Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Platform:
          </span>
          {VEHICLE_TYPES.map((vt) => (
            <button
              key={vt.id}
              onClick={() => setVehicle(vt.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                vehicle === vt.id
                  ? "gradient-brand text-white shadow-lg shadow-blue-500/25"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{vt.icon}</span>
              <span>{vt.name}</span>
            </button>
          ))}
        </div>

        {/* Community Presets Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-all shrink-0 cursor-pointer"
            >
              ⚡ {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visualizer Canvas Display (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass rounded-3xl border border-white/15 overflow-hidden shadow-2xl relative bg-gradient-to-b from-[#0a0f1d] to-[#05070d] p-6">
            {/* Top Overlay Badges */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[10px] text-blue-400 uppercase font-extrabold tracking-wider block">
                  Interactive 2D/3D Studio
                </span>
                <h2 className="text-xl font-black text-white">{currentVehicleInfo.baseModel}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareBuild}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Link Copied!" : "Share Spec"}</span>
                </button>
              </div>
            </div>

            {/* Dynamic Vector Vehicle Visualizer Stage */}
            <div className="relative aspect-[16/9] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-black border border-white/5 my-2">
              {/* Dynamic Underglow Lighting */}
              {underglow.hex !== "transparent" && (
                <div
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-8 rounded-full blur-xl pointer-events-none transition-all duration-500"
                  style={{
                    backgroundColor: underglow.hex,
                    boxShadow: `0 0 45px 15px ${underglow.hex}`,
                    opacity: 0.85,
                  }}
                />
              )}

              {/* Vehicle SVG Canvas with Layered Attributes */}
              <div
                className="w-full max-w-xl transition-all duration-300"
                style={{
                  transform: `translateY(${stance.offset}px)`,
                }}
              >
                <svg
                  viewBox="0 0 900 420"
                  className="w-full h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Dynamic Paint Gradient */}
                    <linearGradient id="bodyPaintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={paint.hex} stopOpacity="1" />
                      <stop
                        offset="50%"
                        stopColor={paint.finish === "chameleon" ? "#f39c12" : paint.hex}
                        stopOpacity={paint.finish === "matte" ? 0.9 : 0.85}
                      />
                      <stop offset="100%" stopColor={paint.hex} stopOpacity="1" />
                    </linearGradient>

                    {/* Paint Highlight / Reflection */}
                    <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={paint.finish === "satin" ? "0.15" : "0.45"} />
                      <stop offset="60%" stopColor="#ffffff" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Wheel Rim Gradient */}
                    <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={wheelFinish.hex} />
                      <stop offset="100%" stopColor="#0a0a0a" />
                    </linearGradient>
                  </defs>

                  {/* Ground Shadow */}
                  <ellipse cx="450" cy="385" rx="380" ry="20" fill="#000000" fillOpacity="0.7" />

                  {/* Rear GT Wing / Spoiler if Aero Kit equipped */}
                  {aero.id === "aero_track" && (
                    <g id="gt-wing">
                      <path d="M120 180 L170 120 L195 120 L155 180 Z" fill="#111" stroke="#333" strokeWidth="2" />
                      <path d="M150 180 L200 120 L225 120 L185 180 Z" fill="#111" stroke="#333" strokeWidth="2" />
                      <path d="M90 120 C180 115 260 115 280 120 L275 130 C250 125 180 125 100 130 Z" fill="#1e272e" stroke="#00d2d3" strokeWidth="1" />
                    </g>
                  )}

                  {aero.id === "aero_gt" && (
                    <path
                      d="M130 190 C150 170 180 165 210 180 L205 190 Z"
                      fill="#1e272e"
                      stroke="#485460"
                      strokeWidth="2"
                    />
                  )}

                  {/* Main Vehicle Chassis / Body Silhouette */}
                  <path
                    d="M 120 280 C 120 230 160 190 230 185 C 310 180 390 130 520 130 C 650 130 730 190 790 230 C 820 250 830 290 820 320 C 810 340 780 350 760 350 L 690 350 C 690 310 650 280 610 280 C 570 280 530 310 530 350 L 330 350 C 330 310 290 280 250 280 C 210 280 170 310 170 350 L 110 350 C 100 340 100 300 120 280 Z"
                    fill="url(#bodyPaintGrad)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2"
                  />

                  {/* Body Highlight Reflection Layer */}
                  <path
                    d="M 240 190 C 330 185 410 140 520 140 C 630 140 710 190 770 230 L 750 245 C 690 205 620 155 520 155 C 410 155 330 195 240 205 Z"
                    fill="url(#highlightGrad)"
                  />

                  {/* Windows & Glass Layer with Dynamic Tint */}
                  <path
                    d="M 340 190 L 510 145 C 610 145 660 185 710 230 L 530 230 L 340 230 Z"
                    fill="#000000"
                    fillOpacity={tint.opacity}
                    stroke="#1e272e"
                    strokeWidth="2"
                  />
                  {/* Window Pillar */}
                  <path d="M 525 145 L 535 230" stroke="#0f172a" strokeWidth="6" />

                  {/* Headlights & Tail Lights */}
                  <path d="M 780 245 L 815 260 L 805 275 L 775 265 Z" fill="#38bdf8" fillOpacity="0.85" filter="drop-shadow(0 0 8px #38bdf8)" />
                  <path d="M 115 270 L 135 270 L 130 285 L 110 285 Z" fill="#ef4444" fillOpacity="0.9" filter="drop-shadow(0 0 6px #ef4444)" />

                  {/* Carbon Aero Splitter & Side Skirts if equipped */}
                  {(aero.id === "aero_carbon" || aero.id === "aero_track" || aero.id === "aero_gt") && (
                    <g id="aero-trim">
                      <path d="M 90 352 L 170 352 L 165 358 L 85 358 Z" fill="#111" stroke="#333" />
                      <path d="M 330 354 L 530 354 L 525 360 L 335 360 Z" fill="#111" stroke="#333" />
                      <path d="M 690 352 L 830 352 L 835 358 L 695 358 Z" fill="#111" stroke="#333" />
                    </g>
                  )}

                  {/* Front Wheel Assembly (Center 610, 350) */}
                  <g id="front-wheel">
                    {/* Brake Caliper */}
                    <circle cx="610" cy="350" r="54" fill="#1e293b" />
                    <rect x="635" y="325" width="22" height="48" rx="6" fill={caliper.hex} filter="drop-shadow(0 0 4px rgba(0,0,0,0.5))" />
                    {/* Tyre */}
                    <circle cx="610" cy="350" r="68" fill="#111827" stroke="#1f2937" strokeWidth="6" />
                    {/* Rim */}
                    <circle cx="610" cy="350" r="50" fill="url(#rimGrad)" stroke="#4b5563" strokeWidth="3" />
                    {/* Spokes */}
                    <line x1="610" y1="305" x2="610" y2="395" stroke={wheelFinish.hex} strokeWidth="5" />
                    <line x1="565" y1="350" x2="655" y2="350" stroke={wheelFinish.hex} strokeWidth="5" />
                    <line x1="578" y1="318" x2="642" y2="382" stroke={wheelFinish.hex} strokeWidth="4" />
                    <line x1="578" y1="382" x2="642" y2="318" stroke={wheelFinish.hex} strokeWidth="4" />
                    {/* Center Cap */}
                    <circle cx="610" cy="350" r="14" fill="#000000" stroke="#6b7280" strokeWidth="2" />
                  </g>

                  {/* Rear Wheel Assembly (Center 250, 350) */}
                  <g id="rear-wheel">
                    {/* Brake Caliper */}
                    <circle cx="250" cy="350" r="54" fill="#1e293b" />
                    <rect x="275" y="325" width="22" height="48" rx="6" fill={caliper.hex} filter="drop-shadow(0 0 4px rgba(0,0,0,0.5))" />
                    {/* Tyre */}
                    <circle cx="250" cy="350" r="68" fill="#111827" stroke="#1f2937" strokeWidth="6" />
                    {/* Rim */}
                    <circle cx="250" cy="350" r="50" fill="url(#rimGrad)" stroke="#4b5563" strokeWidth="3" />
                    {/* Spokes */}
                    <line x1="250" y1="305" x2="250" y2="395" stroke={wheelFinish.hex} strokeWidth="5" />
                    <line x1="205" y1="350" x2="295" y2="350" stroke={wheelFinish.hex} strokeWidth="5" />
                    <line x1="218" y1="318" x2="282" y2="382" stroke={wheelFinish.hex} strokeWidth="4" />
                    <line x1="218" y1="382" x2="282" y2="318" stroke={wheelFinish.hex} strokeWidth="4" />
                    {/* Center Cap */}
                    <circle cx="250" cy="350" r="14" fill="#000000" stroke="#6b7280" strokeWidth="2" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Live Metrics Delta Strip */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#131b2e]/70 rounded-2xl border border-white/5 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                  Est. Power Output
                </div>
                <div className="text-sm font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>+{totalHpGain} HP</span>
                </div>
              </div>

              <div className="p-3 bg-[#131b2e]/70 rounded-2xl border border-white/5 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                  Weight Reduction
                </div>
                <div className="text-sm font-extrabold text-blue-400 flex items-center justify-center gap-1">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>{totalWeightDelta <= 0 ? `${totalWeightDelta} kg` : `+${totalWeightDelta} kg`}</span>
                </div>
              </div>

              <div className="p-3 bg-[#131b2e]/70 rounded-2xl border border-white/5 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                  Total Custom Spec
                </div>
                <div className="text-sm font-extrabold text-white">
                  ${totalBuildPrice.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Certified Tuning Specialists Carousel */}
          <div className="glass rounded-3xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Certified Debford Installation Partners
              </h3>
              <span className="text-[11px] text-emerald-400 font-semibold">100% Fitment Guarantee</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "TurboTech Performance", city: "New York, NY", rating: "5.0 ★", specialty: "ECU & Titanium Exhausts" },
                { name: "WrapKing Studio", city: "Los Angeles, CA", rating: "4.9 ★", specialty: "Satin Vinyl & PPF" },
                { name: "Apex Aero Composites", city: "Miami, FL", rating: "4.9 ★", specialty: "Carbon Wings & Widebodies" },
              ].map((partner) => (
                <div key={partner.name} className="p-3 bg-[#131b2e]/60 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-white truncate">{partner.name}</span>
                    <span className="text-[10px] text-amber-400 font-bold ml-1">{partner.rating}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{partner.specialty}</p>
                  <p className="text-[10px] text-slate-500">📍 {partner.city}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customization Controls & Build Sheet (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Navigation Control Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 glass rounded-2xl border border-white/10">
            {[
              { id: "paint", label: "Paint & Wrap", icon: Palette },
              { id: "wheels", label: "Wheels & Stance", icon: Disc },
              { id: "aero", label: "Aero & Body", icon: Layers },
              { id: "performance", label: "Performance", icon: Wrench },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "paint" | "wheels" | "aero" | "performance")}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "gradient-brand text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate px-1">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Control Panel Content */}
          <div className="glass rounded-3xl border border-white/15 p-6 shadow-2xl space-y-6">
            {/* TAB 1: Paint & Wrap */}
            {activeTab === "paint" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Exterior Finish & Color</h3>
                  <p className="text-xs text-slate-400">
                    Selected: <strong className="text-white">{paint.name}</strong> ({paint.finish.toUpperCase()}) — ${paint.price}
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-2.5">
                  {PAINTS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setPaint(p)}
                      title={`${p.name} ($${p.price})`}
                      className={`relative aspect-square rounded-2xl border-2 transition-all p-1 cursor-pointer ${
                        paint.name === p.name ? "border-blue-500 ring-2 ring-blue-500/40 scale-105" : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="w-full h-full rounded-xl shadow-inner" style={{ backgroundColor: p.hex }} />
                    </button>
                  ))}
                </div>

                {/* Window Tint Selector */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Window Tint Darkness</h4>
                  <div className="space-y-1.5">
                    {TINTS.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => setTint(t)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          tint.name === t.name
                            ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                            : "bg-[#131b2e]/60 border-white/5 text-slate-300 hover:bg-[#131b2e]"
                        }`}
                      >
                        <span>{t.name}</span>
                        <span className="text-blue-400 font-bold">{t.price === 0 ? "Included" : `+$${t.price}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Wheels & Stance */}
            {activeTab === "wheels" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Forged Wheels & Fitment</h3>
                  <p className="text-xs text-slate-400">
                    Selected: <strong className="text-white">{wheel.name}</strong> in <strong className="text-white">{wheelFinish.name}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  {WHEELS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setWheel(w)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        wheel.id === w.id
                          ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                          : "bg-[#131b2e]/60 border-white/5 text-slate-300 hover:bg-[#131b2e]"
                      }`}
                    >
                      <div>
                        <span className="block">{w.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{w.style}</span>
                      </div>
                      <span className="text-blue-400 font-bold">+${w.price}</span>
                    </button>
                  ))}
                </div>

                {/* Rim Finish */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Rim Finish Color</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {WHEEL_FINISHES.map((wf) => (
                      <button
                        key={wf.name}
                        onClick={() => setWheelFinish(wf)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer ${
                          wheelFinish.name === wf.name ? "border-blue-500 bg-blue-500/10 text-white font-bold" : "border-white/5 bg-[#131b2e]/60 text-slate-400"
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: wf.hex }} />
                        <span className="truncate">{wf.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Suspension Stance */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Suspension & Stance</h4>
                  <div className="space-y-1.5">
                    {STANCES.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => setStance(s)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          stance.name === s.name
                            ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                            : "bg-[#131b2e]/60 border-white/5 text-slate-300 hover:bg-[#131b2e]"
                        }`}
                      >
                        <div>
                          <span>{s.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{s.desc}</span>
                        </div>
                        <span className="text-blue-400 font-bold">{s.price === 0 ? "Stock" : `+$${s.price}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Aero & Body */}
            {activeTab === "aero" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Aerodynamics & Body Kits</h3>
                  <p className="text-xs text-slate-400">
                    Selected: <strong className="text-white">{aero.name}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  {AERO_KITS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAero(a)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        aero.id === a.id
                          ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                          : "bg-[#131b2e]/60 border-white/5 text-slate-300 hover:bg-[#131b2e]"
                      }`}
                    >
                      <div>
                        <span className="block">{a.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{a.desc}</span>
                      </div>
                      <span className="text-blue-400 font-bold">{a.price === 0 ? "OEM Stock" : `+$${a.price}`}</span>
                    </button>
                  ))}
                </div>

                {/* Brake Calipers Color */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Performance Brake Calipers</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {CALIPERS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setCaliper(c)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer ${
                          caliper.name === c.name ? "border-blue-500 bg-blue-500/10 text-white font-bold" : "border-white/5 bg-[#131b2e]/60 text-slate-400"
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                        <span className="truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Performance & Exhaust */}
            {activeTab === "performance" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Exhaust & Lighting Systems</h3>
                  <p className="text-xs text-slate-400">
                    Selected: <strong className="text-white">{exhaust.name}</strong> (+{exhaust.hp} HP)
                  </p>
                </div>

                <div className="space-y-2">
                  {EXHAUSTS.map((ex) => (
                    <button
                      key={ex.name}
                      onClick={() => setExhaust(ex)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        exhaust.name === ex.name
                          ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                          : "bg-[#131b2e]/60 border-white/5 text-slate-300 hover:bg-[#131b2e]"
                      }`}
                    >
                      <div>
                        <span>{ex.name}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{ex.desc}</span>
                      </div>
                      <span className="text-blue-400 font-bold">{ex.price === 0 ? "Stock" : `+$${ex.price}`}</span>
                    </button>
                  ))}
                </div>

                {/* Underglow Neon Kit */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Underglow Ambient Lighting</h4>
                  <div className="space-y-1.5">
                    {UNDERGLOWS.map((ug) => (
                      <button
                        key={ug.name}
                        onClick={() => setUnderglow(ug)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer ${
                          underglow.name === ug.name ? "border-blue-500 bg-blue-500/10 text-white font-bold" : "border-white/5 bg-[#131b2e]/60 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: ug.hex }} />
                          <span>{ug.name}</span>
                        </div>
                        <span className="text-blue-400 font-bold">{ug.price === 0 ? "None" : `+$${ug.price}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Build Summary & Quote CTA */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Total Estimated Build</span>
                  <span className="text-2xl font-black text-white">${totalBuildPrice.toLocaleString()}</span>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  Specialist Approved
                </span>
              </div>

              <button
                onClick={() => {
                  setQuoteSuccess(false);
                  setQuoteError(null);
                  setShowQuoteModal(true);
                }}
                className="w-full py-3.5 gradient-brand text-white text-xs font-extrabold rounded-xl hover:opacity-90 shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request Specialist Quote & Fitment Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Request Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass max-w-lg w-full rounded-3xl border border-white/20 p-6 shadow-2xl space-y-5 bg-[#0e1424]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Submit Custom Spec Sheet</h3>
                  <p className="text-xs text-slate-400">{currentVehicleInfo.baseModel}</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {quoteSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20">
                  🎉
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Build Sheet Dispatched!</h4>
                  <p className="text-xs text-slate-300">
                    Your custom spec has been routed to top verified installation specialists. You will receive itemized quotes in your messages.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link
                    href="/messages"
                    className="flex-1 py-3 gradient-brand text-white text-xs font-bold rounded-xl text-center"
                  >
                    View Messages →
                  </Link>
                  <button
                    onClick={() => setShowQuoteModal(false)}
                    className="px-4 py-3 bg-white/5 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Build summary table */}
                <div className="p-3.5 bg-[#131b2e] rounded-2xl border border-white/5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Paint / Wrap</span>
                    <span className="font-semibold text-white">{paint.name} ({paint.finish})</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Wheels</span>
                    <span className="font-semibold text-white">{wheel.name} ({wheelFinish.name})</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Aero Package</span>
                    <span className="font-semibold text-white">{aero.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Suspension / Stance</span>
                    <span className="font-semibold text-white">{stance.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-white/5">
                    <span className="font-bold text-white">Estimated Parts & Labor</span>
                    <span className="font-black text-blue-400">${totalBuildPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Additional Instructions or VIN (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., I already have downpipes installed; prefer pickup in North Jersey area..."
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {quoteError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{quoteError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(false)}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitQuote}
                    disabled={isPending}
                    className="flex-1 py-3 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Dispatch to Verified Specialists</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
