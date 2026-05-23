"use client";

import {
  Camera,
  Car,
  Code,
  Palette,
  PenTool,
  Scissors,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

const SERVICES = [
  { name: "Automotive", icon: Car },
  { name: "Graphic Design", icon: Palette },
  { name: "Web Development", icon: Code },
  { name: "Copywriting", icon: PenTool },
  { name: "Photography", icon: Camera },
  { name: "Cleaning", icon: Sparkles },
  { name: "Hair & Beauty", icon: Scissors },
] as const;

const CENTER = 300;
const RADIUS = 220;
const NODE_OFFSET = 56;

export function ServiceOrbital() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-[600px] overflow-hidden px-2">
      <div className="relative mx-auto h-[600px] w-[600px] scale-[0.55] sm:scale-75 md:scale-100">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {SERVICES.map((_, index) => {
            const angle =
              (index / SERVICES.length) * 2 * Math.PI - Math.PI / 2;
            const x = CENTER + RADIUS * Math.cos(angle);
            const y = CENTER + RADIUS * Math.sin(angle);
            return (
              <line
                key={index}
                x1={CENTER}
                y1={CENTER}
                x2={x}
                y2={y}
                stroke="rgba(48,92,222,0.3)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>

        <div className="animate-spin-slow absolute inset-0">
          <div className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full bg-gradient-to-br from-[#305CDE] to-[#1A3FA0] shadow-2xl shadow-[#305CDE]/40">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Elev8U</span>
          </div>

          {SERVICES.map(({ name, icon: Icon }, index) => {
            const angle =
              (index / SERVICES.length) * 2 * Math.PI - Math.PI / 2;
            const x = CENTER + RADIUS * Math.cos(angle) - NODE_OFFSET;
            const y = CENTER + RADIUS * Math.sin(angle) - NODE_OFFSET;

            return (
              <div
                key={name}
                className="animate-counter-spin absolute"
                style={{ left: x, top: y }}
              >
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/signup?category=${encodeURIComponent(name)}`
                    )
                  }
                  className="glass-strong w-28 cursor-pointer rounded-2xl p-4 text-center transition-all duration-300 hover:scale-110 hover:border-[#305CDE]/50 hover:bg-white/15 hover:shadow-lg hover:shadow-[#305CDE]/20"
                >
                  <Icon className="mx-auto mb-2 h-8 w-8 text-[#6B8EE8]" />
                  <span className="text-xs font-medium text-white/70">
                    {name}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
