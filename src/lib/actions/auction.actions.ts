"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PlaceBidResult {
  success?: boolean;
  error?: string;
  newBid?: number;
  isBuyNow?: boolean;
}

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

/**
 * Place a bid on an auction.
 * Validates: authenticated, auction is live, bid >= min next bid.
 * Handles anti-sniping auto-extension and outbid notifications.
 */
export async function placeBid(
  auctionId: string,
  amount: number
): Promise<PlaceBidResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to place a bid." };
  }

  const db = await getDb();

  // Fetch current auction state
  const { data: auction, error: fetchError } = await db
    .from("auctions")
    .select(
      "id, title, status, current_bid, starting_price, bid_increment, seller_id, current_bidder_id, ends_at, reserve_price, buy_now_price, bids_count, requires_registration"
    )
    .eq("id", auctionId)
    .single();

  if (fetchError || !auction) {
    return { error: "Auction not found." };
  }

  // Pre-registration enforcement
  if (auction.requires_registration) {
    const { data: participant } = await db
      .from("auction_participants")
      .select("status")
      .eq("auction_id", auctionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!participant || participant.status !== "approved") {
      return {
        error: "This auction requires pre-registration. You must be approved by the operator before placing bids.",
      };
    }
  }

  if (auction.status !== "live") {
    return { error: "This auction is no longer accepting bids." };
  }

  const now = Date.now();
  const endsAtTime = new Date(auction.ends_at).getTime();

  if (endsAtTime <= now) {
    return { error: "This auction has ended." };
  }

  if (auction.seller_id === user.id) {
    return { error: "You cannot bid on your own auction." };
  }

  const minBid =
    (auction.current_bid ?? auction.starting_price) +
    (auction.bid_increment ?? 100);

  if (amount < minBid) {
    return {
      error: `Minimum next bid is $${minBid.toLocaleString()}`,
    };
  }

  // Check if this bid meets or exceeds Buy Now price
  const isBuyNow = Boolean(auction.buy_now_price && amount >= auction.buy_now_price);

  const prevBidderId = auction.current_bidder_id;

  // Mark previous bids as lost
  await db
    .from("auction_bids")
    .update({ status: "lost" })
    .eq("auction_id", auctionId)
    .eq("status", "active");

  // Insert new bid
  const { error: bidError } = await db.from("auction_bids").insert({
    auction_id: auctionId,
    bidder_id: user.id,
    amount,
    status: isBuyNow ? "won" : "active",
  });

  if (bidError) {
    return { error: bidError.message };
  }

  // Anti-sniping protection: if bid placed in the last 2 minutes, extend ends_at by 2 minutes
  let newEndsAt = auction.ends_at;
  const timeRemainingMs = endsAtTime - now;
  if (!isBuyNow && timeRemainingMs < 2 * 60 * 1000) {
    newEndsAt = new Date(now + 2 * 60 * 1000).toISOString();
  }

  // Update auction state
  const updatePayload: Record<string, any> = {
    current_bid: amount,
    current_bidder_id: user.id,
    bids_count: (auction.bids_count ?? 0) + 1,
    ends_at: newEndsAt,
  };

  if (isBuyNow) {
    updatePayload.status = "ended";
  }

  const { error: updateError } = await db
    .from("auctions")
    .update(updatePayload)
    .eq("id", auctionId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Send Notifications
  // 1. Notify previous highest bidder that they were outbid
  if (prevBidderId && prevBidderId !== user.id) {
    await db.from("notifications").insert({
      user_id: prevBidderId,
      type: "auction",
      title: "You've been outbid! ⚠️",
      body: `A new bid of $${amount.toLocaleString()} was placed on "${auction.title}". Bid again to stay in the lead!`,
    });
  }

  // 2. Notify seller of new bid or instant purchase
  if (auction.seller_id) {
    await db.from("notifications").insert({
      user_id: auction.seller_id,
      type: "auction",
      title: isBuyNow ? "Auction Won via Buy It Now! 🎉" : "New Bid Placed! 🔨",
      body: isBuyNow
        ? `A buyer purchased "${auction.title}" instantly for $${amount.toLocaleString()}!`
        : `A new bid of $${amount.toLocaleString()} was placed on "${auction.title}".`,
    });
  }

  revalidatePath(`/auctions/${auctionId}`);
  revalidatePath("/auctions");
  revalidatePath("/dashboard");

  return { success: true, newBid: amount, isBuyNow };
}

