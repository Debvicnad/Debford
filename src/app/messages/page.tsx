import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { MessagesClient } from "@/components/messages/MessagesClient";
import { getMyConversations, getOrCreateConversation } from "@/lib/actions/message.actions";

export const metadata: Metadata = {
  title: "Messages | DEBFORD",
  description: "Your live messages and negotiations on DEBFORD.",
};

interface MessagesPageProps {
  searchParams: Promise<{
    seller?: string;
    listing?: string;
    c?: string;
    offer?: string;
    viewing?: string;
  }>;
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  if (!isSupabaseConfigured()) redirect("/login?redirectTo=/messages");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/messages");

  const params = await searchParams;
  let targetConvId: string | null = params.c ?? null;
  let prefillMessage: string | null = null;

  // If redirected from vehicle page with seller id
  if (params.seller) {
    const result = await getOrCreateConversation(params.seller, params.listing);
    if (result.conversationId) {
      targetConvId = result.conversationId;
    }
  }

  if (params.offer) {
    prefillMessage = "Hi, I'm interested in this vehicle and would like to make an offer. Is the price negotiable?";
  } else if (params.viewing) {
    prefillMessage = "Hi! I would like to schedule a viewing and test drive for this vehicle. What times are available?";
  }

  const { conversations, currentUserId } = await getMyConversations();

  return (
    <MessagesClient
      initialConversations={conversations}
      currentUserId={user.id}
      initialSelectedId={targetConvId}
      prefillMessage={prefillMessage}
    />
  );
}
