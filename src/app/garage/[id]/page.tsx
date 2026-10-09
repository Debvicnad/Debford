import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVehicleDetails, isSupabaseConfigured } from "@/lib/db/queries";
import { GarageVehicleClient } from "@/components/garage/GarageVehicleClient";
import { Navbar } from "@/components/layout/Navbar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured()) return { title: "Vehicle Command | Debford Garage" };
  const { vehicle } = await getVehicleDetails(id);
  if (!vehicle) return { title: "Vehicle Command | Debford Garage" };
  return {
    title: `${vehicle.year} ${vehicle.make_name} ${vehicle.model_name} | Debford Garage`,
    description: `Manage service history, maintenance records, and documents for your ${vehicle.make_name} on Debford.`,
  };
}

export default async function GarageVehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  if (!user && id !== "demo") {
    redirect("/login?redirectTo=/garage");
  }

  const { vehicle } = await getVehicleDetails(id);

  // If vehicle doesn't exist in database, provide fallback demo if test id
  let targetVehicle = vehicle;
  if (!targetVehicle) {
    if (id === "demo" || id === "1") {
      targetVehicle = {
        id: "demo",
        year: 2024,
        make_name: "BMW",
        model_name: "M4 Competition",
        variant_name: "xDrive Coupe",
        color: "Isle of Man Green",
        interior_color: "Kyalami Orange Leather",
        mileage: 12400,
        mileage_unit: "km",
        fuel_type: "Petrol",
        transmission: "Automatic",
        engine_capacity: 2993,
        power_hp: 503,
        registration_plate: "M-POWER-4",
        vin: "WBS43AY05PFL98214",
        condition: "used",
        status: "active",
        city: "Los Angeles, CA",
        description:
          "Fully loaded 2024 BMW M4 Competition xDrive with Carbon Package and M Performance exhaust.",
        images: [
          {
            url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
            is_primary: true,
          },
        ],
        features: [
          { category: "Performance", feature: "M Carbon Ceramic Brakes" },
          { category: "Performance", feature: "M Drivers Package" },
          { category: "Technology", feature: "Harman Kardon Audio" },
        ],
        documents: [
          {
            id: "d1",
            title: "Comprehensive Insurance Policy",
            document_type: "insurance",
            expiry_date: "2027-04-15",
          },
          {
            id: "d2",
            title: "State Vehicle Registration",
            document_type: "registration",
            expiry_date: "2027-01-30",
          },
          {
            id: "d3",
            title: "10,000 km Break-in Service & Inspection",
            document_type: "service_record",
            expiry_date: "2026-06-10",
          },
        ],
        sale_listing: null,
        rental_listing: null,
      };
    } else {
      notFound();
    }
  }

  return (
    <main className="min-h-screen bg-[#080a0f] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar userEmail={user?.email} />

      {/* Breadcrumb Header */}
      <div className="pt-24 pb-4 bg-[#0a0d14] border-b border-white/8">
        <div className="container-debford flex items-center gap-2 text-xs font-mono text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
            DASHBOARD
          </Link>
          <span>/</span>
          <Link href="/garage" className="hover:text-slate-300 transition-colors">
            MY GARAGE
          </Link>
          <span>/</span>
          <span className="text-blue-400">
            {targetVehicle.year} {targetVehicle.make_name} {targetVehicle.model_name}
          </span>
        </div>
      </div>

      <div className="container-debford py-8">
        <GarageVehicleClient vehicle={targetVehicle} />
      </div>
    </main>
  );
}
