import type { Metadata } from "next";
import Link from "next/link";
import { ALL_PROVIDERS } from "@/lib/data/services.data";
import { ProvidersDirectoryClient } from "@/components/services/ProvidersDirectoryClient";

export const metadata: Metadata = {
  title: "Automotive Specialists & Service Directory — Debford",
  description: "Browse verified mechanics, mobile diagnostic vans, body shops, dyno tuners, and detailing studios. Book appointments with zero upfront deposit.",
};

export default async function ServiceProvidersPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; city?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};

  return (
    <div className="min-h-screen surface-base">
      {/* Header Banner */}
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-8">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/services" className="hover:text-white transition-colors">
              Services
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Specialists Directory</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white text-lg shadow-sm">
                  🔧
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Verified Automotive Specialists
                </h1>
              </div>
              <p className="text-sm text-slate-400 max-w-2xl">
                Connect with vetted mechanics, mobile service vans, certified body shops, and performance tuners. Book instant service packages with zero upfront payment.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/services/requests"
                className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-300 text-sm font-medium hover:border-white/20 hover:text-white transition-all"
              >
                My Requests &amp; Quotes
              </Link>
              <Link
                href="/services#request"
                className="px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
              >
                <span>+</span>
                <span>Broadcast Request</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Directory */}
      <div className="container-debford py-8">
        <ProvidersDirectoryClient
          providers={ALL_PROVIDERS}
          initialCategory={resolvedParams.category}
        />
      </div>
    </div>
  );
}
