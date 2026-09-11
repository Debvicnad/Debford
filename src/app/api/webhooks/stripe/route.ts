import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

const PLAN_TIERS: Record<string, string> = {
  basic: "basic",
  pro: "pro",
  enterprise: "enterprise",
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      // ── Subscription created / updated ─────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        const plan = sub.metadata?.plan ?? "basic";
        if (!userId) break;

        await supabase.from("profiles").update({
          membership_tier: PLAN_TIERS[plan] ?? "basic",
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          subscription_status: sub.status,
          subscription_expires_at: (sub as unknown as { current_period_end?: number }).current_period_end
            ? new Date(((sub as unknown as { current_period_end: number }).current_period_end) * 1000).toISOString()
            : null,
        }).eq("id", userId);

        // Notify user
        await supabase.from("notifications").insert({
          user_id: userId,
          type: "system",
          title: "Plan activated!",
          body: `Your ${plan} plan is now active. Enjoy Debford!`,
        });
        break;
      }

      // ── Subscription cancelled ──────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) break;

        await supabase.from("profiles").update({
          membership_tier: "free",
          stripe_subscription_id: null,
          subscription_status: "cancelled",
          subscription_expires_at: null,
        }).eq("id", userId);
        break;
      }

      // ── Listing boost paid ──────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { supabase_user_id, listing_id, boost_type, type } = (session.metadata ?? {}) as Record<string, string | undefined>;

        if (type === "vehicle_purchase" && listing_id) {
          // Record purchase intent; escrow held
          await supabase.from("sale_listings").update({
            status: "payment_pending",
          }).eq("id", listing_id);

          await supabase.from("notifications").insert({
            user_id: supabase_user_id,
            type: "purchase",
            title: "Purchase secured!",
            body: "Your payment is held securely. The seller will be notified to arrange handover.",
          });
        }

        if (boost_type && listing_id) {
          const days = boost_type === "featured" ? 7 : 30;
          const expiresAt = new Date(Date.now() + days * 86400_000).toISOString();

          await supabase.from("sale_listings").update({
            is_featured: true,
            featured_until: expiresAt,
          }).eq("id", listing_id);

          await supabase.from("notifications").insert({
            user_id: supabase_user_id,
            type: "listing",
            title: "Listing boosted!",
            body: `Your listing is now ${boost_type === "featured" ? "featured" : "priority"} for ${days} days.`,
          });
        }
        break;
      }

      // ── Invoice paid (renewal) ─────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabase.from("profiles").update({
            subscription_status: "active",
          }).eq("id", profile.id);
        }
        break;
      }

      // ── Invoice payment failed ─────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabase.from("notifications").insert({
            user_id: profile.id,
            type: "billing",
            title: "Payment failed",
            body: "We couldn't process your subscription payment. Please update your billing details.",
          });
        }
        break;
      }
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