/**
 * Buy It Now action
 */
export async function buyItNow(auctionId: string): Promise<PlaceBidResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to purchase." };

  const db = await getDb();
  const { data: auction } = await db
    .from("auctions")
    .select("buy_now_price")
    .eq("id", auctionId)
    .single();

  if (!auction?.buy_now_price) {
    return { error: "Buy It Now is not available for this auction." };
  }

  return await placeBid(auctionId, auction.buy_now_price);
}

/**
 * Toggle watching / saving an auction.
 */
export async function toggleWatchAuction(auctionId: string): Promise<{ isWatched: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isWatched: false, error: "Please sign in to save auctions." };

  const db = await getDb();

  const { data: existing } = await db
    .from("saved_listings")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", auctionId)
    .eq("listing_type", "auction")
    .maybeSingle();

  if (existing) {
    await db.from("saved_listings").delete().eq("id", existing.id);
    revalidatePath(`/auctions/${auctionId}`);
    return { isWatched: false };
  } else {
    await db.from("saved_listings").insert({
      user_id: user.id,
      listing_id: auctionId,
      listing_type: "auction",
    });
    revalidatePath(`/auctions/${auctionId}`);
    return { isWatched: true };
  }
}

/**
 * Check if auction is saved by user.
 */
export async function isAuctionWatched(auctionId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const db = await getDb();
  const { data } = await db
    .from("saved_listings")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", auctionId)
    .eq("listing_type", "auction")
    .maybeSingle();

  return Boolean(data);
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERATOR ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateAuctionInput {
  title: string;
  description?: string;
  vehicleId?: string;
  startingPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  bidIncrement: number;
  startsAt: string;
  endsAt: string;
  currency?: string;
  requiresRegistration?: boolean;
  registrationDeadline?: string;
  maxParticipants?: number;
}

export interface AuctionOperatorResult {
  success?: boolean;
  error?: string;
  id?: string;
}

/**
 * Create a new auction (operator only).
 */
export async function createAuction(
  input: CreateAuctionInput
): Promise<AuctionOperatorResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  // Validate role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "operator", "dealer"].includes(profile.role)) {
    return { error: "Only auction operators can create auctions." };
  }

  const db = await getDb();

  const payload: Record<string, any> = {
    title: input.title,
    description: input.description ?? null,
    vehicle_id: input.vehicleId ?? null,
    seller_id: user.id,
    starting_price: input.startingPrice,
    reserve_price: input.reservePrice ?? null,
    buy_now_price: input.buyNowPrice ?? null,
    bid_increment: input.bidIncrement,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    currency: input.currency ?? "USD",
    status: "draft",
    bids_count: 0,
    requires_registration: input.requiresRegistration ?? false,
    registration_deadline: input.registrationDeadline ?? null,
    max_participants: input.maxParticipants ?? null,
  };

  const { data, error } = await db
    .from("auctions")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/auctions");
  revalidatePath("/auctions/manage");
  revalidatePath("/dashboard");

  return { success: true, id: data.id };
}

/**
 * Update auction (title, description, dates, pricing) — only while in draft/scheduled.
 */
