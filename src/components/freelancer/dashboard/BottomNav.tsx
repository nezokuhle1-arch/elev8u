"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Home,
  MessageSquare,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Home", href: "/freelancer/dashboard", icon: Home },
  { label: "Leads", href: "/freelancer/dashboard#leads", icon: MessageSquare },
  { label: "Calendar", href: "/freelancer/dashboard#bookings", icon: Calendar },
  { label: "Earnings", href: "/freelancer/dashboard#earnings", icon: BarChart3 },
  { label: "Profile", href: "/freelancer/profile/setup", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-[480px] items-center justify-around px-2 py-2">
        {tabs.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/freelancer/dashboard"
              ? pathname === "/freelancer/dashboard"
              : pathname.startsWith(href.split("#")[0]);

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium",
                isActive ? "text-[#1D9E75]" : "text-gray-400"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
