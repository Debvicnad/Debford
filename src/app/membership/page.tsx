import { Suspense } from "react";
import type { Metadata } from "next";
import { getMyMembership } from "@/lib/actions/membership.actions";
import { MembershipClient } from "@/components/membership/MembershipClient";

export const metadata: Metadata = {
  title: "Membership & Dealer Pricing — Debford",
  description: "Scale your automotive sales with Debford. Compare Free, Basic Seller, Pro Dealer, and Enterprise Fleet membership plans.",
};

export default async function MembershipPage() {
  const { membership } = await getMyMembership();
  const isAuthenticated = !!membership && membership.email !== null;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen surface-base flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }
    >
      <MembershipClient
        initialMembership={membership}
        isAuthenticated={isAuthenticated}
      />
    </Suspense>
  );
}