export async function updateAuction(
  auctionId: string,
  input: Partial<CreateAuctionInput>
): Promise<AuctionOperatorResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const db = await getDb();

  const { data: auction } = await db
    .from("auctions")
    .select("seller_id, status")
    .eq("id", auctionId)
    .single();

  if (!auction) return { error: "Auction not found." };
  if (auction.seller_id !== user.id) return { error: "You do not own this auction." };
  if (!["draft", "scheduled"].includes(auction.status)) {
    return { error: "Only draft or scheduled auctions can be edited." };
  }

  const patch: Record<string, any> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.startingPrice !== undefined) patch.starting_price = input.startingPrice;
  if (input.reservePrice !== undefined) patch.reserve_price = input.reservePrice;
  if (input.buyNowPrice !== undefined) patch.buy_now_price = input.buyNowPrice;
  if (input.bidIncrement !== undefined) patch.bid_increment = input.bidIncrement;
  if (input.startsAt !== undefined) patch.starts_at = input.startsAt;
  if (input.endsAt !== undefined) patch.ends_at = input.endsAt;
  if (input.requiresRegistration !== undefined) patch.requires_registration = input.requiresRegistration;
  if (input.registrationDeadline !== undefined) patch.registration_deadline = input.registrationDeadline;
  if (input.maxParticipants !== undefined) patch.max_participants = input.maxParticipants;

  const { error } = await db
    .from("auctions")
    .update(patch)
    .eq("id", auctionId);

  if (error) return { error: error.message };

  revalidatePath(`/auctions/${auctionId}`);
  revalidatePath("/auctions/manage");

  return { success: true };
}

type AuctionStatus = "draft" | "scheduled" | "registration" | "live" | "ended" | "cancelled";

const VALID_TRANSITIONS: Record<string, AuctionStatus[]> = {
  draft: ["scheduled", "cancelled"],
  scheduled: ["registration", "live", "cancelled"],
  registration: ["live", "cancelled"],
  live: ["ended"],
  ended: [],
  cancelled: [],
};

/**
 * Transition an auction to a new status (operator only).
 */
export async function updateAuctionStatus(
  auctionId: string,
  newStatus: AuctionStatus
): Promise<AuctionOperatorResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const db = await getDb();

  const { data: auction } = await db
    .from("auctions")
    .select("seller_id, status, title, current_bid, current_bidder_id, reserve_price")
    .eq("id", auctionId)
    .single();

  if (!auction) return { error: "Auction not found." };

  // Allow admin override or owner
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  if (!isAdmin && auction.seller_id !== user.id) {
    return { error: "You do not have permission to manage this auction." };
  }

  const allowed = VALID_TRANSITIONS[auction.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return {
      error: `Cannot transition from "${auction.status}" to "${newStatus}".`,
    };
  }

  const patch: Record<string, any> = { status: newStatus };

  // If going live, set a real starts_at timestamp
  if (newStatus === "live") {
    patch.starts_at = new Date().toISOString();
  }

  const { error } = await db
    .from("auctions")
    .update(patch)
    .eq("id", auctionId);

  if (error) return { error: error.message };

  // Notify registered participants when auction goes live
  if (newStatus === "live") {
    const { data: participants } = await db
      .from("auction_participants")
      .select("user_id")
      .eq("auction_id", auctionId)
      .eq("status", "approved");

    if (participants && participants.length > 0) {
      await db.from("notifications").insert(
        participants.map((p: { user_id: string }) => ({
          user_id: p.user_id,
          type: "auction",
          title: "🔴 Auction is Now Live!",
          body: `"${auction.title}" has started. Place your bids now!`,
        }))
      );
    }
  }

  revalidatePath(`/auctions/${auctionId}`);
  revalidatePath("/auctions");
  revalidatePath("/auctions/manage");

  return { success: true };
}

/**
 * Register a user for an auction that requires pre-registration.
 */
export async function registerForAuction(
  auctionId: string
): Promise<AuctionOperatorResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to register." };

  const db = await getDb();

  // Check if already registered
  const { data: existing } = await db
    .from("auction_participants")
    .select("id, status")
    .eq("auction_id", auctionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: `You are already registered (status: ${existing.status}).` };
  }

  const { data: auction } = await db
    .from("auctions")
    .select("status, max_participants, requires_registration, seller_id, title")
    .eq("id", auctionId)
    .single();

  if (!auction) return { error: "Auction not found." };
  if (!["scheduled", "registration"].includes(auction.status)) {
    return { error: "Registration is not currently open for this auction." };
  }

  // Check capacity
  if (auction.max_participants) {
    const { count } = await db
      .from("auction_participants")
      .select("id", { count: "exact", head: true })
      .eq("auction_id", auctionId)
      .eq("status", "approved");

    if ((count ?? 0) >= auction.max_participants) {
      return { error: "This auction has reached its participant limit." };
    }
  }

  const { error } = await db.from("auction_participants").insert({
    auction_id: auctionId,
    user_id: user.id,
    status: "pending",
  });

  if (error) return { error: error.message };

  // Notify operator
  await db.from("notifications").insert({
    user_id: auction.seller_id,
    type: "auction",
    title: "New Participant Registration",
    body: `A new bidder has requested to join "${auction.title}". Review in your Auction Manager.`,
  });

  revalidatePath(`/auctions/${auctionId}`);

  return { success: true };
}

