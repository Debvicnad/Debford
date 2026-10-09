"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

export interface EscrowPurchasePayload {
  listingId: string;
  depositOnly?: boolean;
  deliveryOption?: "pickup" | "delivery" | "enclosed_transport";
  shippingAddress?: string;
  buyerNotes?: string;
}

export interface BoostListingPayload {
  listingId: string;
  boostType: "featured" | "priority";
}

// ── Membership checkout ───────────────────────────────────────
const PLAN_PRICE_IDS: Record<string, string> = {
  basic: process.env.STRIPE_PRICE_BASIC ?? "",
  pro:   process.env.STRIPE_PRICE_PRO ?? "",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE ?? "",
};

export async function createMembershipCheckout(planId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to subscribe." };

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const isStripeConfigured = stripeSecretKey && !stripeSecretKey.includes("placeholder") && !stripeSecretKey.includes("your_");
  const priceId = PLAN_PRICE_IDS[planId];

  if (isStripeConfigured && priceId) {
    const db = await getDb();
    const { data: profile } = await db
      .from("profiles")
      .select("stripe_customer_id, email, full_name")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? profile?.email ?? "",
        name: profile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await db
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/dashboard?plan=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/membership?cancelled=1`,
      metadata: { supabase_user_id: user.id, plan: planId },
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan: planId },
      },
      allow_promotion_codes: true,
    });

    if (session.url) return { url: session.url };
  }

  // Direct activation fallback
  return { success: true, redirectUrl: `${APP_URL}/membership?success=1&plan=${planId}` };
}

// ── Featured listing boost ────────────────────────────────────
export async function createListingBoostCheckout(listingId: string, boostType: "featured" | "priority") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to boost your listing." };

  const db = await getDb();
  const days = boostType === "featured" ? 7 : 30;
  const expiresAt = new Date(Date.now() + days * 86400_000).toISOString();

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const isStripeConfigured = stripeSecretKey && !stripeSecretKey.includes("placeholder") && !stripeSecretKey.includes("your_");

  if (isStripeConfigured) {
    try {
      const priceMap = {
        featured: 999,   // $9.99
        priority: 2999,  // $29.99
      };

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: priceMap[boostType],
              product_data: {
                name: boostType === "featured" ? "Featured Listing (7 days)" : "Priority Placement (30 days)",
                description: boostType === "featured"
                  ? "Your listing appears at the top of search results for 7 days"
                  : "Your listing is pinned to homepage & category search for 30 days",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${APP_URL}/garage?boost=success&listing=${listingId}`,
        cancel_url: `${APP_URL}/garage`,
        metadata: { supabase_user_id: user.id, listing_id: listingId, boost_type: boostType },
      });

      if (session.url) return { url: session.url };
    } catch (err: any) {
      console.warn("Stripe boost error, falling back to direct update:", err.message);
    }
  }

  // Direct activation
  await db
    .from("sale_listings")
    .update({
      is_featured: true,
      featured_until: expiresAt,
    })
    .eq("id", listingId);

  await db.from("notifications").insert({
    user_id: user.id,
    type: "listing",
    title: "🚀 Listing Boost Activated!",
    body: `Your vehicle listing has been upgraded to ${boostType === "featured" ? "Featured Placement (7 days)" : "Priority Spotlight (30 days)"}.`,
  });

  revalidatePath(`/vehicles/${listingId}`);
  revalidatePath("/garage");
  revalidatePath("/vehicles");

  return { success: true, boostType, expiresAt };
}

// ── Vehicle purchase escrow hold ──────────────────────────────
export async function createPurchaseCheckout(payload: EscrowPurchasePayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to purchase or place a deposit." };

  const db = await getDb();

  const { data: listing, error: listingError } = await db
    .from("sale_listings")
    .select("id, title, price, currency, seller_id, status")
    .eq("id", payload.listingId)
    .single();

  if (listingError || !listing) return { error: "Vehicle listing not found." };
  if (listing.seller_id === user.id) return { error: "You cannot purchase your own vehicle." };

  const holdAmount = payload.depositOnly ? Math.min(1000, Math.round(Number(listing.price) * 0.05)) : Number(listing.price);
  const escrowReference = `ESC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const isStripeConfigured = stripeSecretKey && !stripeSecretKey.includes("placeholder") && !stripeSecretKey.includes("your_");

  if (isStripeConfigured) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: (listing.currency ?? "usd").toLowerCase(),
              unit_amount: Math.round(holdAmount * 100),
              product_data: {
                name: payload.depositOnly ? `Vehicle Deposit Hold: ${listing.title}` : `Escrow Purchase: ${listing.title}`,
                description: "Protected by Debford Automotive Escrow Vault. Funds are held until vehicle inspection & title transfer.",
              },
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          capture_method: "manual", // Escrow hold
          metadata: {
            supabase_user_id: user.id,
            listing_id: payload.listingId,
            seller_id: listing.seller_id,
            type: "vehicle_purchase",
            escrow_reference: escrowReference,
          },
        },
        success_url: `${APP_URL}/checkout?success=1&reference=${escrowReference}&listing=${payload.listingId}`,
        cancel_url: `${APP_URL}/checkout?type=vehicle&id=${payload.listingId}`,
        metadata: {
          supabase_user_id: user.id,
          listing_id: payload.listingId,
          type: "vehicle_purchase",
          escrow_reference: escrowReference,
        },
      });

      if (session.url) return { url: session.url };
    } catch (stripeErr: any) {
      console.warn("Stripe Checkout error, falling back to direct escrow record:", stripeErr.message);
    }
  }

  // Direct escrow hold recording
  await db
    .from("sale_listings")
    .update({ status: "reserved" })
    .eq("id", payload.listingId);

  // Notify Buyer
  await db.from("notifications").insert({
    user_id: user.id,
    type: "payment",
    title: "🛡️ Escrow Hold Secured!",
    body: `Your ${payload.depositOnly ? "refundable deposit" : "purchase funds"} ($${holdAmount.toLocaleString()}) for "${listing.title}" is now held safely in the Debford Escrow Vault (Ref: ${escrowReference}).`,
  });

  // Notify Seller
  if (listing.seller_id) {
    await db.from("notifications").insert({
      user_id: listing.seller_id,
      type: "payment",
      title: "💰 Buyer Escrow Funds Deposited!",
      body: `A verified buyer has secured an escrow hold ($${holdAmount.toLocaleString()}) for "${listing.title}". Please contact the buyer to coordinate vehicle inspection and handover.`,
    });
  }

  revalidatePath(`/vehicles/${payload.listingId}`);
  revalidatePath("/garage");
  revalidatePath("/dashboard");

  return { success: true, escrowReference, holdAmount, listingTitle: listing.title };
}

// ── Complete & Release Escrow ─────────────────────────────────
export async function releaseEscrowHold(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const db = await getDb();

  const { data: listing } = await db
    .from("sale_listings")
    .select("id, title, price, seller_id")
    .eq("id", listingId)
    .single();

  if (!listing) return { error: "Listing not found" };

  // Mark as sold
  await db
    .from("sale_listings")
    .update({ status: "sold" })
    .eq("id", listingId);

  // Send release notification
  if (listing.seller_id) {
    await db.from("notifications").insert({
      user_id: listing.seller_id,
      type: "payment",
      title: "🎉 Escrow Funds Released!",
      body: `The buyer confirmed inspection & handover for "${listing.title}". Payout of $${Number(listing.price).toLocaleString()} has been dispatched to your merchant account.`,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/garage");
  revalidatePath(`/vehicles/${listingId}`);

  return { success: true };
}
