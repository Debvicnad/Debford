import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`,                priority: 1.0,  changeFrequency: "daily" },
  { url: `${BASE_URL}/vehicles`,        priority: 0.9,  changeFrequency: "hourly" },
  { url: `${BASE_URL}/search`,          priority: 0.85, changeFrequency: "hourly" },
  { url: `${BASE_URL}/auctions`,        priority: 0.85, changeFrequency: "hourly" },
  { url: `${BASE_URL}/rentals`,         priority: 0.8,  changeFrequency: "daily" },
  { url: `${BASE_URL}/parts`,           priority: 0.8,  changeFrequency: "daily" },
  { url: `${BASE_URL}/services`,        priority: 0.8,  changeFrequency: "daily" },
  { url: `${BASE_URL}/services/providers`, priority: 0.75, changeFrequency: "weekly" },
  { url: `${BASE_URL}/compare`,         priority: 0.6,  changeFrequency: "monthly" },
  { url: `${BASE_URL}/login`,           priority: 0.4,  changeFrequency: "yearly" },
  { url: `${BASE_URL}/register`,        priority: 0.5,  changeFrequency: "yearly" },
];

async function getVehicleRoutes(): Promise<MetadataRoute.Sitemap> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(500);
    return (data ?? []).map((row: { slug: string; updated_at: string }) => ({
      url: `${BASE_URL}/vehicles/${row.slug}`,
      lastModified: new Date(row.updated_at),
      priority: 0.8,
      changeFrequency: "weekly" as const,
    }));
  } catch { return []; }
}

async function getAuctionRoutes(): Promise<MetadataRoute.Sitemap> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("auctions")
      .select("id, updated_at")
      .in("status", ["scheduled", "registration", "live"])
      .order("updated_at", { ascending: false })
      .limit(100);
    return (data ?? []).map((row: { id: string; updated_at: string }) => ({
      url: `${BASE_URL}/auctions/${row.id}`,
      lastModified: new Date(row.updated_at),
      priority: 0.75,
      changeFrequency: "hourly" as const,
    }));
  } catch { return []; }
}

async function getServiceRoutes(): Promise<MetadataRoute.Sitemap> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("service_providers")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(200);
    return (data ?? []).map((row: { slug: string; updated_at: string }) => ({
      url: `${BASE_URL}/services/${row.slug}`,
      lastModified: new Date(row.updated_at),
      priority: 0.65,
      changeFrequency: "weekly" as const,
    }));
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehicleRoutes, auctionRoutes, serviceRoutes] = await Promise.all([
    getVehicleRoutes(),
    getAuctionRoutes(),
    getServiceRoutes(),
  ]);
  return [...STATIC_ROUTES, ...vehicleRoutes, ...auctionRoutes, ...serviceRoutes];
}
