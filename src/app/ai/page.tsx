import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { Navbar } from "@/components/layout/Navbar";
import { AIAssistantClient } from "@/components/ai/AIAssistantClient";

export const metadata: Metadata = {
  title: "DEBA — AI Automotive Concierge & Diagnostics — Debford",
  description:
    "Your intelligent automotive advisor. Real-time market valuations, OBD-II diagnostic fault advice, 150-point inspection analysis, and vehicle telemetry comparisons.",
};

export default async function AIAssistantPage() {
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
      <AIAssistantClient userEmail={user?.email} />
    </main>
  );
}
