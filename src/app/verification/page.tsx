import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { getMyVerificationStatus } from "@/lib/actions/verification.actions";
import { VerificationClient } from "@/components/verification/VerificationClient";

export const metadata: Metadata = {
  title: "Identity & Trust Verification | DEBFORD",
  description: "Verify your identity, address, and dealer credentials on DEBFORD.",
};

export default async function VerificationPage() {
  if (!isSupabaseConfigured()) redirect("/login?redirectTo=/verification");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/verification");

  const { data } = await getMyVerificationStatus();

  const fallbackData = {
    verification_status: "unverified" as const,
    email: user.email ?? "",
    phone: user.phone ?? "",
    full_name: user.user_metadata?.full_name ?? "",
    city: "",
    country: "US",
    role: "buyer",
    documents: [],
  };

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      {/* Breadcrumb */}
      <div className="bg-[#0d121d] border-b border-white/5">
        <div className="container-debford py-3.5 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
          <span>›</span>
          <Link href="/profile" className="hover:text-slate-300 transition-colors">Profile</Link>
          <span>›</span>
          <span className="text-slate-300 font-medium">Verification Centre</span>
        </div>
      </div>

      <div className="container-debford py-8 max-w-5xl">
        <VerificationClient initialData={data || fallbackData} />
      </div>
    </div>
  );
}
