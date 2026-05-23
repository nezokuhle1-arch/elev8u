"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function EvoluteLoading() {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="gradient-hero fixed inset-0 z-[100] flex flex-col items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#305CDE]"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative mb-8 flex items-center justify-center">
        <div
          className="absolute h-28 w-28 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(48,92,222,0.8) 120deg, rgba(107,142,232,0.4) 200deg, transparent 360deg)",
            animation: "ring-spin 1.5s linear infinite",
          }}
        />

        <div
          className="absolute h-20 w-20 rounded-full"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 0deg, rgba(48,92,222,0.5) 100deg, transparent 200deg)",
            animation: "ring-spin 2s linear infinite reverse",
          }}
        />

        <div
          className="absolute h-3 w-3"
          style={{ animation: "dot-orbit 1.5s linear infinite" }}
        >
          <div className="h-3 w-3 rounded-full bg-[#305CDE] shadow-lg shadow-[#305CDE]/60" />
        </div>

        <div
          className="glass-strong relative z-10 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ animation: "ring-pulse 2s ease infinite" }}
        >
          <Sparkles className="h-6 w-6 text-[#305CDE]" />
        </div>
      </div>

      <div className="animate-fade-in-up text-center">
        <p className="mb-1 text-lg font-semibold text-white">Evolute AI</p>
        <p className="text-sm text-white/50">
          Processing your request{".".repeat(dots + 1)}
        </p>
      </div>
    </div>
  );
}
