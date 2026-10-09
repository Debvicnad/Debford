import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { Navbar } from "@/components/layout/Navbar";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Collector Profile & Security Console — Debford",
  description:
    "Manage your Debford collector credentials, multi-factor security, transaction notifications, and escrow settlement accounts.",
};

export default async function ProfilePage() {
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

  // Graceful fallback for preview / guest demonstration
  const userEmail = user?.email ?? "collector@debford.luxury";
  const userFullName = user?.user_metadata?.full_name ?? "Alexander Wright";
  const userRole = user?.user_metadata?.role ?? "Pro Dealer & Collector";

  return (
    <main className="min-h-screen bg-[#06090e] text-slate-100 selection:bg-blue-600 selection:text-white">
      <Navbar userEmail={user?.email} />
      <ProfileClient
        userEmail={userEmail}
        userFullName={userFullName}
        userRole={userRole}
      />
    </main>
  );
}
