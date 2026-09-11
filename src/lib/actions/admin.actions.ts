"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PendingItem {
  id: string;
  vehicleId: string;
  title: string;
  slug?: string;
  type: "sale" | "rental" | "auction";
  price: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  submittedAt: string;
  make: string;
  model: string;
  year: number;
  imageUrl?: string;
  status: string;
}

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  status: string;
}

/**
 * Get client to use: admin client if service role key is set, else authenticated client
 */
async function getDbClient() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

/**
 * Fetch all pending listings across sale, rental, and auction categories.
 */
export async function getPendingListings(): Promise<PendingItem[]> {
  const db = await getDbClient();

  const items: PendingItem[] = [];

  // 1. Pending sale listings
  const { data: sales, error: salesError } = await db
    .from("sale_listings")
    .select(`
      id, title, slug, price, currency, status, created_at, seller_id,
      vehicle:vehicles (
        id, year, make_name, model_name,
        images:vehicle_images (url, is_primary)
      ),
      seller:profiles (id, full_name, email)
    `)
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });

  if (sales) {
    for (const s of sales as any[]) {
      const v = s.vehicle;
      const primaryImg = v?.images?.find((i: any) => i.is_primary)?.url ?? v?.images?.[0]?.url;
      const seller = s.seller;
      items.push({
        id: s.id,
        vehicleId: v?.id ?? "",
        title: s.title ?? `${v?.year} ${v?.make_name} ${v?.model_name}`,
        slug: s.slug,
        type: "sale",
        price: s.price ? `$${Number(s.price).toLocaleString()}` : "Price on request",
        sellerId: s.seller_id,
        sellerName: seller?.full_name ?? "Unknown Seller",
        sellerEmail: seller?.email ?? "",
        submittedAt: new Date(s.created_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        }),
        make: v?.make_name ?? "",
        model: v?.model_name ?? "",
        year: v?.year ?? 0,
        imageUrl: primaryImg,
        status: s.status,
      });
    }
  }

  // 2. Pending rental listings
  const { data: rentals } = await db
    .from("rental_listings")
    .select(`
      id, title, price_per_day, currency, status, created_at, owner_id,
      vehicle:vehicles (
        id, year, make_name, model_name,
        images:vehicle_images (url, is_primary)
      ),
      owner:profiles (id, full_name, email)
    `)
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });

  if (rentals) {
    for (const r of rentals as any[]) {
      const v = r.vehicle;
      const primaryImg = v?.images?.find((i: any) => i.is_primary)?.url ?? v?.images?.[0]?.url;
      const owner = r.owner;
      items.push({
        id: r.id,
        vehicleId: v?.id ?? "",
        title: r.title ?? `${v?.year} ${v?.make_name} ${v?.model_name}`,
        type: "rental",
        price: `$${r.price_per_day}/day`,
        sellerId: r.owner_id,
        sellerName: owner?.full_name ?? "Unknown Owner",
        sellerEmail: owner?.email ?? "",
        submittedAt: new Date(r.created_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        }),
        make: v?.make_name ?? "",
        model: v?.model_name ?? "",
        year: v?.year ?? 0,
        imageUrl: primaryImg,
        status: r.status,
      });
    }
  }

  // 3. Pending auctions
  const { data: auctions } = await db
    .from("auctions")
    .select(`
      id, title, starting_price, currency, status, created_at, seller_id,
      vehicle:vehicles (
        id, year, make_name, model_name,
        images:vehicle_images (url, is_primary)
      ),
      seller:profiles (id, full_name, email)
    `)
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });

  if (auctions) {
    for (const a of auctions as any[]) {
      const v = a.vehicle;
      const primaryImg = v?.images?.find((i: any) => i.is_primary)?.url ?? v?.images?.[0]?.url;
      const seller = a.seller;
      items.push({
        id: a.id,
        vehicleId: v?.id ?? "",
        title: a.title ?? `${v?.year} ${v?.make_name} ${v?.model_name}`,
        type: "auction",
        price: `Start: $${Number(a.starting_price).toLocaleString()}`,
        sellerId: a.seller_id,
        sellerName: seller?.full_name ?? "Unknown Seller",
        sellerEmail: seller?.email ?? "",
        submittedAt: new Date(a.created_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        }),
        make: v?.make_name ?? "",
        model: v?.model_name ?? "",
        year: v?.year ?? 0,
        imageUrl: primaryImg,
        status: a.status,
      });
    }
  }

  return items;
}

