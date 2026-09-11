import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Reviews & Ratings",
  description: "Your reviews and ratings on Debford.",
};

const MOCK_REVIEWS = [
  { id: "r1", author: "James K.", avatar: "JK", rating: 5, date: "2026-09-05", listing: "2022 BMW 5 Series", body: "Absolutely smooth transaction. The car was exactly as described, and the seller was incredibly responsive. Would highly recommend.", type: "received", reply: null },
  { id: "r2", author: "Sarah M.", avatar: "SM", rating: 4, date: "2026-08-28", listing: "2023 Toyota Camry SE", body: "Good experience overall. Minor delay in response but the vehicle was in great condition.", type: "received", reply: "Thank you for your kind words, Sarah! Glad the Camry found a good home." },
  { id: "r3", author: "Mike T.", avatar: "MT", rating: 5, date: "2026-08-14", listing: "Mobile Mechanic Service", body: "Mike came out within an hour and fixed the issue on the spot. Incredibly professional and honest. 10/10.", type: "given", reply: null },
];

function StarRating({ value, max = 5, size = "sm" }: { value: number; max?: number; size?: "sm" | "lg" }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`${size === "lg" ? "text-lg" : "text-sm"} ${i < value ? "text-amber-400" : "text-slate-700"}`}>★</span>
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  if (!isSupabaseConfigured()) redirect("/login?redirectTo=/reviews");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/reviews");

  const avgRating = MOCK_REVIEWS.filter(r => r.type === "received").reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.filter(r => r.type === "received").length;
  const received = MOCK_REVIEWS.filter(r => r.type === "received");
  const given = MOCK_REVIEWS.filter(r => r.type === "given");

  return (
    <div className="min-h-screen surface-base">
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <span>›</span>
            <span className="text-slate-300">Reviews</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Reviews & Ratings</h1>
        </div>
      </div>

      <div className="container-debford py-8 max-w-4xl">
        {/* Score card */}
        <div className="glass rounded-2xl border border-white/10 p-6 mb-8 flex items-center gap-8 flex-wrap">
          <div className="text-center">
            <div className="text-5xl font-extrabold text-white">{avgRating.toFixed(1)}</div>
            <StarRating value={Math.round(avgRating)} size="lg" />
            <div className="text-xs text-slate-500 mt-1">{received.length} reviews</div>
          </div>
          <div className="flex-1 min-w-40 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = received.filter(r => r.rating === star).length;
              const pct = received.length ? (count / received.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-2">{star}</span>
                  <span className="text-amber-400 text-xs">★</span>
                  <div className="flex-1 h-1.5 surface-base rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-600 w-4">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Response rate", value: "96%" },
              { label: "Avg. response", value: "< 1h" },
              { label: "Member since", value: "Sep 2026" },
              { label: "Total sales", value: "12" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 surface-base rounded-xl">
                <div className="text-base font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass rounded-xl border border-white/10 p-1 w-fit">
          {["Reviews Received", "Reviews Given"].map((tab, i) => (
            <button key={tab} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${i === 0 ? "gradient-brand text-white" : "text-slate-400 hover:text-white"}`}>
              {tab}
              <span className="ml-1.5 text-xs opacity-70">({i === 0 ? received.length : given.length})</span>
            </button>
          ))}
        </div>

        {/* Review cards */}
        <div className="space-y-4">
          {received.map((review) => (
            <div key={review.id} className="glass rounded-2xl border border-white/10 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 gradient-brand rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {review.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
                    <div>
                      <span className="text-sm font-semibold text-white">{review.author}</span>
                      <span className="text-xs text-slate-600 ml-2">· Re: {review.listing}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} />
                      <span className="text-xs text-slate-600">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">{review.body}</p>

                  {/* Existing reply */}
                  {review.reply && (
                    <div className="pl-4 border-l-2 border-blue-500/30 mb-3">
                      <div className="text-xs font-semibold text-blue-400 mb-1">Your reply</div>
                      <p className="text-sm text-slate-400">{review.reply}</p>
                    </div>
                  )}

                  {/* Reply CTA */}
                  {!review.reply && (
                    <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      + Reply to this review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
