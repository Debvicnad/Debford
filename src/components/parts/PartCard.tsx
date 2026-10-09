"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, AlertTriangle, Eye, Star, Truck } from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";
import { PartItem } from "@/lib/data/parts.data";

interface Props {
  part: PartItem;
  selectedVehicle?: string;
}

const CONDITION_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  new: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", text: "#34d399", label: "NEW" },
  oem: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", text: "#a78bfa", label: "OEM GENUINE" },
  refurbished: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", text: "#60a5fa", label: "REFURBISHED" },
  used: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", text: "#fbbf24", label: "PRE-OWNED" },
};

export function PartCard({ part, selectedVehicle }: Props) {
  const condStyle = CONDITION_STYLES[part.condition] ?? CONDITION_STYLES.new;

  const isCompatible = selectedVehicle
    ? part.compatibleModels.some(
        (m) =>
          selectedVehicle.toLowerCase().includes(m.toLowerCase()) ||
          m.toLowerCase().includes(selectedVehicle.toLowerCase())
      )
    : true;

  const isImageHttp = part.image.startsWith("http");

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300"
      style={{
        backgroundColor: "#0d121f",
        borderColor: "rgba(255,255,255,0.08)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.35)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(99,102,241,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Product Image */}
      <div
        className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a0f1d 0%, #131b2e 100%)" }}
      >
        {isImageHttp ? (
          <Image
            src={part.image}
            alt={part.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-6xl opacity-25 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300">
            {part.image}
          </span>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(13,18,31,0.8) 0%, transparent 50%)",
          }}
        />

        {/* Condition badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span
            className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider backdrop-blur-md border"
            style={{
              backgroundColor: condStyle.bg,
              borderColor: condStyle.border,
              color: condStyle.text,
            }}
          >
            {condStyle.label}
          </span>

          {selectedVehicle && (
            <span
              className="px-2 py-0.5 text-[10px] font-bold rounded-full backdrop-blur-md border flex items-center gap-1"
              style={{
                backgroundColor: isCompatible ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                borderColor: isCompatible ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
                color: isCompatible ? "#34d399" : "#f87171",
              }}
            >
              {isCompatible ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Fits Vehicle</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>Check Fitment</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {part.stock <= 3 && part.stock > 0 && (
          <div
            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md"
            style={{
              backgroundColor: "rgba(239,68,68,0.15)",
              borderColor: "rgba(239,68,68,0.3)",
              color: "#f87171",
            }}
          >
            Only {part.stock} left
          </div>
        )}

        {/* Quick inspect overlay */}
        <Link
          href={`/parts/${part.id}`}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold backdrop-blur-md border transition-all opacity-0 group-hover:opacity-100"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            borderColor: "rgba(255,255,255,0.12)",
            color: "#f8fafc",
          }}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </Link>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 space-y-3">
        {/* Brand + Part number */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] font-extrabold uppercase tracking-wider"
            style={{ color: "#818cf8" }}
          >
            {part.brand}
          </span>
          {part.partNumber && (
            <code
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "rgba(148,163,184,0.5)",
              }}
            >
              {part.partNumber}
            </code>
          )}
        </div>

        {/* Title */}
        <Link href={`/parts/${part.id}`} className="block flex-1">
          <h3
            className="font-bold text-sm leading-snug line-clamp-2 transition-colors"
            style={{ color: "#f1f5f9" }}
          >
            {part.title}
          </h3>
        </Link>

        {/* Compatibility */}
        <p
          className="text-[11px] line-clamp-1 pb-3 border-b"
          style={{ color: "rgba(148,163,184,0.5)", borderColor: "rgba(255,255,255,0.06)" }}
        >
          Fits: {part.compatibility}
        </p>

        {/* Price row */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-white">
              ${part.price.toLocaleString()}
            </div>
            {part.warranty && (
              <div
                className="text-[10px] font-semibold"
                style={{ color: "rgba(148,163,184,0.5)" }}
              >
                {part.warranty}
              </div>
            )}
          </div>
          <div className="text-right">
            <div
              className={`text-[11px] font-bold ${
                part.stock > 5
                  ? ""
                  : part.stock > 0
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
              style={part.stock > 5 ? { color: "#34d399" } : {}}
            >
              {part.stock > 0 ? `${part.stock} in stock` : "Sold Out"}
            </div>
            <div
              className="text-[10px] flex items-center gap-1 justify-end mt-0.5"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              <Truck className="w-3 h-3" />
              <span>Express Ship</span>
            </div>
          </div>
        </div>

        {/* Seller + rating */}
        <div
          className="flex items-center justify-between text-[10px] pb-3 border-b"
          style={{ color: "rgba(148,163,184,0.5)", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span>
            by <strong className="text-slate-300">{part.seller}</strong>
          </span>
          {part.sellerRating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-bold text-amber-400">{part.sellerRating}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
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
            size="sm"
          />
          <Link
            href={`/parts/${part.id}`}
            className="flex items-center justify-center py-2 px-3 rounded-xl text-xs font-semibold border transition-all"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.1)",
              color: "#94a3b8",
            }}
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
