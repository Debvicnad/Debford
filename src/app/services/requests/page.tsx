import type { Metadata } from "next";
import Link from "next/link";
import { getServiceRequests, getUserBookings } from "@/lib/actions/service.actions";
import { ServiceRequestsHubClient } from "@/components/services/ServiceRequestsHubClient";

export const metadata: Metadata = {
  title: "Service Requests & Quotes Hub — Debford",
  description: "Track your automotive service requests, review quotes from certified providers, and manage your booked appointments.",
};

export default async function ServiceRequestsPage() {
  const [requests, bookings] = await Promise.all([
    getServiceRequests("all"),
    getUserBookings(),
  ]);

  return (
    <div className="min-h-screen surface-base">
      {/* Top Banner & Breadcrumb */}
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-8">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/services" className="hover:text-white transition-colors">
              Services
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Requests &amp; Quotes Hub</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white text-lg shadow-sm">
                  ⚡
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Service Requests &amp; Quotes
                </h1>
              </div>
              <p className="text-sm text-slate-400 max-w-xl">
                Compare competitive itemized quotes from certified automotive specialists, book appointments with zero upfront deposit, and follow jobs to completion.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/services#request"
                className="px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
              >
                <span>+</span>
                <span>New Service Request</span>
              </Link>
              <Link
                href="/services/providers"
                className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-300 text-sm font-medium hover:border-white/20 hover:text-white transition-all"
              >
                Browse Specialists
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Hub Content */}
      <div className="container-debford py-8">
        <ServiceRequestsHubClient
          initialRequests={requests}
          initialBookings={bookings}
        />
      </div>
    </div>
  );
}
