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
      "id, title, status, current_bid, starting_price, bid_increment, seller_id, current_bidder_id, ends_at, reserve_price, buy_now_price, bids_count"
    )
    .eq("id", auctionId)
    .single();

  if (fetchError || !auction) {
    return { error: "Auction not found." };
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
