"use client";

import { useState, useTransition } from "react";
import {
  type AdminUserItem,
  updateUserRole,
  updateUserVerificationStatus,
} from "@/lib/actions/admin.actions";
import { ShieldCheck } from "lucide-react";

export function RecentUsersTable({
  initialUsers,
}: {
  initialUsers: AdminUserItem[];
}) {
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [isPending, startTransition] = useTransition();

  function handleRoleToggle(user: AdminUserItem) {
    const newRole = user.role.toLowerCase() === "admin" ? "seller" : "admin";
    startTransition(async () => {
      const res = await updateUserRole(user.id, newRole);
      if (!res?.error) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? { ...u, role: newRole.charAt(0).toUpperCase() + newRole.slice(1) }
              : u
          )
        );
      }
    });
  }

  function handleVerificationToggle(user: AdminUserItem) {
    const newStatus = user.verificationStatus === "verified" ? "unverified" : "verified";
    startTransition(async () => {
      const res = await updateUserVerificationStatus(user.id, newStatus);
      if (!res?.error) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  verificationStatus: newStatus,
                  status: newStatus === "verified" ? "Verified" : "Active",
                }
              : u
          )
        );
      }
    });
  }

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-white/8">
        <div>
          <h2 className="text-sm font-bold text-white">Registered Users & KYC</h2>
          <p className="text-xs text-slate-500">Live platform accounts & verification controls</p>
        </div>
        <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          {users.length} total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/8 text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Verification</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-500">
                  No registered users found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const initial = u.fullName.charAt(0).toUpperCase();
                const isAdmin = u.role.toLowerCase() === "admin";
                const isVerified = u.verificationStatus === "verified";
                const isPendingKYC = u.verificationStatus === "pending";

                return (
                  <tr key={u.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate flex items-center gap-1.5">
                            <span>{u.fullName}</span>
                            {isVerified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                            )}
                          </div>
                          <div className="text-slate-500 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isAdmin
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isVerified
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : isPendingKYC
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                            : "bg-white/5 text-slate-400 border-white/10"
                        }`}
                      >
                        {isVerified ? "✓ Verified" : isPendingKYC ? "⏳ Pending Review" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{u.createdAt}</td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      {/* Verify/Unverify Toggle */}
                      <button
                        onClick={() => handleVerificationToggle(u)}
                        disabled={isPending}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          isVerified
                            ? "border-emerald-500/30 text-emerald-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
                            : isPendingKYC
                            ? "border-amber-500/30 text-amber-300 hover:bg-emerald-500/10 hover:text-emerald-300"
                            : "border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
                        }`}
                        title={isVerified ? "Revoke Verification" : "Approve & Verify Identity"}
                      >
                        {isVerified ? "Revoke KYC" : "Verify KYC ✓"}
                      </button>

                      {/* Admin Toggle */}
                      <button
                        onClick={() => handleRoleToggle(u)}
                        disabled={isPending}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          isAdmin
                            ? "border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                            : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                        title={isAdmin ? "Demote to Seller" : "Promote to Admin"}
                      >
                        {isAdmin ? "Admin ★" : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
