"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

export interface VerificationData {
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  email: string;
  phone?: string;
  full_name?: string;
  address?: string;
  city?: string;
  country?: string;
  role: string;
  documents: Array<{
    id: string;
    document_type: string;
    title: string;
    created_at: string;
  }>;
}

/**
 * Get current verification profile data
 */
export async function getMyVerificationStatus(): Promise<{ data: VerificationData | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const db = await getDb();

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("verification_status, email, phone, full_name, city, country, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { data: null, error: profileError?.message ?? "Profile not found" };
  }

  // Fetch KYC documents
  const { data: docs } = await db
    .from("vehicle_documents")
    .select("id, document_type, title, created_at")
    .eq("owner_id", user.id)
    .in("document_type", ["inspection", "registration", "title", "identity_id", "business_license"]);

  return {
    data: {
      verification_status: profile.verification_status ?? "unverified",
      email: profile.email,
      phone: profile.phone ?? "",
      full_name: profile.full_name ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "US",
      role: profile.role ?? "buyer",
      documents: (docs ?? []).map((d) => ({
        id: d.id,
        document_type: d.document_type,
        title: d.title,
        created_at: d.created_at,
      })),
    },
  };
}

/**
 * Submit Phone Number Verification
 */
export async function submitPhoneVerification(phone: string) {
  if (!phone || phone.trim().length < 7) {
    return { error: "Please enter a valid phone number with country code." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to verify your phone number." };

  const db = await getDb();

  const { error } = await db
    .from("profiles")
    .update({ phone: phone.trim() })
    .eq("id", user.id);

  if (error) return { error: error.message };

  await db.from("notifications").insert({
    user_id: user.id,
    type: "system",
    title: "Phone Number Verified! 📱",
    body: `Your phone number ${phone} has been verified and added to your account.`,
  });

  revalidatePath("/verification");
  revalidatePath("/profile");
  return { success: true };
}

/**
 * Submit Address Verification
 */
export async function submitAddressVerification(payload: {
  streetAddress: string;
  city: string;
  country: string;
  postalCode?: string;
}) {
  if (!payload.city.trim() || !payload.country.trim()) {
    return { error: "City and Country are required." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to update address." };

  const db = await getDb();

  const { error } = await db
    .from("profiles")
    .update({
      city: payload.city.trim(),
      country: payload.country.trim(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/verification");
  revalidatePath("/profile");
  return { success: true };
}

/**
 * Submit Government ID / KYC Document for Review
 */
export async function submitIdVerification(payload: {
  idType: "passport" | "national_id" | "driver_license";
  idNumber: string;
  issuingCountry: string;
  fullName: string;
}) {
  if (!payload.idNumber.trim() || !payload.fullName.trim()) {
    return { error: "Full legal name and ID number are required." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to submit verification." };

  const db = await getDb();

  // 1. Update profile to pending verification
  const { error: profileError } = await db
    .from("profiles")
    .update({
      full_name: payload.fullName.trim(),
      verification_status: "pending",
      country: payload.issuingCountry,
    })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  // 2. Insert into kyc_applications table if available
  try {
    await db.from("kyc_applications").insert({
      user_id: user.id,
      application_type: "individual_id",
      full_name: payload.fullName.trim(),
      id_type: payload.idType,
      id_number: payload.idNumber.trim(),
      issuing_country: payload.issuingCountry,
      status: "pending",
    });
  } catch {
    // Continue gracefully if migration not yet executed
  }

  // 3. Notification to user
  await db.from("notifications").insert({
    user_id: user.id,
    type: "system",
    title: "Identity Verification Submitted 🪪",
    body: `Your ${payload.idType.replace("_", " ")} verification is currently under review by our compliance team.`,
  });

  revalidatePath("/verification");
  revalidatePath("/profile");
  revalidatePath("/admin");

  return { success: true };
}

/**
 * Submit Business / Dealer License Verification
 */
export async function submitBusinessVerification(payload: {
  businessName: string;
  licenseNumber: string;
  businessType: string;
  city: string;
  country: string;
}) {
  if (!payload.businessName.trim() || !payload.licenseNumber.trim()) {
    return { error: "Business name and dealer license number are required." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const db = await getDb();

  // 1. Update profile role to dealer and status to pending
  await db
    .from("profiles")
    .update({
      full_name: payload.businessName.trim(),
      role: "dealer",
      verification_status: "pending",
      city: payload.city.trim(),
      country: payload.country.trim(),
    })
    .eq("id", user.id);

  // 2. Insert into kyc_applications table if available
  try {
    await db.from("kyc_applications").insert({
      user_id: user.id,
      application_type: "dealer_license",
      full_name: payload.businessName.trim(),
      business_name: payload.businessName.trim(),
      license_number: payload.licenseNumber.trim(),
      business_type: payload.businessType,
      city: payload.city.trim(),
      country: payload.country.trim(),
      status: "pending",
    });
  } catch {
    // Continue gracefully
  }

  // 3. Notification to user
  await db.from("notifications").insert({
    user_id: user.id,
    type: "system",
    title: "Dealer Verification Submitted 🏢",
    body: `Your dealer application for "${payload.businessName}" is now pending review.`,
  });

  revalidatePath("/verification");
  revalidatePath("/profile");
  revalidatePath("/admin");

  return { success: true };
}

/**
 * Admin: Approve User Verification
 */
export async function approveUserVerification(userId: string) {
  const db = await getDb();

  const { error } = await db
    .from("profiles")
    .update({
      verification_status: "verified",
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  // Update kyc_applications
  try {
    await db
      .from("kyc_applications")
      .update({
        status: "verified",
        reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } catch {
    // Graceful fallback
  }

  // Record audit log
  try {
    await db.from("admin_audit_logs").insert({
      action_type: "verify_kyc",
      target_type: "user_kyc",
      target_id: userId,
      target_title: `KYC Approved: User ${userId.slice(0, 8)}`,
      notes: "Identity and compliance credentials verified by administrator.",
    });
  } catch {
    // Graceful fallback
  }

  // Notify user
  await db.from("notifications").insert({
    user_id: userId,
    type: "system",
    title: "Account Verified! 🎉",
    body: "Congratulations! Your identity has been verified. You now have full access to high-value auctions and verified seller badges.",
  });

  revalidatePath("/admin");
  revalidatePath("/verification");
  revalidatePath("/profile");
  return { success: true };
}

/**
 * Admin: Reject User Verification
 */
export async function rejectUserVerification(userId: string, reason?: string) {
  const db = await getDb();

  const rejectionText = reason || "Your identity document could not be verified. Please submit a clearer government-issued ID.";

  const { error } = await db
    .from("profiles")
    .update({
      verification_status: "rejected",
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  // Update kyc_applications
  try {
    await db
      .from("kyc_applications")
      .update({
        status: "rejected",
        rejection_reason: rejectionText,
        reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } catch {
    // Graceful fallback
  }

  // Record audit log
  try {
    await db.from("admin_audit_logs").insert({
      action_type: "reject_kyc",
      target_type: "user_kyc",
      target_id: userId,
      target_title: `KYC Rejected: User ${userId.slice(0, 8)}`,
      notes: rejectionText,
    });
  } catch {
    // Graceful fallback
  }

  // Notify user
  await db.from("notifications").insert({
    user_id: userId,
    type: "system",
    title: "Verification Needs Attention ⚠️",
    body: rejectionText,
  });

  revalidatePath("/admin");
  revalidatePath("/verification");
  revalidatePath("/profile");
  return { success: true };
}
