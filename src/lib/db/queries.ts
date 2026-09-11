import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase.types";

/** Returns false when Supabase env vars aren't set (e.g. local dev without .env.local) */
export const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


// ── Shared types ──────────────────────────────────────────────
export type VehicleListingRow = {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  is_negotiable: boolean;
  status: string;
  views_count: number;
  saves_count: number;
  published_at: string | null;
  vehicle: {
    id: string;
    year: number;
    make_name: string | null;
    model_name: string | null;
    variant_name: string | null;
    condition: string;
    mileage: number | null;
    mileage_unit: string | null;
    fuel_type: string | null;
    transmission: string | null;
    body_type: string | null;
    color: string | null;
    city: string | null;
    country: string | null;
    images: { url: string; is_primary: boolean }[];
  };
  seller: {
    id: string;
    full_name: string | null;
    average_rating: number | null;
    verification_status: string;
  } | null;
};

export type AuctionRow = {
  id: string;
  title: string;
  status: string;
  starting_price: number;
  current_bid: number | null;
  reserve_price: number | null;
  buy_now_price: number | null;
  bid_increment: number;
  bids_count: number;
  starts_at: string;
  ends_at: string;
  currency: string;
  vehicle: {
    id: string;
    year: number;
    make_name: string | null;
    model_name: string | null;
    city: string | null;
    images: { url: string; is_primary: boolean }[];
  };
};

export type RentalRow = {
  id: string;
  title: string;
  status: string;
  price_per_day: number;
  price_per_week: number | null;
  price_per_month: number | null;
  currency: string;
  average_rating: number | null;
  total_bookings: number;
  pickup_location: string | null;
  delivery_available: boolean;
  vehicle: {
    id: string;
    year: number;
    make_name: string | null;
    model_name: string | null;
    fuel_type: string | null;
    transmission: string | null;
    seats: number | null;
    images: { url: string; is_primary: boolean }[];
  };
  owner: { id: string; full_name: string | null; average_rating: number | null } | null;
};

// ── Vehicle listing queries ───────────────────────────────────

export interface ListingFilters {
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  bodyType?: string;
  vehicleType?: string;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest" | "mileage_asc";
  page?: number;
  limit?: number;
}

