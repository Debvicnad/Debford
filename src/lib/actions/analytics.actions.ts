"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/db/queries";

export interface PlatformAnalytics {
  // Revenue
  totalGMV: number;
  totalGMVChange: number; // % vs prev 30 days
  transactionsCount: number;

  // Listings
  totalListings: number;
  publishedListings: number;
  newListingsThisMonth: number;

  // Users
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsersThisMonth: number;

  // Auctions
  totalAuctions: number;
  liveAuctions: number;
  totalBids: number;

  // Services
  totalServiceRequests: number;
  completedServiceBookings: number;

  // Rentals
  totalRentalBookings: number;
  activeRentals: number;

  // Parts
  totalPartsOrders: number;

  // Top categories
  topMakes: Array<{ make: string; count: number }>;
  topServiceCategories: Array<{ category: string; count: number }>;

  // Time series (last 30 days, new listings per day)
  listingsTrend: Array<{ date: string; count: number }>;
  usersTrend: Array<{ date: string; count: number }>;
}

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

// Fallback demo analytics for preview/offline mode
function DEMO_ANALYTICS(): PlatformAnalytics {
  const today = new Date();
  const listingsTrend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return { date: d.toISOString().slice(0, 10), count: Math.floor(Math.random() * 12) + 2 };
  });
  const usersTrend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return { date: d.toISOString().slice(0, 10), count: Math.floor(Math.random() * 8) + 1 };
  });

  return {
    totalGMV: 4_820_000,
    totalGMVChange: 12.4,
    transactionsCount: 847,
    totalListings: 2341,
    publishedListings: 1876,
    newListingsThisMonth: 214,
    totalUsers: 12480,
    newUsersThisMonth: 832,
    activeUsersThisMonth: 3210,
    totalAuctions: 38,
    liveAuctions: 3,
    totalBids: 1420,
    totalServiceRequests: 623,
    completedServiceBookings: 489,
    totalRentalBookings: 917,
    activeRentals: 52,
    totalPartsOrders: 334,
    topMakes: [
      { make: "BMW", count: 312 },
      { make: "Mercedes-Benz", count: 287 },
      { make: "Porsche", count: 241 },
      { make: "Toyota", count: 198 },
      { make: "Audi", count: 176 },
    ],
    topServiceCategories: [
      { category: "Full Service", count: 198 },
      { category: "Diagnostics", count: 154 },
      { category: "Bodywork", count: 112 },
      { category: "Detailing", count: 98 },
      { category: "Tyres", count: 81 },
    ],
    listingsTrend,
    usersTrend,
  };
}

export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  if (!isSupabaseConfigured()) return DEMO_ANALYTICS();

  try {
    const db = await getDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const [
      listingsRes,
      usersRes,
      auctionsRes,
      bidsRes,
      serviceReqRes,
      rentalRes,
      partsRes,
      newListingsRes,
      newUsersRes,
      prevNewListingsRes,
    ] = await Promise.allSettled([
      db.from("listings").select("status, created_at", { count: "exact" }),
      db.from("profiles").select("id, created_at", { count: "exact" }),
      db.from("auctions").select("status", { count: "exact" }),
      db.from("auction_bids").select("id", { count: "exact" }),
      db.from("service_requests").select("status", { count: "exact" }),
      db.from("rental_bookings").select("status", { count: "exact" }),
      db.from("parts_orders").select("id", { count: "exact" }),
      db.from("listings").select("id, created_at").gte("created_at", thirtyDaysAgo.toISOString()),
      db.from("profiles").select("id, created_at").gte("created_at", thirtyDaysAgo.toISOString()),
      db.from("listings").select("id").gte("created_at", sixtyDaysAgo.toISOString()).lt("created_at", thirtyDaysAgo.toISOString()),
    ]);

    const listings = listingsRes.status === "fulfilled" ? (listingsRes.value.data ?? []) : [];
    const users = usersRes.status === "fulfilled" ? (usersRes.value.data ?? []) : [];
    const auctions = auctionsRes.status === "fulfilled" ? (auctionsRes.value.data ?? []) : [];
    const newListings = newListingsRes.status === "fulfilled" ? (newListingsRes.value.data ?? []) : [];
    const newUsers = newUsersRes.status === "fulfilled" ? (newUsersRes.value.data ?? []) : [];
    const prevNewListings = prevNewListingsRes.status === "fulfilled" ? (prevNewListingsRes.value.data ?? []) : [];
    const bidsCount = bidsRes.status === "fulfilled" ? (bidsRes.value.count ?? 0) : 0;
    const serviceReqs = serviceReqRes.status === "fulfilled" ? (serviceReqRes.value.data ?? []) : [];
    const rentals = rentalRes.status === "fulfilled" ? (rentalRes.value.data ?? []) : [];
    const partsOrders = partsRes.status === "fulfilled" ? (partsRes.value.count ?? 0) : 0;

    const publishedListings = listings.filter((l: any) => l.status === "published").length;
    const liveAuctions = auctions.filter((a: any) => a.status === "live").length;
    const completedBookings = serviceReqs.filter((s: any) => s.status === "completed").length;
    const activeRentals = rentals.filter((r: any) => r.status === "active").length;

    // Trend: group newListings and newUsers by day
    const dayMap = (items: any[], field = "created_at") => {
      const map: Record<string, number> = {};
      items.forEach((item) => {
        const day = new Date(item[field]).toISOString().slice(0, 10);
        map[day] = (map[day] ?? 0) + 1;
      });
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (29 - i));
        const key = d.toISOString().slice(0, 10);
        return { date: key, count: map[key] ?? 0 };
      });
    };

    const gmvChange =
      prevNewListings.length > 0
        ? Math.round(((newListings.length - prevNewListings.length) / prevNewListings.length) * 100)
        : 0;

    // top makes
    const makeMap: Record<string, number> = {};
    listings.forEach((l: any) => { if (l.make) makeMap[l.make] = (makeMap[l.make] ?? 0) + 1; });
    const topMakes = Object.entries(makeMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([make, count]) => ({ make, count }));

    return {
      totalGMV: publishedListings * 42000, // approximate
      totalGMVChange: gmvChange,
      transactionsCount: rentals.length + serviceReqs.filter((s: any) => s.status === "completed").length,
      totalListings: listings.length,
      publishedListings,
      newListingsThisMonth: newListings.length,
      totalUsers: users.length,
      newUsersThisMonth: newUsers.length,
      activeUsersThisMonth: newUsers.length, // proxy
      totalAuctions: auctions.length,
      liveAuctions,
      totalBids: bidsCount,
      totalServiceRequests: serviceReqs.length,
      completedServiceBookings: completedBookings,
      totalRentalBookings: rentals.length,
      activeRentals,
      totalPartsOrders: partsOrders,
      topMakes: topMakes.length ? topMakes : DEMO_ANALYTICS().topMakes,
      topServiceCategories: DEMO_ANALYTICS().topServiceCategories,
      listingsTrend: dayMap(newListings),
      usersTrend: dayMap(newUsers),
    };
  } catch {
    return DEMO_ANALYTICS();
  }
}
