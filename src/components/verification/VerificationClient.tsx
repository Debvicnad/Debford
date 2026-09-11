"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Phone,
  CreditCard,
  Home,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ChevronRight,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  VerificationData,
  submitPhoneVerification,
  submitAddressVerification,
  submitIdVerification,
  submitBusinessVerification,
} from "@/lib/actions/verification.actions";

interface Props {
  initialData: VerificationData;
}

export function VerificationClient({ initialData }: Props) {
  const [data, setData] = useState<VerificationData>(initialData);
  const [activeModal, setActiveModal] = useState<"phone" | "id" | "address" | "business" | null>(null);

  // Phone Form
  const [phoneInput, setPhoneInput] = useState(data.phone || "");

  // ID Form
  const [idForm, setIdForm] = useState({
    idType: "passport" as "passport" | "national_id" | "driver_license",
    idNumber: "",
    issuingCountry: data.country || "United States",
    fullName: data.full_name || "",
  });

  // Address Form
  const [addressForm, setAddressForm] = useState({
    streetAddress: data.address || "",
    city: data.city || "",
    country: data.country || "United States",
    postalCode: "",
  });

  // Business Form
  const [businessForm, setBusinessForm] = useState({
    businessName: data.full_name || "",
    licenseNumber: "",
    businessType: "Automotive Dealership",
    city: data.city || "",
    country: data.country || "United States",
  });

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Compute progress
  const hasEmail = Boolean(data.email);
  const hasPhone = Boolean(data.phone && data.phone.length > 5);
  const isIdVerified = data.verification_status === "verified";
  const isIdPending = data.verification_status === "pending";
  const hasAddress = Boolean(data.city && data.country);
  const isDealer = data.role === "dealer" || data.role === "admin";

  const totalSteps = 4;
  let completedSteps = 0;
  if (hasEmail) completedSteps += 1;
  if (hasPhone) completedSteps += 1;
  if (isIdVerified) completedSteps += 1;
  if (hasAddress) completedSteps += 1;

  const progressPct = Math.round((completedSteps / totalSteps) * 100);

  // Handlers
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await submitPhoneVerification(phoneInput);
      if (res.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setData((prev) => ({ ...prev, phone: phoneInput }));
        setFeedback({ type: "success", text: "Phone number verified and updated!" });
        setActiveModal(null);
      }
    });
  };

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await submitIdVerification(idForm);
      if (res.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setData((prev) => ({ ...prev, verification_status: "pending", full_name: idForm.fullName }));
        setFeedback({ type: "success", text: "ID documents submitted! Our compliance team will review them within 24 hours." });
        setActiveModal(null);
      }
    });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await submitAddressVerification(addressForm);
      if (res.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setData((prev) => ({ ...prev, city: addressForm.city, country: addressForm.country }));
        setFeedback({ type: "success", text: "Address verified and saved to account!" });
        setActiveModal(null);
      }
    });
  };

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await submitBusinessVerification(businessForm);
      if (res.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setData((prev) => ({ ...prev, verification_status: "pending", role: "dealer" }));
        setFeedback({ type: "success", text: "Dealer verification application submitted for admin review!" });
        setActiveModal(null);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Progress Banner */}
      <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-6 md:p-8 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Compliance & Trust Centre
              </span>
              {data.verification_status === "verified" && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Member
                </span>
              )}
              {data.verification_status === "pending" && (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  Review Pending
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Identity & Trust Verification
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Complete your verification checkpoints to unlock high-value auctions, escrow buyer protection, and get the official verified seller badge.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-3xl font-black text-white">{progressPct}%</span>
            <span className="text-xs text-slate-500 block font-medium">Completed ({completedSteps}/{totalSteps})</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full bg-[#131b2e] rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full gradient-brand rounded-full transition-all duration-700 shadow-lg shadow-blue-500/50"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold border flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}
      </div>

      {/* 2. Main Grid: Checklist & Perks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Verification Checkpoints */}
        <div className="lg:col-span-2 space-y-4">
          {/* STEP 1: EMAIL */}
          <div className="bg-[#0d121d] rounded-2xl border border-emerald-500/20 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-white">Email Address</h3>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400">{data.email}</p>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>

          {/* STEP 2: PHONE */}
          <div
            className={`bg-[#0d121d] rounded-2xl border p-5 flex items-center justify-between gap-4 transition-all ${
              hasPhone ? "border-emerald-500/20" : "border-white/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  hasPhone
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-[#131b2e] border border-white/10 text-slate-400"
                }`}
              >
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-white">Phone Number</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      hasPhone
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-white/5 text-slate-400 border-white/10"
                    }`}
                  >
                    {hasPhone ? "Verified" : "Unverified"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {data.phone ? data.phone : "Add mobile number for 2FA and transactional SMS alerts."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal("phone")}
              className="px-3.5 py-2 rounded-xl bg-[#131b2e] hover:bg-white/10 text-xs font-bold text-white border border-white/10 hover:border-white/20 transition-all shrink-0 cursor-pointer"
            >
              {hasPhone ? "Change" : "Verify Phone →"}
            </button>
          </div>

          {/* STEP 3: GOVERNMENT ID (KYC) */}
          <div
            className={`bg-[#0d121d] rounded-2xl border p-5 flex items-center justify-between gap-4 transition-all ${
              isIdVerified
                ? "border-emerald-500/20"
                : isIdPending
                ? "border-amber-500/30"
                : "border-white/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isIdVerified
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : isIdPending
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                    : "bg-[#131b2e] border border-white/10 text-slate-400"
                }`}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-white">Government ID / KYC</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isIdVerified
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : isIdPending
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : "bg-white/5 text-slate-400 border-white/10"
                    }`}
                  >
                    {isIdVerified ? "Verified" : isIdPending ? "Under Review" : "Required for Selling"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isIdVerified
                    ? "Your identity document has been approved."
                    : isIdPending
                    ? "Verification submitted. Review in progress by compliance."
                    : "Submit Passport, Driver's License, or National ID."}
                </p>
              </div>
            </div>

            {!isIdVerified && (
              <button
                onClick={() => setActiveModal("id")}
                className="px-3.5 py-2 rounded-xl gradient-brand hover:opacity-95 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
              >
                {isIdPending ? "Update ID" : "Submit ID →"}
              </button>
            )}
          </div>

          {/* STEP 4: RESIDENTIAL ADDRESS */}
          <div
            className={`bg-[#0d121d] rounded-2xl border p-5 flex items-center justify-between gap-4 transition-all ${
              hasAddress ? "border-emerald-500/20" : "border-white/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  hasAddress
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-[#131b2e] border border-white/10 text-slate-400"
                }`}
              >
                <Home className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-white">Residential / Operating Address</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      hasAddress
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-white/5 text-slate-400 border-white/10"
                    }`}
                  >
                    {hasAddress ? "Verified" : "Optional"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {hasAddress ? `${data.city}, ${data.country}` : "Add address for localized listings and parts shipping."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal("address")}
              className="px-3.5 py-2 rounded-xl bg-[#131b2e] hover:bg-white/10 text-xs font-bold text-white border border-white/10 hover:border-white/20 transition-all shrink-0 cursor-pointer"
            >
              {hasAddress ? "Edit" : "Add Address →"}
            </button>
          </div>

          {/* STEP 5: DEALER / ENTERPRISE VERIFICATION */}
          <div className="bg-[#0d121d] rounded-2xl border border-white/5 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-white">Dealer & Auctioneer Registration</h3>
                  <span className="text-[10px] bg-blue-500/15 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                    Pro & Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Upload company registration or motor dealer license to host unlimited auctions.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal("business")}
              className="px-3.5 py-2 rounded-xl bg-[#131b2e] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-xs font-bold text-slate-200 transition-all shrink-0 cursor-pointer"
            >
              Apply as Dealer →
            </button>
          </div>
        </div>

        {/* Right Column: Perks & Security Guarantee */}
        <div className="space-y-6">
          <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Verified Member Benefits</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { title: "Verified Badge", desc: "Display official green checkmark on all your listings and chats." },
                { title: "High-Value Auctions", desc: "Bid on exclusive sports cars, classics, and luxury inventory." },
                { title: "Escrow Protection", desc: "Access platform-backed vehicle deposits and secure payment holds." },
                { title: "Priority Support", desc: "24/7 priority compliance assistance and dispute resolution." },
              ].map((perk) => (
                <div key={perk.title} className="p-3 bg-[#131b2e]/60 rounded-2xl border border-white/5 space-y-0.5">
                  <span className="font-bold text-white block">{perk.title}</span>
                  <span className="text-slate-400 block leading-relaxed">{perk.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-6 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-white font-bold">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Bank-Grade Encryption</span>
            </div>
            <p className="leading-relaxed">
              All personal documents are encrypted at rest with AES-256 and never shared with third parties.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: PHONE VERIFICATION */}
      {/* ============================================================ */}
      {activeModal === "phone" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d121d] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Phone className="w-5 h-5 text-blue-400" />
                <span>Verify Mobile Number</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Number (with country code) *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !phoneInput.trim()}
                  className="flex-1 py-2.5 gradient-brand text-white text-xs font-bold rounded-xl disabled:opacity-40"
                >
                  {isPending ? "Saving..." : "Verify & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: GOVERNMENT ID (KYC) */}
      {/* ============================================================ */}
      {activeModal === "id" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d121d] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <span>Submit Government ID</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIdSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Type *
                </label>
                <select
                  value={idForm.idType}
                  onChange={(e) => setIdForm({ ...idForm, idType: e.target.value as any })}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="passport">Passport</option>
                  <option value="driver_license">Driver&apos;s License</option>
                  <option value="national_id">National Identity Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Legal Name (as shown on ID) *
                </label>
                <input
                  type="text"
                  required
                  value={idForm.fullName}
                  onChange={(e) => setIdForm({ ...idForm, fullName: e.target.value })}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ID / Document Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={idForm.idNumber}
                    onChange={(e) => setIdForm({ ...idForm, idNumber: e.target.value })}
                    placeholder="e.g. A12345678"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Issuing Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={idForm.issuingCountry}
                    onChange={(e) => setIdForm({ ...idForm, issuingCountry: e.target.value })}
                    placeholder="e.g. United States"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !idForm.idNumber.trim() || !idForm.fullName.trim()}
                  className="flex-1 py-2.5 gradient-brand text-white text-xs font-bold rounded-xl disabled:opacity-40 shadow-lg shadow-blue-500/20"
                >
                  {isPending ? "Submitting..." : "Submit for Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: RESIDENTIAL ADDRESS */}
      {/* ============================================================ */}
      {activeModal === "address" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d121d] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Home className="w-5 h-5 text-blue-400" />
                <span>Operating / Home Address</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={addressForm.streetAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                  placeholder="e.g. 100 Broadway Ave, Suite 400"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="e.g. New York"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    placeholder="e.g. United States"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !addressForm.city.trim() || !addressForm.country.trim()}
                  className="flex-1 py-2.5 gradient-brand text-white text-xs font-bold rounded-xl disabled:opacity-40"
                >
                  {isPending ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DEALER & BUSINESS REGISTRATION */}
      {/* ============================================================ */}
      {activeModal === "business" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d121d] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>Dealer Registration</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBusinessSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Dealership / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessForm.businessName}
                  onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                  placeholder="e.g. Apex Prestige Auto Group LLC"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motor Vehicle Dealer License # / Tax ID *
                </label>
                <input
                  type="text"
                  required
                  value={businessForm.licenseNumber}
                  onChange={(e) => setBusinessForm({ ...businessForm, licenseNumber: e.target.value })}
                  placeholder="e.g. DL-99201482-NY"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operating City *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessForm.city}
                    onChange={(e) => setBusinessForm({ ...businessForm, city: e.target.value })}
                    placeholder="e.g. Miami"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessForm.country}
                    onChange={(e) => setBusinessForm({ ...businessForm, country: e.target.value })}
                    placeholder="e.g. United States"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !businessForm.businessName.trim() || !businessForm.licenseNumber.trim()}
                  className="flex-1 py-2.5 gradient-brand text-white text-xs font-bold rounded-xl disabled:opacity-40"
                >
                  {isPending ? "Submitting..." : "Apply as Dealer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
