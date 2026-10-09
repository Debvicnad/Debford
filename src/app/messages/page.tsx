import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { MessagesClient } from "@/components/messages/MessagesClient";
import { getMyConversations, getOrCreateConversation, type ConversationItem } from "@/lib/actions/message.actions";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Automotive Messaging & Negotiation Console — Debford",
  description: "Real-time encrypted buyer-seller negotiations, viewing coordination, and official escrow offer management on Debford.",
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

const DEMO_CONVERSATIONS: ConversationItem[] = [
  {
    id: "conv-demo-1",
    last_message: "The 150-point ramp inspection is scheduled for 10 AM Saturday. Title is clean and ready.",
    last_message_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    unread_count: 1,
    other_user: {
      id: "usr-stuttgart",
      full_name: "James Kowalski",
      email: "james@stuttgartmotors.com",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
    listing: {
      id: "porsche-gt3-rs",
      title: "2023 Porsche 911 GT3 RS — Clubsport Package",
      price: 248500,
      currency: "USD",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    id: "conv-demo-2",
    last_message: "Offered $76,500 — \"Ready to authorize holding deposit in Debford Escrow Vault today.\"",
    last_message_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    unread_count: 0,
    other_user: {
      id: "usr-sarah",
      full_name: "Sarah Mitchell",
      email: "sarah.m@verifiedbuyer.com",
      avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    },
    listing: {
      id: "bmw-m4-competition",
      title: "2022 BMW M4 Competition Coupe (G82)",
      price: 78900,
      currency: "USD",
      imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    id: "conv-demo-3",
    last_message: "Dyno run confirmed +54 WHP with the Akrapovič titanium system and ECU Stage 2 tune.",
    last_message_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    unread_count: 0,
    other_user: {
      id: "usr-apex",
      full_name: "Apex Precision Dynamics",
      email: "service@apexdynamics.com",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
    listing: {
      id: "amg-gt-black",
      title: "2023 Mercedes-AMG GT Black Series",
      price: 325000,
      currency: "USD",
      imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    },
  },
];

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const params = await searchParams;
  let targetConvId: string | null = params.c ?? null;
  let prefillMessage: string | null = null;
  let currentUserId = "demo-user-1";
  let conversations: ConversationItem[] = DEMO_CONVERSATIONS;
  let userEmail: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        currentUserId = user.id;
        userEmail = user.email ?? null;

        // If redirected from vehicle page with seller id
        if (params.seller) {
          const result = await getOrCreateConversation(params.seller, params.listing);
          if (result.conversationId) {
            targetConvId = result.conversationId;
          }
        }

        const res = await getMyConversations();
        if (res.conversations && res.conversations.length > 0) {
          conversations = res.conversations;
        }
      }
    } catch {
      // Fall through to demo conversations
    }
  }

  if (params.offer) {
    prefillMessage = "Hi, I'm interested in this vehicle and would like to make an offer. Is the price negotiable?";
  } else if (params.viewing) {
    prefillMessage = "Hi! I would like to schedule a viewing and test drive for this vehicle. What times are available?";
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden text-slate-100" style={{ backgroundColor: "#06090e" }}>
      <Navbar userEmail={userEmail} />
      <div className="flex-1 overflow-hidden">
        <MessagesClient
          initialConversations={conversations}
          currentUserId={currentUserId}
          initialSelectedId={targetConvId}
          prefillMessage={prefillMessage}
        />
      </div>
    </div>
  );
}
