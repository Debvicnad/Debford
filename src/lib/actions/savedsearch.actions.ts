"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return createClient();
}

export interface SavedSearchItem {
  id: string;
  name: string;
  filters: Record<string, string>;
  alertsEnabled: boolean;
  resultsCount?: number;
  createdAt: string;
}

export async function getSavedSearches(): Promise<SavedSearchItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const db = await getDb();
    const { data, error } = await db
      .from("saved_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      filters: row.filters ?? {},
      alertsEnabled: row.alerts_enabled ?? false,
      createdAt: new Date(row.created_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      }),
    }));
  } catch {
    return [];
  }
}

export async function saveSearch(
  name: string,
  filters: Record<string, string>,
  alertsEnabled = false,
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to save searches." };

  try {
    const db = await getDb();
    const { error } = await db.from("saved_searches").insert({
      user_id: user.id,
      name,
      filters,
      alerts_enabled: alertsEnabled,
    });

    if (error) return { error: error.message };

    revalidatePath("/saved");
    return { success: true };
  } catch (e: any) {
    return { error: e?.message ?? "Could not save search." };
  }
}

export async function toggleSearchAlert(
  searchId: string,
  enabled: boolean,
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  try {
    const db = await getDb();
    const { error } = await db
      .from("saved_searches")
      .update({ alerts_enabled: enabled })
      .eq("id", searchId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/saved");
    return { success: true };
  } catch (e: any) {
    return { error: e?.message ?? "Failed to update alert." };
  }
}

export async function deleteSavedSearch(
  searchId: string,
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  try {
    const db = await getDb();
    const { error } = await db
      .from("saved_searches")
      .delete()
      .eq("id", searchId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/saved");
    return { success: true };
  } catch (e: any) {
    return { error: e?.message ?? "Failed to delete search." };
  }
}
