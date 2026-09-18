"use client";

import { useState, useEffect } from "react";
import { useSellStore } from "@/stores/sell.store";
import { TrendingUp } from "lucide-react";

interface Props { onNext: () => void; onBack: () => void }

const HIGHLIGHT_PRESETS = [
  "One owner", "Non-smoker", "Full service history", "No accidents",
  "Toyota / BMW / Mercedes Certified", "Finance available", "New tyres",
  "Recent service", "Dealer maintained", "Accident-free",
];

/** Currency config — symbol, flag emoji, display name */
const CURRENCIES = [
  { code: "USD", symbol: "$",  flag: "🇺🇸", name: "US Dollar" },
  { code: "GBP", symbol: "£",  flag: "🇬🇧", name: "British Pound" },
  { code: "EUR", symbol: "€",  flag: "🇪🇺", name: "Euro" },
  { code: "NGN", symbol: "₦",  flag: "🇳🇬", name: "Nigerian Naira" },
  { code: "CAD", symbol: "$",  flag: "🇨🇦", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$",  flag: "🇦🇺", name: "Australian Dollar" },
] as const;

type CurrencyCode = typeof CURRENCIES[number]["code"];

/**
 * Approximate exchange rates relative to USD (updated periodically).
 * Labeled as "approximate" in the UI — not used for financial settlement.
 */
const RATES_FROM_USD: Record<CurrencyCode, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  NGN: 1600,
  CAD: 1.37,
  AUD: 1.54,
};

function toUsd(amount: number, from: CurrencyCode): number {
  return amount / RATES_FROM_USD[from];
}

function fromUsd(amount: number, to: CurrencyCode): number {
  return amount * RATES_FROM_USD[to];
}

function formatCurrency(amount: number, code: CurrencyCode): string {
  const cfg = CURRENCIES.find((c) => c.code === code)!;
  if (amount >= 1_000_000) return `${cfg.symbol}${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${cfg.symbol}${(amount / 1_000).toFixed(1)}k`;
  return `${cfg.symbol}${amount.toFixed(0)}`;
}

/** Generate a rough market range based on year and mileage */
function estimateMarketRange(
  make: string,
  year: string,
  mileage: string,
  currency: CurrencyCode
): { low: string; high: string } | null {
  const yr = parseInt(year, 10);
  const mi = parseInt(mileage, 10);
  if (!yr || !mi) return null;

  const age = new Date().getFullYear() - yr;
  let base = 30_000; // USD base
  // Depreciation: ~15% per year, floor at $3k
  base = Math.max(3_000, base * Math.pow(0.85, age));
  // Mileage discount
  if (mi > 100_000) base *= 0.75;
  else if (mi > 60_000) base *= 0.87;

  const low = fromUsd(base * 0.9, currency);
  const high = fromUsd(base * 1.2, currency);
  return {
    low: formatCurrency(low, currency),
    high: formatCurrency(high, currency),
  };
}

