"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, AlertTriangle, Eye } from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";

import { PartItem } from "@/lib/data/parts.data";

interface Props {
  part: PartItem;
  selectedVehicle?: string;
}

export function PartCard({ part, selectedVehicle }: Props) {
  const conditionColors = {
    new: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    oem: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    refurbished: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    used: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  const isCompatible = selectedVehicle
    ? part.compatibleModels.some((m) =>
        selectedVehicle.toLowerCase().includes(m.toLowerCase()) ||
        m.toLowerCase().includes(selectedVehicle.toLowerCase())
      )
    : true;

  const isImageHttp = part.image.startsWith("http");

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group flex flex-col justify-between bg-[#0d121f]">
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-900 to-[#131b2e] flex items-center justify-center overflow-hidden">
        {isImageHttp ? (
          <Image
            src={part.image}
            alt={part.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity group-hover:scale-110 duration-300">
            {part.image}
          </span>
        )}

        {/* Condition Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span
            className={`px-2.5 py-0.5 text-[10px] font-extrabold border rounded-full uppercase tracking-wider backdrop-blur-md ${
              conditionColors[part.condition] || conditionColors.new
            }`}
          >
            {part.condition.toUpperCase()}
          </span>

          {selectedVehicle && (
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full backdrop-blur-md flex items-center gap-1 ${
                isCompatible
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
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

        {/* Quick View Button on Hover */}
        <Link
          href={`/parts/${part.id}`}
          className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-white rounded-xl backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-bold"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </Link>
      </div>

      {/* Part Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-bold text-blue-400 uppercase tracking-wider">{part.brand}</span>
            {part.partNumber && (
              <span className="font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                {part.partNumber}
              </span>
            )}
          </div>

          <Link href={`/parts/${part.id}`} className="block">
            <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 group-hover:text-blue-300 transition-colors leading-snug mb-1.5">
              {part.title}
            </h3>
          </Link>

          <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
            Fits: {part.compatibility}
          </p>

          <div className="flex items-baseline justify-between pt-1 border-t border-white/5">
            <div className="text-lg font-black text-white">
              ${part.price.toLocaleString()}
            </div>
            <span
              className={`text-[11px] font-semibold ${
                part.stock > 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {part.stock > 0 ? `${part.stock} in stock` : "Sold Out"}
            </span>
          </div>

          <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
            <span>Sold by: <strong className="text-slate-300">{part.seller}</strong></span>
            {part.sellerRating && <span className="text-amber-400">★ {part.sellerRating}</span>}
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2">
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
            className="py-2 px-3 text-xs font-semibold text-center surface-base border border-white/10 text-slate-300 rounded-xl hover:border-white/20 hover:text-white transition-all flex items-center justify-center"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
