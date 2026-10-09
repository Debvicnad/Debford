"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Car,
  DollarSign,
  Wrench,
  Scale,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  Cpu,
  Zap,
  Info,
  ArrowRight,
  Gauge,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "deba";
  text: string;
  timestamp: string;
  category?: string;
  specs?: {
    model?: string;
    fairPrice?: string;
    power?: string;
    reliabilityRating?: string;
    commonIssues?: string[];
    actionLink?: { label: string; url: string };
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    sender: "deba",
    text: "Welcome to Debford Engineering & Benchmark Advisor (DEBA). I am synchronized with our live marketplace inventory, NHTSA safety bulletins, and 150-point certified inspection telemetry. How can I assist your automotive acquisition or diagnostics today?",
    timestamp: "12:00 PM",
    category: "System Brief",
  },
];

const SUGGESTED_QUERIES = [
  {
    category: "Valuation Check",
    icon: DollarSign,
    prompt: "Is $248,500 a fair market price for a 2023 Porsche 911 GT3 RS with 4,200 km?",
    badge: "Market Analytics",
  },
  {
    category: "Mechanical Diagnostics",
    icon: Wrench,
    prompt: "What are common preventive maintenance checkpoints for the BMW S58 3.0L twin-turbo engine?",
    badge: "Powertrain",
  },
  {
    category: "Comparison Analysis",
    icon: Scale,
    prompt: "Compare Porsche 911 GT3 RS vs BMW M4 Competition in lap telemetry and daily usability.",
    badge: "Track & Road",
  },
  {
    category: "Pre-Purchase Inspection",
    icon: ShieldCheck,
    prompt: "What items should I verify in Debford's 150-point inspection report before wiring escrow?",
    badge: "Escrow Protocol",
  },
  {
    category: "Listing Optimization",
    icon: Car,
    prompt: "Draft a high-conversion consignment listing description for an AMG GT Black Series.",
    badge: "Consignment",
  },
  {
    category: "Tuning & Upgrades",
    icon: Gauge,
    prompt: "What HP gains and exhaust sound improvements can I expect from titanium sport downpipes?",
    badge: "Performance",
  },
];

