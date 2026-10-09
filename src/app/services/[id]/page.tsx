import type { Metadata } from "next";
import { ALL_PROVIDERS } from "@/lib/data/services.data";
import { ProviderDetailView } from "@/components/services/ProviderDetailView";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const provider = ALL_PROVIDERS.find((p) => p.id === id) || ALL_PROVIDERS[0];
  return {
    title: `${provider.name} — Automotive Service Specialist | Debford`,
    description: `Book appointments, inspect verified packages, customer reviews, and get service quotes from ${provider.name} on Debford. Zero upfront fee.`,
  };
}

export default async function ServiceProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = ALL_PROVIDERS.find((p) => p.id === id) || ALL_PROVIDERS[0];

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
      {/* Navigation */}
      <Navbar userEmail={user?.email} />

      <ProviderDetailView provider={provider} />
    </main>
  );
}

