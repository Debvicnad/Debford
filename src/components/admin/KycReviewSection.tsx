"use client";

import { useState, useTransition } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  X,
  Check,
} from "lucide-react";
import type { KycApplicationItem } from "@/types/admin.types";
import { reviewKycApplication } from "@/lib/actions/admin.actions";

interface Props {
  initialApplications: KycApplicationItem[];
}

const REJECTION_REASONS = [
  "Expired or no longer valid document",
  "Illegible or blurry scan/photo",
  "Name on document does not match account registration",
  "Invalid or unrecognised dealer license number",
  "Document issued by unsupported jurisdiction",
  "Suspected fraudulent or altered document",
];

function KycCard({
  app,
  onApprove,
  onReject,
}: {
  app: KycApplicationItem;
  onApprove: (app: KycApplicationItem) => void;
  onReject: (app: KycApplicationItem, reason: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isActing, startTransition] = useTransition();

  const isDealer = app.applicationType === "dealer_license";
  const effectiveReason = customReason.trim() || selectedPreset;

  const handleApprove = () => {
    startTransition(async () => {
      onApprove(app);
    });
  };

  const handleConfirmReject = () => {
    if (!effectiveReason) return;
    startTransition(async () => {
      onReject(app, effectiveReason);
      setRejectMode(false);
    });
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all ${
        app.status === "pending"
          ? "border-amber-500/25 bg-[#0d121d]"
          : app.status === "verified"
          ? "border-emerald-500/20 bg-[#0d121d]"
          : "border-rose-500/20 bg-[#0d121d]"
      }`}
    >
      {/* Card Header */}
      <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDealer
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                : "bg-purple-500/15 text-purple-400 border border-purple-500/20"
            }`}
          >
            {isDealer ? <Building2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white truncate">{app.fullName}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  app.status === "pending"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                    : app.status === "verified"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}
              >
                {app.status === "pending"
                  ? "⏳ Pending Review"
                  : app.status === "verified"
                  ? "✓ Verified"
                  : "✕ Rejected"}
              </span>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
              <span>
                {isDealer ? "🏢 Dealer License" : "🪪 Government ID"} •{" "}
                {app.userRole || "Seller"}
              </span>
              {app.email && (
                <>
                  <span>•</span>
                  <span>{app.email}</span>
                </>
              )}
              <span>•</span>
              <span>🕒 {app.submittedAt}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {app.status === "pending" && (
            <>
              <button
                onClick={handleApprove}
                disabled={isActing}
                className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Verify</span>
              </button>
              <button
                onClick={() => setRejectMode((v) => !v)}
                disabled={isActing}
                className="px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          )}

          {app.status === "verified" && (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          {app.status === "rejected" && (
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Document Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/5 mt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {!isDealer ? (
              <>
                <div className="p-3 bg-[#131b2e] rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">Document Type</span>
                  <span className="text-xs font-bold text-white mt-1 capitalize block">
                    {app.idType?.replace("_", " ") || "Government ID"}
                  </span>
                </div>
                <div className="p-3 bg-[#131b2e] rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Document Number
                  </span>
                  <span className="text-xs font-mono font-bold text-white mt-1 block">
                    {app.idNumber ? `••••${app.idNumber.slice(-4)}` : "Not provided"}
                  </span>
                </div>
                <div className="p-3 bg-[#131b2e] rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Issuing Country
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block">
                    {app.issuingCountry || "Not specified"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-[#131b2e] rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">Business Name</span>
                  <span className="text-xs font-bold text-white mt-1 block truncate">
                    {app.businessName}
                  </span>
                </div>
                <div className="p-3 bg-[#131b2e] rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Dealer License / Tax ID
                  </span>
                  <span className="text-xs font-mono font-bold text-white mt-1 block">
                    {app.licenseNumber}
                  </span>
                </div>
                <div className="p-3 bg-[#131b2e] rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Location
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block">
                    {[app.city, app.country].filter(Boolean).join(", ") || "Not specified"}
                  </span>
                </div>
              </>
            )}
          </div>

          {app.rejectionReason && (
            <div className="mt-3 p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <span className="text-[10px] text-rose-400 font-bold block mb-1">Rejection Reason:</span>
              <span className="text-xs text-rose-300">{app.rejectionReason}</span>
            </div>
          )}
        </div>
      )}

      {/* Rejection Reason Form */}
      {rejectMode && app.status === "pending" && (
        <div className="px-4 pb-4 border-t border-rose-500/10 bg-rose-500/5">
          <div className="pt-4 space-y-3">
            <p className="text-xs text-rose-300 font-semibold">
              Select or write a rejection reason. The applicant will be notified.
            </p>

            <div className="flex flex-wrap gap-2">
              {REJECTION_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setSelectedPreset(r);
                    setCustomReason("");
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${
                    selectedPreset === r
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold"
                      : "bg-[#131b2e] text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              placeholder="Or type a custom reason..."
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                setSelectedPreset("");
              }}
              className="w-full bg-[#0d121d] border border-rose-500/20 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setRejectMode(false)}
                className="flex-1 py-2 border border-white/10 rounded-xl text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isActing || !effectiveReason}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                {isActing ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function KycReviewSection({ initialApplications }: Props) {
  const [applications, setApplications] = useState<KycApplicationItem[]>(initialApplications);
  const [isPending, startTransition] = useTransition();
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const verifiedCount = applications.filter((a) => a.status === "verified").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  const filtered = applications.filter(
    (a) => filterStatus === "all" || a.status === filterStatus
  );

  function handleApprove(app: KycApplicationItem) {
    startTransition(async () => {
      const res = await reviewKycApplication(app.id, app.userId, "approve");
      if (res?.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setApplications((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, status: "verified", reviewedAt: "Just now" } : a))
        );
        setMessage({
          text: `KYC approved for "${app.fullName}" — account is now verified!`,
          type: "success",
        });
      }
    });
  }

  function handleReject(app: KycApplicationItem, reason: string) {
    startTransition(async () => {
      const res = await reviewKycApplication(app.id, app.userId, "reject", reason);
      if (res?.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === app.id
              ? { ...a, status: "rejected", rejectionReason: reason, reviewedAt: "Just now" }
              : a
          )
        );
        setMessage({
          text: `KYC rejected for "${app.fullName}". Applicant has been notified with feedback.`,
          type: "success",
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Header Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending Review", count: pendingCount, color: "amber", icon: "⏳" },
          { label: "Verified", count: verifiedCount, color: "emerald", icon: "✓" },
          { label: "Rejected", count: rejectedCount, color: "rose", icon: "✕" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`p-3.5 glass rounded-2xl border border-${stat.color}-500/20 text-center`}
          >
            <div className={`text-xl font-extrabold text-${stat.color}-400`}>
              {stat.count}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "verified", "rejected"] as const).map((s) => {
          const count =
            s === "all"
              ? applications.length
              : applications.filter((a) => a.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-all ${
                filterStatus === s
                  ? "gradient-brand text-white shadow"
                  : "glass text-slate-400 border border-white/10 hover:text-white"
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Status Feedback */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Application Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl border border-white/5">
            <div className="text-3xl mb-2">🛡️</div>
            <p className="text-sm font-semibold text-slate-300">No applications in this category.</p>
          </div>
        ) : (
          filtered.map((app) => (
            <KycCard
              key={app.id}
              app={app}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>
    </div>
  );
}