/**
 * Approve a listing and change its status to published.
 */
export async function approveListing(listingId: string, type: "sale" | "rental" | "auction" = "sale") {
  const db = await getDbClient();
  const table = type === "sale" ? "sale_listings" : type === "rental" ? "rental_listings" : "auctions";

  const { data: updated, error } = await db
    .from(table)
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", listingId)
    .select("id, seller_id, title")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Notify the seller
  if (updated && (updated as any).seller_id) {
    await db.from("notifications").insert({
      user_id: (updated as any).seller_id,
      type: "listing",
      title: "Listing Approved! 🎉",
      body: `Your listing "${(updated as any).title ?? "vehicle"}" is now live on Debford.`,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/vehicles");
  revalidatePath("/rentals");
  revalidatePath("/auctions");
  revalidatePath("/garage");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Reject a listing.
 */
export async function rejectListing(listingId: string, type: "sale" | "rental" | "auction" = "sale", reason?: string) {
  const db = await getDbClient();
  const table = type === "sale" ? "sale_listings" : type === "rental" ? "rental_listings" : "auctions";

  const { data: updated, error } = await db
    .from(table)
    .update({ status: "rejected" })
    .eq("id", listingId)
    .select("id, seller_id, title")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Notify seller
  if (updated && (updated as any).seller_id) {
    await db.from("notifications").insert({
      user_id: (updated as any).seller_id,
      type: "listing",
      title: "Listing Needs Revision",
      body: reason ?? `Your listing "${(updated as any).title ?? "vehicle"}" was not approved. Please update your details and resubmit.`,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/garage");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Approve all pending listings in bulk (great for testing).
 */
export async function publishAllPending(): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDbClient();

    await db
      .from("sale_listings")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("status", "pending_review");

    await db
      .from("rental_listings")
      .update({ status: "published" })
      .eq("status", "pending_review");

    await db
      .from("auctions")
      .update({ status: "published" })
      .eq("status", "pending_review");

    revalidatePath("/admin");
    revalidatePath("/vehicles");
    revalidatePath("/rentals");
    revalidatePath("/auctions");
    revalidatePath("/garage");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to publish all listings." };
  }
}

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  status: string;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
}

/**
 * Fetch real admin overview stats.
 */
export async function getAdminStats() {
  const db = await getDbClient();

  const [usersRes, vehiclesRes, salesPendingRes, salesPublishedRes] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("vehicles").select("id", { count: "exact", head: true }),
    db.from("sale_listings").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    db.from("sale_listings").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);

  return {
    totalUsers: usersRes.count ?? 0,
    totalVehicles: vehiclesRes.count ?? 0,
    pendingReviews: salesPendingRes.count ?? 0,
    activeListings: salesPublishedRes.count ?? 0,
  };
}

/**
 * Fetch real registered users from profiles table.
 */
export async function getAdminUsers(limit = 10): Promise<AdminUserItem[]> {
  const db = await getDbClient();

  const { data } = await db
    .from("profiles")
    .select("id, full_name, email, role, created_at, verification_status")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((u) => ({
    id: u.id,
    fullName: u.full_name ?? "Anonymous User",
    email: u.email ?? "No email",
    role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "Buyer",
    createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently",
    status: u.verification_status === "verified" ? "Verified" : u.verification_status === "pending" ? "Pending KYC" : "Active",
    verificationStatus: (u.verification_status as any) ?? "unverified",
  }));
}

/**
 * Toggle user role (e.g. promote to Admin).
 */
export async function updateUserRole(userId: string, newRole: string) {
  const db = await getDbClient();

  const { error } = await db
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Admin: Update user verification status.
 */
export async function updateUserVerificationStatus(userId: string, status: "unverified" | "pending" | "verified" | "rejected") {
  const db = await getDbClient();

  const { error } = await db
    .from("profiles")
    .update({ verification_status: status })
    .eq("id", userId);

  if (error) return { error: error.message };

  if (status === "verified") {
    await db.from("notifications").insert({
      user_id: userId,
      type: "system",
      title: "Account Verified! 🎉",
      body: "Your identity has been verified by the administrator. Enjoy full platform privileges!",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/verification");
  return { success: true };
}
