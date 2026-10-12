import { describe, it, expect } from "vitest";

describe("Vehicle Finance & Escrow Math Telemetry", () => {
  it("correctly calculates monthly finance payments", () => {
    const vehiclePrice = 60000;
    const downPayment = 12000; // 20%
    const loanAmount = vehiclePrice - downPayment; // 48000
    const annualRate = 5.9; // 5.9% APR
    const months = 60; // 5 years

    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1);

    expect(Math.round(monthlyPayment)).toBe(926);
    expect(loanAmount).toBe(48000);
  });

  it("calculates platform escrow fees correctly", () => {
    const purchasePrice = 45000;
    const platformFeeRate = 0.015; // 1.5% escrow fee
    const docFee = 450;
    const inspectionFee = 250;

    const escrowFee = purchasePrice * platformFeeRate;
    const totalClosingCost = purchasePrice + escrowFee + docFee + inspectionFee;

    expect(escrowFee).toBe(675);
    expect(totalClosingCost).toBe(46375);
  });
});
