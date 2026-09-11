"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

export interface CustomBuildQuotePayload {
  vehicleModel: string;
  vehicleArchetype: string;
  paintColor: string;
  paintFinish: string;
  wheelStyle: string;
  wheelFinish: string;
  windowTint: string;
  suspension: string;
  aeroKit: string;
  caliperColor: string;
  underglow: string;
  estimatedTotal: number;
  customerNotes?: string;
}

/**
 * Submit custom build sheet to verified tuning shops and service providers
 */
export async function submitCustomBuildQuote(payload: CustomBuildQuotePayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to save your build or request a specialist quote." };

  const db = await getDb();

  // Create service request entry for customization
  const { data: request, error } = await db
    .from("service_requests")
    .insert({
      customer_id: user.id,
      service_type: "customization",
      status: "pending",
      preferred_date: new Date(Date.now() + 7 * 86400_000).toISOString().split("T")[0],
      notes: [
        `Vehicle: ${payload.vehicleModel} (${payload.vehicleArchetype})`,
        `Finish: ${payload.paintColor} (${payload.paintFinish})`,
        `Wheels: ${payload.wheelStyle} in ${payload.wheelFinish}`,
        `Aero & Body: ${payload.aeroKit}`,
        `Suspension: ${payload.suspension}`,
        `Brake Calipers: ${payload.caliperColor} | Tint: ${payload.windowTint}`,
        payload.underglow !== "None" ? `Underglow: ${payload.underglow}` : null,
        `Estimated Build Total: $${payload.estimatedTotal.toLocaleString()}`,
        payload.customerNotes ? `Customer Notes: ${payload.customerNotes}` : null,
      ].filter(Boolean).join("\n"),
    })
    .select("id")
    .single();

  if (error || !request) {
    return { error: error?.message ?? "Failed to submit build request." };
  }

  // Create notification for user
  await db.from("notifications").insert({
    user_id: user.id,
    type: "service",
    title: "🎨 Custom Build Sheet Submitted!",
    body: `Your custom spec for "${payload.vehicleModel}" ($${payload.estimatedTotal.toLocaleString()}) has been dispatched to certified performance specialists.`,
  });

  revalidatePath("/garage");
  revalidatePath("/services");
  revalidatePath("/customisation");

  return { success: true, requestId: request.id };
}
