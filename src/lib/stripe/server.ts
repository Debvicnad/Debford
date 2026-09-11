import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Allow dev without Stripe configured
  console.warn("Warning: STRIPE_SECRET_KEY not set. Stripe features will be unavailable.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  // Use the version string required by the installed stripe package
  apiVersion: "2026-08-26.dahlia" as Stripe.LatestApiVersion,
  typescript: true,
});
