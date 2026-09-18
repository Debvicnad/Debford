import type { Metadata } from "next";
import Link from "next/link";
import { getServiceRequestById } from "@/lib/actions/service.actions";
import { ServiceRequestDetailView } from "@/components/services/ServiceRequestDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const request = await getServiceRequestById(id);

  if (!request) {
    return {
      title: "Request Not Found — Debford Services",
    };
  }

  const vehicleTitle = request.vehicle || request.vehicleDescription;
  return {
    title: `${vehicleTitle} Quotes & Service Request — Debford`,
    description: `Track quotes and status for ${vehicleTitle} service request on Debford Automotive Services.`,
  };
}

export default async function ServiceRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getServiceRequestById(id);

  if (!request) {
    return (
      <div className="min-h-screen surface-base py-16">
        <div className="container-debford max-w-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mx-auto">
            🔍
          </div>
          <h1 className="text-2xl font-bold text-white">Service Request Not Found</h1>
          <p className="text-sm text-slate-400">
            The service request with ID <code className="text-blue-400 font-mono">{id}</code> could not be found or has expired.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/services/requests"
              className="px-5 py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 transition-all"
            >
              Go to Requests Hub
            </Link>
            <Link
              href="/services"
              className="px-5 py-2.5 rounded-xl glass border border-white/10 text-slate-300 font-medium text-sm hover:text-white transition-all"
            >
              Services Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-base py-8">
      <div className="container-debford">
        <ServiceRequestDetailView initialRequest={request} />
      </div>
    </div>
  );
}