/**
 * Approve a participant (operator only).
 */
export async function approveParticipant(
  auctionId: string,
  participantId: string
): Promise<AuctionOperatorResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const db = await getDb();

  const { data: auction } = await db
    .from("auctions")
    .select("seller_id, title")
    .eq("id", auctionId)
    .single();

  if (!auction || auction.seller_id !== user.id) {
    return { error: "Not authorised." };
  }

  const { data: participant } = await db
    .from("auction_participants")
    .update({ status: "approved" })
    .eq("id", participantId)
    .eq("auction_id", auctionId)
    .select("user_id")
    .single();

  if (participant) {
    await db.from("notifications").insert({
      user_id: participant.user_id,
      type: "auction",
      title: "Registration Approved ✅",
      body: `You are now approved to bid in "${auction.title}".`,
    });
  }

  revalidatePath("/auctions/manage");
  return { success: true };
}

/**
 * Reject a participant (operator only).
 */
export async function rejectParticipant(
  auctionId: string,
  participantId: string,
  reason?: string
): Promise<AuctionOperatorResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const db = await getDb();

  const { data: auction } = await db
    .from("auctions")
    .select("seller_id, title")
    .eq("id", auctionId)
    .single();

  if (!auction || auction.seller_id !== user.id) {
    return { error: "Not authorised." };
  }

  const { data: participant } = await db
    .from("auction_participants")
    .update({ status: "rejected" })
    .eq("id", participantId)
    .eq("auction_id", auctionId)
    .select("user_id")
    .single();

  if (participant) {
    await db.from("notifications").insert({
      user_id: participant.user_id,
      type: "auction",
      title: "Registration Not Approved",
      body: reason
        ? `Your registration for "${auction.title}" was not approved: ${reason}`
        : `Your registration for "${auction.title}" was not approved.`,
    });
  }

  revalidatePath("/auctions/manage");
  return { success: true };
}

export interface SettlementInput {
  auctionId: string;
  winnerId: string;
  finalAmount: number;
  notes?: string;
}

/**
 * Settle a concluded auction — record the winner and trigger notification.
 */
export async function settleAuction(
  input: SettlementInput
): Promise<AuctionOperatorResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const db = await getDb();

  const { data: auction } = await db
    .from("auctions")
    .select("seller_id, status, title")
    .eq("id", input.auctionId)
    .single();

  if (!auction) return { error: "Auction not found." };
  if (auction.seller_id !== user.id) return { error: "Not authorised." };
  if (auction.status !== "ended") return { error: "Only ended auctions can be settled." };

  const { error } = await db
    .from("auctions")
    .update({
      status: "settled",
      winner_id: input.winnerId,
      settlement_amount: input.finalAmount,
      settlement_notes: input.notes ?? null,
      settled_at: new Date().toISOString(),
    })
    .eq("id", input.auctionId);

  if (error) return { error: error.message };

  // Notify winner
  await db.from("notifications").insert({
    user_id: input.winnerId,
    type: "auction",
    title: "🏆 You Won the Auction!",
    body: `Congratulations! You won "${auction.title}" for $${input.finalAmount.toLocaleString()}. The seller will contact you within 24 hours to arrange payment and collection.`,
  });

  // Notify seller
  await db.from("notifications").insert({
    user_id: auction.seller_id,
    type: "auction",
    title: "Auction Settled ✅",
    body: `"${auction.title}" has been settled for $${input.finalAmount.toLocaleString()}. The buyer has been notified.`,
  });

  revalidatePath(`/auctions/${input.auctionId}`);
  revalidatePath("/auctions/manage");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Conclude / finalize an auction (operator manual trigger or automated expiry).
 * Evaluates highest bid against reserve, assigns winner or declares reserve not met.
 */