const PREDEFINED_RESPONSES: Record<string, { text: string; specs?: Message["specs"] }> = {
  porsche: {
    text: "Based on active Debford marketplace telemetry and collector auction comps across North America and Europe, $248,500 for a 2023 911 GT3 RS (Clubsport Package, 4,200 km) sits in the top 15th percentile of value. The Clubsport cage, ceramic composite brakes (PCCB), and front-axle lift significantly preserve resale liquidity.",
    specs: {
      model: "2023 Porsche 911 GT3 RS (992)",
      fairPrice: "$240,000 – $258,000 USD",
      power: "518 HP · 465 Nm · 4.0L NA Flat-6",
      reliabilityRating: "Grade A+ (98/100)",
      commonIssues: [
        "Inspect front splitter scrape guards and active aero wing actuators",
        "Verify centerlock wheel hub torque service interval",
        "Check PCCB carbon-ceramic rotor surface wear matrix",
      ],
      actionLink: { label: "Inspect in Marketplace", url: "/vehicles/porsche-gt3-rs" },
    },
  },
  s58: {
    text: "The BMW S58 3.0L twin-turbocharged inline-6 (found in G80 M3 / G82 M4) is renowned for forged internals and extreme thermal efficiency. Key maintenance benchmarks to ensure track readiness:",
    specs: {
      model: "BMW M S58B30T0 Twin-Turbo",
      fairPrice: "Service Avg: $650 – $1,200",
      power: "503 HP (Comp) / 543 HP (CSL)",
      reliabilityRating: "Grade A (94/100)",
      commonIssues: [
        "Crank hub slippage is virtually resolved on S58 vs older S55, but check oil filter housing seals at 40k km",
        "Spark plug gap verification recommended every 25,000 km if running high boost",
        "Charge cooler coolant levels should be inspected bi-annually",
      ],
      actionLink: { label: "Book Certified M-Specialist", url: "/services/providers" },
    },
  },
  compare: {
    text: "Here is the direct telemetry comparison: The Porsche GT3 RS is an uncompromising, naturally-aspirated aerodynamic scalpel producing 860 kg of downforce at 285 km/h. The BMW M4 Competition is an everyday super-GT featuring twin-turbo torque delivery and comfortable grand touring acoustics.",
    specs: {
      model: "GT3 RS (992) vs M4 Competition (G82)",
      fairPrice: "Delta: ~$169,600 USD",
      power: "518 HP (NA) vs 503 HP (Twin-Turbo)",
      reliabilityRating: "Both Grade A+ Escrow Certified",
      commonIssues: [
        "0–100 km/h: GT3 RS (3.2s) vs M4 Comp (3.5s)",
        "Lateral Grip: GT3 RS 1.28g vs M4 Comp 1.05g",
        "Usability: M4 has generous trunk & 2+2 seating; GT3 RS has fixed carbon buckets and roll cage",
      ],
      actionLink: { label: "Open Side-by-Side Matrix", url: "/compare" },
    },
  },
  inspection: {
    text: "Debford's 150-Point Certified Inspection Vault covers mechanical, diagnostic, structural, and cosmetic standards. Before releasing funds from escrow, always verify:",
    specs: {
      model: "Debford Escrow & Inspection Protocol",
      fairPrice: "100% Fund Refund Guarantee",
      power: "Grade A+ (95-100 Score Required)",
      reliabilityRating: "OBD-II Zero Fault Code Pass",
      commonIssues: [
        "1. OBD-II ECU freeze frame logs for over-rev history (Ignition Range 1–6)",
        "2. Paint meter depth gauge readings (typical factory: 100–140 microns)",
        "3. Tire DOT date codes & tread depth (minimum 4mm remaining on performance rubber)",
        "4. Brake pad thickness (>60% life remaining) and rotor lip wear",
      ],
      actionLink: { label: "View Inspection Standards", url: "/verification" },
    },
  },
  listing: {
    text: "Here is an optimized, high-conversion consignment draft for your performance listing:\n\n'Offered exclusively through Debford Escrow: Immaculate 2023 Mercedes-AMG GT Black Series finished in Magmabeam Orange. Equipped with flat-plane crank 4.0L Biturbo V8 generating 720 HP. Full carbon aero package, carbon bucket seats, and ceramic brakes. Complete dealer service history, clean title, and Debford 150-Point inspection certification. Available for private viewing or enclosed global transport.'",
    specs: {
      model: "Mercedes-AMG GT Black Series",
      fairPrice: "Market Range: $380k – $420k",
      power: "720 HP · 800 Nm · 0–100 in 3.2s",
      reliabilityRating: "Collector Grade",
      commonIssues: [
        "Highlight factory options (Track Package, Burmester 3D, Carbon Trim)",
        "Include high-res photos of underbody diffuser and front splitter extension",
        "Enable Debford verified test drive booking",
      ],
      actionLink: { label: "Publish in Consignment Studio", url: "/sell" },
    },
  },
  tuning: {
    text: "Titanium sport downpipes with 200-cell high-flow catalytic converters typically yield +18 to +28 HP and +35 Nm of torque on modern twin-turbo platforms, with a substantial reduction in turbo spool latency (approx 250 RPM earlier peak boost). Titanium also sheds ~8 to 12 kg over stainless steel OEM pipes.",
    specs: {
      model: "Titanium Sport Downpipe System",
      fairPrice: "Parts & Labor: $2,800 – $4,500",
      power: "+22 HP Avg Gain · +35 Nm",
      reliabilityRating: "Euro-6 / OBD-II Compliant Options",
      commonIssues: [
        "Requires ECU stage 1 or stage 2 calibration to prevent catalytic efficiency check engine lights",
        "Verify local road emissions compliance",
        "Always use new OEM multi-layer exhaust gaskets upon install",
      ],
      actionLink: { label: "Launch Customisation Studio", url: "/customisation" },
    },
  },
};