export function Step4Pricing({ onNext, onBack }: Props) {
  const { data, updateData, addHighlight, removeHighlight } = useSellStore();
  const [highlightInput, setHighlightInput] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>((data.currency as CurrencyCode) ?? "USD");
  const [rawPrice, setRawPrice] = useState(data.price ?? "");

  const listingType = data.listingType ?? "sale";
  const highlights = data.highlights ?? [];

  const currencyConfig = CURRENCIES.find((c) => c.code === currency)!;

  // Cross-currency previews
  const crossCurrencies: CurrencyCode[] = (["USD", "GBP", "EUR", "NGN"] as CurrencyCode[]).filter(
    (c) => c !== currency
  );

  const numericPrice = parseFloat(rawPrice) || 0;
  const inUsd = numericPrice > 0 ? toUsd(numericPrice, currency) : 0;

  const marketRange = estimateMarketRange(
    data.make ?? "",
    data.year ?? "",
    data.mileage ?? "",
    currency
  );

  // Sync currency to store on change
  useEffect(() => {
    updateData({ currency });
  }, [currency]); // eslint-disable-line

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateData({
      price: fd.get("price") as string,
      currency,
      isNegotiable: fd.get("isNegotiable") === "on",
      pricePerDay: fd.get("pricePerDay") as string,
      pricePerWeek: fd.get("pricePerWeek") as string,
      pricePerMonth: fd.get("pricePerMonth") as string,
      securityDeposit: fd.get("securityDeposit") as string,
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
      {/* ─── CURRENCY PICKER ─────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Currency
        </label>
        <div className="flex flex-wrap gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                currency === c.code
                  ? "gradient-brand text-white border-transparent shadow-lg shadow-blue-500/20"
                  : "glass border-white/10 text-slate-400 hover:text-white hover:border-white/20"
              }`}
            >
              <span className="text-base">{c.flag}</span>
              <span>{c.code}</span>
              <span className="text-xs opacity-60 font-normal hidden sm:block">{c.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── SALE PRICING ────────────────────────────────────────── */}
      {listingType === "sale" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Sale Price</h3>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Asking Price <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold select-none">
                {currencyConfig.symbol}
              </span>
              <input
                name="price"
                type="number"
                required
                min={1}
                value={rawPrice}
                onChange={(e) => setRawPrice(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-2xl font-bold focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Cross-currency preview */}
            {numericPrice > 0 && (
              <div className="mt-3 p-3.5 glass rounded-xl border border-white/8">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Approximate equivalents
                </p>
                <div className="flex flex-wrap gap-3">
                  {crossCurrencies.map((code) => {
                    const cfg = CURRENCIES.find((c) => c.code === code)!;
                    const converted = fromUsd(inUsd, code);
                    return (
                      <div key={code} className="flex items-center gap-1.5">
                        <span className="text-sm">{cfg.flag}</span>
                        <span className="text-xs font-semibold text-white">
                          {formatCurrency(converted, code)}
                        </span>
                        <span className="text-[10px] text-slate-500">{code}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Market range estimator */}
            {marketRange && data.year && (
              <div className="mt-2 flex items-center gap-2 p-3 glass rounded-xl border border-blue-500/15">
                <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-blue-300">Market range estimate</span>{" "}
                  for a {data.year} {data.make || "vehicle"} with {data.mileage || "—"} km:{" "}
                  <span className="font-bold text-white">
                    {marketRange.low} – {marketRange.high}
                  </span>{" "}
                  <span className="text-slate-600">(approximate)</span>
                </p>
              </div>
            )}
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

      {/* ─── RENTAL PRICING ──────────────────────────────────────── */}
      {listingType === "rental" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Rental Rates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "pricePerDay",   label: "Per day",   required: true,  hint: "Required", default: data.pricePerDay },
              { name: "pricePerWeek",  label: "Per week",  required: false, hint: "Optional", default: data.pricePerWeek },
              { name: "pricePerMonth", label: "Per month", required: false, hint: "Optional", default: data.pricePerMonth },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  {field.label} {field.required && <span className="text-rose-400">*</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {currencyConfig.symbol}
                  </span>
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                {currencyConfig.symbol}
              </span>
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

      {/* ─── AUCTION PRICING ─────────────────────────────────────── */}
      {listingType === "auction" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Auction Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "startingPrice", label: "Starting Price",   required: true,  hint: "",                              default: data.startingPrice },
              { name: "reservePrice",  label: "Reserve Price",    required: false, hint: "Minimum you'll accept",         default: data.reservePrice },
              { name: "buyNowPrice",   label: "Buy Now Price",    required: false, hint: "Optional instant win price",    default: data.buyNowPrice },
              { name: "bidIncrement",  label: "Bid Increment",    required: false, hint: "",                              default: data.bidIncrement ?? "100" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  {field.label} {field.required && <span className="text-rose-400">*</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {currencyConfig.symbol}
                  </span>
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

      {/* ─── HIGHLIGHTS ──────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Listing Highlights
        </h3>
        <p className="text-xs text-slate-600 mb-3">
          Add up to 6 key selling points shown prominently on your listing
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {HIGHLIGHT_PRESETS.map((p) => {
            const active = highlights.includes(p);
            return (
              <button
                key={p}
                type="button"
                disabled={highlights.length >= 6 && !active}
                onClick={() => (active ? removeHighlight(highlights.indexOf(p)) : addPreset(p))}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
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
              className="px-4 py-2.5 gradient-brand text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
            >
              Add
            </button>
          </div>
        )}

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
                  className="text-emerald-600 hover:text-emerald-400 transition-colors ml-0.5 cursor-pointer"
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
