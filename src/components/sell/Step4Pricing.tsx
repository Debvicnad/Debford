"use client";

import { useState } from "react";
import { useSellStore } from "@/stores/sell.store";

interface Props { onNext: () => void; onBack: () => void }

const HIGHLIGHT_PRESETS = [
  "One owner", "Non-smoker", "Full service history", "No accidents",
  "Toyota / BMW / Mercedes Certified", "Finance available", "New tyres",
  "Recent service", "Dealer maintained", "Accident-free",
];

export function Step4Pricing({ onNext, onBack }: Props) {
  const { data, updateData, addHighlight, removeHighlight } = useSellStore();
  const [highlightInput, setHighlightInput] = useState("");

  const listingType = data.listingType ?? "sale";
  const highlights = data.highlights ?? [];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateData({
      price: fd.get("price") as string,
      currency: fd.get("currency") as string,
      isNegotiable: fd.get("isNegotiable") === "on",
      // Rental
      pricePerDay: fd.get("pricePerDay") as string,
      pricePerWeek: fd.get("pricePerWeek") as string,
      pricePerMonth: fd.get("pricePerMonth") as string,
      securityDeposit: fd.get("securityDeposit") as string,
      // Auction
      startingPrice: fd.get("startingPrice") as string,
      reservePrice: fd.get("reservePrice") as string,
      buyNowPrice: fd.get("buyNowPrice") as string,
      bidIncrement: fd.get("bidIncrement") as string,
      auctionStartDate: fd.get("auctionStartDate") as string,
      auctionEndDate: fd.get("auctionEndDate") as string,
    });
    onNext();
  }

  function addPreset(preset: string) {
    if (!highlights.includes(preset)) addHighlight(preset);
  }

  function handleAddHighlight() {
    const trimmed = highlightInput.trim();
    if (trimmed && !highlights.includes(trimmed)) {
      addHighlight(trimmed);
      setHighlightInput("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Currency */}
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Currency</label>
          <select
            name="currency"
            defaultValue={data.currency ?? "USD"}
            className="px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 bg-transparent"
          >
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="EUR">EUR — Euro</option>
            <option value="NGN">NGN — Nigerian Naira</option>
            <option value="CAD">CAD — Canadian Dollar</option>
            <option value="AUD">AUD — Australian Dollar</option>
          </select>
        </div>
      </div>

      {/* === SALE === */}
      {listingType === "sale" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Sale Price
          </h3>
          <div className="relative">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Asking Price <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">$</span>
              <input
                name="price"
                type="number"
                required
                min={1}
                defaultValue={data.price ?? ""}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-2xl font-bold focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="isNegotiable"
              type="checkbox"
              defaultChecked={data.isNegotiable !== false}
              className="w-4 h-4 rounded text-blue-500 border-white/20 bg-slate-800"
            />
            <span className="text-sm text-slate-300">Price is negotiable</span>
          </label>
        </div>
      )}

      {/* === RENTAL === */}
      {listingType === "rental" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Rental Rates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "pricePerDay", label: "Per day", required: true, hint: "Required", default: data.pricePerDay },
              { name: "pricePerWeek", label: "Per week", required: false, hint: "Optional", default: data.pricePerWeek },
              { name: "pricePerMonth", label: "Per month", required: false, hint: "Optional", default: data.pricePerMonth },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  {field.label} {field.required && <span className="text-rose-400">*</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input
                    name={field.name}
                    type="number"
                    min={1}
                    required={field.required}
                    defaultValue={field.default ?? ""}
                    placeholder="0"
                    className="w-full pl-7 pr-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">{field.hint}</p>
              </div>
            ))}
          </div>
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Security Deposit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
              <input
                name="securityDeposit"
                type="number"
                min={0}
                defaultValue={data.securityDeposit ?? ""}
                placeholder="0"
                className="w-full pl-7 pr-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* === AUCTION === */}
      {listingType === "auction" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Auction Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "startingPrice", label: "Starting Price", required: true, default: data.startingPrice },
              { name: "reservePrice", label: "Reserve Price", required: false, hint: "Minimum you'll accept", default: data.reservePrice },
              { name: "buyNowPrice", label: "Buy Now Price", required: false, hint: "Optional instant win price", default: data.buyNowPrice },
              { name: "bidIncrement", label: "Bid Increment", required: false, default: data.bidIncrement ?? "100" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  {field.label} {field.required && <span className="text-rose-400">*</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input
                    name={field.name}
                    type="number"
                    min={0}
                    required={field.required}
                    defaultValue={field.default ?? ""}
                    placeholder="0"
                    className="w-full pl-7 pr-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                {field.hint && <p className="text-xs text-slate-600 mt-1">{field.hint}</p>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Auction Start <span className="text-rose-400">*</span>
              </label>
              <input
                name="auctionStartDate"
                type="datetime-local"
                required
                defaultValue={data.auctionStartDate ?? ""}
                className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Auction End <span className="text-rose-400">*</span>
              </label>
              <input
                name="auctionEndDate"
                type="datetime-local"
                required
                defaultValue={data.auctionEndDate ?? ""}
                className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Highlights */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Listing Highlights
        </h3>
        <p className="text-xs text-slate-600 mb-3">
          Add up to 6 key selling points shown prominently on your listing
        </p>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {HIGHLIGHT_PRESETS.map((p) => {
            const active = highlights.includes(p);
            return (
              <button
                key={p}
                type="button"
                disabled={highlights.length >= 6 && !active}
                onClick={() => active ? removeHighlight(highlights.indexOf(p)) : addPreset(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  active
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "surface-base border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300 disabled:opacity-30"
                }`}
              >
                {active && "✓ "}{p}
              </button>
            );
          })}
        </div>

        {/* Custom input */}
        {highlights.length < 6 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddHighlight())}
              placeholder="Custom highlight…"
              maxLength={40}
              className="flex-1 px-4 py-2.5 surface-base border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleAddHighlight}
              className="px-4 py-2.5 gradient-brand text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              Add
            </button>
          </div>
        )}

        {/* Added highlights */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {highlights.map((h, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
              >
                ✓ {h}
                <button
                  type="button"
                  onClick={() => removeHighlight(i)}
                  className="text-emerald-600 hover:text-emerald-400 transition-colors ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/8">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="px-8 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
        >
          Next: Review →
        </button>
      </div>
    </form>
  );
}
