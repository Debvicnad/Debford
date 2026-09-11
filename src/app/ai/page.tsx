import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DEBA — AI Automotive Assistant",
  description: "Your AI-powered automotive assistant. Ask anything about vehicles, pricing, maintenance, and more.",
};

const SUGGESTED_PROMPTS = [
  { icon: "🔍", text: "What should I look for when buying a used BMW 3 Series?", category: "Buying advice" },
  { icon: "💰", text: "Is $45,000 a fair price for a 2022 Toyota Camry with 30,000 km?", category: "Price check" },
  { icon: "🔧", text: "What are the common issues with the 2019 Ford F-150 3.5L EcoBoost?", category: "Reliability" },
  { icon: "📋", text: "Help me write a compelling listing description for my Porsche 911", category: "Selling" },
  { icon: "⚡", text: "Compare Tesla Model 3 vs BMW i4 for long-distance driving", category: "Comparison" },
  { icon: "🛡️", text: "What questions should I ask a seller before buying a car?", category: "Inspection" },
];

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen surface-base flex flex-col">
      {/* Header */}
      <div className="surface-raised border-b border-subtle shrink-0">
        <div className="container-debford py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Home</Link>
            <span className="text-slate-700">/</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold text-xs">AI</span>
              </div>
              <span className="text-white font-bold text-sm">DEBA</span>
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">Beta</span>
            </div>
          </div>
          <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors glass border border-white/10 px-3 py-1.5 rounded-lg">
            New chat
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10 max-w-xl">
          <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-2xl shadow-blue-500/20">
            🤖
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">
            Meet DEBA
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Your AI-powered automotive assistant. Ask anything — pricing, buying advice, reliability data, listing help, and more.
          </p>
        </div>

        {/* Suggested prompts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10 w-full max-w-3xl">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt.text}
              className="flex items-start gap-3 p-4 glass rounded-xl border border-white/10 text-left hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
            >
              <span className="text-xl shrink-0 mt-0.5">{prompt.icon}</span>
              <div>
                <div className="text-xs font-semibold text-blue-400 mb-1">{prompt.category}</div>
                <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors line-clamp-2">
                  {prompt.text}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Chat input */}
        <div className="w-full max-w-2xl">
          <div className="glass rounded-2xl border border-white/15 p-4 hover:border-white/25 transition-colors focus-within:border-blue-500/40">
            <textarea
              rows={3}
              placeholder="Ask DEBA anything about vehicles, buying, selling, maintenance…"
              className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none resize-none leading-relaxed mb-3"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {["🚗 Vehicles", "💰 Pricing", "🔧 Maintenance"].map((chip) => (
                  <button key={chip} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                    {chip}
                  </button>
                ))}
              </div>
              <button className="px-5 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
                <span>Ask</span>
                <span>→</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-600 text-center mt-3">
            DEBA is powered by AI and may make mistakes. Always verify important automotive decisions with a professional.
          </p>
        </div>
      </div>

      {/* Coming soon banner */}
      <div className="shrink-0 border-t border-white/8 py-4">
        <div className="container-debford text-center">
          <p className="text-xs text-slate-600">
            DEBA is in Beta. Full AI integration coming in Phase 9. 
            <Link href="/membership" className="text-blue-400 hover:underline ml-1">Join Pro</Link> to get early access.
          </p>
        </div>
      </div>
    </div>
  );
}
