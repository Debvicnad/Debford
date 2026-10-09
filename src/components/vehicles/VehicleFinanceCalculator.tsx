"use client";

import { useState, useMemo } from "react";

interface VehicleFinanceCalculatorProps {
  vehiclePrice: number;
  currency?: string;
}

export function VehicleFinanceCalculator({
  vehiclePrice,
  currency = "USD",
}: VehicleFinanceCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermMonths, setLoanTermMonths] = useState(48);
  const [interestRateApr, setInterestRateApr] = useState(5.9);

  const downPaymentAmount = useMemo(
    () => Math.round((vehiclePrice * downPaymentPercent) / 100),
    [vehiclePrice, downPaymentPercent]
  );

  const loanAmount = useMemo(
    () => Math.max(0, vehiclePrice - downPaymentAmount),
    [vehiclePrice, downPaymentAmount]
  );

  // Monthly payment using amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyPayment = useMemo(() => {
    if (loanAmount <= 0) return 0;
    const monthlyRate = interestRateApr / 100 / 12;
    if (monthlyRate === 0) return Math.round(loanAmount / loanTermMonths);
    const compound = Math.pow(1 + monthlyRate, loanTermMonths);
    const payment = (loanAmount * monthlyRate * compound) / (compound - 1);
    return Math.round(payment);
  }, [loanAmount, loanTermMonths, interestRateApr]);

  const totalPayable = useMemo(() => {
    return downPaymentAmount + monthlyPayment * loanTermMonths;
  }, [downPaymentAmount, monthlyPayment, loanTermMonths]);

  const totalInterest = useMemo(() => {
    return Math.max(0, totalPayable - vehiclePrice);
  }, [totalPayable, vehiclePrice]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl border border-white/8 p-6 md:p-8 backdrop-blur-md space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/8">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-0.5">
            Transparent Financing
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Escrow Payment & Loan Estimator
          </h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 font-mono">ESTIMATED MONTHLY</div>
          <div className="text-2xl font-mono font-black text-cyan-400">
            {fmt(monthlyPayment)}
            <span className="text-xs text-slate-400 font-normal"> / mo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders & Controls */}
        <div className="space-y-5">
          {/* Down payment */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300">Down Payment ({downPaymentPercent}%):</span>
              <span className="text-white font-bold">{fmt(downPaymentAmount)}</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>10% ({fmt(vehiclePrice * 0.1)})</span>
              <span>60% ({fmt(vehiclePrice * 0.6)})</span>
            </div>
          </div>

          {/* Loan Duration */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300">Term Duration:</span>
              <span className="text-white font-bold">{loanTermMonths} Months</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[24, 36, 48, 60, 72].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setLoanTermMonths(term)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    loanTermMonths === term
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40"
                      : "bg-slate-950/70 border border-white/8 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {term}m
                </button>
              ))}
            </div>
          </div>

          {/* APR */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">Interest APR:</span>
              <span className="text-white font-bold">{interestRateApr}%</span>
            </div>
            <div className="flex gap-2">
              {[4.9, 5.9, 6.9, 8.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setInterestRateApr(rate)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                    interestRateApr === rate
                      ? "bg-white/15 text-white font-bold border border-white/25"
                      : "bg-slate-950/40 text-slate-500 hover:text-slate-300 border border-white/5"
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Vehicle Base Price:</span>
              <span className="text-white font-bold">{fmt(vehiclePrice)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Down Payment:</span>
              <span className="text-emerald-400 font-bold">-{fmt(downPaymentAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Financed Principal:</span>
              <span className="text-white font-bold">{fmt(loanAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Interest:</span>
              <span className="text-slate-300">+{fmt(totalInterest)}</span>
            </div>
            <div className="pt-3 border-t border-white/8 flex justify-between text-sm font-bold">
              <span className="text-white">Total Outlay:</span>
              <span className="text-cyan-400">{fmt(totalPayable)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-slate-300 leading-relaxed">
            🛡️ <strong>Debford Escrow Guarantee:</strong> Your initial deposit and purchase funds are securely held in third-party escrow and only released after physical delivery and your final sign-off.
          </div>
        </div>
      </div>
    </div>
  );
}
