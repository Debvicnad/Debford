import type { Metadata } from "next";
import { ALL_PROVIDERS } from "@/lib/data/services.data";
import { ProviderDetailView } from "@/components/services/ProviderDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const provider = ALL_PROVIDERS.find((p) => p.id === id) || ALL_PROVIDERS[0];
  return {
    title: `${provider.name} — Automotive Service Specialist`,
    description: `Book appointments, inspect verified packages, reviews, and get service quotes from ${provider.name} on Debford.`,
  };
}

export default async function ServiceProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = ALL_PROVIDERS.find((p) => p.id === id) || ALL_PROVIDERS[0];

  return <ProviderDetailView provider={provider} />;
}
