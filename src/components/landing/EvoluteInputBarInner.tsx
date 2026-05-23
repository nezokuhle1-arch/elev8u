"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import EvoluteLoading from "./EvoluteLoading";

export function EvoluteInputBarInner() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    const href = `/client/concierge?message=${encodeURIComponent(message.trim())}`;
    startTransition(() => {
      router.push(href);
    });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  if (loading) return <EvoluteLoading />;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-center justify-center gap-2">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
        <span className="text-sm text-white/60">Evolute AI is ready</span>
      </div>

      <div className="glass-input group flex items-center gap-3 rounded-2xl p-1.5 transition-all duration-300 focus-within:border-[#305CDE]/60 focus-within:shadow-[0_0_0_1px_rgba(48,92,222,0.3),0_8px_40px_rgba(48,92,222,0.2)]">
        <div className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#305CDE]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. I need a web developer in Johannesburg..."
          className="flex-1 bg-transparent py-2.5 pr-2 text-sm text-white outline-none placeholder:text-white/35"
        />

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!message.trim()}
          className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#305CDE] shadow-lg shadow-[#305CDE]/30 transition-all duration-200 hover:bg-[#1A3FA0] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Send to Evolute AI"
        >
          <ArrowRight className="h-4 w-4 text-white" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {[
          { label: "🔧 Mechanic in Soweto", value: "Mechanic in Soweto" },
          { label: "💻 Web developer", value: "Web developer" },
          { label: "🎨 Graphic designer", value: "Graphic designer" },
          { label: "✍️ Copywriter", value: "Copywriter" },
        ].map(({ label, value }) => (
          <button
            key={label}
            type="button"
            onClick={() => setMessage(value)}
            className="glass rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/60 transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
