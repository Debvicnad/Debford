import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Secure Escrow & Checkout — Debford",
  description: "Complete your vehicle purchase, listing boost, or membership with Debford Escrow Protection.",
};

interface SearchParams {
  type?: string;
  id?: string;
  plan?: string;
  success?: string;
  reference?: string;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const checkoutType = (sp.type as "vehicle" | "boost" | "membership" | "general") || "vehicle";
  const listingId = sp.id;
  const boostPlan = (sp.plan as "featured" | "priority") || null;
  const initialSuccessRef = sp.reference || (sp.success ? "ESC-CONFIRMED" : null);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let vehiclePreview = null;

  if (listingId) {
    const { data: listing } = await supabase
      .from("sale_listings")
      .select(`
        id, title, price, currency,
        vehicle:vehicles (
          year, make_name, model_name,
          images:vehicle_images (url, is_primary)
        ),
        seller:profiles (
          id, full_name, average_rating
        )
      `)
      .eq("id", listingId)
      .single();

    if (listing) {
      const v = listing.vehicle as any;
      const primaryImg = v?.images?.find((i: any) => i.is_primary)?.url || v?.images?.[0]?.url;
      vehiclePreview = {
        id: listing.id,
        title: listing.title,
        price: Number(listing.price),
        currency: listing.currency ?? "USD",
        year: v?.year,
        sellerName: (listing.seller as any)?.full_name ?? "Verified Merchant",
        sellerRating: Number((listing.seller as any)?.average_rating ?? 4.9),
        imageUrl: primaryImg,
      };
    }
  }

  // Fallback demo vehicle preview if no specific listing was provided
  if (!vehiclePreview && checkoutType === "vehicle") {
    vehiclePreview = {
      id: listingId || "demo-v1",
      title: "2023 Porsche 911 GT3 RS — Clubsport Package",
      price: 248500,
      currency: "USD",
      year: 2023,
      sellerName: "Stuttgart Heritage Motors",
      sellerRating: 5.0,
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    };
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen surface-base flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutClient
        checkoutType={checkoutType}
        vehicle={vehiclePreview}
        boostPlan={boostPlan}
        membershipPlan={sp.plan}
        initialSuccessRef={initialSuccessRef}
        isAuthenticated={!!user}
      />
    </Suspense>
  );
}
