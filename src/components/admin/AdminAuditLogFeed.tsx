"use client";

import type { AdminAuditLogItem } from "@/types/admin.types";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  UserCog,
  List,
  Wrench,
  Zap,
} from "lucide-react";

interface Props {
  logs: AdminAuditLogItem[];
}

const ACTION_META: Record<
  AdminAuditLogItem["actionType"],
  { label: string; Icon: React.ElementType; color: string; bg: string; border: string }
> = {
  approve_listing: {
    label: "Approved Listing",
    Icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  reject_listing: {
    label: "Rejected Listing",
    Icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  verify_kyc: {
    label: "KYC Verified",
    Icon: ShieldCheck,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  reject_kyc: {
    label: "KYC Rejected",
    Icon: ShieldAlert,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  verify_provider: {
    label: "Provider Verified",
    Icon: Wrench,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  reject_provider: {
    label: "Provider Rejected",
    Icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  change_user_role: {
    label: "Role Changed",
    Icon: UserCog,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  bulk_approve_listings: {
    label: "Bulk Approved",
    Icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
};

export function AdminAuditLogFeed({ logs }: Props) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Administrative Audit Trail</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            All platform administration actions are logged below.
          </p>
        </div>
        <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          {logs.length} recorded
        </span>
      </div>

      {/* Log Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/30 via-white/5 to-transparent" />

        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-10 glass rounded-2xl border border-white/5 ml-12">
              <List className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No audit logs yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Actions taken in the admin panel will appear here.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const meta = ACTION_META[log.actionType] ?? ACTION_META["approve_listing"];
              const { label, Icon, color, bg, border } = meta;

              return (
                <div key={log.id} className="flex items-start gap-4 relative">
                  {/* Icon node on timeline */}
                  <div
                    className={`w-10 h-10 shrink-0 rounded-xl ${bg} border ${border} flex items-center justify-center z-10`}
                  >
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>

                  {/* Content card */}
                  <div className="flex-1 min-w-0 p-3.5 bg-[#0d121d] rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${bg} ${color} border ${border}`}
                          >
                            {label}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-white mt-1.5 truncate">
                          {log.targetTitle}
                        </p>

                        {log.notes && (
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                            {log.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                          <span className="font-medium">👤 {log.adminName}</span>
                          <span>•</span>
                          <span>🕒 {log.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
