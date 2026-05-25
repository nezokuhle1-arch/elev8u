"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

type Elev8ULogoProps = {
  size?: "sm" | "md";
  theme?: "dark" | "light";
  className?: string;
  centered?: boolean;
  href?: string;
};

function LogoBadge({ badgeSize }: { badgeSize: number }) {
  const id = `logo-${badgeSize}`;
  return (
    <svg
      width={badgeSize}
      height={badgeSize}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="65%" y2="100%">
          <stop offset="0%" stopColor="#eef2ff" />
          <stop offset="18%" stopColor="#305CDE" />
          <stop offset="40%" stopColor="#8aaaf5" />
          <stop offset="55%" stopColor="#1A3FA0" />
          <stop offset="72%" stopColor="#6B8EE8" />
          <stop offset="100%" stopColor="#dde5ff" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="5%" y1="0%" x2="95%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${id}-t`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#dde8ff" />
          <stop offset="50%" stopColor="#4a70e8" />
          <stop offset="75%" stopColor="#aabfff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-g)`} />
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-s)`} />
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="0.8"
      />
      <ellipse
        cx="16"
        cy="11"
        rx="9"
        ry="5"
        fill="rgba(255,255,255,0.38)"
        transform="rotate(-25 16 11)"
      />
      <text
        x="5"
        y="46"
        fontFamily="system-ui, sans-serif"
        fontSize="32"
        fontWeight="700"
        fill={`url(#${id}-t)`}
        letterSpacing="-1"
      >
        E
      </text>
      <path
        d="M 38 32 C 38 24, 46 19, 52 24 C 58 29, 58 35, 52 40 C 46 45, 38 40, 38 32 Z"
        fill={`url(#${id}-t)`}
        opacity="0.95"
      />
      <path
        d="M 38 32 C 38 24, 30 19, 25 24 C 20 29, 20 35, 25 40 C 30 45, 38 40, 38 32 Z"
        fill={`url(#${id}-t)`}
        opacity="0.82"
      />
      <ellipse cx="38" cy="32" rx="3.5" ry="6" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}

export function Elev8ULogo({
  size = "md",
  theme = "dark",
  className,
  centered = false,
  href,
}: Elev8ULogoProps) {
  const badgeSize = size === "sm" ? 28 : 36;
  const textSize = size === "sm" ? "text-base" : "text-xl";
  const elevClass =
    theme === "dark" ? "text-white/90" : "text-[#111827]";
  const eightClass = theme === "dark" ? "text-[#6B8EE8]" : "text-[#305CDE]";

  const content = (
    <div
      className={cn(
        "flex items-center gap-3",
        centered && "justify-center",
        className
      )}
    >
      <LogoBadge badgeSize={badgeSize} />
      <span className={cn("leading-none tracking-tight", textSize)}>
        <span className={cn("font-medium", elevClass)}>Elev</span>
        <span className={cn("font-bold", eightClass)}>8</span>
        <span className={cn("font-medium", elevClass)}>U</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