export async function closeAuction(auctionId: string): Promise<AuctionOperatorResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const db = await getDb();
  const { data: auction } = await db
    .from("auctions")
    .select("id, title, seller_id, status, current_bid, current_bidder_id, reserve_price")
    .eq("id", auctionId)
    .single();

  if (!auction) return { error: "Auction not found." };

  // Permission check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  if (!isAdmin && auction.seller_id !== user.id) {
    return { error: "Not authorised to conclude this auction." };
  }

  if (auction.status === "ended" || auction.status === "settled" || auction.status === "cancelled") {
    return { error: `Auction is already in '${auction.status}' state.` };
  }

  const reserveMet = !auction.reserve_price || (auction.current_bid && auction.current_bid >= auction.reserve_price);
  const patch: Record<string, any> = {
    status: "ended",
    ends_at: new Date().toISOString(),
  };

  if (reserveMet && auction.current_bidder_id) {
    patch.winner_id = auction.current_bidder_id;
  }

  const { error: updateErr } = await db
    .from("auctions")
    .update(patch)
    .eq("id", auctionId);

  if (updateErr) return { error: updateErr.message };

  // Notify seller
  if (auction.seller_id) {
    await db.from("notifications").insert({
      user_id: auction.seller_id,
      type: "auction",
      title: reserveMet && auction.current_bidder_id ? "Auction Concluded — Winner Determined! 🏆" : "Auction Concluded — Reserve Not Met ⚠️",
      body: reserveMet && auction.current_bidder_id
        ? `"${auction.title}" ended with a winning bid of $${auction.current_bid?.toLocaleString()}. Proceed to settlement in your Auction Manager.`
        : `"${auction.title}" ended without meeting the reserve price threshold.`,
    });
  }

  // Notify winner
  if (reserveMet && auction.current_bidder_id) {
    await db.from("notifications").insert({
      user_id: auction.current_bidder_id,
      type: "auction",
      title: "🎉 You Won the Auction!",
      body: `Congratulations! Your bid of $${auction.current_bid?.toLocaleString()} won "${auction.title}". The operator will contact you for escrow settlement.`,
    });
  }

  revalidatePath(`/auctions/${auctionId}`);
  revalidatePath("/auctions");
  revalidatePath("/auctions/manage");

  return { success: true };
}

/**
 * Check registration status of the current user for an auction.
 */
export async function getParticipantStatus(
  auctionId: string
): Promise<{ status: "none" | "pending" | "approved" | "rejected"; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "none" };

  const db = await getDb();
  const { data, error } = await db
    .from("auction_participants")
    .select("status")
    .eq("auction_id", auctionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return { status: "none" };
  return { status: data.status as "pending" | "approved" | "rejected" };
}

