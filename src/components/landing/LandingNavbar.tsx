"use client";

import { Elev8ULogo } from "@/components/ui/Elev8ULogo";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const NAV_ANCHORS = [
  { label: "How it works", hash: "#how-it-works" },
  { label: "Categories", hash: "#categories" },
  { label: "For Freelancers", hash: "#for-freelancers" },
] as const;

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleAnchorClick(hash: string) {
    setMenuOpen(false);
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <nav className="glass-strong relative border-b border-white/10">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Elev8ULogo size="md" theme="dark" href="/" />
            <span className="glass hidden rounded-full px-3 py-1 text-xs text-white/70 sm:inline">
              Powered by Evolute AI
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_ANCHORS.map(({ label, hash }) => (
              <a
                key={hash}
                href={hash}
                className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="mr-2 hidden text-sm text-white/60 transition-colors duration-200 hover:text-white md:inline"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hidden rounded-xl bg-[#305CDE] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#305CDE]/25 transition-all duration-200 hover:bg-[#1A3FA0] md:inline"
            >
              Get started free
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="glass flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:text-white md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <Link
              href="/signup"
              className="rounded-xl bg-[#305CDE] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#305CDE]/25 transition-all duration-200 hover:bg-[#1A3FA0] md:hidden"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "glass-strong overflow-hidden border-b border-white/10 transition-all duration-200 md:hidden",
          menuOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="w-full">
          {NAV_ANCHORS.map(({ label, hash }) => (
            <button
              key={hash}
              type="button"
              onClick={() => handleAnchorClick(hash)}
              className="block w-full border-b border-white/5 px-6 py-4 text-left text-base text-white/70 transition-colors duration-150 hover:bg-white/5 hover:text-white"
            >
              {label}
            </button>
          ))}
          <div className="border-t border-white/10">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block border-b border-white/5 px-6 py-4 text-base text-white/70 transition-colors duration-150 hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="mx-4 my-3 block rounded-xl bg-[#305CDE] py-3 text-center font-medium text-white hover:bg-[#1A3FA0]"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
