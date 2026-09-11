import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Award,
  Wrench,
  Car,
  Layers,
} from "lucide-react";
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
    title: `${part.title} — Debford Auto Parts`,
    description: part.description ?? "Buy genuine OEM and aftermarket auto parts on Debford with fitment guarantee.",
  };
}

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const part = ALL_PARTS.find((p) => p.id === id) ?? ALL_PARTS[0];

  const conditionBadges = {
    new: { label: "Brand New", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    oem: { label: "Genuine OEM", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    refurbished: { label: "Certified Refurbished", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
    used: { label: "Used / Tested", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  };

  const currentBadge = conditionBadges[part.condition] || conditionBadges.new;
  const isImageHttp = part.image.startsWith("http");

  return (
    <div className="min-h-screen surface-base pt-16">
      {/* Breadcrumb Bar */}
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <Link href="/parts" className="hover:text-slate-300 transition-colors">Spare Parts</Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-400">{part.category}</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-300 truncate max-w-xs">{part.title}</span>
        </div>
      </div>

      <div className="container-debford py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image & Specifications (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Product Image Stage */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-900 via-[#101626] to-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-6">
              {isImageHttp ? (
                <Image
                  src={part.image}
                  alt={part.title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <span className="text-9xl opacity-40">{part.image}</span>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 text-xs font-extrabold border rounded-full backdrop-blur-md ${currentBadge.color}`}>
                  {currentBadge.label}
                </span>
                <span className="px-3 py-1 text-xs font-bold bg-blue-600/80 text-white rounded-full backdrop-blur-md">
                  {part.brand}
                </span>
              </div>
            </div>

            {/* Guaranteed Vehicle Fitment Card */}
            <div className="glass rounded-2xl border border-emerald-500/20 p-6 space-y-3 bg-emerald-500/5">
              <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Guaranteed Compatibility
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct-fit replacement guaranteed for the following vehicle models:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {part.compatibleModels.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1.5 bg-[#131b2e] border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-1.5"
                  >
                    <Car className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{m}</span>
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Notes: {part.compatibility}
              </p>
            </div>

            {/* Description & Overview */}
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                Product Description
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {part.description ?? "High-performance OEM-spec replacement part manufactured with premium materials and tested to meet or exceed rigorous automotive durability standards."}
              </p>
            </div>

            {/* OEM Interchange / Cross Reference Table */}
            {part.oemCrossReference && part.oemCrossReference.length > 0 && (
              <div className="glass rounded-2xl border border-white/10 p-6 space-y-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  OEM Part Number Cross Reference
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {part.oemCrossReference.map((num) => (
                    <div
                      key={num}
                      className="p-2.5 bg-[#131b2e] rounded-xl border border-white/5 font-mono text-xs text-blue-400 font-bold"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Buy Box & Seller Info (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass rounded-3xl border border-white/15 p-6 shadow-2xl backdrop-blur-xl space-y-5 sticky top-20">
              {/* Title & Brand */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-extrabold text-blue-400 uppercase tracking-wider">{part.brand}</span>
                  {part.partNumber && <span className="font-mono text-slate-500">PN: {part.partNumber}</span>}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {part.title}
                </h1>
              </div>

              {/* Price & Stock */}
              <div className="pb-4 border-b border-white/10 flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black text-white">
                    ${part.price.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400">Taxes & shipping calculated at checkout</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    part.stock > 0
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                  }`}
                >
                  {part.stock > 0 ? `In Stock (${part.stock} left)` : "Out of Stock"}
                </span>
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Select Quantity
                </span>
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
                  className="block w-full py-3 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-xl text-center border border-white/10 transition-colors"
                >
                  View Shopping Cart →
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Free standard shipping on orders over $150</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{part.warranty ?? "1-Year Debford Fitment Guarantee"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>30-Day Hassle-Free Returns & Replacements</span>
                </div>
              </div>

              {/* Seller Card */}
              <div className="p-4 bg-[#131b2e]/80 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                    Verified Parts Merchant
                  </span>
                  <div className="font-bold text-white text-xs mt-0.5">{part.seller}</div>
                  <div className="text-[11px] text-amber-400">★ {part.sellerRating ?? 4.9} Positive Feedback</div>
                </div>
                <Link
                  href={`/messages?seller=${part.seller}&topic=part_${part.id}`}
                  className="px-3 py-2 glass border border-white/10 hover:border-white/25 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Message</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