// ── Demo Fallback Data for Operator Management ──
const DEMO_OPERATOR_AUCTIONS = [
  {
    id: "demo",
    title: "2023 Porsche 911 GT3 RS — Weissach Package",
    status: "live",
    starting_price: 180000,
    current_bid: 215000,
    reserve_price: 210000,
    buy_now_price: 265000,
    bid_increment: 1000,
    bids_count: 14,
    starts_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    ends_at: new Date(Date.now() + 4 * 3600000 + 35 * 60000).toISOString(),
    currency: "USD",
    requires_registration: true,
    vehicle: {
      id: "v-gt3",
      year: 2023,
      make_name: "Porsche",
      model_name: "911 GT3 RS",
      images: [
        { url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1400&q=80", is_primary: true }
      ]
    }
  },
  {
    id: "demo-auc-sf90",
    title: "2021 Ferrari SF90 Stradale Assetto Fiorano",
    status: "registration",
    starting_price: 450000,
    current_bid: null,
    reserve_price: 520000,
    buy_now_price: 590000,
    bid_increment: 2500,
    bids_count: 0,
    starts_at: new Date(Date.now() + 48 * 3600000).toISOString(),
    ends_at: new Date(Date.now() + 96 * 3600000).toISOString(),
    currency: "USD",
    requires_registration: true,
    vehicle: {
      id: "v-sf90",
      year: 2021,
      make_name: "Ferrari",
      model_name: "SF90 Stradale",
      images: [
        { url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1400&q=80", is_primary: true }
      ]
    }
  },
  {
    id: "demo-auc-g63",
    title: "2024 Mercedes-AMG G63 4x4 Squared Edition",
    status: "ended",
    starting_price: 290000,
    current_bid: 345000,
    reserve_price: 330000,
    buy_now_price: 380000,
    bid_increment: 2000,
    bids_count: 22,
    starts_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    ends_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    currency: "USD",
    requires_registration: false,
    winner_id: "demo-winner-1",
    current_bidder_id: "demo-winner-1",
    vehicle: {
      id: "v-g63",
      year: 2024,
      make_name: "Mercedes-AMG",
      model_name: "G63 4x4²",
      images: [
        { url: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1400&q=80", is_primary: true }
      ]
    }
  },
  {
    id: "demo-auc-cobra",
    title: "1967 Shelby Cobra 427 S/C CSX Continuation",
    status: "draft",
    starting_price: 195000,
    current_bid: null,
    reserve_price: 225000,
    buy_now_price: null,
    bid_increment: 1000,
    bids_count: 0,
    starts_at: new Date(Date.now() + 120 * 3600000).toISOString(),
    ends_at: new Date(Date.now() + 168 * 3600000).toISOString(),
    currency: "USD",
    requires_registration: false,
    vehicle: {
      id: "v-cobra",
      year: 1967,
      make_name: "Shelby",
      model_name: "Cobra 427 S/C",
      images: [
        { url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80", is_primary: true }
      ]
    }
  }
];

const DEMO_PARTICIPANTS = [
  {
    id: "part-1",
    status: "pending",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    user: {
      id: "user-8842",
      full_name: "Marcus Vance",
      avatar_url: null,
      verification_status: "verified",
      average_rating: 4.9,
    },
  },
  {
    id: "part-2",
    status: "approved",
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    user: {
      id: "user-1923",
      full_name: "Eleanor Sterling",
      avatar_url: null,
      verification_status: "verified",
      average_rating: 5.0,
    },
  },
  {
    id: "part-3",
    status: "pending",
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    user: {
      id: "user-5517",
      full_name: "Harrison Brooks",
      avatar_url: null,
      verification_status: "unverified",
      average_rating: 4.7,
    },
  },
  {
    id: "part-4",
    status: "rejected",
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    user: {
      id: "user-3301",
      full_name: "Julian Cross",
      avatar_url: null,
      verification_status: "flagged",
      average_rating: 3.2,
    },
  },
];

/**
 * Fetch auctions managed by the current user (operator view).
 */
export async function getMyAuctions(): Promise<{
  auctions: any[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const db = await getDb();
    let query = db
      .from("auctions")
      .select(
        `id, title, status, starting_price, current_bid, reserve_price,
         buy_now_price, bid_increment, bids_count, starts_at, ends_at,
         currency, requires_registration, winner_id,
         vehicle:vehicles (id, year, make_name, model_name,
           images:vehicle_images (url, is_primary)
         )`
      )
      .order("created_at", { ascending: false });

    if (user?.id) {
      query = query.eq("seller_id", user.id);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return { auctions: DEMO_OPERATOR_AUCTIONS };
    }
    return { auctions: data };
  } catch {
    return { auctions: DEMO_OPERATOR_AUCTIONS };
  }
}

/**
 * Fetch participants for a given auction (operator view).
 */
export async function getAuctionParticipants(auctionId: string): Promise<{
  participants: any[];
  error?: string;
}> {
  try {
    const db = await getDb();
    const { data, error } = await db
      .from("auction_participants")
      .select(
        `id, status, created_at,
         user:profiles (id, full_name, avatar_url, verification_status, average_rating)`
      )
      .eq("auction_id", auctionId)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return { participants: DEMO_PARTICIPANTS };
    }
    return { participants: data };
  } catch {
    return { participants: DEMO_PARTICIPANTS };
  }
}
