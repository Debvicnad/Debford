"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/server";

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

export type MembershipTier = "free" | "basic" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "annual";

export interface MembershipStatus {
  tier: MembershipTier;
  role: string;
  email: string | null;
  fullName: string | null;
  subscriptionStatus?: string | null;
  subscriptionExpiresAt?: string | null;
  stripeCustomerId?: string | null;
}

export interface MembershipActionResult {
  success?: boolean;
  error?: string;
  redirectUrl?: string;
  tier?: MembershipTier;
  billingCycle?: BillingCycle;
  expiresAt?: string;
}

const PLAN_PRICES: Record<MembershipTier, { monthly: number; annualMonthly: number; annualTotal: number; name: string }> = {
  free: { monthly: 0, annualMonthly: 0, annualTotal: 0, name: "Free Tier" },
  basic: { monthly: 19, annualMonthly: 15, annualTotal: 180, name: "Basic Plan" },
  pro: { monthly: 49, annualMonthly: 39, annualTotal: 468, name: "Pro Dealer Plan" },
  enterprise: { monthly: 199, annualMonthly: 159, annualTotal: 1908, name: "Enterprise Fleet Plan" },
};

/**
 * Get current user's membership and profile information
 */
export async function getMyMembership(): Promise<{ membership: MembershipStatus | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { membership: null };

  const db = await getDb();
  const { data: profile, error } = await db
    .from("profiles")
    .select("id, email, full_name, role, membership_tier, stripe_customer_id, subscription_status, subscription_expires_at")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return {
      membership: {
        tier: "free",
        role: "buyer",
        email: user.email ?? null,
        fullName: user.user_metadata?.full_name ?? null,
      },
    };
  }

  return {
    membership: {
      tier: (profile.membership_tier as MembershipTier) || "free",
      role: profile.role || "buyer",
      email: profile.email || user.email || null,
      fullName: profile.full_name || user.user_metadata?.full_name || null,
      subscriptionStatus: profile.subscription_status ?? null,
      subscriptionExpiresAt: profile.subscription_expires_at ?? null,
      stripeCustomerId: profile.stripe_customer_id ?? null,
    },
  };
}

/**
 * Upgrade or change membership plan (supports Stripe Checkout when configured or Instant Activation)
 */
export async function switchMembershipPlan(
  planId: MembershipTier,
  billingCycle: BillingCycle = "monthly"
): Promise<MembershipActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to change your membership plan." };

  if (planId === "free") {
    return cancelMembershipSubscription();
  }

  const db = await getDb();

  // If Stripe secret key and environment price IDs exist, generate real Stripe Checkout session
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const isStripeConfigured = stripeSecretKey && !stripeSecretKey.includes("placeholder") && !stripeSecretKey.includes("your_");
  const priceEnvKey = `STRIPE_PRICE_${planId.toUpperCase()}_${billingCycle.toUpperCase()}`;
  const fallbackPriceEnvKey = `STRIPE_PRICE_${planId.toUpperCase()}`;
  const priceId = process.env[priceEnvKey] || process.env[fallbackPriceEnvKey];

  if (isStripeConfigured && priceId) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

      // Fetch or create customer
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
        success_url: `${appUrl}/membership?success=1&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/membership?cancelled=1`,
        metadata: { supabase_user_id: user.id, plan: planId, billingCycle },
        subscription_data: {
          metadata: { supabase_user_id: user.id, plan: planId, billingCycle },
        },
        allow_promotion_codes: true,
      });

      if (session.url) {
        return { success: true, redirectUrl: session.url };
      }
    } catch (stripeErr: any) {
      console.warn("Stripe Checkout Session error, falling back to direct DB activation:", stripeErr.message);
    }
  }

  // Instant direct activation (sandbox / dev / zero-friction activation)
  const daysValid = billingCycle === "annual" ? 365 : 30;
  const expiresAt = new Date(Date.now() + daysValid * 86400_000).toISOString();

  // Role promotion logic
  let newRole: string | undefined = undefined;
  if (planId === "enterprise") {
    newRole = "dealer";
  } else if (planId === "pro") {
    newRole = "dealer";
  }

  const updateData: Record<string, any> = {
    membership_tier: planId,
    subscription_status: "active",
    subscription_expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  };

  if (newRole) {
    updateData.role = newRole;
  }

  const { error: updateError } = await db
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (updateError) {
    return { error: `Failed to activate plan: ${updateError.message}` };
  }

  // Create notification
  const planInfo = PLAN_PRICES[planId] ?? { name: `${planId.toUpperCase()} Plan` };
  await db.from("notifications").insert({
    user_id: user.id,
    type: "system",
    title: `🎉 ${planInfo.name} Activated!`,
    body: `Your account has been upgraded to ${planInfo.name} (${billingCycle} billing). Enjoy increased listing limits, analytics, and verified dealer perks!`,
  });

  revalidatePath("/membership");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/sell");

  return { success: true, tier: planId, billingCycle, expiresAt };
}

/**
 * Cancel user's membership subscription and revert to Free tier
 */
export async function cancelMembershipSubscription(): Promise<MembershipActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const db = await getDb();

  const { error } = await db
    .from("profiles")
    .update({
      membership_tier: "free",
      subscription_status: "cancelled",
      subscription_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  await db.from("notifications").insert({
    user_id: user.id,
    type: "system",
    title: "Subscription Cancelled",
    body: "Your subscription has been cancelled. Your account is now on the Free tier.",
  });

  revalidatePath("/membership");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return { success: true, tier: "free" };
}