export async function getSaleListings(filters: ListingFilters = {}) {
  const supabase = await createClient();
  const limit = filters.limit ?? 12;
  const offset = ((filters.page ?? 1) - 1) * limit;

  let query = supabase
    .from("sale_listings")
    .select(
      `
      id, title, slug, price, currency, is_negotiable,
      status, views_count, saves_count, published_at,
      vehicle:vehicles (
        id, year, make_name, model_name, variant_name,
        condition, mileage, mileage_unit, fuel_type,
        transmission, body_type, color, city, country,
        images:vehicle_images (url, is_primary)
      ),
      seller:profiles (
        id, full_name, average_rating, verification_status
      )
    `,
      { count: "exact" }
    )
    .eq("status", "published");

  // Apply filters
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%`
    );
  }
  if (filters.minPrice) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);

  // Sort
  switch (filters.sortBy) {
    case "price_asc":    query = query.order("price", { ascending: true }); break;
    case "price_desc":   query = query.order("price", { ascending: false }); break;
    case "oldest":       query = query.order("published_at", { ascending: true }); break;
    default:             query = query.order("published_at", { ascending: false }); break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  return { listings: (data ?? []) as unknown as VehicleListingRow[], total: count ?? 0, error };
}

export async function getSaleListingBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sale_listings")
    .select(
      `
      *,
      vehicle:vehicles (
        *,
        images:vehicle_images (*, url, is_primary, sort_order),
        features:vehicle_features (feature, category)
      ),
      seller:profiles (
        id, full_name, avatar_url, average_rating,
        reviews_count, sales_count, verification_status, city, created_at
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return { listing: data, error };
}

// ── Auction queries ───────────────────────────────────────────
export async function getAuctions(status?: "live" | "upcoming" | "ended") {
  const supabase = await createClient();
  let query = supabase
    .from("auctions")
    .select(
      `
      id, title, status, starting_price, current_bid,
      reserve_price, buy_now_price, bid_increment,
      bids_count, starts_at, ends_at, currency,
      vehicle:vehicles (
        id, year, make_name, model_name, city,
        images:vehicle_images (url, is_primary)
      )
    `
    )
    .order("ends_at", { ascending: true });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  return { auctions: (data ?? []) as unknown as AuctionRow[], error };
}

export async function getAuctionById(id: string) {
  const supabase = await createClient();
  const { data: auction, error } = await supabase
    .from("auctions")
    .select(
      `
      *,
      vehicle:vehicles (
        *,
        images:vehicle_images (*, url, is_primary, sort_order),
        features:vehicle_features (feature, category)
      ),
      seller:profiles (
        id, full_name, avatar_url, average_rating,
        reviews_count, sales_count, verification_status
      )
    `
    )
    .eq("id", id)
    .single();

  const { data: bids } = await supabase
    .from("auction_bids")
    .select("id, amount, bidder_id, created_at, status")
    .eq("auction_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  return { auction, bids: bids ?? [], error };
}

// ── Rental queries ────────────────────────────────────────────
export async function getRentalListings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rental_listings")
    .select(
      `
      id, title, status, price_per_day, price_per_week,
      price_per_month, currency, average_rating, total_bookings,
      pickup_location, delivery_available,
      vehicle:vehicles (
        id, year, make_name, model_name,
        fuel_type, transmission, seats,
        images:vehicle_images (url, is_primary)
      ),
      owner:profiles (id, full_name, average_rating)
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return { rentals: (data ?? []) as unknown as RentalRow[], error };
}

export async function getRentalListingById(id: string) {
  const supabase = await createClient();
  const { data: rental, error } = await supabase
    .from("rental_listings")
    .select(
      `
      *,
      vehicle:vehicles (
        *,
        images:vehicle_images (*, url, is_primary, sort_order),
        features:vehicle_features (feature, category)
      ),
      owner:profiles (
        id, full_name, avatar_url, average_rating, verification_status, created_at
      ),
      bookings:rental_bookings (
        id, start_date, end_date, status
      )
    `
    )
    .eq("id", id)
    .single();

  return { rental, error };
}

export async function getVehicleDetails(vehicleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { vehicle: null, error: "Not authenticated" };

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select(
      `
      *,
      images:vehicle_images (*, url, is_primary, sort_order),
      features:vehicle_features (feature, category),
      documents:vehicle_documents (*),
      sale_listing:sale_listings (id, title, price, currency, status, slug),
      rental_listing:rental_listings (id, title, price_per_day, currency, status)
    `
    )
    .eq("id", vehicleId)
    .single();

  return { vehicle, error };
}

// ── User-specific queries ─────────────────────────────────────
export async function getMyVehicles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { vehicles: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("vehicles")
    .select(
      `
      id, year, make_name, model_name, variant_name,
      mileage, mileage_unit, color, status, condition,
      registration_plate, created_at,
      images:vehicle_images (url, is_primary)
    `
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return { vehicles: data ?? [], error };
}

export async function getMyListings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { listings: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("sale_listings")
    .select(
      `
      id, title, price, currency, status,
      views_count, saves_count, inquiries_count,
      published_at, expires_at,
      vehicle:vehicles (year, make_name, model_name)
    `
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  return { listings: data ?? [], error };
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [vehiclesRes, listingsRes, messagesRes] = await Promise.all([
    supabase.from("vehicles").select("id", { count: "exact" }).eq("owner_id", user.id),
    supabase.from("sale_listings").select("id", { count: "exact" }).eq("seller_id", user.id).eq("status", "published"),
    supabase.from("conversation_participants").select("unread_count").eq("user_id", user.id),
  ]);

  const totalUnread = (messagesRes.data ?? []).reduce(
    (sum, p) => sum + (p.unread_count ?? 0), 0
  );

  return {
    vehiclesCount: vehiclesRes.count ?? 0,
    activeListings: listingsRes.count ?? 0,
    unreadMessages: totalUnread,
  };
}

export async function getNotifications(limit = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { notifications: [] };

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { notifications: data ?? [] };
}

// ── Increment listing view count ──────────────────────────────
export async function incrementListingViews(listingId: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_listing_views", { listing_id: listingId });
}
