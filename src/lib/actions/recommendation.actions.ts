"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, getSaleListings } from "@/lib/db/queries";

export interface RecommendationMatch {
  listing: any;
  score: number; // 0 - 100
  reasons: string[];
  category: "direct_alternative" | "value_pick" | "performance_rival" | "personalized";
}

export interface RecommendationOptions {
  currentListingId?: string;
  make?: string;
  model?: string;
  bodyType?: string;
  price?: number;
  fuelType?: string;
  year?: number;
  userId?: string;
  limit?: number;
}

export async function getRecommendations(
  options: RecommendationOptions = {}
): Promise<RecommendationMatch[]> {
  const limit = options.limit ?? 4;

  try {
    // 1. Fetch available listings
    const { listings } = await getSaleListings({ limit: 30 });
    if (!listings || listings.length === 0) return [];

    // Filter out the current vehicle if provided
    const pool = listings.filter((item: any) => {
      if (!options.currentListingId) return true;
      return item.id !== options.currentListingId && item.slug !== options.currentListingId;
    });

    if (pool.length === 0) return [];

    const refMake = (options.make ?? "").toLowerCase();
    const refBody = (options.bodyType ?? "").toLowerCase();
    const refFuel = (options.fuelType ?? "").toLowerCase();
    const refPrice = options.price ?? 50000;
    const refYear = options.year ?? 2023;

    // 2. Score each candidate
    const scored: RecommendationMatch[] = pool.map((item: any) => {
      let score = 50; // base score
      const reasons: string[] = [];
      const v = (item.vehicle as any) ?? {};
      const itemMake = (v.make_name ?? "").toLowerCase();
      const itemBody = (v.body_type ?? "").toLowerCase();
      const itemFuel = (v.fuel_type ?? "").toLowerCase();
      const itemYear = v.year ?? 2023;
      const itemPrice = item.price ?? 50000;

      // Make similarity
      if (refMake && itemMake === refMake) {
        score += 25;
        reasons.push(`Same marque heritage (${v.make_name})`);
      } else if (refMake && ["bmw", "mercedes-benz", "audi", "porsche"].includes(refMake) &&
                 ["bmw", "mercedes-benz", "audi", "porsche"].includes(itemMake)) {
        score += 15;
        reasons.push("German luxury & performance segment peer");
      }

      // Body style match
      if (refBody && itemBody === refBody) {
        score += 20;
        reasons.push(`Identical ${v.body_type || "segment"} architecture`);
      }

      // Price proximity (+/- 25%)
      const priceRatio = Math.abs(itemPrice - refPrice) / refPrice;
      if (priceRatio <= 0.15) {
        score += 20;
        reasons.push("Direct price-bracket alternative (<15% delta)");
      } else if (priceRatio <= 0.3) {
        score += 10;
        reasons.push("Comparable acquisition budget");
      } else if (itemPrice < refPrice * 0.75) {
        score += 15;
        reasons.push("High-value proposition at lower capital outlay");
      }

      // Year proximity
      const yearDiff = Math.abs(itemYear - refYear);
      if (yearDiff <= 1) {
        score += 10;
        reasons.push(`Contemporary model year (${itemYear})`);
      }

      // Powertrain match
      if (refFuel && itemFuel === refFuel) {
        score += 10;
        reasons.push(`Matching ${v.fuel_type || "powertrain"} efficiency`);
      }

      // Popularity boost
      if ((item.saves_count ?? 0) > 10) {
        score += 5;
        reasons.push("Trending showroom watchlist favorite");
      }

      // Normalize score between 65 and 99
      const normalizedScore = Math.min(99, Math.max(65, Math.round(score)));

      // Determine recommendation category
      let category: RecommendationMatch["category"] = "direct_alternative";
      if (itemPrice < refPrice * 0.85) {
        category = "value_pick";
      } else if (itemMake !== refMake && normalizedScore >= 80) {
        category = "performance_rival";
      } else if (options.userId) {
        category = "personalized";
      }

      if (reasons.length === 0) {
        reasons.push("Verified 150-point inspection certified");
        reasons.push("Prime market liquidity & condition");
      }

      return {
        listing: item,
        score: normalizedScore,
        reasons,
        category,
      };
    });

    // Sort descending by match score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit);
  } catch (error) {
    console.error("getRecommendations error:", error);
    return [];
  }
}
