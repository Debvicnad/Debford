import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Wrench,
  Car,
  Layers,
  Clock,
  Globe,
  Scale,
  AlertTriangle,
  Star,
  Package,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ALL_PARTS } from "@/lib/data/parts.data";
import { AddToCartButton } from "@/components/parts/AddToCartButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const part = ALL_PARTS.find((p) => p.id === id) ?? ALL_PARTS[0];
  return {
    title: `${part.title} — OEM Parts Vault | Debford`,
    description:
      part.description?.slice(0, 160) ??
      "Buy genuine OEM and aftermarket auto parts on Debford with 100% fitment guarantee and fast express delivery.",
  };
}

const CONDITION_STYLES: Record<
  string,
  { bg: string; border: string; text: string; label: string; dot: string }
> = {
  new: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", text: "#34d399", label: "Brand New", dot: "#10b981" },
  oem: { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)", text: "#a78bfa", label: "OEM Genuine", dot: "#8b5cf6" },
  refurbished: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", text: "#60a5fa", label: "Certified Refurbished", dot: "#3b82f6" },
  used: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#fbbf24", label: "Used / Pre-Owned", dot: "#f59e0b" },
};

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const part = ALL_PARTS.find((p) => p.id === id) ?? ALL_PARTS[0];
  const relatedParts = ALL_PARTS.filter(
    (p) => p.id !== part.id && (part.relatedPartIds?.includes(p.id) || p.category === part.category)
  ).slice(0, 3);

  const cond = CONDITION_STYLES[part.condition] ?? CONDITION_STYLES.new;
  const isImageHttp = part.image.startsWith("http");
  const isLowStock = part.stock > 0 && part.stock <= 5;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#06090e" }}>
      <Navbar />

      {/* ── Breadcrumb bar ── */}
      <div
        className="border-b"
        style={{ backgroundColor: "rgba(13,18,31,0.95)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="container-debford py-3.5 flex items-center gap-2 text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(148,163,184,0.25)" }} />
          <Link href="/parts" className="hover:text-slate-300 transition-colors">Parts Marketplace</Link>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(148,163,184,0.25)" }} />
          <span style={{ color: "rgba(148,163,184,0.6)" }}>{part.category}</span>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(148,163,184,0.25)" }} />
          <span className="text-slate-300 font-semibold truncate max-w-xs">{part.title}</span>
        </div>
      </div>

      <div className="container-debford py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT — Product Stage + Specs ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Product Image Stage */}
            <div
              className="relative aspect-[4/3] rounded-3xl overflow-hidden border shadow-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #0a0f1d 0%, #131b2e 100%)",
                borderColor: "rgba(255,255,255,0.08)",
                boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
              }}
            >
              {isImageHttp ? (
                <Image
                  src={part.image}
                  alt={part.title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <span className="text-[120px] opacity-20">{part.image}</span>
              )}

              {/* gradient bottom overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to top, rgba(6,9,14,0.75) 0%, transparent 50%)",
                }}
              />

              {/* Top badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span
                  className="px-3 py-1 text-xs font-extrabold rounded-full border backdrop-blur-md uppercase tracking-wider"
                  style={{ backgroundColor: cond.bg, borderColor: cond.border, color: cond.text }}
                >
                  {cond.label}
                </span>
                <span
                  className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md border"
                  style={{
                    backgroundColor: "rgba(99,102,241,0.2)",
                    borderColor: "rgba(99,102,241,0.4)",
                    color: "#a5b4fc",
                  }}
                >
                  {part.brand}
                </span>
              </div>

              {/* Low stock warning */}
              {isLowStock && (
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.15)",
                    borderColor: "rgba(239,68,68,0.3)",
                    color: "#f87171",
                  }}
                >
                  Only {part.stock} left
                </div>
              )}

              {/* Part number watermark */}
              {part.partNumber && (
                <div
                  className="absolute bottom-4 left-4 font-mono text-xs font-bold"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(148,163,184,0.8)",
                  }}
                >
                  PN: {part.partNumber}
                </div>
              )}
            </div>

            {/* OEM Spec Telemetry Matrix */}
            <div
              className="rounded-3xl border p-6 space-y-5"
              style={{
                background: "linear-gradient(135deg, rgba(13,18,31,0.95), rgba(10,15,26,0.95))",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <h2
                className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                style={{ color: "#f8fafc" }}
              >
                <Layers className="w-4 h-4" style={{ color: "#6366f1" }} />
                Component Specification Vault
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Brand", value: part.brand, icon: "🏭" },
                  { label: "Part Number", value: part.partNumber, icon: "🔢" },
                  { label: "Category", value: part.category, icon: "📦" },
                  { label: "Condition", value: cond.label, icon: "✅" },
                  { label: "Material", value: part.material, icon: "🔩" },
                  { label: "Weight", value: part.weightGrams ? `${part.weightGrams}g` : null, icon: "⚖️" },
                  {
                    label: "Country of Origin",
                    value: part.countryOfOrigin,
                    icon: "🌍",
                  },
                  {
                    label: "Install Time",
                    value: part.installTimeMinutes
                      ? part.installTimeMinutes >= 60
                        ? `${Math.floor(part.installTimeMinutes / 60)}h ${part.installTimeMinutes % 60 > 0 ? `${part.installTimeMinutes % 60}m` : ""}`
                        : `${part.installTimeMinutes} min`
                      : null,
                    icon: "⏱️",
                  },
                  { label: "Warranty", value: part.warranty, icon: "🛡️" },
                ]
                  .filter((s) => Boolean(s.value))
                  .map((spec) => (
                    <div
                      key={spec.label}
                      className="p-3.5 rounded-2xl border"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(255,255,255,0.07)",
                      }}
                    >
                      <div
                        className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"
                        style={{ color: "rgba(148,163,184,0.45)" }}
                      >
                        <span>{spec.icon}</span>
                        <span>{spec.label}</span>
                      </div>
                      <div className="text-sm font-bold text-white truncate">{spec.value}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Guaranteed Fitment Chart */}
            <div
              className="rounded-3xl border p-6 space-y-4"
              style={{
                backgroundColor: "rgba(16,185,129,0.04)",
                borderColor: "rgba(16,185,129,0.2)",
              }}
            >
              <h2
                className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                style={{ color: "#34d399" }}
              >
                <CheckCircle2 className="w-4 h-4" />
                100% Direct-Fit Compatibility
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(148,163,184,0.65)" }}>
                This part is guaranteed to fit the following vehicle makes and models. If it doesn&apos;t fit, Debford will arrange a free return and full refund — no questions asked.
              </p>

              <div className="flex flex-wrap gap-2">
                {part.compatibleModels.map((m) => (
                  <span
                    key={m}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border"
                    style={{
                      backgroundColor: "rgba(16,185,129,0.08)",
                      borderColor: "rgba(16,185,129,0.25)",
                      color: "#6ee7b7",
                    }}
                  >
                    <Car className="w-3 h-3 text-emerald-400" />
                    {m}
                  </span>
                ))}
              </div>

              <p
                className="text-[11px] leading-relaxed border-t pt-3"
                style={{ color: "rgba(148,163,184,0.5)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <strong className="text-slate-300">Full compatibility notes:</strong> {part.compatibility}
              </p>
            </div>

            {/* Product Description */}
            <div
              className="rounded-3xl border p-6 space-y-3"
              style={{
                background: "linear-gradient(135deg, rgba(13,18,31,0.95), rgba(10,15,26,0.95))",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <h2
                className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                style={{ color: "#f8fafc" }}
              >
                <Wrench className="w-4 h-4" style={{ color: "#38bdf8" }} />
                Product Engineering Overview
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(203,213,225,0.75)" }}>
                {part.description ??
                  "High-performance OEM-spec replacement part manufactured with premium materials and tested to meet or exceed rigorous automotive durability standards."}
              </p>
            </div>

            {/* OEM Cross Reference */}
            {part.oemCrossReference && part.oemCrossReference.length > 0 && (
              <div
                className="rounded-3xl border p-6 space-y-4"
                style={{
                  background: "linear-gradient(135deg, rgba(13,18,31,0.95), rgba(10,15,26,0.95))",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: "#f8fafc" }}
                >
                  <Layers className="w-4 h-4" style={{ color: "#f59e0b" }} />
                  OEM Part Number Cross-Reference
                </h2>
                <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                  This part replaces or is interchangeable with the following manufacturer part numbers:
                </p>
                <div className="flex flex-wrap gap-2">
                  {part.oemCrossReference.map((num) => (
                    <code
                      key={num}
                      className="px-3 py-2 rounded-xl font-mono text-xs font-bold border"
                      style={{
                        backgroundColor: "rgba(99,102,241,0.08)",
                        borderColor: "rgba(99,102,241,0.2)",
                        color: "#a5b4fc",
                      }}
                    >
                      {num}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Installation Guide */}
            {(part.installTimeMinutes || (part.specialToolsRequired && part.specialToolsRequired.length > 0) || part.notes) && (
              <div
                className="rounded-3xl border p-6 space-y-4"
                style={{
                  background: "linear-gradient(135deg, rgba(13,18,31,0.95), rgba(10,15,26,0.95))",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <h2
                  className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: "#f8fafc" }}
                >
                  <Wrench className="w-4 h-4" style={{ color: "#8b5cf6" }} />
                  Installation Reference Guide
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {part.installTimeMinutes && (
                    <div
                      className="flex items-start gap-3 p-4 rounded-2xl border"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
                    >
                      <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#6366f1" }} />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.45)" }}>
                          Estimated Install Time
                        </div>
                        <div className="text-sm font-bold text-white">
                          {part.installTimeMinutes >= 60
                            ? `${Math.floor(part.installTimeMinutes / 60)}h ${part.installTimeMinutes % 60 > 0 ? `${part.installTimeMinutes % 60}m` : ""}`
                            : `${part.installTimeMinutes} minutes`}
                        </div>
                      </div>
                    </div>
                  )}

                  {part.countryOfOrigin && (
                    <div
                      className="flex items-start gap-3 p-4 rounded-2xl border"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
                    >
                      <Globe className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#10b981" }} />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.45)" }}>
                          Manufactured In
                        </div>
                        <div className="text-sm font-bold text-white">{part.countryOfOrigin}</div>
                      </div>
                    </div>
                  )}
                </div>

                {part.specialToolsRequired && part.specialToolsRequired.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "rgba(148,163,184,0.45)" }}>
                      Tools Required
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {part.specialToolsRequired.map((tool) => (
                        <span
                          key={tool}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold border"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.04)",
                            borderColor: "rgba(255,255,255,0.08)",
                            color: "#cbd5e1",
                          }}
                        >
                          🔧 {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {part.notes && (
                  <div
                    className="flex items-start gap-2.5 p-4 rounded-2xl border"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.05)",
                      borderColor: "rgba(245,158,11,0.2)",
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(203,213,225,0.7)" }}>
                      <strong className="text-amber-300">Installer Note: </strong>{part.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Related Parts */}
            {relatedParts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: "#f8fafc" }}
                  >
                    <Zap className="w-4 h-4" style={{ color: "#f59e0b" }} />
                    Frequently Bought Together
                  </h2>
                  <Link
                    href="/parts"
                    className="text-xs font-bold flex items-center gap-1 transition-colors"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedParts.map((rp) => {
                    const rpCond = CONDITION_STYLES[rp.condition] ?? CONDITION_STYLES.new;
                    return (
                      <Link
                        key={rp.id}
                        href={`/parts/${rp.id}`}
                        className="group block rounded-2xl p-4 space-y-3 transition-all duration-200 hover:shadow-lg"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <div
                          className="relative aspect-[4/3] rounded-xl overflow-hidden"
                          style={{ background: "linear-gradient(135deg, #0a0f1d, #131b2e)" }}
                        >
                          {rp.image.startsWith("http") ? (
                            <Image src={rp.image} alt={rp.title} fill className="object-cover" />
                          ) : (
                            <span className="text-4xl opacity-20 absolute inset-0 flex items-center justify-center">{rp.image}</span>
                          )}
                        </div>
                        <div>
                          <span
                            className="text-[10px] font-extrabold uppercase tracking-wider"
                            style={{ color: rpCond.text }}
                          >
                            {rpCond.label}
                          </span>
                          <h3 className="text-xs font-bold text-white line-clamp-2 mt-0.5 group-hover:text-indigo-300 transition-colors">
                            {rp.title}
                          </h3>
                          <div className="text-sm font-black text-white mt-1">${rp.price.toLocaleString()}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — Sticky Buy Box ── */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">

              {/* Main buy box */}
              <div
                className="rounded-3xl border p-6 space-y-5 shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(13,18,31,0.98), rgba(10,15,26,0.98))",
                  borderColor: "rgba(255,255,255,0.1)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                }}
              >
                {/* Brand + PN */}
                <div className="flex items-center justify-between text-xs">
                  <span
                    className="font-extrabold uppercase tracking-wider"
                    style={{ color: "#818cf8" }}
                  >
                    {part.brand}
                  </span>
                  {part.partNumber && (
                    <code
                      className="font-mono px-2 py-0.5 rounded-lg"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        color: "rgba(148,163,184,0.5)",
                        fontSize: "10px",
                      }}
                    >
                      {part.partNumber}
                    </code>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="font-black leading-tight"
                  style={{ fontSize: "clamp(1.1rem,2.5vw,1.4rem)", color: "#f8fafc" }}
                >
                  {part.title}
                </h1>

                {/* Condition badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                  style={{ backgroundColor: cond.bg, borderColor: cond.border, color: cond.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cond.dot }} />
                  {cond.label}
                </span>

                {/* Price + Stock */}
                <div
                  className="flex items-end justify-between pb-5 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <div>
                    <div
                      className="text-4xl font-black"
                      style={{ color: "#f8fafc" }}
                    >
                      ${part.price.toLocaleString()}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: "rgba(148,163,184,0.4)" }}>
                      Taxes &amp; shipping calculated at checkout
                    </div>
                  </div>
                  <span
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border"
                    style={
                      part.stock > 0
                        ? isLowStock
                          ? {
                              backgroundColor: "rgba(245,158,11,0.1)",
                              borderColor: "rgba(245,158,11,0.25)",
                              color: "#fbbf24",
                            }
                          : {
                              backgroundColor: "rgba(16,185,129,0.1)",
                              borderColor: "rgba(16,185,129,0.25)",
                              color: "#34d399",
                            }
                        : {
                            backgroundColor: "rgba(239,68,68,0.1)",
                            borderColor: "rgba(239,68,68,0.25)",
                            color: "#f87171",
                          }
                    }
                  >
                    {part.stock > 0
                      ? isLowStock
                        ? `⚡ Only ${part.stock} left`
                        : `✓ ${part.stock} in stock`
                      : "Out of Stock"}
                  </span>
                </div>

                {/* Add to cart */}
                <div className="space-y-3">
                  <AddToCartButton
                    item={{
                      id: part.id,
                      title: part.title,
                      partNumber: part.partNumber,
                      brand: part.brand,
                      price: part.price,
                      condition: part.condition,
                      image: part.image,
                      seller: part.seller,
                      stock: part.stock,
                      compatibility: part.compatibility,
                    }}
                    showQuantity={true}
                    size="lg"
                  />

                  <Link
                    href="/cart"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold border transition-all"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#94a3b8",
                    }}
                  >
                    <Package className="w-3.5 h-3.5" />
                    View Cart
                  </Link>
                </div>

                {/* Trust perks */}
                <div
                  className="pt-4 border-t space-y-3"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  {[
                    { icon: Truck, color: "text-blue-400", text: "Free express delivery on orders over $150" },
                    { icon: ShieldCheck, color: "text-emerald-400", text: part.warranty ?? "1-Year Debford Fitment Guarantee" },
                    { icon: RotateCcw, color: "text-purple-400", text: "30-Day hassle-free returns & replacement" },
                    { icon: Scale, color: "text-amber-400", text: "100% Direct-Fit or full refund — guaranteed" },
                  ].map(({ icon: Icon, color, text }) => (
                    <div key={text} className="flex items-start gap-2.5 text-xs" style={{ color: "rgba(148,163,184,0.7)" }}>
                      <Icon className={`w-4 h-4 ${color} shrink-0 mt-0.5`} />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seller card */}
              <div
                className="rounded-3xl border p-5"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div
                      className="text-[10px] font-extrabold uppercase tracking-wider mb-1"
                      style={{ color: "rgba(148,163,184,0.4)" }}
                    >
                      Verified Parts Merchant
                    </div>
                    <div className="font-bold text-white text-sm">{part.seller}</div>
                    <div className="flex items-center gap-3 text-xs mt-1" style={{ color: "rgba(148,163,184,0.5)" }}>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-amber-400 font-bold">{part.sellerRating ?? 4.9}</span>
                      </span>
                      {part.sellerSales && (
                        <span>• {part.sellerSales.toLocaleString()} sales</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/messages?seller=${encodeURIComponent(part.seller)}&topic=part_${part.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#94a3b8",
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    Message Seller
                  </Link>
                </div>
              </div>

              {/* Request hard-to-find */}
              <div
                className="rounded-3xl border p-5 text-center space-y-3"
                style={{
                  backgroundColor: "rgba(99,102,241,0.04)",
                  borderColor: "rgba(99,102,241,0.15)",
                }}
              >
                <div className="text-xs font-semibold" style={{ color: "rgba(148,163,184,0.6)" }}>
                  Need a different variant or can&apos;t find your part?
                </div>
                <Link
                  href="/services/request"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                  }}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Request Hard-to-Find Part →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