export function AIAssistantClient({ userEmail }: { userEmail?: string }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage: Message = {
      id: "u_" + Date.now(),
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setIsThinking(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let responseObj = PREDEFINED_RESPONSES.porsche;

      if (lower.includes("bmw") || lower.includes("s58") || lower.includes("m4") || lower.includes("m3") || lower.includes("engine")) {
        responseObj = PREDEFINED_RESPONSES.s58;
      } else if (lower.includes("compare") || lower.includes("vs") || lower.includes("difference")) {
        responseObj = PREDEFINED_RESPONSES.compare;
      } else if (lower.includes("inspection") || lower.includes("escrow") || lower.includes("check") || lower.includes("safe") || lower.includes("report")) {
        responseObj = PREDEFINED_RESPONSES.inspection;
      } else if (lower.includes("listing") || lower.includes("sell") || lower.includes("consign") || lower.includes("description")) {
        responseObj = PREDEFINED_RESPONSES.listing;
      } else if (lower.includes("tuning") || lower.includes("exhaust") || lower.includes("hp") || lower.includes("downpipe") || lower.includes("upgrade")) {
        responseObj = PREDEFINED_RESPONSES.tuning;
      } else if (lower.includes("porsche") || lower.includes("price") || lower.includes("gt3") || lower.includes("fair")) {
        responseObj = PREDEFINED_RESPONSES.porsche;
      }

      const botMessage: Message = {
        id: "d_" + Date.now(),
        sender: "deba",
        text: responseObj.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        specs: responseObj.specs,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsThinking(false);
    }, 750);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="pb-24">
      {/* ── CINEMATIC CONCIERGE HEADER ─────────────────────── */}
      <div className="relative pt-28 pb-10 overflow-hidden border-b border-white/8 bg-[#080d16]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[260px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />

        {/* Scanline Grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-4 tracking-wide">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-blue-400 font-semibold">Automotive AI Concierge</span>
              </nav>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-wider uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DEBA Core v4.2 · Live Telemetry Matrix</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Engineering & Valuation Concierge
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                Query instant market benchmarks, OBD-II diagnostic fault advice, 150-point inspection
                telemetry, and pre-purchase vehicle assessments.
              </p>
            </div>

            {/* Quick Control Bar */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleResetChat}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-medium hover:border-white/20 hover:text-white transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Terminal</span>
              </button>
              <Link
                href="/compare"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Matrix</span>
              </Link>
            </div>
          </div>

          {/* ── CONCIERGE TELEMETRY RIBBON ───────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/8">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Neural Model
                </span>
              </div>
              <div className="text-xl font-bold text-white">DEBA v4.2</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Automotive fine-tuned LLM</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Data Accuracy
                </span>
              </div>
              <div className="text-xl font-bold text-white">150-Pt Audited</div>
              <p className="text-[11px] text-slate-400 mt-0.5">OEM & NHTSA Telemetry</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Inference Latency
                </span>
              </div>
              <div className="text-xl font-bold text-white">&lt; 22 ms</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time edge compute</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Escrow Integration
                </span>
              </div>
              <div className="text-xl font-bold text-white">Live Sync</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Verified marketplace links</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CHAT ARENA ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 gap-6">
          {/* SUGGESTED QUERY SHORTCUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUGGESTED_QUERIES.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.prompt}
                  onClick={() => handleSend(q.prompt)}
                  className="flex flex-col text-left p-3.5 rounded-2xl bg-[#0d121d] border border-white/6 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-blue-400">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{q.category}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                      {q.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 group-hover:text-white leading-relaxed line-clamp-2">
                    {q.prompt}
                  </p>
                </button>
              );
            })}
          </div>

          {/* CHAT TERMINAL CONTAINER */}
          <div className="rounded-3xl bg-[#0d121d] border border-white/8 shadow-2xl overflow-hidden flex flex-col min-h-[520px]">
            {/* TERMINAL STATUS BAR */}
            <div className="px-6 py-3.5 bg-[#080d16] border-b border-white/6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-500/50" />
                <span className="text-xs font-mono text-slate-300 font-medium">
                  SESSION ENCRYPTED · DEBA ACTIVE TELEMETRY
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                USER: {userEmail ? userEmail.split("@")[0] : "DEBFORD ENTHUSIAST"}
              </span>
            </div>

            {/* MESSAGE STREAM */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3.5 ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.sender === "deba" && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-0.5 shrink-0 shadow-lg shadow-blue-500/20">
                      <div className="w-full h-full bg-[#080d16] rounded-[10px] flex items-center justify-center text-blue-400 font-bold text-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl p-4.5 space-y-3 ${
                      m.sender === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-blue-500/20"
                        : "bg-[#080d16] border border-white/8 text-slate-200 rounded-tl-sm shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[11px] opacity-70">
                      <span className="font-bold">
                        {m.sender === "user" ? "You" : "DEBA Advisor"}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>

                    <p className="text-sm leading-relaxed whitespace-pre-line">{m.text}</p>

                    {/* TELEMETRY SPECS CARD */}
                    {m.specs && (
                      <div className="rounded-xl bg-[#0d121d] border border-blue-500/20 p-4 space-y-3 mt-3 text-xs">
                        <div className="flex items-center justify-between border-b border-white/6 pb-2">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-blue-400" />
                            <span>{m.specs.model}</span>
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {m.specs.fairPrice}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Performance Metric</span>
                            <span className="text-white font-mono font-medium">
                              {m.specs.power}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Reliability Grade</span>
                            <span className="text-emerald-400 font-mono font-bold">
                              {m.specs.reliabilityRating}
                            </span>
                          </div>
                        </div>

                        {m.specs.commonIssues && (
                          <div className="pt-2 border-t border-white/6 space-y-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                              Key Verification Checkpoints:
                            </span>
                            <ul className="space-y-1 text-slate-300 text-[11px]">
                              {m.specs.commonIssues.map((issue, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-blue-400 shrink-0">·</span>
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {m.specs.actionLink && (
                          <div className="pt-2 border-t border-white/6">
                            <Link
                              href={m.specs.actionLink.url}
                              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold transition-colors"
                            >
                              <span>{m.specs.actionLink.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Copy button */}
                    {m.sender === "deba" && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleCopy(m.id, m.text)}
                          className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy telemetry</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-3.5 justify-start items-center">
                  <div className="w-9 h-9 rounded-xl bg-[#080d16] border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-[#080d16] border border-white/8 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    <span>Analyzing marketplace comps and mechanical telemetry...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* CHAT INPUT AREA */}
            <div className="p-4 bg-[#080d16] border-t border-white/8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-3"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask DEBA about vehicle valuations, engine reliability, inspection reports, or tuning specs..."
                    className="w-full bg-[#131b2e] border border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
