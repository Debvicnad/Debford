import { describe, it, expect } from "vitest";

describe("AI Recommendation Engine Scoring Engine", () => {
  interface VehicleCandidate {
    id: string;
    make: string;
    bodyType: string;
    price: number;
    year: number;
  }

  function computeMatchScore(target: VehicleCandidate, candidate: VehicleCandidate) {
    let score = 50;
    const reasons: string[] = [];

    // Make match
    if (target.make.toLowerCase() === candidate.make.toLowerCase()) {
      score += 25;
      reasons.push("Same marque heritage");
    }

    // Body type match
    if (target.bodyType.toLowerCase() === candidate.bodyType.toLowerCase()) {
      score += 20;
      reasons.push("Identical segment architecture");
    }

    // Price bracket
    const delta = Math.abs(candidate.price - target.price) / target.price;
    if (delta <= 0.15) {
      score += 20;
      reasons.push("Direct price bracket");
    }

    // Year proximity
    if (Math.abs(candidate.year - target.year) <= 1) {
      score += 10;
      reasons.push("Contemporary model year");
    }

    const normalized = Math.min(99, Math.max(65, Math.round(score)));

    let category: "direct_alternative" | "value_pick" | "performance_rival" = "direct_alternative";
    if (candidate.price < target.price * 0.85) {
      category = "value_pick";
    } else if (target.make !== candidate.make && normalized >= 80) {
      category = "performance_rival";
    }

    return { score: normalized, reasons, category };
  }

  it("assigns high scores to close peers of same make and body type", () => {
    const target: VehicleCandidate = {
      id: "bmw-m4",
      make: "BMW",
      bodyType: "Coupe",
      price: 78000,
      year: 2023,
    };

    const peer: VehicleCandidate = {
      id: "bmw-m2",
      make: "BMW",
      bodyType: "Coupe",
      price: 74000,
      year: 2023,
    };

    const result = computeMatchScore(target, peer);
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.category).toBe("direct_alternative");
    expect(result.reasons).toContain("Same marque heritage");
  });

  it("identifies performance rivals from competing luxury marques", () => {
    const target: VehicleCandidate = {
      id: "bmw-m4",
      make: "BMW",
      bodyType: "Coupe",
      price: 78000,
      year: 2023,
    };

    const rival: VehicleCandidate = {
      id: "merc-c63",
      make: "Mercedes-Benz",
      bodyType: "Coupe",
      price: 79000,
      year: 2023,
    };

    const result = computeMatchScore(target, rival);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.category).toBe("performance_rival");
  });

  it("classifies candidates under 85% price threshold as value picks", () => {
    const target: VehicleCandidate = {
      id: "porsche-911",
      make: "Porsche",
      bodyType: "Coupe",
      price: 120000,
      year: 2023,
    };

    const valuePick: VehicleCandidate = {
      id: "corvette-c8",
      make: "Chevrolet",
      bodyType: "Coupe",
      price: 85000,
      year: 2023,
    };

    const result = computeMatchScore(target, valuePick);
    expect(result.category).toBe("value_pick");
  });
});
