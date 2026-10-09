import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, getSaleListings } from "@/lib/db/queries";
import { Navbar } from "@/components/layout/Navbar";
import { CinematicHero } from "@/components/home/CinematicHero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { VehicleDiscovery } from "@/components/home/VehicleDiscovery";
import { GarageShowcase } from "@/components/home/GarageShowcase";
import { EcosystemGrid } from "@/components/home/EcosystemGrid";
import { VisualInterlude } from "@/components/home/VisualInterlude";
import { WhyDebford } from "@/components/home/WhyDebford";
import { CinematicCTA } from "@/components/home/CinematicCTA";

// ============================================================
// HOMEPAGE — Debford Cinematic Automotive Experience
// ============================================================

export default async function HomePage() {
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

  // Fetch initial featured/curated listings
  let listings: any[] = [];
  try {
    const res = await getSaleListings({ limit: 6 });
    listings = res.listings || [];
  } catch {
    listings = [];
  }

  const initial = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <main className="min-h-screen bg-[#080a0f] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* ── CINEMATIC NAVIGATION ───────────────────────────── */}
      <Navbar userEmail={user?.email} />

      {/* ── SECTION 1: CINEMATIC GARAGE HERO ───────────────── */}
      <CinematicHero userInitial={user ? initial : null} />

      {/* ── SECTION 2: THREE WORLDS (CARS, BIKES, TRUCKS) ──── */}
      <CategoryShowcase />

      {/* ── SECTION 3: DISCOVERY ENGINE & LIVE LISTINGS ────── */}
      <VehicleDiscovery initialListings={listings} />

      {/* ── SECTION 4: THE DEBFORD GARAGE LIFECYCLE ────────── */}
      <GarageShowcase />

      {/* ── SECTION 5: ECOSYSTEM MATRIX (SERVICES, PARTS, ETC) */}
      <EcosystemGrid />

      {/* ── SECTION 6: VISUAL INTERLUDE (BUILT FOR EVERY JOURNEY) */}
      <VisualInterlude />

      {/* ── SECTION 7: WHY DEBFORD PLATFORM PILLARS ────────── */}
      <WhyDebford />

      {/* ── SECTION 8: FINAL CINEMATIC CTA ─────────────────── */}
      <CinematicCTA />
    </main>
  );
}
