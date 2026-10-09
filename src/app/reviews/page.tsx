import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { Navbar } from "@/components/layout/Navbar";
import { ReviewsClient } from "@/components/reviews/ReviewsClient";

export const metadata: Metadata = {
  title: "Reviews & Trust Telemetry — Debford",
  description:
    "Transparent peer ratings, verified buyer testimonials, and guild reputation telemetry for sellers and specialists on Debford.",
};

export default async function ReviewsPage() {
  let user = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch {
      user = null;
    }
  }

  return (
    <main className="min-h-screen bg-[#06090e] text-slate-100 selection:bg-blue-600 selection:text-white">
      <Navbar userEmail={user?.email} />
      <ReviewsClient userEmail={user?.email} />
    </main>
  );
}
