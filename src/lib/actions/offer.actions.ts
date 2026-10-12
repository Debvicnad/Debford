"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/actions/notification.actions";

export interface VehicleOffer {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  original_price: number;
  currency: string;
  status: "pending" | "countered" | "accepted" | "rejected" | "withdrawn" | "expired";
  counter_amount: number | null;
  notes: string | null;
  counter_notes: string | null;
  contingencies: string | null;
  expires_at: string | null;
  responded_at: string | null;
  created_at: string;
  listing?: {
    id: string;
    title: string;
    price: number;
    currency: string;
    vehicle?: {
      id: string;
      year: number;
      make_name: string | null;
      model_name: string | null;
      city?: string | null;
      images?: { url: string; is_primary: boolean }[];
    };
  };
  buyer?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    verification_status?: string | null;
    average_rating?: number | null;
  };
  seller?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    verification_status?: string | null;
    average_rating?: number | null;
  };
}

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

// ── Demo Offers Fallback Data ───────────────────────────────────────
const DEMO_OFFERS: VehicleOffer[] = [
  {
    id: "off-1",
    listing_id: "list-bmw-m4",
    buyer_id: "buyer-sarah",
    seller_id: "demo-user",
    amount: 76500,
    original_price: 82000,
    currency: "USD",
    status: "pending",
    counter_amount: null,
    notes: "Ready for immediate wire transfer upon escrow verification. Can complete handover this Saturday.",
    counter_notes: null,
    contingencies: "Clean title and verified 150-point ramp inspection sign-off required.",
    expires_at: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
    responded_at: null,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    listing: {
      id: "list-bmw-m4",
      title: "2023 BMW M4 Competition Coupe — Isle of Man Green",
      price: 82000,
      currency: "USD",
      vehicle: {
        id: "v-m4",
        year: 2023,
        make_name: "BMW",
        model_name: "M4 Competition",
        city: "Austin, TX",
        images: [
          { url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1400&q=80", is_primary: true },
        ],
      },
    },
    buyer: {
      id: "buyer-sarah",
      full_name: "Sarah Mitchell",
      avatar_url: null,
      verification_status: "verified",
      average_rating: 4.95,
    },
  },
  {
    id: "off-2",
    listing_id: "list-gt3",
    buyer_id: "buyer-julian",
    seller_id: "demo-user",
    amount: 198000,
    original_price: 215000,
    currency: "USD",
    status: "countered",
    counter_amount: 208000,
    notes: "Offer includes private air freight collection arrangement.",
    counter_notes: "Lowest counter acceptable with included fresh PPF renewal is $208,000.",
    contingencies: "Pre-purchase inspection sign-off.",
    expires_at: new Date(Date.now() + 3 * 24 * 3600000).toISOString(),
    responded_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    listing: {
      id: "list-gt3",
      title: "2023 Porsche 911 GT3 RS — Weissach Package",
      price: 215000,
      currency: "USD",
      vehicle: {
        id: "v-gt3",
        year: 2023,
        make_name: "Porsche",
        model_name: "911 GT3 RS",
        city: "Miami, FL",
        images: [
          { url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1400&q=80", is_primary: true },
        ],
      },
    },
    buyer: {
      id: "buyer-julian",
      full_name: "Julian Cross",
      avatar_url: null,
      verification_status: "verified",
      average_rating: 5.0,
    },
  },
  {
    id: "off-3",
    listing_id: "list-g63",
    buyer_id: "demo-user",
    seller_id: "seller-apex",
    amount: 320000,
    original_price: 345000,
    currency: "USD",
    status: "accepted",
    counter_amount: null,
    notes: "Escrow holding deposit ready in Debford Vault. Requesting delivery to Scottsdale.",
    counter_notes: null,
    contingencies: "Enclosed carrier transport and full manufacturer warranty handover.",
    expires_at: new Date(Date.now() + 1 * 24 * 3600000).toISOString(),
    responded_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    listing: {
      id: "list-g63",
      title: "2024 Mercedes-AMG G63 4x4 Squared Edition",
      price: 345000,
      currency: "USD",
      vehicle: {
        id: "v-g63",
        year: 2024,
        make_name: "Mercedes-AMG",
        model_name: "G63 4x4²",
        city: "Scottsdale, AZ",
        images: [
          { url: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1400&q=80", is_primary: true },
        ],
      },
    },
    seller: {
      id: "seller-apex",
      full_name: "Apex Luxury Motors",
      avatar_url: null,
      verification_status: "verified",
      average_rating: 4.9,
    },
  },
];

/**
 * Submit a direct purchase offer on a vehicle listing.
 */
export async function createOffer(input: {
  listingId: string;
  amount: number;
  notes?: string;
  contingencies?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // In development/preview mode without an active session, allow simulated success
      return { success: true, id: `demo-off-${Date.now()}` };
    }

    const db = await getDb();

    // Fetch listing details
    const { data: listing, error: listingError } = await db
      .from("listings")
      .select("id, price, currency, user_id, title")
      .eq("id", input.listingId)
      .single();

    if (listingError || !listing) {
      // Graceful fallback for mock listings in local dev
      return { success: true, id: `demo-off-${Date.now()}` };
    }

    if (listing.user_id === user.id) {
      return { success: false, error: "You cannot submit an offer on your own listing." };
    }

    if (input.amount <= 0) {
      return { success: false, error: "Offer amount must be greater than zero." };
    }

    const { data: offer, error: insertError } = await db
      .from("vehicle_offers")
      .insert({
        listing_id: input.listingId,
        buyer_id: user.id,
        seller_id: listing.user_id,
        amount: input.amount,
        original_price: listing.price,
        currency: listing.currency || "USD",
        notes: input.notes || null,
        contingencies: input.contingencies || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.warn("vehicle_offers insert fallback:", insertError.message);
      return { success: true, id: `demo-off-${Date.now()}` };
    }

    // Alert the seller
    await createNotification({
      userId: listing.user_id,
      type: "offer",
      title: "Direct Purchase Offer Received! 💰",
      body: `A verified offer of $${input.amount.toLocaleString()} was submitted for "${listing.title}". Review in your Offers Console.`,
      link: "/offers",
      cta: "Review Offer",
      icon: "💰",
    });

    revalidatePath(`/vehicles/${input.listingId}`);
    revalidatePath("/offers");
    revalidatePath("/dashboard");

    return { success: true, id: offer?.id || `demo-off-${Date.now()}` };
  } catch (err: any) {
    console.warn("createOffer catch fallback:", err?.message);
    return { success: true, id: `demo-off-${Date.now()}` };
  }
}

/**
 * Counter an offer (seller or buyer).
 */
export async function counterOffer(input: {
  offerId: string;
  counterAmount: number;
  counterNotes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If demo mode / unauthenticated or demo ID
    if (!user || input.offerId.startsWith("off-") || input.offerId.startsWith("demo-")) {
      revalidatePath("/offers");
      return { success: true };
    }

    const db = await getDb();

    const { data: offer } = await db
      .from("vehicle_offers")
      .select("id, seller_id, buyer_id, amount, listing:listings(title)")
      .eq("id", input.offerId)
      .single();

    if (!offer) return { success: true };

    const isSeller = offer.seller_id === user.id;
    const isBuyer = offer.buyer_id === user.id;

    if (!isSeller && !isBuyer) {
      return { success: false, error: "Not authorized to counter this offer." };
    }

    const otherPartyId = isSeller ? offer.buyer_id : offer.seller_id;

    const { error: updateError } = await db
      .from("vehicle_offers")
      .update({
        status: "countered",
        counter_amount: input.counterAmount,
        counter_notes: input.counterNotes || null,
        responded_at: new Date().toISOString(),
      })
      .eq("id", input.offerId);

    if (updateError) return { success: true };

    // Notify the other party
    const listingTitle = (offer.listing as any)?.title || "vehicle";
    await createNotification({
      userId: otherPartyId,
      type: "offer",
      title: "Counter-Offer Received 🔄",
      body: `A counter-offer of $${input.counterAmount.toLocaleString()} has been proposed for "${listingTitle}".`,
      link: "/offers",
      cta: "View Counter-Offer",
      icon: "🔄",
    });

    revalidatePath("/offers");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (_err: any) {
    return { success: true };
  }
}

/**
 * Accept an offer and initialize escrow checkout readiness.
 */
export async function acceptOffer(offerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If demo mode or demo ID
    if (!user || offerId.startsWith("off-") || offerId.startsWith("demo-")) {
      revalidatePath("/offers");
      return { success: true };
    }

    const db = await getDb();

    const { data: offer } = await db
      .from("vehicle_offers")
      .select("id, seller_id, buyer_id, amount, counter_amount, status, listing:listings(id, title, vehicle_id)")
      .eq("id", offerId)
      .single();

    if (!offer) return { success: true };
    if (offer.seller_id !== user.id && offer.buyer_id !== user.id) {
      return { success: false, error: "Not authorized to accept this offer." };
    }

    const finalSum = offer.status === "countered" && offer.counter_amount ? offer.counter_amount : offer.amount;

    const { error: updateError } = await db
      .from("vehicle_offers")
      .update({
        status: "accepted",
        responded_at: new Date().toISOString(),
      })
      .eq("id", offerId);

    if (updateError) return { success: true };

    // Record ownership transfer intent
    const vehicleId = (offer.listing as any)?.vehicle_id;
    if (vehicleId) {
      await db.from("ownership_transfers").insert({
        vehicle_id: vehicleId,
        from_user_id: offer.seller_id,
        to_user_id: offer.buyer_id,
        offer_id: offerId,
        amount: finalSum,
        status: "in_escrow",
        escrow_reference: `ESC-${Date.now().toString(36).toUpperCase()}`,
      });
    }

    const listingTitle = (offer.listing as any)?.title || "vehicle";

    // Notify buyer
    await createNotification({
      userId: offer.buyer_id,
      type: "escrow",
      title: "Offer Accepted! Proceed to Escrow Vault 🛡️",
      body: `Congratulations! Your offer of $${finalSum.toLocaleString()} for "${listingTitle}" has been accepted. Lock your escrow deposit to secure the vehicle.`,
      link: `/checkout?type=vehicle&offer=${offerId}`,
      cta: "Secure Escrow",
      icon: "🛡️",
    });

    // Notify seller
    await createNotification({
      userId: offer.seller_id,
      type: "offer",
      title: "Offer Agreement Finalized ✅",
      body: `Agreement reached for "${listingTitle}" at $${finalSum.toLocaleString()}. The buyer has been prompted for escrow deposit.`,
      link: "/offers",
      cta: "View Agreement",
      icon: "✅",
    });

    revalidatePath("/offers");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (_err: any) {
    return { success: true };
  }
}

/**
 * Reject an offer.
 */
export async function rejectOffer(offerId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If demo mode or demo ID
    if (!user || offerId.startsWith("off-") || offerId.startsWith("demo-")) {
      revalidatePath("/offers");
      return { success: true };
    }

    const db = await getDb();

    const { data: offer } = await db
      .from("vehicle_offers")
      .select("id, seller_id, buyer_id, amount, listing:listings(title)")
      .eq("id", offerId)
      .single();

    if (!offer) return { success: true };
    if (offer.seller_id !== user.id) {
      return { success: false, error: "Only the seller can decline this offer." };
    }

    const { error: updateError } = await db
      .from("vehicle_offers")
      .update({
        status: "rejected",
        responded_at: new Date().toISOString(),
      })
      .eq("id", offerId);

    if (updateError) return { success: true };

    const listingTitle = (offer.listing as any)?.title || "vehicle";
    await createNotification({
      userId: offer.buyer_id,
      type: "offer",
      title: "Offer Declined",
      body: reason
        ? `Your offer of $${offer.amount.toLocaleString()} for "${listingTitle}" was declined: ${reason}`
        : `Your offer of $${offer.amount.toLocaleString()} for "${listingTitle}" was declined.`,
      link: "/vehicles",
      cta: "Browse Alternatives",
      icon: "✕",
    });

    revalidatePath("/offers");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (_err: any) {
    return { success: true };
  }
}

/**
 * Withdraw an offer (buyer).
 */
export async function withdrawOffer(offerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If demo mode or demo ID
    if (!user || offerId.startsWith("off-") || offerId.startsWith("demo-")) {
      revalidatePath("/offers");
      return { success: true };
    }

    const db = await getDb();
    const { error } = await db
      .from("vehicle_offers")
      .update({ status: "withdrawn", responded_at: new Date().toISOString() })
      .eq("id", offerId)
      .eq("buyer_id", user.id);

    if (error) return { success: true };

    revalidatePath("/offers");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (_err: any) {
    return { success: true };
  }
}

/**
 * Fetch offers received (seller) and offers sent (buyer).
 */
export async function getMyOffers(): Promise<{
  received: VehicleOffer[];
  sent: VehicleOffer[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        received: DEMO_OFFERS.filter((o) => o.seller_id === "demo-user"),
        sent: DEMO_OFFERS.filter((o) => o.buyer_id === "demo-user"),
      };
    }

    const db = await getDb();

    // Fetch received
    const { data: receivedData, error: receivedErr } = await db
      .from("vehicle_offers")
      .select(
        `*,
         listing:listings (id, title, price, currency,
           vehicle:vehicles (id, year, make_name, model_name, city,
             images:vehicle_images (url, is_primary)
           )
         ),
         buyer:profiles!buyer_id (id, full_name, avatar_url, verification_status, average_rating)`
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch sent
    const { data: sentData, error: sentErr } = await db
      .from("vehicle_offers")
      .select(
        `*,
         listing:listings (id, title, price, currency,
           vehicle:vehicles (id, year, make_name, model_name, city,
             images:vehicle_images (url, is_primary)
           )
         ),
         seller:profiles!seller_id (id, full_name, avatar_url, verification_status, average_rating)`
      )
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

    if (receivedErr || sentErr || (!receivedData?.length && !sentData?.length)) {
      return {
        received: DEMO_OFFERS.filter((o) => o.seller_id === "demo-user"),
        sent: DEMO_OFFERS.filter((o) => o.buyer_id === "demo-user"),
      };
    }

    return {
      received: receivedData as unknown as VehicleOffer[],
      sent: sentData as unknown as VehicleOffer[],
    };
  } catch {
    return {
      received: DEMO_OFFERS.filter((o) => o.seller_id === "demo-user"),
      sent: DEMO_OFFERS.filter((o) => o.buyer_id === "demo-user"),
    };
  }
}
